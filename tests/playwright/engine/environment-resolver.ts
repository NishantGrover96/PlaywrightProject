/**
 * Environment Resolver
 *
 * Resolves the full runtime environment for a given client × environment pair.
 *
 * Responsibilities:
 *   - Load baseUrl / apiUrl from config/clients/{clientId}.json
 *   - Load .env.{environment} for credential/config fallbacks
 *   - Apply client-specific timeouts from config
 *   - Merge execution feature flags
 *   - Expose final env vars (string map) for the Playwright Runtime
 *
 * Everything comes from configuration. No hardcoded URLs.
 */

import * as fs   from 'fs';
import * as path from 'path';
import type {
  EnvironmentName,
  ResolvedEnvironment,
  ExecutionFeatureFlags,
  TimeoutConfig,
} from './execution-plan';

const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUTS: TimeoutConfig = {
  global:     90_000,
  action:     30_000,
  navigation: 60_000,
  expect:     10_000,
};

const DEFAULT_FLAGS: ExecutionFeatureFlags = {
  runVisualTests: false,
  runApiTests:    false,
  captureVideo:   false,
  captureTrace:   false,
  smokeOnly:      false,
};

// ── Client Config Loader ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadClientConfig(clientId: string): Record<string, any> | null {
  const p = path.join(WORKSPACE_ROOT, 'config', 'clients', `${clientId}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

// ── .env File Parser ───────────────────────────────────────────────────────

/**
 * Parses a .env file into a plain object.
 * Handles quoted values ("…" and '…'), inline comments, and blank lines.
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = line.slice(0, eqIdx).trim();
    let   val = line.slice(eqIdx + 1).trim();
    // Strip inline comment
    const commentIdx = val.search(/\s+#/);
    if (commentIdx > 0) val = val.slice(0, commentIdx).trim();
    // Strip quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function loadEnvFile(envName: string): Record<string, string> {
  const primary  = path.join(WORKSPACE_ROOT, `.env.${envName}`);
  const fallback = path.join(WORKSPACE_ROOT, '.env.production');
  if (fs.existsSync(primary))  return parseEnvFile(primary);
  if (fs.existsSync(fallback)) return parseEnvFile(fallback);
  return {};
}

// ── Timeout Merging ────────────────────────────────────────────────────────

function mergeTimeouts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientTimeouts?: Record<string, any>,
  envTimeouts?:    Record<string, number>,
): TimeoutConfig {
  return {
    global:     clientTimeouts?.global     ?? envTimeouts?.global     ?? DEFAULT_TIMEOUTS.global,
    action:     clientTimeouts?.action     ?? envTimeouts?.action     ?? DEFAULT_TIMEOUTS.action,
    navigation: clientTimeouts?.navigation ?? envTimeouts?.navigation ?? DEFAULT_TIMEOUTS.navigation,
    expect:     clientTimeouts?.expect     ?? envTimeouts?.expect     ?? DEFAULT_TIMEOUTS.expect,
  };
}

// ── Feature Flag Merging ───────────────────────────────────────────────────

function mergeFeatureFlags(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFlags?: Record<string, any>,
  overrides?:   Partial<ExecutionFeatureFlags>,
): ExecutionFeatureFlags {
  return {
    runVisualTests: overrides?.runVisualTests ?? clientFlags?.runVisualTests ?? DEFAULT_FLAGS.runVisualTests,
    runApiTests:    overrides?.runApiTests    ?? clientFlags?.runApiTests    ?? DEFAULT_FLAGS.runApiTests,
    captureVideo:   overrides?.captureVideo   ?? clientFlags?.captureVideo   ?? DEFAULT_FLAGS.captureVideo,
    captureTrace:   overrides?.captureTrace   ?? clientFlags?.captureTrace   ?? DEFAULT_FLAGS.captureTrace,
    smokeOnly:      overrides?.smokeOnly      ?? clientFlags?.smokeOnly      ?? DEFAULT_FLAGS.smokeOnly,
  };
}

// ── Main Resolver ──────────────────────────────────────────────────────────

/**
 * Resolve the full runtime environment for a client × environment pair.
 *
 * @param clientId   - Client ID (matches config/clients/{clientId}.json)
 * @param envName    - Environment name: 'production' | 'uat' | 'testing' | 'dev'
 * @param overrides  - Optional flag overrides from the execution request
 */
export function resolveEnvironment(
  clientId:   string,
  envName:    EnvironmentName,
  overrides?: Partial<ExecutionFeatureFlags>,
): ResolvedEnvironment {
  const cfg     = loadClientConfig(clientId);
  const envFile = loadEnvFile(envName);

  // ── URL resolution ──
  const envCfg  = cfg?.environments?.[envName];
  const baseUrl = (
    envCfg?.baseUrl ||
    cfg?.environments?.production?.baseUrl ||
    envFile.BASE_URL ||
    ''
  );
  const apiUrl = (
    envCfg?.apiUrl ||
    baseUrl ||
    envFile.API_BASE_URL ||
    ''
  );
  const envFileName = envCfg?.envFile ?? envName;

  // ── Timeouts ──
  const clientTimeouts = cfg?.execution?.timeouts ?? cfg?.timeouts;
  const envTimeouts    = envCfg?.timeouts;
  const timeouts       = mergeTimeouts(clientTimeouts, envTimeouts);

  // ── Feature flags ──
  const clientFlags  = cfg?.execution?.featureFlags ?? cfg?.featureFlags;
  const featureFlags = mergeFeatureFlags(clientFlags, overrides);

  // ── Extra headers / cookies ──
  const extraHeaders = cfg?.execution?.extraHeaders ?? cfg?.extraHeaders ?? undefined;
  const cookies      = cfg?.execution?.cookies      ?? cfg?.cookies      ?? undefined;

  return {
    baseUrl,
    apiUrl,
    envFileName,
    timeouts,
    featureFlags,
    ...(extraHeaders ? { extraHeaders } : {}),
    ...(cookies      ? { cookies }      : {}),
  };
}

/**
 * Build the environment variable map to pass to the Playwright CLI process.
 * Merges .env file, resolved values, and execution-specific overrides.
 *
 * @param clientId   - Client ID
 * @param envName    - Environment name
 * @param resolved   - Already-resolved environment (from resolveEnvironment)
 * @param extras     - Additional env vars (credentials, feature/module IDs, etc.)
 */
export function buildEnvVars(
  clientId:  string,
  envName:   EnvironmentName,
  resolved:  ResolvedEnvironment,
  extras:    Record<string, string> = {},
): Record<string, string> {
  const fileEnv = loadEnvFile(envName);

  // Start with current process.env (type-safe, string-only copy)
  const base: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) base[k] = v;
  }

  const merged: Record<string, string> = {
    ...base,
    ...fileEnv,

    // Core routing
    CLIENT_ID: clientId,
    TEST_ENV:  envName,

    // URLs
    ...(resolved.baseUrl ? { BASE_URL:     resolved.baseUrl } : {}),
    ...(resolved.apiUrl  ? { API_BASE_URL: resolved.apiUrl  } : {}),

    // Caller overrides (credentials, feature/module IDs, etc.)
    ...extras,
  };

  // Remove undefined values (paranoia guard)
  return Object.fromEntries(
    Object.entries(merged).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
}

/**
 * Load and return the raw .env file contents for a given environment.
 * Used by other engine components that need raw .env access.
 */
export function loadRawEnvFile(envName: EnvironmentName): Record<string, string> {
  return loadEnvFile(envName);
}
