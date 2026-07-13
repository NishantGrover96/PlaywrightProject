#!/usr/bin/env node
'use strict';

/**
 * Repository Analysis Pipeline - Entry Point
 *
 * Usage:
 *   node scripts/analysis/analyze.js --client <clientId>
 *   node scripts/analysis/analyze.js --client <clientId> --module <moduleName>
 *   node scripts/analysis/analyze.js --client <clientId> --feature <FEATURE-ID>
 *   node scripts/analysis/analyze.js --client <clientId> --generate
 *   node scripts/analysis/analyze.js --client <clientId> --generate --feature <FEATURE-ID>
 *   node scripts/analysis/analyze.js --help
 *
 * Pipeline stages:
 *   1. Load config
 *   2. Resolve & validate client repository
 *   3. Scan files
 *   4. Detect features
 *   5. Score confidence
 *   6. Write catalog (feature.json + review.md per feature)
 *   7. Update catalog manifest
 *   8. Update repo registry
 *   9. [Optional --generate] Generate Playwright artifacts for Approved features
 */

const path = require('path');

const { loadAnalysisConfig }   = require('./lib/config-loader');
const { createLogger }         = require('./lib/logger');
const { resolveRepo }          = require('./lib/repo-resolver');
const { scan }                 = require('./lib/file-scanner');
const { detectFeatures }       = require('./lib/feature-detector');
const { scoreAll }             = require('./lib/confidence-scorer');
const { writeCatalog }         = require('./lib/catalog-writer');
const { updateManifest }       = require('./lib/manifest-updater');
const { updateRegistry }       = require('./lib/registry-updater');
const { generate,
        loadApprovedFeatures } = require('./lib/playwright-generator');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args   = argv.slice(2);
  const result = {
    clientId:      null,
    filterModule:  null,
    filterFeature: null,
    generateOnly:  false,
    help:          false,
    dryRun:        false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--client':   result.clientId      = args[++i]; break;
      case '--module':   result.filterModule  = args[++i]; break;
      case '--feature':  result.filterFeature = args[++i]; break;
      case '--generate': result.generateOnly  = true;      break;
      case '--dry-run':  result.dryRun        = true;      break;
      case '--help':
      case '-h':         result.help          = true;      break;
      default:
        // Allow positional: analyze.js <clientId>
        if (!args[i].startsWith('-') && !result.clientId) {
          result.clientId = args[i];
        }
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Repository Analysis Pipeline
-------------------------------------------------------------
Usage:
  node scripts/analysis/analyze.js --client <clientId>
  node scripts/analysis/analyze.js --client <clientId> --module <module>
  node scripts/analysis/analyze.js --client <clientId> --feature <FEATURE-ID>
  node scripts/analysis/analyze.js --client <clientId> --generate
  node scripts/analysis/analyze.js --client <clientId> --generate --feature <ID>

Options:
  --client   <id>    Client ID (required). Must be registered in repos.local.json.
  --module   <name>  Limit analysis to one module.
  --feature  <id>    Limit analysis (or generation) to one Feature ID.
  --generate         Generate Playwright artifacts for Approved features only.
  --dry-run          Run analysis without writing any files.
  --help, -h         Show this help.

Examples:
  node scripts/analysis/analyze.js --client acme-corp
  node scripts/analysis/analyze.js --client acme-corp --module Admin
  node scripts/analysis/analyze.js --client acme-corp --generate
  node scripts/analysis/analyze.js --client acme-corp --generate --feature ADMIN-USERS

Pipeline flow:
  1. Validate client repository from config/repos.local.json
  2. Scan source files (respects ignore patterns from config/analysis.config.json)
  3. Detect modules, features, endpoints, forms, validations, roles
  4. Score confidence (0-100%)
  5. Write docs/functional-catalogs/{clientId}/.../{feature.json + review.md}
  6. Update dashboard/catalogs/{clientId}-manifest.json
  7. Update config/repos.local.json (lastSync, lastCommit)

After analysis, review review.md files and update feature.json status to "Approved"
before running --generate.
-------------------------------------------------------------
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.clientId) {
    console.error('\n  [ERROR] --client <clientId> is required.\n');
    printHelp();
    process.exit(1);
  }

  const runId = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  const log   = createLogger(args.clientId, runId);

  log.section(`Repository Analysis - ${args.clientId.toUpperCase()}`);
  log.info(`Run ID : ${runId}`);
  log.info(`Mode   : ${args.generateOnly ? 'Generate only' : 'Full analysis'}${args.dryRun ? ' (dry-run)' : ''}`);
  if (args.filterModule)  log.info(`Module filter  : ${args.filterModule}`);
  if (args.filterFeature) log.info(`Feature filter : ${args.filterFeature}`);

  const cfg = _loadConfig(log);
  if (!cfg) { await log.close(); process.exit(1); }

  // ---------------------------------------------------------------------------
  // Generate-only mode: skip scan, load from catalog, generate for Approved
  // ---------------------------------------------------------------------------

  if (args.generateOnly) {
    log.info('Generate-only mode: loading features from catalog...');

    const features = await loadApprovedFeatures(args.clientId);
    if (features.length === 0) {
      log.warn('No features found in catalog. Run analysis first.');
      await log.close();
      process.exit(0);
    }

    log.info(`Loaded ${features.length} feature(s) from catalog.`);

    if (!args.dryRun) {
      const report = await generate(args.clientId, features, log, {
        filterModule:  args.filterModule,
        filterFeature: args.filterFeature,
      });
      _printGenerationReport(report, log);
    } else {
      log.info('[dry-run] Would generate artifacts for Approved features.');
    }

    await log.close();
    process.exit(0);
  }

  // ---------------------------------------------------------------------------
  // Full pipeline
  // ---------------------------------------------------------------------------

  let repoContext;
  try {
    repoContext = resolveRepo(args.clientId, log);
    log.info(`Repository: ${repoContext.localPath}`);
    log.info(`Branch    : ${repoContext.branch}`);
    log.info(`Commit    : ${repoContext.currentCommit || '(unknown)'}`);
  } catch (err) {
    log.error(`Repository resolution failed: ${err.message}`, err);
    await log.close();
    process.exit(1);
  }

  // -- Stage: Scan --------------------------------------------------------
  log.section('Scanning Files');
  const cacheStore = {};
  let scanResult;

  try {
    scanResult = await scan(repoContext.localPath, cfg, log, cacheStore);
  } catch (err) {
    log.error(`File scan failed: ${err.message}`, err);
    await _registryFail(args.clientId, repoContext, log);
    await log.close();
    process.exit(1);
  }

  log.stat({
    'Files accepted': scanResult.totalScanned,
    'Files skipped':  scanResult.skipped.length,
    'Scan errors':    scanResult.errors.length,
    'Elapsed (scan)': `${scanResult.elapsedMs}ms`,
  });

  if (scanResult.errors.length > 0) {
    scanResult.errors.forEach(e => log.warn(`Scan error: ${e}`));
  }

  // -- Stage: Detect features ---------------------------------------------
  let features;
  try {
    features = await detectFeatures(
      scanResult.files, repoContext.localPath, cfg, log,
      { filterModule: args.filterModule, filterFeature: args.filterFeature }
    );
  } catch (err) {
    log.error(`Feature detection failed: ${err.message}`, err);
    await _registryFail(args.clientId, repoContext, log);
    await log.close();
    process.exit(1);
  }

  // -- Stage: Score -------------------------------------------------------
  const scoredFeatures = scoreAll(features, cfg);

  log.stat({
    'Modules found':     [...new Set(scoredFeatures.map(f => f.module))].length,
    'Features found':    scoredFeatures.length,
    'High confidence':   scoredFeatures.filter(f => f.confidence >= 85).length,
    'Medium confidence': scoredFeatures.filter(f => f.confidence >= 70 && f.confidence < 85).length,
    'Low confidence':    scoredFeatures.filter(f => f.confidence < 70).length,
  });

  if (args.dryRun) {
    log.info('[dry-run] Skipping catalog write, manifest update, and registry update.');
    _printDiscoveredFeatures(scoredFeatures, log);
    await log.close();
    process.exit(0);
  }

  // -- Stage: Write catalog -----------------------------------------------
  let writtenItems;
  try {
    writtenItems = await writeCatalog(args.clientId, scoredFeatures, repoContext, log);
  } catch (err) {
    log.error(`Catalog write failed: ${err.message}`, err);
    await _registryFail(args.clientId, repoContext, log);
    await log.close();
    process.exit(1);
  }

  // -- Stage: Update manifest ---------------------------------------------
  try {
    await updateManifest(args.clientId, scoredFeatures, repoContext, writtenItems, log);
  } catch (err) {
    log.warn(`Manifest update failed (non-fatal): ${err.message}`);
  }

  // -- Stage: Update registry ---------------------------------------------
  try {
    await updateRegistry(args.clientId, repoContext, 'completed', log);
  } catch (err) {
    log.warn(`Registry update failed (non-fatal): ${err.message}`);
  }

  // -- Summary -----------------------------------------------------------
  _printDiscoveredFeatures(scoredFeatures, log);

  log.section('Analysis Complete');
  log.info('Next step: review docs/functional-catalogs/{clientId}/ - open each review.md');
  log.info('Set feature.json -> status to "Approved" then run:');
  log.info(`  node scripts/analysis/analyze.js --client ${args.clientId} --generate`);

  await log.close();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _loadConfig(log) {
  try {
    const cfg = loadAnalysisConfig();
    log.info('Analysis config loaded.');
    return cfg;
  } catch (err) {
    log.error(`Failed to load analysis.config.json: ${err.message}`, err);
    return null;
  }
}

async function _registryFail(clientId, repoContext, log) {
  try {
    if (repoContext) await updateRegistry(clientId, repoContext, 'failed', log);
  } catch {}
}

function _printDiscoveredFeatures(features, log) {
  if (features.length === 0) {
    log.warn('No features discovered. Check module detection patterns in config/analysis.config.json.');
    return;
  }

  log.section('Discovered Features');
  const grouped = {};
  for (const f of features) {
    if (!grouped[f.module]) grouped[f.module] = [];
    grouped[f.module].push(f);
  }

  for (const [mod, modFeatures] of Object.entries(grouped)) {
    log.info(`\n  Module: ${mod}`);
    for (const f of modFeatures) {
      const bar   = _confidenceBar(f.confidence);
      const warns = f.warnings.length > 0 ? ` [${f.warnings.length} warning(s)]` : '';
      log.info(`    ${f.featureId.padEnd(40)} ${bar} ${f.confidence}%${warns}`);
    }
  }
}

function _printGenerationReport(report, log) {
  log.info(`Generated : ${report.generated.length}`);
  log.info(`Skipped   : ${report.skipped.length}`);
  log.info(`Errors    : ${report.errors.length}`);

  if (report.skipped.length > 0) {
    for (const s of report.skipped) {
      log.warn(`  Skipped ${s.featureId}: ${s.reason}`);
    }
  }
}

function _confidenceBar(score) {
  const filled = Math.round(score / 10);
  return '[' + '█'.repeat(filled) + '░'.repeat(10 - filled) + ']';
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch(err => {
  console.error(`\n  [FATAL] Unhandled error: ${err.message}\n`);
  console.error(err.stack);
  process.exit(2);
});
