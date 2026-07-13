'use strict';

/**
 * Health Service - Phase 5.5 Pre-flight Validation
 *
 * JavaScript mirror of health-check.ts for use by dashboard/server.js.
 * Runs the same checks without requiring ts-node or a build step.
 *
 * Exports:
 *   runHealthChecks(opts?)       -> Promise<HealthReport>  - full checks, includes URL probes
 *   runQuickHealthChecks(opts?)  -> HealthReport            - fast sync checks only (no HTTP)
 *
 * Options: { clientId?: string, skipUrls?: boolean }
 */

const fs    = require('fs');
const path  = require('path');
const http  = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..', '..');

// -- Result constructors -------------------------------------------------------

function _pass(name, cat, sev, msg, clientId)              { return { name, category: cat, severity: sev, status: 'PASS', message: msg, clientId }; }
function _fail(name, cat, sev, msg, detail, clientId)      { return { name, category: cat, severity: sev, status: 'FAIL', message: msg, detail, clientId }; }
function _warn(name, cat, sev, msg, detail, clientId)      { return { name, category: cat, severity: sev, status: 'WARN', message: msg, detail, clientId }; }
function _skip(name, cat, sev, reason)                     { return { name, category: cat, severity: sev, status: 'SKIP', message: reason }; }

function _abs(rel) {
  return path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
}

// -- Config --------------------------------------------------------------------

function _loadConfig() {
  const base  = path.join(ROOT, 'config', 'health-check.config.json');
  const local = path.join(ROOT, 'config', 'health-check.local.json');
  let cfg;
  try   { cfg = JSON.parse(fs.readFileSync(base, 'utf8')); }
  catch { cfg = _defaultConfig(); }

  if (fs.existsSync(local)) {
    try   { cfg = _deepMerge(cfg, JSON.parse(fs.readFileSync(local, 'utf8'))); }
    catch { /* bad local override - ignore */ }
  }
  return cfg;
}

function _deepMerge(base, override) {
  const result = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') {
      result[k] = _deepMerge(base[k], v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function _defaultConfig() {
  return {
    scope:  { clients: 'all', environments: ['production'] },
    checks: {
      requiredFolders:    { enabled: true, severity: 'CRITICAL', paths: ['tests/playwright/specs', 'config/clients', 'dashboard'] },
      clientConfig:       { enabled: true, severity: 'CRITICAL', requiredFields: ['clientId', 'clientName', 'environments', 'roles'] },
      repositories:       { enabled: true, severity: 'HIGH' },
      catalogManifest:    { enabled: true, severity: 'CRITICAL' },
      specFiles:          { enabled: true, severity: 'CRITICAL' },
      authSetupFiles:     { enabled: true, severity: 'HIGH',   roles: ['dealer', 'admin'] },
      environmentUrls:    { enabled: true, severity: 'MEDIUM', timeoutMs: 5000, environments: ['production'] },
      dashboardServices:  {
        enabled:   true,
        severity:  'CRITICAL',
        services:  [
          'dashboard/services/catalog-service',
          'dashboard/services/client-service',
          'dashboard/services/feature-service',
          'dashboard/services/execution-resolver',
          'dashboard/services/repository-service',
          'dashboard/services/engine-adapter',
        ],
      },
    },
    report: { writeTo: 'docs/health-reports', formats: ['json'], keepLast: 30 },
  };
}

// -- Client discovery ----------------------------------------------------------

function _getClients(cfg, onlyClient) {
  const dir = path.join(ROOT, 'config', 'clients');
  if (!fs.existsSync(dir)) return onlyClient ? [onlyClient] : [];
  const all = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  if (onlyClient) return [onlyClient];
  if (Array.isArray(cfg.scope?.clients)) return cfg.scope.clients;
  return all;
}

// -- Check: Required folders ---------------------------------------------------

function _checkRequiredFolders(cfg) {
  const c = cfg.checks.requiredFolders;
  if (!c?.enabled) return [_skip('required-folders', 'required-folders', 'CRITICAL', 'Disabled')];
  return (c.paths || []).map(rel => {
    const full = _abs(rel);
    return fs.existsSync(full)
      ? _pass(`folder:${rel}`, 'required-folders', c.severity, `Exists: ${rel}`)
      : _fail(`folder:${rel}`, 'required-folders', c.severity, `Missing: ${rel}`, `Expected: ${full}`);
  });
}

// -- Check: Client configs -----------------------------------------------------

function _checkClientConfigs(cfg, clients) {
  const c = cfg.checks.clientConfig;
  if (!c?.enabled) return [_skip('client-config', 'client-config', 'CRITICAL', 'Disabled')];

  const required = c.requiredFields || ['clientId', 'clientName', 'environments', 'roles'];
  const results  = [];

  for (const clientId of clients) {
    const cfgPath = path.join(ROOT, 'config', 'clients', `${clientId}.json`);
    if (!fs.existsSync(cfgPath)) {
      results.push(_fail(`client-config:${clientId}`, 'client-config', c.severity, `Config missing: ${clientId}.json`, undefined, clientId));
      continue;
    }
    let parsed;
    try   { parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); }
    catch (e) { results.push(_fail(`client-config:${clientId}`, 'client-config', c.severity, `Invalid JSON: ${clientId}.json`, String(e), clientId)); continue; }

    const missing = required.filter(f => !(f in parsed));
    if (missing.length > 0) {
      results.push(_fail(`client-config:${clientId}`, 'client-config', c.severity, `Missing fields: ${missing.join(', ')}`, undefined, clientId));
      continue;
    }
    const envs  = parsed.environments || {};
    const empty = Object.entries(envs).filter(([, v]) => !v?.baseUrl).map(([k]) => k);
    if (empty.length > 0) {
      results.push(_warn(`client-config:${clientId}`, 'client-config', c.severity, `Environments missing baseUrl: ${empty.join(', ')}`, undefined, clientId));
      continue;
    }
    const roles = parsed.roles;
    if (!Array.isArray(roles) || roles.length === 0) {
      results.push(_warn(`client-config:${clientId}`, 'client-config', c.severity, `No roles defined for: ${clientId}`, undefined, clientId));
      continue;
    }
    results.push(_pass(`client-config:${clientId}`, 'client-config', c.severity,
      `Valid - ${clientId}: ${Object.keys(envs).length} env(s), roles: ${roles.join(', ')}`, clientId));
  }

  return results;
}

// -- Check: Repositories -------------------------------------------------------

function _checkRepositories(cfg) {
  const c = cfg.checks.repositories;
  if (!c?.enabled) return [_skip('repositories', 'repositories', 'HIGH', 'Disabled')];

  const reposPath = path.join(ROOT, 'config', 'repos.local.json');
  if (!fs.existsSync(reposPath)) {
    return [_warn('repositories', 'repositories', c.severity,
      'config/repos.local.json not found - repository paths not configured',
      'Copy config/repos.json -> config/repos.local.json and fill in local paths')];
  }

  let registry;
  try   { registry = JSON.parse(fs.readFileSync(reposPath, 'utf8')); }
  catch (e) { return [_fail('repositories', 'repositories', c.severity, 'repos.local.json invalid JSON', String(e))]; }

  const results = [];
  for (const [key, val] of Object.entries(registry)) {
    if (key.startsWith('_')) continue;
    const root = val?.root;
    if (!root || root.startsWith('{{')) {
      results.push(_warn(`repository:${key}`, 'repositories', c.severity, `"${key}" root path not configured`));
      continue;
    }
    if (!fs.existsSync(root)) {
      results.push(_fail(`repository:${key}`, 'repositories', c.severity, `"${key}" root does not exist: ${root}`));
      continue;
    }
    if (!fs.existsSync(path.join(root, '.git'))) {
      results.push(_warn(`repository:${key}`, 'repositories', c.severity, `"${key}" has no .git folder: ${root}`));
      continue;
    }
    results.push(_pass(`repository:${key}`, 'repositories', c.severity, `"${key}" accessible: ${root}`));
  }
  if (results.length === 0) {
    results.push(_warn('repositories', 'repositories', c.severity, 'No repository entries in repos.local.json'));
  }
  return results;
}

// -- Check: Catalog manifest ---------------------------------------------------

function _checkCatalogManifest(cfg) {
  const c = cfg.checks.catalogManifest;
  if (!c?.enabled) return [_skip('catalog-manifest', 'catalog-manifest', 'CRITICAL', 'Disabled')];

  const manifestPath = path.join(ROOT, 'dashboard', 'catalog-manifest.json');
  if (!fs.existsSync(manifestPath)) return [_fail('catalog-manifest', 'catalog-manifest', c.severity, 'catalog-manifest.json not found')];

  let manifest;
  try   { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch (e) { return [_fail('catalog-manifest', 'catalog-manifest', c.severity, 'catalog-manifest.json invalid JSON', String(e))]; }

  const entries = Object.entries(manifest);
  const results = [_pass('catalog-manifest:exists', 'catalog-manifest', c.severity, `Loaded: ${entries.length} entries`)];

  for (const [featureId, entry] of entries) {
    if (entry.catalogFile && !fs.existsSync(_abs(entry.catalogFile))) {
      results.push(_warn(`catalog-manifest:file:${featureId}`, 'catalog-manifest', c.severity, `Catalog file missing: ${entry.catalogFile}`));
    }
  }
  return results;
}

// -- Check: Spec files ---------------------------------------------------------

function _checkSpecFiles(cfg) {
  const c = cfg.checks.specFiles;
  if (!c?.enabled) return [_skip('spec-files', 'spec-files', 'CRITICAL', 'Disabled')];

  const manifestPath = path.join(ROOT, 'dashboard', 'catalog-manifest.json');
  if (!fs.existsSync(manifestPath)) return [_skip('spec-files', 'spec-files', c.severity, 'catalog-manifest.json missing')];

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results  = [];
  let totalRefs  = 0;

  for (const [featureId, entry] of Object.entries(manifest)) {
    const specFiles = entry.specFiles || {};
    for (const [tier, specPath] of Object.entries(specFiles)) {
      if (!specPath) continue;
      totalRefs++;
      if (!fs.existsSync(_abs(specPath))) {
        results.push(_fail(`spec-file:${featureId}:${tier}`, 'spec-files', c.severity, `Missing: ${featureId} [${tier}] -> ${specPath}`));
      }
    }
  }
  if (results.length === 0) {
    results.push(_pass('spec-files:all', 'spec-files', c.severity, `All ${totalRefs} spec files exist`));
  }
  return results;
}

// -- Check: Auth setup files ---------------------------------------------------

const LEGACY_CLIENTS = new Set(['demoportal', 'certainteed', 'samsung']);

function _checkAuthSetupFiles(cfg, clients) {
  const c = cfg.checks.authSetupFiles;
  if (!c?.enabled) return [_skip('auth-setup-files', 'auth-setup-files', 'HIGH', 'Disabled')];

  const roles   = c.roles || ['dealer', 'admin'];
  const authDir = path.join(ROOT, 'tests', 'playwright', 'fixtures', '.auth');
  if (!fs.existsSync(authDir)) {
    return [_warn('auth-setup-files:dir', 'auth-setup-files', c.severity,
      '.auth directory missing', 'Run setup project to generate storage state files')];
  }

  const results = [];
  for (const clientId of clients) {
    for (const role of roles) {
      const filename      = role === 'admin' ? 'admin.json' : 'user.json';
      const clientAuthDir = path.join(authDir, clientId);
      const authFile = LEGACY_CLIENTS.has(clientId)
        ? path.join(authDir, filename)
        : fs.existsSync(clientAuthDir)
          ? path.join(clientAuthDir, filename)
          : path.join(authDir, filename);

      const rel = path.relative(ROOT, authFile).replace(/\\/g, '/');
      if (!fs.existsSync(authFile)) {
        results.push(_warn(`auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
          `Auth file missing - ${clientId}/${role}: ${rel}`, 'Run setup project', clientId));
        continue;
      }
      try {
        const parsed     = JSON.parse(fs.readFileSync(authFile, 'utf8'));
        const hasContent = (Array.isArray(parsed.cookies) && parsed.cookies.length > 0) ||
                           (Array.isArray(parsed.origins) && parsed.origins.length > 0);
        if (!hasContent) {
          results.push(_warn(`auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
            `Auth file has empty session - ${clientId}/${role}: ${rel}`, 'Re-run auth setup', clientId));
        } else {
          results.push(_pass(`auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
            `Auth file valid - ${clientId}/${role}`, clientId));
        }
      } catch {
        results.push(_warn(`auth:${clientId}:${role}`, 'auth-setup-files', c.severity,
          `Auth file not valid JSON - ${clientId}/${role}: ${rel}`, undefined, clientId));
      }
    }
  }
  return results;
}

// -- Check: Environment URLs ---------------------------------------------------

async function _checkEnvironmentUrls(cfg, clients, skipUrls) {
  const c = cfg.checks.environmentUrls;
  if (!c?.enabled || skipUrls) {
    return [_skip('environment-urls', 'environment-urls', 'MEDIUM', skipUrls ? 'skip-urls requested' : 'Disabled')];
  }

  const envs      = c.environments || ['production'];
  const timeoutMs = c.timeoutMs    || 5000;
  const results   = [];

  for (const clientId of clients) {
    const cfgPath = path.join(ROOT, 'config', 'clients', `${clientId}.json`);
    if (!fs.existsSync(cfgPath)) continue;
    let parsed;
    try   { parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); }
    catch { continue; }

    const environments = parsed.environments || {};
    for (const envName of envs) {
      const envEntry = environments[envName];
      if (!envEntry?.baseUrl) {
        results.push(_skip(`url:${clientId}:${envName}`, 'environment-urls', c.severity, `No baseUrl for ${clientId}/${envName}`));
        continue;
      }
      const start = Date.now();
      try {
        const status = await _httpGet(envEntry.baseUrl, timeoutMs);
        const ms     = Date.now() - start;
        results.push({
          name:      `url:${clientId}:${envName}`,
          category:  'environment-urls',
          severity:  c.severity,
          status:    (status >= 200 && status < 400) ? 'PASS' : 'WARN',
          message:   `${clientId}/${envName} HTTP ${status} (${ms}ms): ${envEntry.baseUrl}`,
          clientId,
          durationMs: ms,
        });
      } catch (e) {
        results.push(_fail(`url:${clientId}:${envName}`, 'environment-urls', c.severity,
          `${clientId}/${envName} unreachable: ${envEntry.baseUrl}`, String(e), clientId));
      }
    }
  }
  return results;
}

function _httpGet(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, res => { res.resume(); resolve(res.statusCode || 0); });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout after ${timeoutMs}ms`)); });
    req.on('error',   reject);
  });
}

// -- Check: Dashboard services -------------------------------------------------

function _checkDashboardServices(cfg) {
  const c = cfg.checks.dashboardServices;
  if (!c?.enabled) return [_skip('dashboard-services', 'dashboard-services', 'CRITICAL', 'Disabled')];

  return (c.services || []).map(svcPath => {
    const name = path.basename(svcPath, '.js');
    try {
      require(path.join(ROOT, svcPath));
      return _pass(`service:${name}`, 'dashboard-services', c.severity, `Loads OK: ${svcPath}`);
    } catch (e) {
      return _fail(`service:${name}`, 'dashboard-services', c.severity, `Failed to load: ${svcPath}`, String(e));
    }
  });
}

// -- Summary builder -----------------------------------------------------------

function _buildSummary(checks) {
  return {
    total:          checks.length,
    pass:           checks.filter(c => c.status === 'PASS').length,
    fail:           checks.filter(c => c.status === 'FAIL').length,
    warn:           checks.filter(c => c.status === 'WARN').length,
    skip:           checks.filter(c => c.status === 'SKIP').length,
    criticalFailed: checks.filter(c => c.status === 'FAIL' && c.severity === 'CRITICAL').length,
    highFailed:     checks.filter(c => c.status === 'FAIL' && c.severity === 'HIGH').length,
  };
}

function _writeReport(report, cfg) {
  if (!cfg.report?.formats?.includes('json')) return;
  try {
    const dir = _abs(cfg.report.writeTo);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ts   = report.timestamp.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const file = path.join(dir, `health-${ts}.json`);
    fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');

    // Prune oldest reports
    const keepLast = cfg.report.keepLast ?? 30;
    const reports  = fs.readdirSync(dir).filter(f => f.startsWith('health-') && f.endsWith('.json')).sort();
    if (reports.length > keepLast) {
      for (const f of reports.slice(0, reports.length - keepLast)) {
        try { fs.unlinkSync(path.join(dir, f)); } catch { /* ignore */ }
      }
    }
  } catch { /* report write failure must not break API response */ }
}

// -- Public API ----------------------------------------------------------------

/**
 * Run all health checks including async URL probes.
 *
 * @param {{ clientId?: string, skipUrls?: boolean }} opts
 * @returns {Promise<object>}  HealthReport
 */
async function runHealthChecks(opts = {}) {
  const startMs = Date.now();
  const cfg     = _loadConfig();
  const clients = _getClients(cfg, opts.clientId);

  const checks = [
    ..._checkRequiredFolders(cfg),
    ..._checkClientConfigs(cfg, clients),
    ..._checkRepositories(cfg),
    ..._checkCatalogManifest(cfg),
    ..._checkSpecFiles(cfg),
    ..._checkAuthSetupFiles(cfg, clients),
    ...(await _checkEnvironmentUrls(cfg, clients, opts.skipUrls ?? false)),
    ..._checkDashboardServices(cfg),
  ];

  const summary = _buildSummary(checks);
  const report  = {
    timestamp:  new Date().toISOString(),
    durationMs: Date.now() - startMs,
    summary,
    ok:         summary.criticalFailed === 0 && summary.highFailed === 0,
    checks,
    mode:       'full',
  };

  _writeReport(report, cfg);
  return report;
}

/**
 * Run only synchronous filesystem checks (no HTTP probes).
 * Near-instant. Safe to call on every dashboard page load.
 *
 * @param {{ clientId?: string }} opts
 * @returns {object}  HealthReport
 */
function runQuickHealthChecks(opts = {}) {
  const startMs = Date.now();
  const cfg     = _loadConfig();
  const clients = _getClients(cfg, opts.clientId);

  const checks = [
    ..._checkRequiredFolders(cfg),
    ..._checkClientConfigs(cfg, clients),
    ..._checkRepositories(cfg),
    ..._checkCatalogManifest(cfg),
    ..._checkSpecFiles(cfg),
    ..._checkAuthSetupFiles(cfg, clients),
    _skip('environment-urls', 'environment-urls', 'MEDIUM', 'Skipped in quick mode - use ?full=1 for URL probes'),
    ..._checkDashboardServices(cfg),
  ];

  const summary = _buildSummary(checks);
  return {
    timestamp:  new Date().toISOString(),
    durationMs: Date.now() - startMs,
    summary,
    ok:         summary.criticalFailed === 0 && summary.highFailed === 0,
    checks,
    mode:       'quick',
  };
}

module.exports = { runHealthChecks, runQuickHealthChecks };
