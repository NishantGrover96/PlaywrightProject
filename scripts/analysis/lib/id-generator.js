'use strict';

/**
 * ID Generator - produces stable, deterministic Feature IDs.
 *
 * Rules:
 *   - Format: {MODULE_UPPER}-{FEATURE_UPPER}
 *   - Only letters, digits, and hyphens
 *   - Uppercase
 *   - Stable across rescans (same inputs always produce same output)
 *   - Never uses random GUIDs
 *
 * Examples:
 *   generateFeatureId('EngageAds', 'CampaignSetup')  => 'ENGAGEADS-CAMPAIGNSETUP'
 *   generateFeatureId('Admin',     'UserManagement')  => 'ADMIN-USERMANAGEMENT'
 *   generateFeatureId('coop',      'submit-claim')    => 'COOP-SUBMITCLAIM'
 */

'use strict';

/**
 * Generate a deterministic Feature ID from module and feature names.
 *
 * @param {string} moduleName   - Raw module name (any casing, kebab or pascal)
 * @param {string} featureName  - Raw feature name (any casing, kebab or pascal)
 * @returns {string}  Normalised Feature ID, e.g. "ADMIN-USERMANAGEMENT"
 */
function generateFeatureId(moduleName, featureName) {
  const mod  = _normalise(moduleName);
  const feat = _normalise(featureName);
  return `${mod}-${feat}`;
}

/**
 * Generate a Module ID from a module name.
 *
 * @param {string} moduleName
 * @returns {string}  e.g. "ENGAGEADS"
 */
function generateModuleId(moduleName) {
  return _normalise(moduleName);
}

/**
 * Slugify a feature name for use in file/folder names (kebab-case, lowercase).
 *
 * Example: 'UserManagement' => 'user-management'
 *
 * @param {string} name
 * @returns {string}
 */
function toKebab(name) {
  return name
    // Insert hyphen before uppercase letters that follow lowercase
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Replace non-alphanumeric (except hyphens) with hyphens
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert a kebab or snake name to PascalCase for class names.
 *
 * Example: 'campaign-setup' => 'CampaignSetup'
 *
 * @param {string} name
 * @returns {string}
 */
function toPascal(name) {
  return name
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function _normalise(raw) {
  return raw
    .replace(/[-_\s]+/g, '')   // strip separators
    .replace(/[^A-Za-z0-9]/g, '') // keep alphanumeric only
    .toUpperCase();
}

module.exports = { generateFeatureId, generateModuleId, toKebab, toPascal };
