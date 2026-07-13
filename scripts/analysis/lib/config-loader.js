'use strict';

/**
 * Config Loader - reads and validates config/analysis.config.json.
 *
 * Returns the validated config object.
 * Throws a descriptive error if the file is missing or malformed.
 *
 * Reusable by all pipeline stages.
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..', '..', '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'analysis.config.json');

let _cached = null;

/**
 * Load and cache the analysis configuration.
 *
 * @returns {object}  Parsed analysis.config.json
 */
function loadAnalysisConfig() {
  if (_cached) return _cached;

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `Analysis config not found: ${CONFIG_PATH}\n` +
      `Run: node scripts/analysis/analyze.js --help  for setup instructions.`
    );
  }

  let raw;
  try {
    raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read analysis config: ${err.message}`);
  }

  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (err) {
    throw new Error(`analysis.config.json is not valid JSON: ${err.message}`);
  }

  _validateConfig(cfg);
  _cached = cfg;
  return cfg;
}

/**
 * Clear the in-memory cache (useful for testing or re-reads).
 */
function clearCache() {
  _cached = null;
}

// ---------------------------------------------------------------------------
// Internal validation
// ---------------------------------------------------------------------------

function _validateConfig(cfg) {
  const required = ['scanner', 'projectTypes', 'modules', 'featureDetection', 'pageTypes', 'confidenceWeights'];
  for (const key of required) {
    if (!cfg[key]) {
      throw new Error(`analysis.config.json is missing required section: "${key}"`);
    }
  }

  if (!Array.isArray(cfg.scanner.ignoredFolders)) {
    throw new Error('analysis.config.json: scanner.ignoredFolders must be an array');
  }

  if (typeof cfg.scanner.concurrency !== 'number' || cfg.scanner.concurrency < 1) {
    cfg.scanner.concurrency = 20; // safe default
  }
}

module.exports = { loadAnalysisConfig, clearCache };
