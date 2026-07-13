/**
 * Phase 5.5 - Pre-flight Validation & Health Checks
 *
 * Verifies every client configuration, repository path, catalog manifest,
 * spec file reference, auth setup file, environment URL, required folder,
 * and dashboard service BEFORE running tests or migrating clients.
 *
 * Usage:
 *   npx ts-node tests/playwright/engine/health-check.ts
 *   npx ts-node tests/playwright/engine/health-check.ts --client=demoportal
 *   npx ts-node tests/playwright/engine/health-check.ts --env=uat
 *   npx ts-node tests/playwright/engine/health-check.ts --skip-urls
 *   npx ts-node tests/playwright/engine/health-check.ts --json
 *   npx ts-node tests/playwright/engine/health-check.ts --config=config/health-check.local.json
 *
 * Exit codes:
 *   0 - no CRITICAL or HIGH failures
 *   1 - one or more CRITICAL or HIGH checks failed
 */

import * as fs    from 'fs';
import * as path  from 'path';
import * as http  from 'http';
import * as https from 'https';

// Workspace root: engine/ -> playwright/ -> tests/ -> repo root
const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');

// -- CLI flags -----------------------------------------------------------------

const _argv      = process.argv.slice(2);
const _flag      = (name: string): boolean => _argv.some(a => a === `--${name}` || a.startsWith(`--${name}=`));
const _opt       = (name: string): string | undefined => {
  const a = _argv.find(a => a.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : undefined;
};

const ONLY_CLIENT  = _opt('client');
const SKIP_URLS    = _flag('skip-urls');
const JSON_OUTPUT  = _flag('json');
const ONLY_ENV     = _opt('env');
const CONFIG_PATH  = _opt('config') ?? 'config/health-check.config.json';

// -- Types ---------------------------------------------------------------------

export type Severity    = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CheckStatus = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';

export interface CheckResult {
  name:        string;
  category:    string;
  severity:    Severity;
  status:      CheckStatus;
  message:     string;
  detail?:     string;
  clientId?:   string;
  durationMs?: number;
}

export interface HealthReport {
  timestamp:  string;
  durationMs: number;
  summary: {
    total:          number;
    pass:           number;
    fail:           number;
    warn:           number;
    skip:           number;
    criticalFailed: number;
    highFailed:     number;
  };
  ok:     boolean;
  checks: CheckResult[];
}

interface CheckCfg {
  enabled:  boolean;
  severity: Severity;
  [key: string]: unknown;
}

interface HealthConfig {
  scope: {
    clients:      'all' | string[];
    environments: string[];
  };
  checks:  Record<string, CheckCfg | undefined>;
  report: {
    writeTo:  string;
    formats:  string[];
    keepLast: number;
  };
}

// -- Config --------------------------------------------------------------------

function loadConfig(): HealthConfig {
  const base  = path.isAbsolute(CONFIG_PATH)
    ? CONFIG_PATH
    : path.join(WORKSPACE_ROOT, CONFIG_PATH);
  const local = base.replace('.config.json', '.local.json');

  let cfg: HealthConfig;
  try {
    cfg = JSON.parse(fs.readFileSync(base, 'utf8')) as HealthConfig;
  } catch {
    throw new Error(`Cannot read ${base}. Ensure config/health-check.config.json exists.`);
  }

  if (fs.existsSync(local)) {
    try {
      const override = JSON.parse(fs.readFileSync(local, 'utf8')) as Record<string, unknown>;
      cfg = _deepMerge(cfg as unknown as Record<string, unknown>, override) as unknown as HealthConfig;
    } catch { /* bad local override - ignore */ }
  }

  return cfg;
}

function _deepMerge(
  base:     Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (
      v && typeof v === 'object' && !Array.isArray(v) &&
      base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])
    ) {
      result[k] = _deepMerge(
        base[k]     as Record<string, unknown>,
        v           as Record<string, unknown>,
      );
    } else {
      result[k] = v;
    }
  }
  return result;
}

// -- Result constructors -------------------------------------------------------

function _pass(name: string, cat: string, sev: Severity, msg: string, clientId?: string): CheckResult {
  return { name, category: cat, severity: sev, status: 'PASS', message: msg, clientId };
}
function _fail(name: string, cat: string, sev: Severity, msg: string, detail?: string, clientId?: string): CheckResult {
  return { name, category: cat, severity: sev, status: 'FAIL', message: msg, detail, clientId };
}
function _warn(name: string, cat: string, sev: Severity, msg: string, detail?: string, clientId?: string): CheckResult {
  return { name, category: cat, severity: sev, status: 'WARN', message: msg, detail, clientId };
}
function _skip(name: string, cat: string, sev: Severity, reason: string): CheckResult {
  return { name, category: cat, severity: sev, status: 'SKIP', message: reason };
}

function _abs(rel: string): string {
  return path.isAbsolute(rel) ? rel : path.join(WORKSPACE_ROOT, rel);
}

// -- Client discovery ----------------------------------------------------------

function getClients(cfg: HealthConfig): string[] {
  const dir = path.join(WORKSPACE_ROOT, 'config', 'clients');
  if (!fs.existsSync(dir)) return ONLY_CLIENT ? [ONLY_CLIENT] : [];

  const all = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  if (ONLY_CLIENT) return [ONLY_CLIENT];
  if (Array.isArray(cfg.scope?.clients)) return cfg.scope.clients as string[];
  return all;
}

// -- Check 1: Required folders -------------------------------------------------

function checkRequiredFolders(cfg: HealthConfig): CheckResult[] {
  const c = cfg.checks['requiredFolders'];
  if (!c?.enabled) return [_skip('required-folders', 'required-folders', 'CRITICAL', 'Disabled in config')];

  const paths = (c['paths'] as string[]) ?? [];
  return paths.map(rel => {
    const full = _abs(rel);
    return fs.existsSync(full)
      ? _pass(`folder:${rel}`, 'required-folders', c.severity, `Exists: ${rel}`)
      : _fail(`folder:${rel}`, 'required-folders', c.severity, `Missing: ${rel}`, `Expected at: ${full}`);
  });
}

// -- Check 2: Client configuration validity ------------------------------------

function checkClientConfigs(cfg: HealthConfig, clients: string[]): CheckResult[] {
  const c = cfg.checks['clientConfig'];
  if (!c?.enabled) return [_skip('client-config', 'client-config', 'CRITICAL', 'Disabled in config')];

  const required = (c['requiredFields'] as string[]) ?? ['clientId', 'clientName', 'environments', 'roles'];
  const results: CheckResult[] = [];

  for (const clientId of clients) {
    const cfgPath = path.join(WORKSPACE_ROOT, 'config', 'clients', `${clientId}.json`);

    if (!fs.existsSync(cfgPath)) {
      results.push(_fail(
        `client-config:${clientId}`, 'client-config', c.severity,
        `Config file missing: config/clients/${clientId}.json`, undefined, clientId,
      ));
      continue;
    }

    let clientCfg: Record<string, unknown>;
    try {
      clientCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as Record<string, unknown>;
    } catch (e) {
      results.push(_fail(
        `client-config:${clientId}`, 'client-config', c.severity,
        `Invalid JSON: config/clients/${clientId}.json`, String(e), clientId,
      ));
      continue;
    }

    const missing = required.filter(f => !(f in clientCfg));
    if (missing.length > 0) {
      results.push(_fail(
        `client-config:${clientId}`, 'client-config', c.severity,
        `Missing fields in ${clientId}.json: ${missing.join(', ')}`, undefined, clientId,
      ));
      continue;
    }

    // Warn on environments with missing baseUrl
    const envs = clientCfg['environments'] as Record<string, { baseUrl?: string }> | undefined;
    if (envs) {
      const empty = Object.entries(envs).filter(([, v]) => !v?.baseUrl).map(([k]) => k);
      if (empty.length > 0) {
        results.push(_warn(
          `client-config:${clientId}`, 'client-config', c.severity,
          `Environments missing baseUrl: ${empty.join(', ')}`, undefined, clientId,
        ));
        continue;
      }
    }

    const roles = clientCfg['roles'];
    if (!Array.isArray(roles) || roles.length === 0) {
      results.push(_warn(
        `client-config:${clientId}`, 'client-config', c.severity,
        `No roles defined for client: ${clientId}`, undefined, clientId,
      ));
      continue;
    }

    results.push(_pass(
      `client-config:${clientId}`, 'client-config', c.severity,
      `Valid - ${clientId}: ${Object.keys(envs ?? {}).length} env(s), roles: ${(roles as string[]).join(', ')}`,
      clientId,
    ));
  }

  return results;
}

// -- Check 3: Repository reachability -----------------------------------------

function checkRepositories(cfg: HealthConfig): CheckResult[] {
  const c = cfg.checks['repositories'];
  if (!c?.enabled) return [_skip('repositories', 'repositories', 'HIGH', 'Disabled in config')];

  const reposLocalPath = path.join(WORKSPACE_ROOT, 'config', 'repos.local.json');

  if (!fs.existsSync(reposLocalPath)) {
    return [_warn(
      'repositories', 'repositories', c.severity,
      'config/repos.local.json not found - repository paths not configured',
      'Copy config/repos.json -> config/repos.local.json and fill in local paths',
    )];
  }

  let registry: Record<string, unknown>;
  try {
    registry = JSON.parse(fs.readFileSync(reposLocalPath, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    return [_fail('repositories', 'repositories', c.severity, 'config/repos.local.json is invalid JSON', String(e))];
  }

  const results: CheckResult[] = [];

  for (const [key, val] of Object.entries(registry)) {
    if (key.startsWith('_')) continue;
    const entry = val as Record<string, unknown>;
    const root  = entry?.['root'] as string | undefined;

    if (!root || root.startsWith('{{')) {
      results.push(_warn(
        `repository:${key}`, 'repositories', c.severity,
        `"${key}" root path still has placeholder - not configured`,
        `Set ${key}.root in config/repos.local.json`,
      ));
      continue;
    }

    if (!fs.existsSync(root)) {
      results.push(_fail(
        `repository:${key}`, 'repositories', c.severity,
        `"${key}" root directory does not exist: ${root}`,
      ));
      continue;
    }

    if (!fs.existsSync(path.join(root, '.git'))) {
      results.push(_warn(
        `repository:${key}`, 'repositories', c.severity,
        `"${key}" directory exists but has no .git folder: ${root}`,
        'Directory found but may not be a valid git repository',
      ));
      continue;
    }

    results.push(_pass(
      `repository:${key}`, 'repositories', c.severity,
      `"${key}" accessible with .git: ${root}`,
    ));
  }

  if (results.length === 0) {
    results.push(_warn('repositories', 'repositories', c.severity, 'No repository entries in repos.local.json'));
  }

  return results;
}

// -- Check 4: Catalog manifest integrity --------------------------------------

function checkCatalogManifest(cfg: HealthConfig): CheckResult[] {
  const c = cfg.checks['catalogManifest'];
  if (!c?.enabled) return [_skip('catalog-manifest', 'catalog-manifest', 'CRITICAL', 'Disabled in config')];

  const manifestPath = path.join(WORKSPACE_ROOT, 'dashboard', 'catalog-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return [_fail(
      'catalog-manifest:exists', 'catalog-manifest', c.severity,
      'dashboard/catalog-manifest.json not found',
    )];
  }

  let manifest: Record<string, Record<string, unknown>>;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, Record<string, unknown>>;
  } catch (e) {
    return [_fail(
      'catalog-manifest:parse', 'catalog-manifest', c.severity,
      'dashboard/catalog-manifest.json is invalid JSON', String(e),
    )];
  }

  const entries = Object.entries(manifest);
  const results: CheckResult[] = [
    _pass('catalog-manifest:exists', 'catalog-manifest', c.severity, `Loaded: ${entries.length} feature entries`),
  ];

  for (const [featureId, entry] of entries) {
    const catalogFile = entry['catalogFile'] as string | undefined;
    if (catalogFile && !fs.existsSync(_abs(catalogFile))) {
      results.push(_warn(
        `catalog-manifest:file:${featureId}`, 'catalog-manifest', c.severity,
        `Catalog file missing for "${featureId}": ${catalogFile}`,
      ));
    }
  }

  return results;
}

// -- Check 5: Spec files -------------------------------------------------------

function checkSpecFiles(cfg: HealthConfig): CheckResult[] {
  const c = cfg.checks['specFiles'];
  if (!c?.enabled) return [_skip('spec-files', 'spec-files', 'CRITICAL', 'Disabled in config')];

  const manifestPath = path.join(WORKSPACE_ROOT, 'dashboard', 'catalog-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return [_skip('spec-files', 'spec-files', c.severity, 'Skipped: catalog-manifest.json missing')];
  }

  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf8'),
  ) as Record<string, Record<string, unknown>>;

  const results: CheckResult[] = [];
  let totalRefs = 0;

  for (const [featureId, entry] of Object.entries(manifest)) {
    const specFiles = entry['specFiles'] as Record<string, string> | undefined;
    if (!specFiles) continue;

    for (const [tier, specPath] of Object.entries(specFiles)) {
      if (!specPath) continue;
      totalRefs++;
      if (!fs.existsSync(_abs(specPath))) {
        results.push(_fail(
          `spec-file:${featureId}:${tier}`, 'spec-files', c.severity,
          `Missing spec file - ${featureId} [${tier}]: ${specPath}`,
        ));
      }
    }
  }

  if (results.length === 0) {
    results.push(_pass(
      'spec-files:all', 'spec-files', c.severity,
      `All ${totalRefs} spec files referenced in catalog manifest exist`,
    ));
  }

  return results;
}

// -- Check 6: Auth setup files -------------------------------------------------

const LEGACY_SHARED_CLIENTS = new Set(['demoportal', 'certainteed', 'samsung']);

function checkAuthSetupFiles(cfg: HealthConfig, clients: string[]): CheckResult[] {
  const c = cfg.checks['authSetupFiles'];
  if (!c?.enabled) return [_skip('auth-setup-files', 'auth-setup-files', 'HIGH', 'Disabled in config')];

  const roles  = (c['roles'] as string[]) ?? ['dealer', 'admin'];
  const authDir = path.join(WORKSPACE_ROOT, 'tests', 'playwright', 'fixtures', '.auth');
  const results: CheckResult[] = [];

  if (!fs.existsSync(authDir)) {
    return [_warn(
      'auth-setup-files:dir', 'auth-setup-files', c.severity,
      'Auth directory not found: tests/playwright/fixtures/.auth',
      'Run the appropriate setup project via playwright test to generate storage state files',
    )];
  }

  for (const clientId of clients) {
    for (const role of roles) {
      const filename      = role === 'admin' ? 'admin.json' : 'user.json';
      const clientAuthDir = path.join(authDir, clientId);

      const authFile = LEGACY_SHARED_CLIENTS.has(clientId)
        ? path.join(authDir, filename)
        : fs.existsSync(clientAuthDir)
          ? path.join(clientAuthDir, filename)
          : path.join(authDir, filename);

      const rel = path.relative(WORKSPACE_ROOT, authFile).replace(/\\/g, '/');

      if (!fs.existsSync(authFile)) {
        results.push(_warn(
          `auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
          `Auth file not found - ${clientId}/${role}: ${rel}`,
          'Run: npx playwright test --project=setup (or setup-admin) to generate it',
          clientId,
        ));
        continue;
      }

      // Validate JSON has cookies or origins (non-empty session)
      try {
        const parsed = JSON.parse(fs.readFileSync(authFile, 'utf8')) as {
          cookies?: unknown[];
          origins?: unknown[];
        };
        const hasContent =
          (Array.isArray(parsed.cookies) && parsed.cookies.length > 0) ||
          (Array.isArray(parsed.origins) && parsed.origins.length > 0);

        if (!hasContent) {
          results.push(_warn(
            `auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
            `Auth file has empty cookies and origins - ${clientId}/${role}: ${rel}`,
            'File may be stale. Re-run auth setup to refresh the session.',
            clientId,
          ));
        } else {
          results.push(_pass(
            `auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
            `Auth file valid - ${clientId}/${role}`,
            clientId,
          ));
        }
      } catch {
        results.push(_warn(
          `auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
          `Auth file is not valid JSON - ${clientId}/${role}: ${rel}`,
          undefined, clientId,
        ));
      }
    }
  }

  return results;
}

// -- Check 7: Environment URL reachability -------------------------------------

async function checkEnvironmentUrls(cfg: HealthConfig, clients: string[]): Promise<CheckResult[]> {
  const c = cfg.checks['environmentUrls'];
  if (!c?.enabled || SKIP_URLS) {
    return [_skip(
      'environment-urls', 'environment-urls', 'MEDIUM',
      SKIP_URLS ? '--skip-urls flag provided' : 'Disabled in config',
    )];
  }

  const envs      = ONLY_ENV ? [ONLY_ENV] : (c['environments'] as string[]) ?? ['production'];
  const timeoutMs = (c['timeoutMs'] as number) ?? 8000;
  const results:  CheckResult[] = [];

  for (const clientId of clients) {
    const cfgPath = path.join(WORKSPACE_ROOT, 'config', 'clients', `${clientId}.json`);
    if (!fs.existsSync(cfgPath)) continue;

    let clientCfg: Record<string, unknown>;
    try {
      clientCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as Record<string, unknown>;
    } catch { continue; }

    const environments = clientCfg['environments'] as Record<string, { baseUrl?: string }> | undefined;
    if (!environments) continue;

    for (const envName of envs) {
      const envEntry = environments[envName];
      if (!envEntry?.baseUrl) {
        results.push(_skip(
          `url:${clientId}:${envName}`, 'environment-urls', c.severity,
          `No baseUrl for ${clientId}/${envName}`,
        ));
        continue;
      }

      const start = Date.now();
      try {
        const statusCode = await _httpGet(envEntry.baseUrl, timeoutMs);
        const durationMs = Date.now() - start;
        const ok         = statusCode >= 200 && statusCode < 400;

        results.push({
          name:      `url:${clientId}:${envName}`,
          category:  'environment-urls',
          severity:  c.severity,
          status:    ok ? 'PASS' : 'WARN',
          message:   `${clientId}/${envName} - HTTP ${statusCode} (${durationMs}ms): ${envEntry.baseUrl}`,
          clientId,
          durationMs,
        });
      } catch (e) {
        results.push({
          name:      `url:${clientId}:${envName}`,
          category:  'environment-urls',
          severity:  c.severity,
          status:    'FAIL',
          message:   `${clientId}/${envName} unreachable: ${envEntry.baseUrl}`,
          detail:    String(e),
          clientId,
          durationMs: Date.now() - start,
        });
      }
    }
  }

  return results;
}

function _httpGet(url: string, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      res.resume(); // drain body
      resolve(res.statusCode ?? 0);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout after ${timeoutMs}ms`)); });
    req.on('error',   reject);
  });
}

// -- Check 8: Dashboard services -----------------------------------------------

function checkDashboardServices(cfg: HealthConfig): CheckResult[] {
  const c = cfg.checks['dashboardServices'];
  if (!c?.enabled) return [_skip('dashboard-services', 'dashboard-services', 'CRITICAL', 'Disabled in config')];

  const services = (c['services'] as string[]) ?? [];

  return services.map(svcPath => {
    const full = path.join(WORKSPACE_ROOT, svcPath);
    const name = path.basename(svcPath, '.js');
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(full);
      return _pass(`service:${name}`, 'dashboard-services', c.severity, `Loads OK: ${svcPath}`);
    } catch (e) {
      return _fail(`service:${name}`, 'dashboard-services', c.severity, `Failed to load: ${svcPath}`, String(e));
    }
  });
}

// -- Report builder ------------------------------------------------------------

function buildReport(checks: CheckResult[], startMs: number): HealthReport {
  const summary = {
    total:          checks.length,
    pass:           checks.filter(c => c.status === 'PASS').length,
    fail:           checks.filter(c => c.status === 'FAIL').length,
    warn:           checks.filter(c => c.status === 'WARN').length,
    skip:           checks.filter(c => c.status === 'SKIP').length,
    criticalFailed: checks.filter(c => c.status === 'FAIL' && c.severity === 'CRITICAL').length,
    highFailed:     checks.filter(c => c.status === 'FAIL' && c.severity === 'HIGH').length,
  };

  return {
    timestamp:  new Date().toISOString(),
    durationMs: Date.now() - startMs,
    summary,
    ok:         summary.criticalFailed === 0 && summary.highFailed === 0,
    checks,
  };
}

// -- Console renderer ----------------------------------------------------------

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
};

function col(code: string, text: string): string {
  return JSON_OUTPUT ? text : `${code}${text}${C.reset}`;
}

function statusBadge(s: CheckStatus): string {
  switch (s) {
    case 'PASS': return col(C.green,          '');
    case 'FAIL': return col(C.red,            '✗');
    case 'WARN': return col(C.yellow,         '[!]');
    case 'SKIP': return col(C.dim,            '-');
  }
}

function severityBadge(s: Severity): string {
  switch (s) {
    case 'CRITICAL': return col(C.red,    s);
    case 'HIGH':     return col(C.yellow, s);
    case 'MEDIUM':   return col(C.cyan,   s);
    case 'LOW':      return col(C.dim,    s);
  }
}

function printReport(report: HealthReport): void {
  if (JSON_OUTPUT) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return;
  }

  const LINE = col(C.bold, '-'.repeat(60));
  console.log(`\n${LINE}`);
  console.log(col(C.bold, ' Phase 5.5 - Pre-flight Validation Report'));
  console.log(LINE);
  console.log(`  ${col(C.dim, report.timestamp)}  |  ${report.durationMs}ms\n`);

  let lastCat = '';
  for (const chk of report.checks) {
    if (chk.category !== lastCat) {
      lastCat = chk.category;
      console.log(`\n  ${col(C.bold + C.blue, chk.category.toUpperCase().replace(/-/g, ' '))}`);
    }
    const badge = `[${severityBadge(chk.severity)}]`;
    console.log(`  ${statusBadge(chk.status)} ${badge} ${chk.message}`);
    if (chk.detail && chk.status !== 'PASS') {
      console.log(`    ${col(C.dim, chk.detail)}`);
    }
  }

  const s = report.summary;
  console.log(`\n${LINE}`);
  console.log(
    `  ${col(C.green, `${s.pass} passed`)}  ` +
    `${col(C.red,    `${s.fail} failed`)}  ` +
    `${col(C.yellow, `${s.warn} warnings`)}  ` +
    `${col(C.dim,    `${s.skip} skipped`)}  /  ${s.total} checks`,
  );
  console.log(`  ${
    report.ok
      ? col(C.green + C.bold, ' All critical/high checks passed - platform is ready')
      : col(C.red   + C.bold, `✗ ${s.criticalFailed + s.highFailed} critical/high failure(s) - review above before proceeding`)
  }`);
  console.log(`${LINE}\n`);
}

// -- Report writer -------------------------------------------------------------

function writeReport(report: HealthReport, cfg: HealthConfig): void {
  if (!cfg.report.formats.includes('json')) return;

  const reportDir = _abs(cfg.report.writeTo);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const ts   = report.timestamp.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const file = path.join(reportDir, `health-${ts}.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');

  if (!JSON_OUTPUT) {
    console.log(`  ${col(C.dim, `Report saved: ${path.relative(WORKSPACE_ROOT, file)}`)}\n`);
  }

  // Prune old reports
  const keepLast = cfg.report.keepLast ?? 30;
  const existing = fs.readdirSync(reportDir)
    .filter(f => f.startsWith('health-') && f.endsWith('.json'))
    .sort();

  if (existing.length > keepLast) {
    for (const f of existing.slice(0, existing.length - keepLast)) {
      try { fs.unlinkSync(path.join(reportDir, f)); } catch { /* ignore */ }
    }
  }
}

// -- Entry point ---------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now();

  let config: HealthConfig;
  try {
    config = loadConfig();
  } catch (e) {
    process.stderr.write(`[health-check] Config error: ${String(e)}\n`);
    process.exit(1);
  }

  const clients = getClients(config);

  if (!JSON_OUTPUT) {
    console.log(`\n[health-check] Validating ${clients.length} client(s): ${clients.join(', ') || '(none)'}`);
  }

  const checks: CheckResult[] = [
    ...checkRequiredFolders(config),
    ...checkClientConfigs(config, clients),
    ...checkRepositories(config),
    ...checkCatalogManifest(config),
    ...checkSpecFiles(config),
    ...checkAuthSetupFiles(config, clients),
    ...(await checkEnvironmentUrls(config, clients)),
    ...checkDashboardServices(config),
  ];

  const report = buildReport(checks, startMs);

  printReport(report);
  writeReport(report, config);

  process.exit(report.ok ? 0 : 1);
}

main().catch(e => {
  process.stderr.write(`[health-check] Unexpected error: ${String(e)}\n`);
  process.exit(1);
});
