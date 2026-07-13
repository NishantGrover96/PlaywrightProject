'use strict';

/**
 * Confidence Scorer - assigns a 0-100 confidence score to each RawFeature
 * based on the signals detected during feature detection.
 *
 * Weights come from analysis.config.json -> confidenceWeights.
 *
 * Score bands:
 *   >= 85  - High confidence     (complete discovery)
 *   70-84  - Medium confidence   (minor uncertainty)
 *   50-69  - Low confidence      (needs review - auto-adds warning)
 *   <  50  - Very low confidence (significant gaps - auto-adds warning)
 */

'use strict';

/**
 * Score a single RawFeature and attach the result.
 *
 * @param {object} feature   - RawFeature from feature-detector
 * @param {object} cfg       - Parsed analysis.config.json
 * @returns {object}  The same feature object, mutated with .confidence and updated .warnings
 */
function scoreFeature(feature, cfg) {
  const weights = cfg.confidenceWeights;
  const signals = feature.signals || {};

  let total   = 0;
  let earned  = 0;

  for (const [signal, weight] of Object.entries(weights)) {
    total  += weight;
    if (signals[signal]) earned += weight;
  }

  // Extra bonus signals (not in config weights)
  if (feature.endpoints && feature.endpoints.length > 0)         { earned += 5; total += 5; }
  if (feature.forms     && feature.forms.length > 0)             { earned += 5; total += 5; }
  if (feature.crudCapabilities && feature.crudCapabilities.length > 1) { earned += 5; total += 5; }

  const score = total > 0 ? Math.round((earned / total) * 100) : 0;

  feature.confidence = score;

  // Auto-add warnings for low confidence
  if (score < 50) {
    feature.warnings = feature.warnings || [];
    feature.warnings.push(
      `Very low confidence score (${score}%). Significant discovery gaps detected.`,
      'Manual review strongly recommended before generating tests.'
    );
  } else if (score < 70) {
    feature.warnings = feature.warnings || [];
    feature.warnings.push(
      `Low confidence score (${score}%). Some discovery signals are missing.`,
      'Review the feature.json carefully before approving for test generation.'
    );
  }

  return feature;
}

/**
 * Score all features in an array (in-place mutation).
 *
 * @param {object[]} features
 * @param {object}   cfg
 * @returns {object[]}  Same array, each feature now has .confidence
 */
function scoreAll(features, cfg) {
  return features.map(f => scoreFeature(f, cfg));
}

module.exports = { scoreFeature, scoreAll };
