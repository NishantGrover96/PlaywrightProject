'use strict';

/**
 * Catalog Writer — writes feature.json and review.md for each discovered feature.
 *
 * Output structure per feature:
 *
 *   docs/functional-catalogs/{clientId}/{module}/feature-{featureKebab}/
 *     feature.json
 *     review.md
 *
 * Rules:
 *   - Never overwrites an existing file that has been manually edited
 *     (detected by status !== 'Discovered')
 *   - Merges with existing feature.json if status is 'Discovered' (rescan update)
 *   - review.md is always regenerated on rescan (it is a generated document)
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

/**
 * Write catalog artifacts for all features.
 *
 * @param {string}   clientId
 * @param {object[]} features     - Scored RawFeature array
 * @param {object}   repoContext  - From repo-resolver
 * @param {object}   logger
 * @returns {Promise<WrittenCatalog[]>}
 */
async function writeCatalog(clientId, features, repoContext, logger) {
  logger.section('Writing Functional Catalog');

  const written = [];

  for (const feature of features) {
    try {
      const result = await _writeFeature(clientId, feature, repoContext, logger);
      written.push(result);
    } catch (err) {
      logger.error(`Failed to write catalog for ${feature.featureId}: ${err.message}`, err);
    }
  }

  logger.info(`Catalog entries written: ${written.length}`);
  return written;
}

// ---------------------------------------------------------------------------
// Per-feature write
// ---------------------------------------------------------------------------

async function _writeFeature(clientId, feature, repoContext, logger) {
  const catalogDir = path.join(
    ROOT, 'docs', 'functional-catalogs',
    clientId,
    feature.module.toLowerCase(),
    `feature-${feature.featureKebab}`
  );

  await fs.promises.mkdir(catalogDir, { recursive: true });

  const featureJsonPath = path.join(catalogDir, 'feature.json');
  const reviewMdPath    = path.join(catalogDir, 'review.md');

  // -- feature.json --------------------------------------------------------
  const existingJson = await _readJsonSafe(featureJsonPath);

  if (existingJson && existingJson.status && existingJson.status !== 'Discovered') {
    // Manually progressed — do not overwrite content; only update sourceFiles and timestamps
    logger.warn(`  Skipping full overwrite for ${feature.featureId} (status: ${existingJson.status})`);
    existingJson.sourceFiles    = feature.sourceFiles;
    existingJson.lastAnalyzed   = new Date().toISOString();
    await _writeJson(featureJsonPath, existingJson);
  } else {
    const featureDoc = _buildFeatureJson(feature, repoContext, existingJson);
    await _writeJson(featureJsonPath, featureDoc);
    logger.info(`  [feature.json]  ${feature.featureId}`);
  }

  // -- review.md -----------------------------------------------------------
  const reviewContent = _buildReviewMd(feature, repoContext);
  await fs.promises.writeFile(reviewMdPath, reviewContent, 'utf8');
  logger.info(`  [review.md]     ${feature.featureId}`);

  return {
    featureId:   feature.featureId,
    catalogDir:  path.relative(ROOT, catalogDir).replace(/\\/g, '/'),
    featureJson: path.relative(ROOT, featureJsonPath).replace(/\\/g, '/'),
    reviewMd:    path.relative(ROOT, reviewMdPath).replace(/\\/g, '/'),
  };
}

// ---------------------------------------------------------------------------
// feature.json builder
// ---------------------------------------------------------------------------

function _buildFeatureJson(feature, repoContext, existing) {
  const now = new Date().toISOString();

  return {
    featureId:        feature.featureId,
    module:           feature.module,
    displayName:      _toDisplayName(feature.featureName),
    description:      existing?.description || '',
    navigationPath:   feature.navigationPath,
    pageType:         feature.pageType,
    status:           existing?.status || 'Discovered',
    confidence:       feature.confidence,
    discoveredAt:     existing?.discoveredAt || now,
    lastAnalyzed:     now,
    repositoryCommit: repoContext.currentCommit,
    repositoryBranch: repoContext.branch,
    sourceFiles:      feature.sourceFiles,
    roles:            feature.roles,
    endpoints:        feature.endpoints,
    forms:            feature.forms,
    validationRules:  feature.validationRules,
    businessRules:    feature.businessRules,
    crudCapabilities: feature.crudCapabilities,
    searchSupported:  feature.searchSupported,
    exportSupported:  feature.exportSupported,
    dependencies:     existing?.dependencies || [],
    warnings:         feature.warnings,
    reviewNotes:      existing?.reviewNotes || '',
    _schema:          '1.0',
  };
}

// ---------------------------------------------------------------------------
// review.md builder
// ---------------------------------------------------------------------------

function _buildReviewMd(feature, repoContext) {
  const now     = new Date().toISOString();
  const displayName = _toDisplayName(feature.featureName);
  const confidenceLabel = _confidenceLabel(feature.confidence);

  const lines = [
    `# Feature Review: ${displayName}`,
    '',
    `> **Feature ID:** \`${feature.featureId}\`  `,
    `> **Module:** ${feature.module}  `,
    `> **Status:** ${feature.confidence >= 70 ? 'Ready for Review' : 'Needs Attention'}  `,
    `> **Confidence:** ${feature.confidence}% — ${confidenceLabel}  `,
    `> **Analyzed:** ${now}  `,
    `> **Branch:** ${repoContext.branch}  `,
    `> **Commit:** ${repoContext.currentCommit || 'unknown'}  `,
    '',
    '---',
    '',
    '## Summary',
    '',
    `- **Page Type:** ${feature.pageType}`,
    `- **Navigation Path:** \`${feature.navigationPath || 'Unknown'}\``,
    `- **CRUD Capabilities:** ${feature.crudCapabilities.join(', ') || 'None detected'}`,
    `- **Search Supported:** ${feature.searchSupported ? 'Yes' : 'No'}`,
    `- **Export Supported:** ${feature.exportSupported ? 'Yes' : 'No'}`,
    `- **Roles:** ${feature.roles.join(', ')}`,
    '',
    '---',
    '',
    '## Detected Pages / Views',
    '',
    ...(feature.views.length > 0
      ? feature.views.map(v => `- \`${v}\``)
      : ['- _(none detected)_']),
    '',
    '---',
    '',
    '## Detected Controllers',
    '',
    ...(feature.controllers.length > 0
      ? feature.controllers.map(c => `- \`${c}\``)
      : ['- _(none detected)_']),
    '',
    '---',
    '',
    '## Detected Forms',
    '',
    ...(feature.forms.length > 0
      ? feature.forms.map(f => `- **${f.name}** ${f.action ? `→ \`${f.action}\`` : ''}`)
      : ['- _(none detected)_']),
    '',
    '---',
    '',
    '## Detected Validation Rules',
    '',
    ...(feature.validationRules.length > 0
      ? feature.validationRules.map(v => `- \`${v.rule}\`${v.param ? ` (${v.param})` : ''}`)
      : ['- _(none detected)_']),
    '',
    '---',
    '',
    '## Detected REST Endpoints',
    '',
    ...(feature.endpoints.length > 0
      ? feature.endpoints.map(e => `- \`${e.method.padEnd(6)}\` \`${e.path}\` ${e.description ? '— ' + e.description : ''}`)
      : ['- _(none detected)_']),
    '',
    '---',
    '',
    '## Detected Business Rules',
    '',
    ...(feature.businessRules.length > 0
      ? feature.businessRules.map(r => `- ${r}`)
      : ['- _(none detected from code comments — add manually below)_']),
    '',
    '---',
    '',
    '## Source Files',
    '',
    ...feature.sourceFiles.map(f => `- \`${f}\``),
    '',
    '---',
    '',
    '## Potential Missing Information',
    '',
    ...(feature.warnings.length > 0
      ? feature.warnings.map(w => `- ⚠️  ${w}`)
      : ['- _(no warnings)_']),
    '',
    '---',
    '',
    '## Questions for Human Review',
    '',
    '> Complete this section before changing status to **Approved**.',
    '',
    '- [ ] Is the navigation path correct? Current: `' + (feature.navigationPath || 'unknown') + '`',
    '- [ ] Are all user roles captured? Current: ' + feature.roles.map(r => `\`${r}\``).join(', '),
    '- [ ] Are there business rules not detected from code comments?',
    '- [ ] Are there additional forms or dialogs not listed above?',
    '- [ ] Are there workflow steps (multi-step process) not captured?',
    '- [ ] Are there related features or dependencies to document?',
    ...(feature.confidence < 70 ? [
      `- [ ] **Confidence is ${feature.confidence}% — identify what is missing and add it to feature.json**`,
    ] : []),
    '',
    '---',
    '',
    '## Approval',
    '',
    '```',
    'To approve this feature for Playwright test generation:',
    '',
    '1. Complete all review questions above.',
    '2. Update feature.json → status to "Approved".',
    '3. Run: node scripts/analysis/analyze.js --client <clientId> --generate --feature ' + feature.featureId,
    '```',
    '',
    '---',
    '',
    `_Generated by Repository Analysis Pipeline — ${now}_`,
    '',
  ];

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function _readJsonSafe(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function _writeJson(filePath, obj) {
  await fs.promises.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

function _toDisplayName(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function _confidenceLabel(score) {
  if (score >= 85) return 'High — complete discovery';
  if (score >= 70) return 'Medium — minor uncertainty';
  if (score >= 50) return 'Low — needs review';
  return 'Very Low — significant gaps';
}

module.exports = { writeCatalog };
