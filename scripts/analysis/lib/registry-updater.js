'use strict';

/**
 * Registry Updater — updates config/repos.local.json after analysis.
 *
 * Updates the following fields for the analysed client:
 *   - lastSync       (ISO timestamp of this run)
 *   - lastCommit     (current Git commit SHA)
 *   - lastAnalysis   (ISO timestamp of this run)
 *   - analysisStatus ('completed' | 'failed')
 *
 * Never overwrites fields not listed above.
 * Reusable by future repo-sync.ps1 / scheduled pipelines.
 */

const fs   = require('fs');
const path = require('path');

const ROOT             = path.resolve(__dirname, '..', '..', '..');
const REPOS_LOCAL_PATH = path.join(ROOT, 'config', 'repos.local.json');

/**
 * Update the repo registry entry for a client after a successful analysis run.
 *
 * @param {string} clientId
 * @param {object} repoContext   - From repo-resolver (branch, currentCommit, etc.)
 * @param {'completed'|'failed'} status
 * @param {object} logger
 */
async function updateRegistry(clientId, repoContext, status, logger) {
  logger.section('Updating Repo Registry');

  let registry;
  try {
    const raw = await fs.promises.readFile(REPOS_LOCAL_PATH, 'utf8');
    registry  = JSON.parse(raw);
  } catch (err) {
    logger.warn(`Could not read repos.local.json: ${err.message} — skipping registry update.`);
    return;
  }

  const now = new Date().toISOString();

  // Support both nested (clients.{id}) and top-level ({id}) structures
  let entry = registry.clients?.[clientId] || registry[clientId];

  if (!entry) {
    logger.warn(`No registry entry found for '${clientId}' — skipping update.`);
    return;
  }

  entry.lastSync      = now;
  entry.lastCommit    = repoContext.currentCommit || entry.lastCommit || '';
  entry.lastAnalysis  = now;
  entry.analysisStatus = status;

  try {
    await fs.promises.writeFile(REPOS_LOCAL_PATH, JSON.stringify(registry, null, 2), 'utf8');
    logger.info(`Registry updated for '${clientId}': lastSync=${now}, status=${status}`);
  } catch (err) {
    logger.warn(`Could not write repos.local.json: ${err.message}`);
  }
}

module.exports = { updateRegistry };
