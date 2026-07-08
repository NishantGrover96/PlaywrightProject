'use strict';

/**
 * Repository Service — reads config/repos.local.json and exposes
 * repository metadata for all registered clients.
 *
 * Also checks whether the local repository path is accessible.
 *
 * Provides:
 *   repositoryService.getAll()
 *   repositoryService.getForClient(clientId)
 *   repositoryService.getHealth(clientId)
 */

const fs   = require('fs');
const path = require('path');

const ROOT             = path.join(__dirname, '..', '..');
const REPOS_LOCAL_PATH = path.join(ROOT, 'config', 'repos.local.json');

const repositoryService = {

  /**
   * Get repository info for all registered clients.
   * @returns {object[]}
   */
  getAll() {
    const registry = _loadRegistry();
    const entries  = [];

    const clients = registry.clients || {};
    for (const [id, entry] of Object.entries(clients)) {
      entries.push(_enrich(id, entry));
    }

    // Legacy top-level entries (not nested under .clients)
    for (const [key, val] of Object.entries(registry)) {
      if (key === 'clients' || key.startsWith('_')) continue;
      if (val && typeof val === 'object' && val.localPath) {
        if (!clients[key]) entries.push(_enrich(key, val));
      }
    }

    return entries;
  },

  /**
   * Get repository info for a specific client.
   *
   * @param {string} clientId
   * @returns {object|null}
   */
  getForClient(clientId) {
    const registry = _loadRegistry();

    const entry = registry.clients?.[clientId] || registry[clientId];
    if (!entry) return null;

    return _enrich(clientId, entry);
  },

  /**
   * Get repository health status for a client.
   *
   * @param {string} clientId
   * @returns {{ exists: boolean, accessible: boolean, isGitRepo: boolean, branch: string, commit: string }}
   */
  getHealth(clientId) {
    const info = this.getForClient(clientId);
    if (!info || !info.localPath) {
      return { exists: false, accessible: false, isGitRepo: false, branch: '', commit: '' };
    }

    const exists     = fs.existsSync(info.localPath);
    const isGitRepo  = exists && fs.existsSync(path.join(info.localPath, '.git'));
    const accessible = _isAccessible(info.localPath);

    return {
      exists,
      accessible,
      isGitRepo,
      branch:      info.branch     || '',
      commit:      info.lastCommit || '',
      lastSync:    info.lastSync   || '',
      lastAnalysis: info.lastAnalysis || '',
      analysisStatus: info.analysisStatus || 'not-run',
    };
  },
};

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function _loadRegistry() {
  if (!fs.existsSync(REPOS_LOCAL_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(REPOS_LOCAL_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function _enrich(clientId, entry) {
  return {
    clientId:       clientId,
    url:            entry.url        || '',
    branch:         entry.branch     || '',
    localPath:      entry.localPath  || '',
    lastSync:       entry.lastSync   || '',
    lastCommit:     entry.lastCommit || '',
    lastAnalysis:   entry.lastAnalysis || '',
    analysisStatus: entry.analysisStatus || 'not-run',
  };
}

function _isAccessible(dirPath) {
  try {
    fs.accessSync(dirPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

module.exports = repositoryService;
