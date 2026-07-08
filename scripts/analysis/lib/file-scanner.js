'use strict';

/**
 * File Scanner — recursively walks a repository directory, applying ignore
 * patterns from analysis.config.json.
 *
 * Features:
 *   - Parallel directory reads (configurable concurrency)
 *   - Ignore folder/file patterns from config
 *   - Max file-size guard
 *   - Optional scan cache (skips unchanged files by mtime)
 *   - Returns a ScanResult with categorised file lists
 *
 * Usage:
 *   const scanner = require('./file-scanner');
 *   const result  = await scanner.scan(repoPath, cfg, logger, cacheStore);
 *
 * ScanResult:
 * {
 *   files:         string[]   // all accepted absolute paths
 *   skipped:       string[]   // paths skipped by ignore rules
 *   errors:        string[]   // paths that threw an error
 *   totalScanned:  number
 *   elapsedMs:     number
 * }
 */

const fs   = require('fs');
const path = require('path');

/**
 * Scan the repository and return a ScanResult.
 *
 * @param {string} repoPath     - Absolute path to the local repository root
 * @param {object} cfg          - Parsed analysis.config.json
 * @param {object} logger       - Logger instance
 * @param {object} [cacheStore] - Optional mutable object used as mtime cache
 * @returns {Promise<ScanResult>}
 */
async function scan(repoPath, cfg, logger, cacheStore = {}) {
  const start   = Date.now();
  const scanner = cfg.scanner;

  // Pre-compile ignore patterns once
  const ignoredFolderSet     = new Set(scanner.ignoredFolders.map(f => f.toLowerCase()));
  const ignoredFileRegexes   = (scanner.ignoredFilePatterns || []).map(p => new RegExp(p, 'i'));
  const maxSize              = scanner.maxFileSizeBytes || 524288;
  const concurrency          = scanner.concurrency      || 20;

  const files   = [];
  const skipped = [];
  const errors  = [];

  // Worker-queue style parallel walk
  const pending  = [repoPath];
  let   active   = 0;

  await new Promise((resolve) => {
    function pump() {
      while (active < concurrency && pending.length) {
        const dir = pending.shift();
        active++;
        processDir(dir).then(() => {
          active--;
          if (active === 0 && pending.length === 0) resolve();
          else pump();
        });
      }
    }

    async function processDir(dirPath) {
      let entries;
      try {
        entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      } catch (err) {
        errors.push(`${dirPath}: ${err.message}`);
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (_shouldIgnoreFolder(entry.name, ignoredFolderSet)) {
            skipped.push(`[dir] ${fullPath}`);
          } else {
            pending.push(fullPath);
          }
        } else if (entry.isFile()) {
          const accepted = await _processFile(
            fullPath, entry.name, ignoredFileRegexes, maxSize,
            files, skipped, cacheStore, logger
          );
          void accepted; // result not used here — arrays are mutated
        }
      }

      // Trigger pump after filling pending with subdirs
      pump();
    }

    pump();
    // Handle empty repo
    if (active === 0 && pending.length === 0) resolve();
  });

  return {
    files,
    skipped,
    errors,
    totalScanned: files.length,
    elapsedMs:    Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _shouldIgnoreFolder(name, ignoredFolderSet) {
  return ignoredFolderSet.has(name.toLowerCase());
}

async function _processFile(fullPath, name, ignoredFileRegexes, maxSize, files, skipped, cacheStore, logger) {
  // Ignore by file pattern
  for (const rx of ignoredFileRegexes) {
    if (rx.test(name)) {
      skipped.push(`[pattern] ${fullPath}`);
      return false;
    }
  }

  // Stat the file
  let stat;
  try {
    stat = await fs.promises.stat(fullPath);
  } catch (err) {
    logger && logger.debug(`stat failed: ${fullPath}: ${err.message}`);
    return false;
  }

  // Skip oversized files
  if (stat.size > maxSize) {
    skipped.push(`[size] ${fullPath}`);
    return false;
  }

  // Cache check — skip if mtime unchanged
  const mtimeMs = stat.mtimeMs;
  if (cacheStore[fullPath] && cacheStore[fullPath].mtimeMs === mtimeMs) {
    // File unchanged since last scan — still include in result using cached entry
    files.push(fullPath);
    return true;
  }

  // Update cache
  cacheStore[fullPath] = { mtimeMs };
  files.push(fullPath);
  return true;
}

/**
 * Safely read a file's text content.
 * Returns empty string on error rather than throwing.
 *
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readFileSafe(filePath) {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Filter a file list to those matching a given extension or regex.
 *
 * @param {string[]} files
 * @param {string|RegExp} pattern
 * @returns {string[]}
 */
function filterFiles(files, pattern) {
  const rx = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
  return files.filter(f => rx.test(f));
}

module.exports = { scan, readFileSafe, filterFiles };
