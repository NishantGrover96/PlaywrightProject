'use strict';
/**
 * Engine Adapter — JavaScript bridge between dashboard/server.js and the
 * TypeScript Execution Engine.
 *
 * Design:
 *   - Mirrors the TypeScript engine's interfaces in plain JavaScript
 *   - Reads the same config files (config/clients/{id}.json, .env.{env})
 *   - Constructs ExecutionPlan-compatible objects for the dashboard
 *   - In Phase 6, dashboard/server.js will call this adapter instead of
 *     spawning Playwright directly
 *
 * This file does NOT require ts-node or any build step.
 * It implements the identical logic as the TS engine in CommonJS.
 */

const path = require('path');
const fs   = require('fs');

const catalogService = require('./catalog-service');
const clientService  = require('./client-service');

try { require('./repository-service'); } catch (_) { /* optional */ }

const ROOT = path.join(__dirname, '..', '..');

// ── ID Generator ────────────────────────────────────────────────────────────
let _seq = 0;
function generateExecutionId() {
  const ts  = Date.now().toString(36);
  const rnd = (++_seq).toString(36).padStart(4, '0');
  return `exec_${ts}_${rnd}`;
}

// ── Auth Resolution ──────────────────────────────────────────────────────────

const LEGACY_SHARED = new Set(['demoportal', 'certainteed', 'samsung']);

function resolveSetupProject(clientId, role) {
  const isAdmin = role === 'admin' || role.endsWith('-admin');
  if (LEGACY_SHARED.has(clientId)) return isAdmin ? 'setup-admin' : 'setup';
  return isAdmin ? `setup-${clientId}-admin` : `setup-${clientId}`;
}

function getStorageStateFile(clientId, role) {
  const isAdmin   = role === 'admin' || role.endsWith('-admin');
  const fileName  = isAdmin ? 'admin.json' : 'user.json';
  const clientDir = path.join(ROOT, 'tests', 'playwright', 'fixtures', '.auth', clientId);
  const sharedDir = path.join(ROOT, 'tests', 'playwright', 'fixtures', '.auth');
  if (fs.existsSync(clientDir)) {
    return path.relative(ROOT, path.join(clientDir, fileName)).replace(/\\/g, '/');
  }
  return path.relative(ROOT, path.join(sharedDir, fileName)).replace(/\\/g, '/');
}

function getLoginPath(clientId) {
  try {
    const cfg = loadClientConfig(clientId);
    return cfg?.loginPath ?? '/account/login';
  } catch { return '/account/login'; }
}

function getClientAuthType(clientId) {
  try {
    const cfg = loadClientConfig(clientId);
    return cfg?.authentication?.type ?? cfg?.authType ?? 'forms';
  } catch { return 'forms'; }
}

function resolveAuth(clientId, role, environment) {
  const isAdmin   = role === 'admin' || role.endsWith('-admin');
  const authType  = getClientAuthType(clientId);
  const loginPath = getLoginPath(clientId);
  return {
    setupProject:     resolveSetupProject(clientId, role),
    authType,
    loginPath,
    storageStateFile: getStorageStateFile(clientId, role),
    credentialEnvKey: {
      email:    isAdmin ? 'ADMIN_EMAIL'    : 'TEST_USER_EMAIL',
      password: isAdmin ? 'ADMIN_PASSWORD' : 'TEST_USER_PASSWORD',
    },
  };
}

// ── Environment Resolution ───────────────────────────────────────────────────

function loadClientConfig(clientId) {
  const p = path.join(ROOT, 'config', 'clients', `${clientId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let   val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function loadEnvFile(envName) {
  const primary  = path.join(ROOT, `.env.${envName}`);
  const fallback = path.join(ROOT, '.env.production');
  if (fs.existsSync(primary))  return parseEnvFile(primary);
  if (fs.existsSync(fallback)) return parseEnvFile(fallback);
  return {};
}

const DEFAULT_TIMEOUTS = { global: 90000, action: 30000, navigation: 60000, expect: 10000 };
const DEFAULT_FLAGS    = { runVisualTests: false, runApiTests: false, captureVideo: false, captureTrace: false, smokeOnly: false };

function resolveEnvironment(clientId, envName, flagOverrides) {
  const cfg     = loadClientConfig(clientId);
  const envCfg  = cfg?.environments?.[envName];
  const envFile = loadEnvFile(envName);
  const baseUrl = envCfg?.baseUrl || cfg?.environments?.production?.baseUrl || envFile.BASE_URL || '';
  const apiUrl  = envCfg?.apiUrl  || baseUrl || envFile.API_BASE_URL || '';

  const ct = cfg?.execution?.timeouts ?? cfg?.timeouts ?? {};
  const timeouts = {
    global:     ct.global     ?? DEFAULT_TIMEOUTS.global,
    action:     ct.action     ?? DEFAULT_TIMEOUTS.action,
    navigation: ct.navigation ?? DEFAULT_TIMEOUTS.navigation,
    expect:     ct.expect     ?? DEFAULT_TIMEOUTS.expect,
  };

  const cf = cfg?.execution?.featureFlags ?? cfg?.featureFlags ?? {};
  const featureFlags = {
    runVisualTests: flagOverrides?.runVisualTests ?? cf.runVisualTests ?? DEFAULT_FLAGS.runVisualTests,
    runApiTests:    flagOverrides?.runApiTests    ?? cf.runApiTests    ?? DEFAULT_FLAGS.runApiTests,
    captureVideo:   flagOverrides?.captureVideo   ?? cf.captureVideo   ?? DEFAULT_FLAGS.captureVideo,
    captureTrace:   flagOverrides?.captureTrace   ?? cf.captureTrace   ?? DEFAULT_FLAGS.captureTrace,
    smokeOnly:      flagOverrides?.smokeOnly      ?? cf.smokeOnly      ?? DEFAULT_FLAGS.smokeOnly,
  };

  return { baseUrl, apiUrl, envFileName: envCfg?.envFile ?? envName, timeouts, featureFlags };
}

// ── Artifact Paths ────────────────────────────────────────────────────────────

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildArtifactPaths(clientId, executionId, date) {
  const dateStr = formatDate(date ?? new Date());
  const root    = path.join('reports', clientId, dateStr, executionId).replace(/\\/g, '/');
  return {
    rootDir:        root,
    htmlReport:     `${root}/html`,
    jsonReport:     `${root}/results.json`,
    junitReport:    `${root}/junit.xml`,
    tracesDir:      `${root}/traces`,
    screenshotsDir: `${root}/screenshots`,
    videosDir:      `${root}/videos`,
    logsDir:        `${root}/logs`,
  };
}

// ── Spec Path Resolution ──────────────────────────────────────────────────────

const TIER_TAGS = { smoke: '@smoke', regression: '@regression', e2e: '@e2e' };

function resolveSpecPaths(clientId, features, moduleId, warnings) {
  if (!features.length || features.includes('all')) {
    return resolveModulePath(clientId, moduleId, warnings);
  }
  const paths = [];
  for (const fid of features) {
    const sp = catalogService.getSpecPath(fid, clientId) ?? catalogService.getSpecPath(fid, null);
    if (sp) { paths.push(sp); continue; }
    warnings.push(`Feature '${fid}': no spec path in catalog — skipping.`);
  }
  return [...new Set(paths)];
}

function resolveModulePath(clientId, moduleId, warnings) {
  const clientDir = path.join('tests', 'playwright', 'clients', clientId, 'specs');
  if (fs.existsSync(path.join(ROOT, clientDir))) {
    if (moduleId) {
      const mod = path.join(clientDir, moduleId.toLowerCase());
      if (fs.existsSync(path.join(ROOT, mod))) return [mod];
      warnings.push(`Module dir not found: ${mod}`);
    }
    return [clientDir];
  }
  const legacyDir = path.join('tests', 'playwright', 'specs');
  if (moduleId) {
    const mod = path.join(legacyDir, moduleId.toLowerCase());
    if (fs.existsSync(path.join(ROOT, mod))) return [mod];
    warnings.push(`Module dir not found: ${mod} — running all specs.`);
  }
  return [legacyDir];
}

// ── Plan Builder ───────────────────────────────────────────────────────────────

/**
 * Build a complete ExecutionPlan from an ExecutionRequest.
 * This is the JS mirror of execution-engine.ts buildPlan().
 *
 * @param {object} request  ExecutionRequest
 * @returns {object}        ExecutionPlan (plain JS object)
 */
function buildPlan(request) {
  const errors   = [];
  const warnings = [];

  const clientId  = request.clientId   || 'demoportal';
  const role      = request.role       || 'dealer';
  const envName   = request.environment || request.testEnv || 'production';
  const moduleId  = request.moduleId  ?? null;
  const featureId = request.featureId ?? null;
  const tiers     = request.tiers     ?? [];
  const browser   = request.browser   ?? 'chromium';
  const workers   = request.workers   ?? 1;
  const retries   = request.retries   ?? 0;
  const features  = Array.isArray(request.features) ? request.features : (featureId ? [featureId] : []);

  const clientCfg = clientService.getClient(clientId);
  if (!clientCfg) warnings.push(`Client '${clientId}' not found — using defaults.`);

  const auth        = resolveAuth(clientId, role, envName);
  const resolvedEnv = resolveEnvironment(clientId, envName, request.featureFlags);
  const executionId = generateExecutionId();
  const artifacts   = buildArtifactPaths(clientId, executionId);

  // Repo info
  let repo = null;
  try {
    const repoSvc = require('./repository-service');
    repo = repoSvc.getForClient(clientId);
  } catch (_) { /* optional */ }

  // Spec paths
  const specFiles = resolveSpecPaths(clientId, features, moduleId, warnings);

  // Projects
  const projects = clientService.getProjectsForRole(clientId, role) ?? [
    auth.setupProject,
    `${browser}${role === 'admin' ? '-admin' : ''}`,
  ].filter(Boolean);

  // CLI args
  const cliArgs = ['test'];
  for (const p of specFiles) cliArgs.push(p);
  const activeTiers = tiers.filter(t => TIER_TAGS[t]);
  if (activeTiers.length) cliArgs.push('--grep', activeTiers.map(t => TIER_TAGS[t]).join('|'));
  for (const p of projects) cliArgs.push(`--project=${p}`);
  if (retries)  cliArgs.push(`--retries=${retries}`);
  if (workers > 1) cliArgs.push(`--workers=${workers}`);
  if (request.headed) cliArgs.push('--headed');
  cliArgs.push('--reporter=list');
  cliArgs.push(`--reporter=json:${artifacts.jsonReport}`);
  cliArgs.push(`--reporter=junit:${artifacts.junitReport}`);
  cliArgs.push(`--reporter=html:${artifacts.htmlReport}`);

  // Env vars
  const fileEnv  = loadEnvFile(envName);
  const envVars  = {
    ...process.env,
    ...fileEnv,
    CLIENT_ID:  clientId,
    TEST_ENV:   envName,
    ROLE:       role,
    AUTH_PROJECT:  auth.setupProject,
    LOGIN_PATH:    auth.loginPath,
    AUTH_STORAGE_PATH: auth.storageStateFile
      ? path.join(ROOT, auth.storageStateFile).replace(/\\/g, '/')
      : '',
    ...(resolvedEnv.baseUrl && { BASE_URL: resolvedEnv.baseUrl }),
    ...(resolvedEnv.apiUrl  && { API_BASE_URL: resolvedEnv.apiUrl }),
    ...(moduleId             && { MODULE_ID:  moduleId }),
    ...(featureId            && { FEATURE_ID: featureId }),
    ...(request.username     && { [auth.credentialEnvKey.email]:    request.username }),
    ...(request.password     && { [auth.credentialEnvKey.password]: request.password }),
    ...(request.baseUrl      && { BASE_URL: request.baseUrl }),
    ...(repo?.branch         && { REPOSITORY_BRANCH: repo.branch }),
    ...(repo?.lastCommit     && { REPOSITORY_COMMIT:  repo.lastCommit }),
    PLAYWRIGHT_TRACE: request.trace ?? 'retain-on-failure',
    PLAYWRIGHT_VIDEO: request.video ?? 'off',
  };

  // Remove undefined
  for (const k of Object.keys(envVars)) {
    if (envVars[k] === undefined) delete envVars[k];
  }

  if (specFiles.length === 0 && features.length > 0 && !features.includes('all')) {
    warnings.push('No spec paths resolved. Tests may not run.');
  }

  return {
    executionId,
    clientId,
    moduleId,
    featureId,
    role,
    environment:  envName,
    scope:        featureId ? 'feature' : moduleId ? 'module' : 'client',
    repositoryBranch: repo?.branch     ?? undefined,
    repositoryCommit: repo?.lastCommit ?? undefined,
    specFiles,
    tiers,
    features,
    auth,
    resolvedEnv,
    projects,
    browser,
    workers,
    retries,
    retryStrategy: retries === 0 ? 'none' : 'fixed',
    trace:      request.trace      ?? 'retain-on-failure',
    video:      request.video      ?? 'off',
    screenshot: 'only-on-failure',
    headed:     request.headed     ?? false,
    artifacts,
    reporters:  ['list', 'json', 'junit', 'html'],
    outputDir:  artifacts.tracesDir,
    cliArgs,
    envVars,
    errors,
    warnings,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate a plan. Returns { ok: boolean, errors: string[], warnings: string[] }
 */
function validatePlan(plan) {
  const errors   = [...plan.errors];
  const warnings = [...plan.warnings];

  if (!plan.clientId)      errors.push('clientId is required');
  if (!plan.environment)   errors.push('environment is required');
  if (!plan.role)          errors.push('role is required');

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Summarize a plan for logging / SSE preview.
 */
function summarizePlan(plan) {
  return {
    executionId: plan.executionId,
    clientId:    plan.clientId,
    environment: plan.environment,
    role:        plan.role,
    scope:       plan.scope,
    specCount:   plan.specFiles.length,
    tiers:       plan.tiers,
    projects:    plan.projects,
    browser:     plan.browser,
    workers:     plan.workers,
    retries:     plan.retries,
    artifacts:   plan.artifacts,
    warnings:    plan.warnings,
    errors:      plan.errors,
  };
}

module.exports = {
  buildPlan,
  validatePlan,
  summarizePlan,
  resolveAuth,
  resolveEnvironment,
  buildArtifactPaths,
  generateExecutionId,
};
