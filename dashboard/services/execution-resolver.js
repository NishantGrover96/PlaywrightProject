'use strict';

/**
 * Execution Resolver — translates a run request into concrete Playwright CLI
 * arguments and environment variables, using only metadata from services.
 *
 * No hardcoded paths. No switch statements. No FEATURE_FOLDERS.
 *
 * Input (RunRequest):
 * {
 *   clientId,
 *   environment,   // 'production' | 'uat' | 'dev' | 'testing'
 *   moduleId,      // optional — restricts to module folder
 *   featureId,     // optional — restricts to specific feature
 *   role,          // 'dealer' | 'admin' | 'dealer-custom' | ...
 *   tiers,         // ['smoke'] | ['regression'] | ['all'] | []
 *   browser,       // 'chromium' | 'firefox' | 'webkit' (future)
 *   workers,       // number (future)
 *   headed,        // boolean (future)
 *   trace,         // 'on' | 'off' | 'retain-on-failure'
 *   video,         // 'on' | 'off'
 *   retries,       // number
 *   username,      // custom role override
 *   password,      // custom role override (pre-decrypted)
 *   baseUrl,       // explicit URL override
 *   campaignOrderSeq, // legacy EngageAds param
 * }
 *
 * Output (ExecutionPlan):
 * {
 *   args,          // string[] — Playwright CLI args (after 'test')
 *   env,           // object   — environment variables
 *   specPaths,     // string[] — resolved spec paths
 *   projects,      // string[] — Playwright project names
 *   errors,        // string[] — validation errors (non-empty = do not run)
 *   warnings,      // string[] — non-fatal notes
 * }
 */

const path    = require('path');
const fs      = require('fs');

const catalogService = require('./catalog-service');
const clientService  = require('./client-service');
const featureService = require('./feature-service');

const ROOT     = path.join(__dirname, '..', '..');
const TIER_TAGS = { smoke: '@smoke', regression: '@regression', e2e: '@e2e' };

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

/**
 * Resolve a run request into a concrete execution plan.
 *
 * @param {object} request  RunRequest
 * @returns {ExecutionPlan}
 */
function resolve(request) {
  const errors   = [];
  const warnings = [];

  const clientId  = request.clientId  || 'demoportal';
  const role      = request.role      || 'dealer';
  const testEnv   = request.environment || request.testEnv || 'production';
  const featureId = request.featureId || null;
  const moduleId  = request.moduleId  || null;
  const tiers     = request.tiers     || [];
  const features  = Array.isArray(request.features) ? request.features : (featureId ? [featureId] : []);

  // 1. Validate client exists
  const clientCfg = clientService.getClient(clientId);
  if (!clientCfg) {
    warnings.push(`Client '${clientId}' config not found — using defaults.`);
  }

  // 2. Resolve spec paths
  const specPaths = _resolveSpecPaths(clientId, features, moduleId, warnings);

  // 3. Resolve Playwright projects for role
  const projects = _resolveProjects(clientId, role);

  // 4. Check if API-only run
  const isApiOnly = features.length > 0 && features.every(f => f.includes('api'));

  // 5. Build CLI args
  const args = _buildArgs(specPaths, tiers, projects, isApiOnly, request);

  // 6. Resolve base URL
  const baseUrl = request.baseUrl || clientService.getBaseUrl(clientId, testEnv) || '';

  // 7. Build env vars
  const env = _buildEnv(request, clientId, role, testEnv, baseUrl, featureId, moduleId);

  // 8. Emit warning if no spec paths found
  if (specPaths.length === 0 && features.length > 0) {
    warnings.push(`No spec paths resolved for features: [${features.join(', ')}]. Check catalog entries.`);
  }

  return {
    args,
    env,
    specPaths,
    projects,
    errors,
    warnings,
    _resolved: {
      clientId,
      role,
      testEnv,
      baseUrl,
      featureId,
      moduleId,
    },
  };
}

// ---------------------------------------------------------------------------
// Spec path resolution
// ---------------------------------------------------------------------------

function _resolveSpecPaths(clientId, features, moduleId, warnings) {
  if (features.length === 0 || features.includes('all')) {
    // No feature filter — return module-level path or entire client path
    return _resolveModulePath(clientId, moduleId, warnings);
  }

  const paths = [];

  for (const fid of features) {
    // Try catalog lookup
    const specPath = catalogService.getSpecPath(fid, clientId);
    if (specPath) {
      paths.push(specPath);
      continue;
    }

    // Fallback: try without clientId (legacy manifest)
    const legacySpecPath = catalogService.getSpecPath(fid, null);
    if (legacySpecPath) {
      paths.push(legacySpecPath);
      continue;
    }

    warnings.push(`Feature '${fid}': no spec path in catalog — skipping.`);
  }

  // Deduplicate
  return [...new Set(paths)];
}

function _resolveModulePath(clientId, moduleId, warnings) {
  // For new clients with tests under tests/playwright/clients/{clientId}/
  const clientSpecDir = path.join('tests', 'playwright', 'clients', clientId, 'specs');
  const clientSpecAbs = path.join(ROOT, clientSpecDir);

  if (fs.existsSync(clientSpecAbs)) {
    if (moduleId) {
      const modPath = path.join(clientSpecDir, moduleId.toLowerCase());
      if (fs.existsSync(path.join(ROOT, modPath))) return [modPath];
      warnings.push(`Module directory not found: ${modPath}`);
    }
    return [clientSpecDir];
  }

  // Legacy: tests under tests/playwright/specs/ (shared-platform clients)
  const legacySpecDir = path.join('tests', 'playwright', 'specs');
  if (moduleId) {
    const modPath = path.join(legacySpecDir, moduleId.toLowerCase());
    if (fs.existsSync(path.join(ROOT, modPath))) return [modPath];
    warnings.push(`Module directory not found: ${modPath} — running all specs.`);
  }

  return [legacySpecDir];
}

// ---------------------------------------------------------------------------
// Project resolution
// ---------------------------------------------------------------------------

function _resolveProjects(clientId, role) {
  return clientService.getProjectsForRole(clientId, role);
}

// ---------------------------------------------------------------------------
// CLI args builder
// ---------------------------------------------------------------------------

function _buildArgs(specPaths, tiers, projects, isApiOnly, request) {
  const args = ['test'];

  // Spec paths
  for (const p of specPaths) args.push(p);

  // Tier grep filter
  const activeTiers = (tiers || []).filter(t => t !== 'all' && TIER_TAGS[t]);
  if (activeTiers.length > 0) {
    args.push('--grep', activeTiers.map(t => TIER_TAGS[t]).join('|'));
  }

  // Projects
  if (isApiOnly) {
    args.push('--project=api');
  } else {
    for (const p of projects) args.push(`--project=${p}`);
  }

  // Optional execution flags
  if (typeof request.retries === 'number' && request.retries >= 0) {
    args.push(`--retries=${request.retries}`);
  }
  if (request.headed) {
    args.push('--headed');
  }
  if (request.workers && typeof request.workers === 'number') {
    args.push(`--workers=${request.workers}`);
  }

  args.push('--reporter=list');

  return args;
}

// ---------------------------------------------------------------------------
// Environment builder
// ---------------------------------------------------------------------------

function _buildEnv(request, clientId, role, testEnv, baseUrl, featureId, moduleId) {
  const isAdmin  = role === 'admin' || role === 'admin-custom';
  const fileEnv  = _loadEnvFile(testEnv);
  const authInfo = clientService.getAuthInfo(clientId);
  const repoInfo = clientService.getRepoInfo(clientId);

  const env = {
    ...process.env,
    ...fileEnv,

    // Core execution context
    CLIENT_ID:  clientId,
    TEST_ENV:   testEnv,
    ROLE:       role,

    // Feature/module routing (for tests that load feature profiles at runtime)
    ...(moduleId  && { MODULE_ID:  moduleId }),
    ...(featureId && { FEATURE_ID: featureId }),

    // Auth project identifier (used by playwright.config.ts project selection)
    AUTH_PROJECT: isAdmin ? 'setup-admin' : 'setup',

    // User credentials
    TEST_USER_EMAIL:    request.username || fileEnv.TEST_USER_EMAIL    || process.env.TEST_USER_EMAIL    || '',
    TEST_USER_PASSWORD: request.password || fileEnv.TEST_USER_PASSWORD || process.env.TEST_USER_PASSWORD || '',

    // Admin credential aliases
    ...(isAdmin && {
      ADMIN_EMAIL:    request.username || fileEnv.ADMIN_EMAIL    || process.env.ADMIN_EMAIL    || '',
      ADMIN_PASSWORD: request.password || fileEnv.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '',
    }),

    // URL
    ...(baseUrl && { BASE_URL: baseUrl }),

    // Client login path
    LOGIN_PATH: authInfo.loginPath,

    // Repository metadata (for traceability in test output)
    ...(repoInfo?.branch && { REPOSITORY_BRANCH: repoInfo.branch }),
    ...(repoInfo?.lastCommit && { REPOSITORY_COMMIT: repoInfo.lastCommit }),
  };

  // Legacy EngageAds param
  if (request.campaignOrderSeq) {
    env.CAMPAIGN_ORDER_SEQ = request.campaignOrderSeq;
  }

  return env;
}

// ---------------------------------------------------------------------------
// .env file loader (extracted from server.js for reuse)
// ---------------------------------------------------------------------------

function _loadEnvFile(testEnv) {
  function parse(content) {
    const out = {};
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let   val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  }

  const primary  = path.join(ROOT, `.env.${testEnv}`);
  const fallback = path.join(ROOT, '.env.production');

  if (fs.existsSync(primary))  return parse(fs.readFileSync(primary,  'utf8'));
  if (fs.existsSync(fallback)) return parse(fs.readFileSync(fallback, 'utf8'));
  return {};
}

module.exports = { resolve };
