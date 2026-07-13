'use strict';

/**
 * Catalog Service - loads, merges, and caches all per-client catalog manifests.
 *
 * Watches dashboard/catalogs/ for file changes and auto-reloads.
 * Source of truth for all feature metadata consumed by the dashboard.
 *
 * Provides:
 *   catalogService.getAll(filters)
 *   catalogService.getByClient(clientId)
 *   catalogService.getFeature(featureId, clientId?)
 *   catalogService.getModules(clientId)
 *   catalogService.reload()
 */

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..', '..');
const CATALOGS_DIR = path.join(__dirname, '..', 'catalogs');
// Legacy single-file manifest (backward compat - DemoPortal existing entries)
const LEGACY_MANIFEST = path.join(__dirname, '..', 'catalog-manifest.json');

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

/** @type {Map<string, object>}  featureId -> feature entry, across all clients */
let _featureCache = new Map();

/** @type {Map<string, object[]>}  clientId -> array of feature entries */
let _clientCache  = new Map();

let _lastLoaded   = 0;
let _watcherStarted = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const catalogService = {

  /**
   * Load (or return cached) full catalog.
   * @returns {Map<string, object>}  featureId -> entry
   */
  load() {
    if (_featureCache.size === 0) _reload();
    return _featureCache;
  },

  /**
   * Return all features, optionally filtered.
   *
   * @param {{clientId?, moduleId?, status?, featureId?}} filters
   * @returns {object[]}
   */
  getAll(filters = {}) {
    this.load();
    let entries = [..._featureCache.values()];

    if (filters.clientId)  entries = entries.filter(e => e.clientId  === filters.clientId);
    if (filters.moduleId)  entries = entries.filter(e => (e.module  || '').toLowerCase() === filters.moduleId.toLowerCase());
    if (filters.status)    entries = entries.filter(e => e.status    === filters.status);
    if (filters.featureId) entries = entries.filter(e => e.featureId === filters.featureId);

    return entries;
  },

  /**
   * Get all features for a specific client.
   * Falls back to inherited platform when configured.
   *
   * @param {string} clientId
   * @returns {object[]}
   */
  getByClient(clientId) {
    this.load();
    const direct = [..._featureCache.values()].filter(e => e.clientId === clientId);

    // Inheritance: platform clients may inherit from a shared platform
    const clientSvc = _getClientService();
    if (clientSvc) {
      const clientCfg = clientSvc.getClient(clientId);
      if (clientCfg && clientCfg.platform && clientCfg.platform !== 'independent' && clientCfg.platform !== clientId) {
        const parentId = clientCfg.platform;
        const inherited = [..._featureCache.values()]
          .filter(e => e.clientId === parentId)
          .map(e => ({ ...e, _inherited: true, _inheritedFrom: parentId }));

        // Merge: direct entries override inherited ones
        const directIds = new Set(direct.map(e => e.featureId));
        const merged    = [...direct, ...inherited.filter(e => !directIds.has(e.featureId))];
        return merged;
      }
    }

    return direct;
  },

  /**
   * Get a single feature entry, searching across all clients or within a specific client.
   *
   * @param {string}  featureId
   * @param {string?} clientId   Optional - narrows to one client
   * @returns {object|null}
   */
  getFeature(featureId, clientId) {
    this.load();

    // Direct lookup by composite key
    const key = clientId ? `${clientId}::${featureId}` : featureId;
    if (_featureCache.has(key)) return _featureCache.get(key);

    // Fallback: scan all entries
    for (const entry of _featureCache.values()) {
      if (entry.featureId === featureId) {
        if (!clientId || entry.clientId === clientId) return entry;
      }
    }
    return null;
  },

  /**
   * Get distinct modules for a client, alphabetically sorted.
   *
   * @param {string} clientId
   * @returns {string[]}
   */
  getModules(clientId) {
    const features = this.getByClient(clientId);
    const modules  = [...new Set(features.map(f => f.module).filter(Boolean))];
    return modules.sort();
  },

  /**
   * Get spec path for a feature (from catalog entry).
   *
   * @param {string} featureId
   * @param {string} clientId
   * @returns {string|null}
   */
  getSpecPath(featureId, clientId) {
    const entry = this.getFeature(featureId, clientId);
    if (!entry) return null;

    // New schema (Phase 2 generated clients): specPath field
    if (entry.specPath) return entry.specPath;

    // Legacy schema (existing DemoPortal catalog): specFiles.smoke
    if (entry.specFiles) {
      return entry.specFiles.smoke || entry.specFiles.regression || entry.specFiles.e2e || null;
    }

    return null;
  },

  /**
   * Get coverage metadata for a feature.
   *
   * @param {string} featureId
   * @param {string} clientId
   * @returns {object}
   */
  getCoverage(featureId, clientId) {
    const entry = this.getFeature(featureId, clientId);
    if (!entry) return _emptyCoverage();
    return entry.coverage || _emptyCoverage();
  },

  /**
   * Force a full reload from disk.
   */
  reload() {
    _featureCache.clear();
    _clientCache.clear();
    _reload();
  },

  /** Start watching catalogs directory for changes. */
  watch() {
    if (_watcherStarted) return;
    _watcherStarted = true;

    if (!fs.existsSync(CATALOGS_DIR)) return;

    try {
      fs.watch(CATALOGS_DIR, { persistent: false }, (event, filename) => {
        if (filename && filename.endsWith('.json')) {
          console.log(`[catalog-service] File changed: ${filename} - reloading catalog.`);
          // Debounce: wait 300ms before reload to avoid rapid successive reloads
          clearTimeout(catalogService._reloadTimer);
          catalogService._reloadTimer = setTimeout(() => {
            _featureCache.clear();
            _clientCache.clear();
          }, 300);
        }
      });
    } catch {
      // fs.watch not supported in this environment - graceful degradation
    }
  },
};

// ---------------------------------------------------------------------------
// Internal loaders
// ---------------------------------------------------------------------------

function _reload() {
  _featureCache = new Map();
  _clientCache  = new Map();
  _lastLoaded   = Date.now();

  // 1. Load legacy manifest (DemoPortal backward compat)
  _loadLegacyManifest();

  // 2. Load per-client catalogs from dashboard/catalogs/
  _loadClientCatalogs();
}

function _loadLegacyManifest() {
  if (!fs.existsSync(LEGACY_MANIFEST)) return;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(LEGACY_MANIFEST, 'utf8'));
  } catch (err) {
    console.warn(`[catalog-service] Cannot parse legacy manifest: ${err.message}`);
    return;
  }

  for (const [featureId, entry] of Object.entries(manifest)) {
    if (typeof entry !== 'object' || !entry) continue;

    const enriched = {
      ...entry,
      featureId,
      clientId:   entry.clientId || entry.client || 'demoportal',
      module:     entry.module   || _inferModuleFromId(featureId),
      status:     entry.status   || 'Approved',  // existing catalog entries are all live/approved
      _source:    'legacy-manifest',
    };

    const cacheKey = `${enriched.clientId}::${featureId}`;
    _featureCache.set(cacheKey, enriched);
    // NOTE: do NOT add a plain featureId key - that causes duplicate results in getAll()
  }
}

function _loadClientCatalogs() {
  if (!fs.existsSync(CATALOGS_DIR)) return;

  let files;
  try {
    files = fs.readdirSync(CATALOGS_DIR).filter(f => f.endsWith('-manifest.json'));
  } catch {
    return;
  }

  for (const file of files) {
    const filePath = path.join(CATALOGS_DIR, file);
    try {
      const raw      = fs.readFileSync(filePath, 'utf8');
      const manifest = JSON.parse(raw);

      const clientId = manifest.clientId || file.replace('-manifest.json', '');

      // Support both { features: { [id]: entry } } and flat { [id]: entry } structures
      const features = manifest.features || manifest;

      for (const [featureId, entry] of Object.entries(features)) {
        if (typeof entry !== 'object' || !entry || featureId.startsWith('_')) continue;

        const enriched = {
          ...entry,
          featureId:  entry.featureId  || featureId,
          clientId:   entry.clientId   || clientId,
          module:     entry.module     || _inferModuleFromId(featureId),
          status:     entry.status     || 'Discovered',
          _source:    `catalogs/${file}`,
        };

        const cacheKey = `${enriched.clientId}::${enriched.featureId}`;
        _featureCache.set(cacheKey, enriched);
      }
    } catch (err) {
      console.warn(`[catalog-service] Cannot load catalog ${file}: ${err.message} - skipping.`);
    }
  }
}

function _inferModuleFromId(featureId) {
  // e.g. "coop-submit-claim" -> "coop"
  //      "engage-ads-campaign-setup" -> "engage-ads"
  const parts = featureId.split('-');
  if (parts.length >= 3 && parts[0] === 'engage') return 'engage-ads';
  return parts[0] || 'unknown';
}

function _emptyCoverage() {
  return { functional: 0, validation: 0, workflow: 0, database: 0, security: 0 };
}

// Lazy reference to client-service to avoid circular require
let _clientSvcRef = null;
function _getClientService() {
  if (_clientSvcRef) return _clientSvcRef;
  try {
    _clientSvcRef = require('./client-service');
  } catch { /* optional */ }
  return _clientSvcRef;
}

module.exports = catalogService;
