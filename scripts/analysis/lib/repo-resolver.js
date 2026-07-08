'use strict';

/**
 * Repo Resolver — locates and validates a client's repository from
 * config/repos.local.json.
 *
 * Returns a RepoContext object:
 * {
 *   clientId,
 *   localPath,
 *   branch,
 *   url,
 *   currentCommit,    // SHA from git log
 *   lastSync,         // from registry (may be empty)
 *   lastCommit,       // from registry (may be empty)
 * }
 *
 * Throws a descriptive AnalysisError on any validation failure.
 * Does NOT modify any files — that is registry-updater.js's job.
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

const ROOT             = path.resolve(__dirname, '..', '..', '..');
const REPOS_LOCAL_PATH = path.join(ROOT, 'config', 'repos.local.json');

/**
 * Resolve and validate the repository context for a client.
 *
 * @param {string} clientId
 * @param {object} [logger]  - optional logger instance (uses console.warn fallback)
 * @returns {RepoContext}
 */
function resolveRepo(clientId, logger) {
  const warn = logger ? logger.warn.bind(logger) : console.warn;

  // 1. Load registry
  if (!fs.existsSync(REPOS_LOCAL_PATH)) {
    throw new AnalysisError(
      'REGISTRY_MISSING',
      `config/repos.local.json not found.\n` +
      `Run: .\\scripts\\new-client.ps1  to register client '${clientId}' first.`
    );
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REPOS_LOCAL_PATH, 'utf8'));
  } catch (err) {
    throw new AnalysisError('REGISTRY_PARSE_ERROR',
      `Cannot parse config/repos.local.json: ${err.message}`);
  }

  // 2. Locate client entry (support both top-level keys and nested clients.{id})
  const entry = _findClientEntry(registry, clientId);
  if (!entry) {
    throw new AnalysisError(
      'CLIENT_NOT_REGISTERED',
      `Client '${clientId}' is not registered in config/repos.local.json.\n` +
      `Run: .\\scripts\\new-client.ps1  to register it first.`
    );
  }

  const localPath = entry.localPath;
  const branch    = entry.branch || 'main';
  const url       = entry.url    || '';

  // 3. Validate local path exists
  if (!localPath) {
    throw new AnalysisError('MISSING_LOCAL_PATH',
      `Client '${clientId}' has no localPath in repos.local.json.`);
  }

  if (!fs.existsSync(localPath)) {
    throw new AnalysisError('REPO_NOT_FOUND',
      `Repository path does not exist: ${localPath}\n` +
      `Clone the repository first, then update repos.local.json.`);
  }

  // 4. Validate it is a Git repository
  if (!fs.existsSync(path.join(localPath, '.git'))) {
    throw new AnalysisError('NOT_A_GIT_REPO',
      `Path is not a Git repository (no .git found): ${localPath}`);
  }

  // 5. Validate branch exists
  _validateBranch(localPath, branch, warn);

  // 6. Get current commit SHA
  const currentCommit = _getCurrentCommit(localPath, warn);

  return {
    clientId,
    localPath,
    branch,
    url,
    currentCommit,
    lastSync:   entry.lastSync   || '',
    lastCommit: entry.lastCommit || '',
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _findClientEntry(registry, clientId) {
  // New structure: registry.clients.{clientId}
  if (registry.clients && registry.clients[clientId]) {
    return registry.clients[clientId];
  }

  // Legacy structure: top-level key equals clientId
  if (registry[clientId] && registry[clientId].localPath) {
    return registry[clientId];
  }

  return null;
}

function _validateBranch(localPath, branch, warn) {
  try {
    // Check local branch
    const localBranches = execSync(`git -C "${localPath}" branch --list "${branch}"`, {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    if (localBranches) return; // found locally

    // Check remote-tracking branches
    const remoteBranches = execSync(`git -C "${localPath}" branch -r`, {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    });

    const remoteMatch = remoteBranches.split('\n').some(b => {
      const trimmed = b.trim();
      return trimmed.endsWith(`/${branch}`) || trimmed === branch;
    });

    if (remoteMatch) {
      warn(`Branch '${branch}' exists remotely but not locally. Analysis will use working tree.`);
      return;
    }

    // Branch not found — warn rather than throw so analysis can still run on HEAD
    warn(`Branch '${branch}' not found. Analysis will continue on current HEAD.`);
  } catch (err) {
    warn(`Could not verify branch '${branch}': ${err.message}`);
  }
}

function _getCurrentCommit(localPath, warn) {
  try {
    return execSync(`git -C "${localPath}" log -1 --format=%H`, {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (err) {
    warn(`Could not retrieve current commit: ${err.message}`);
    return '';
  }
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

class AnalysisError extends Error {
  constructor(code, message) {
    super(message);
    this.name  = 'AnalysisError';
    this.code  = code;
  }
}

module.exports = { resolveRepo, AnalysisError };
