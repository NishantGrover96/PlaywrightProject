'use strict';

/**
 * Feature Service - metadata queries on top of the Catalog Service.
 *
 * Never reads from the file system directly - all data comes from catalog-service.
 *
 * Provides:
 *   featureService.getFeature(featureId, clientId?)
 *   featureService.getFeatures(filters)
 *   featureService.getFeaturesByClient(clientId)
 *   featureService.getFeaturesByModule(clientId, moduleId)
 *   featureService.getFeaturesByRole(clientId, role)
 *   featureService.getSpecPath(featureId, clientId)
 *   featureService.getCatalogEntry(featureId, clientId)
 *   featureService.getCoverage(clientId?)
 */

'use strict';

const catalogService = require('./catalog-service');

const featureService = {

  /**
   * Get a single feature entry.
   *
   * @param {string}  featureId
   * @param {string?} clientId
   * @returns {object|null}
   */
  getFeature(featureId, clientId) {
    return catalogService.getFeature(featureId, clientId);
  },

  /**
   * Get features with optional filtering.
   *
   * @param {{ clientId?, moduleId?, status?, role?, featureId? }} filters
   * @returns {object[]}
   */
  getFeatures(filters = {}) {
    let entries = catalogService.getAll(filters);

    // Role filter: feature must include the requested role (or roles field absent)
    if (filters.role) {
      entries = entries.filter(e => {
        if (!e.roles || e.roles.length === 0) return true;
        return e.roles.some(r => r.toLowerCase() === filters.role.toLowerCase());
      });
    }

    return entries;
  },

  /**
   * Get all features for a client (includes inherited platform features).
   *
   * @param {string} clientId
   * @returns {object[]}
   */
  getFeaturesByClient(clientId) {
    return catalogService.getByClient(clientId);
  },

  /**
   * Get features filtered by module within a client.
   *
   * @param {string} clientId
   * @param {string} moduleId
   * @returns {object[]}
   */
  getFeaturesByModule(clientId, moduleId) {
    return catalogService.getAll({ clientId, moduleId });
  },

  /**
   * Get features accessible to a specific role within a client.
   *
   * @param {string} clientId
   * @param {string} role
   * @returns {object[]}
   */
  getFeaturesByRole(clientId, role) {
    return this.getFeatures({ clientId, role });
  },

  /**
   * Resolve the spec path for a feature.
   * Returns null if the feature does not exist or has no spec path.
   *
   * @param {string}  featureId
   * @param {string?} clientId
   * @returns {string|null}
   */
  getSpecPath(featureId, clientId) {
    return catalogService.getSpecPath(featureId, clientId);
  },

  /**
   * Get the full catalog entry for a feature.
   *
   * @param {string}  featureId
   * @param {string?} clientId
   * @returns {object|null}
   */
  getCatalogEntry(featureId, clientId) {
    return catalogService.getFeature(featureId, clientId);
  },

  /**
   * Get coverage summary.
   *
   * When clientId is provided - returns per-module coverage for that client.
   * When moduleId is also provided - returns per-feature coverage.
   * When neither - returns per-client coverage.
   *
   * @param {string?} clientId
   * @param {string?} moduleId
   * @returns {object}
   */
  getCoverage(clientId, moduleId) {
    let features;

    if (clientId && moduleId) {
      features = catalogService.getAll({ clientId, moduleId });
      return _buildFeatureCoverage(features);
    }

    if (clientId) {
      features = catalogService.getByClient(clientId);
      return _buildModuleCoverage(features);
    }

    // All clients - per-client rollup
    const allFeatures  = catalogService.getAll();
    const clientGroups = _groupBy(allFeatures, 'clientId');
    const result       = {};

    for (const [cId, cFeatures] of Object.entries(clientGroups)) {
      result[cId] = {
        clientId:    cId,
        totalFeatures: cFeatures.length,
        approved:    cFeatures.filter(f => f.status === 'Approved').length,
        generated:   cFeatures.filter(f => f.status === 'Generated').length,
        coverage:    _avgCoverage(cFeatures),
      };
    }

    return result;
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _buildModuleCoverage(features) {
  const groups = _groupBy(features, 'module');
  const result = {};

  for (const [mod, modFeatures] of Object.entries(groups)) {
    result[mod] = {
      module:        mod,
      totalFeatures: modFeatures.length,
      approved:      modFeatures.filter(f => f.status === 'Approved').length,
      generated:     modFeatures.filter(f => f.status === 'Generated').length,
      coverage:      _avgCoverage(modFeatures),
    };
  }

  return result;
}

function _buildFeatureCoverage(features) {
  return features.map(f => ({
    featureId: f.featureId,
    module:    f.module,
    status:    f.status,
    coverage:  f.coverage || { functional: 0, validation: 0, workflow: 0, database: 0, security: 0 },
  }));
}

function _avgCoverage(features) {
  if (features.length === 0) return { functional: 0, validation: 0, workflow: 0, database: 0, security: 0 };

  const keys  = ['functional', 'validation', 'workflow', 'database', 'security'];
  const sums  = Object.fromEntries(keys.map(k => [k, 0]));

  for (const f of features) {
    const cov = f.coverage || {};
    for (const k of keys) sums[k] += cov[k] || 0;
  }

  return Object.fromEntries(keys.map(k => [k, Math.round(sums[k] / features.length)]));
}

function _groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const val = item[key] || 'unknown';
    if (!result[val]) result[val] = [];
    result[val].push(item);
  }
  return result;
}

module.exports = featureService;
