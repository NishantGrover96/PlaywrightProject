'use strict';

/**
 * Client Service - loads and caches all client configurations from
 * config/clients/*.json.
 *
 * Provides:
 *   clientService.getClients()               -> all clients
 *   clientService.getClient(clientId)         -> single client config
 *   clientService.getModules(clientId)        -> module list (from catalog)
 *   clientService.getRoles(clientId)          -> role list
 *   clientService.getEnvironments(clientId)   -> environment map
 *   clientService.getRepoInfo(clientId)       -> repo metadata
 *   clientService.getAuthInfo(clientId)       -> authentication config
 *
 * Caches configs in memory; watches config/clients/ for changes.
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..', '..');
const CLIENTS_DIR = path.join(ROOT, 'config', 'clients');
const USERS_DIR   = path.join(ROOT, 'config', 'users');

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

/** @type {Map<string, object>}  clientId -> parsed client config */
let _cache = new Map();
let _watcherStarted = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const clientService = {

  /**
   * Get all client configs, enriched with display metadata.
   * @returns {object[]}
   */
  getClients() {
    _ensureLoaded();

    return [..._cache.values()].map(cfg => _summarise(cfg));
  },

  /**
   * Get a single client config by ID. Returns null if not found.
   *
   * @param {string} clientId
   * @returns {object|null}
   */
  getClient(clientId) {
    _ensureLoaded();
    return _cache.get(clientId) || null;
  },

  /**
   * Get distinct modules for a client.
   * Combines: config modules array + catalog-discovered modules.
   *
   * @param {string} clientId
   * @returns {string[]}  Alphabetically sorted
   */
  getModules(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    const configModules = (cfg && Array.isArray(cfg.modules)) ? cfg.modules : [];

    // Also pull modules from the catalog (lazy import to avoid circular dep)
    let catalogModules = [];
    try {
      const catalogSvc = require('./catalog-service');
      catalogModules   = catalogSvc.getModules(clientId);
    } catch { /* catalog not yet available */ }

    const merged = [...new Set([...configModules, ...catalogModules])];
    return merged.sort();
  },

  /**
   * Get roles defined for a client.
   *
   * @param {string} clientId
   * @returns {string[]}
   */
  getRoles(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    if (!cfg) return ['dealer'];

    // Support both authentication.roles (new schema) and roles (old schema)
    const roles = cfg.authentication?.roles || cfg.roles || ['dealer'];
    return Array.isArray(roles) ? roles : ['dealer'];
  },

  /**
   * Get Playwright project names for a role.
   * Falls back to default chromium/setup projects for unknown roles.
   *
   * @param {string} clientId
   * @param {string} role
   * @returns {string[]}  e.g. ['setup', 'chromium']
   */
  getProjectsForRole(clientId, role) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);

    // Check client-level role -> project override
    const roleProjects = cfg?.roleProjects || cfg?.authentication?.roleProjects;
    if (roleProjects && roleProjects[role]) return roleProjects[role];

    // Built-in defaults (backward compat with existing DemoPortal projects)
    const defaults = {
      'dealer':        ['setup', 'chromium'],
      'dealer-custom': ['setup', 'chromium'],
      'admin':         ['setup-admin', 'chromium-admin'],
      'admin-custom':  ['setup-admin', 'chromium-admin'],
    };
    return defaults[role] || ['setup', 'chromium'];
  },

  /**
   * Get environment map for a client.
   *
   * @param {string} clientId
   * @returns {object}  { dev?, testing?, uat?, production? }
   */
  getEnvironments(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    return cfg?.environments || {};
  },

  /**
   * Resolve base URL for a client + environment combination.
   *
   * @param {string} clientId
   * @param {string} testEnv   e.g. 'production', 'uat', 'dev'
   * @returns {string|null}
   */
  getBaseUrl(clientId, testEnv) {
    const envs = this.getEnvironments(clientId);
    return envs[testEnv]?.baseUrl || null;
  },

  /**
   * Get authentication config for a client.
   *
   * @param {string} clientId
   * @returns {{ loginPath: string, roles: string[] }}
   */
  getAuthInfo(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    return {
      loginPath: cfg?.authentication?.loginPath || cfg?.loginPath || '/account/login',
      roles:     this.getRoles(clientId),
    };
  },

  /**
   * Get repo metadata for a client.
   *
   * @param {string} clientId
   * @returns {{ url, branch, localPath, lastSync, lastCommit }|null}
   */
  getRepoInfo(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    return cfg?.repo || null;
  },

  /**
   * Check if a client is a platform (shared-codebase) or independent client.
   *
   * @param {string} clientId
   * @returns {'platform'|'independent'|'unknown'}
   */
  getClientType(clientId) {
    _ensureLoaded();
    const cfg = _cache.get(clientId);
    return cfg?.platform || 'unknown';
  },

  /** Force reload of all client configs from disk. */
  reload() {
    _cache.clear();
    _load();
  },

  /** Start watching config/clients/ for file changes. */
  watch() {
    if (_watcherStarted || !fs.existsSync(CLIENTS_DIR)) return;
    _watcherStarted = true;
    try {
      fs.watch(CLIENTS_DIR, { persistent: false }, (event, filename) => {
        if (filename && filename.endsWith('.json')) {
          console.log(`[client-service] Config changed: ${filename} - reloading.`);
          clearTimeout(clientService._reloadTimer);
          clientService._reloadTimer = setTimeout(() => _cache.clear(), 1500);
        }
      });
    } catch { /* graceful */ }
  },
};

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function _ensureLoaded() {
  if (_cache.size === 0) _load();
}

function _load() {
  _cache = new Map();
  if (!fs.existsSync(CLIENTS_DIR)) return;

  let files;
  try { files = fs.readdirSync(CLIENTS_DIR).filter(f => f.endsWith('.json')); }
  catch { return; }

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(CLIENTS_DIR, file), 'utf8');
      const cfg = JSON.parse(raw);

      // Support both clientId field (new) and implicit id from filename (old)
      const id = cfg.clientId || file.replace('.json', '');
      _cache.set(id, { ...cfg, clientId: id });
    } catch (err) {
      console.warn(`[client-service] Cannot parse ${file}: ${err.message} - skipping.`);
    }
  }
}

function _summarise(cfg) {
  return {
    clientId:           cfg.clientId,
    displayName:        cfg.displayName || cfg.clientName || cfg.clientId,
    clientType:         cfg.platform    || 'unknown',
    defaultEnvironment: cfg.defaultEnvironment || 'production',
    environments:       Object.keys(cfg.environments || {}),
    roles:              cfg.authentication?.roles || cfg.roles || ['dealer'],
    modules:            cfg.modules  || [],
    featureFlags:       cfg.featureFlags || {},
    repo: {
      url:        cfg.repo?.url        || '',
      branch:     cfg.repo?.branch     || '',
      lastSync:   cfg.repo?.lastSync   || '',
      lastCommit: cfg.repo?.lastCommit || '',
    },
  };
}

module.exports = clientService;
