/**
 * Artifact Manager
 *
 * Creates and manages the filesystem layout for execution artifacts.
 *
 * Layout:
 *   reports/{clientId}/{YYYY-MM-DD}/{executionId}/
 *     html/          — Playwright HTML report
 *     results.json   — JSON reporter output
 *     junit.xml      — JUnit XML
 *     traces/        — Playwright trace files
 *     screenshots/   — Failure screenshots
 *     videos/        — Test videos
 *     logs/          — Execution logs (stdout, stderr)
 *
 * All paths are workspace-relative strings for portability.
 */

import * as fs   from 'fs';
import * as path from 'path';
import type { ExecutionArtifacts } from './execution-plan';

const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');

// ── Path Helpers ───────────────────────────────────────────────────────────

function toRelative(absPath: string): string {
  return path.relative(WORKSPACE_ROOT, absPath).replace(/\\/g, '/');
}

function toAbsolute(relPath: string): string {
  return path.join(WORKSPACE_ROOT, relPath);
}

function formatDate(d: Date): string {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── Artifact Path Builder ──────────────────────────────────────────────────

/**
 * Build all artifact paths for an execution.
 * Creates the directory tree immediately so Playwright reporters can write into it.
 *
 * @param clientId    - Client ID (e.g. 'demoportal')
 * @param executionId - Unique execution ID (e.g. 'exec_abc123')
 * @param date        - Execution date (defaults to today)
 */
export function buildArtifactPaths(
  clientId:    string,
  executionId: string,
  date?:       Date,
): ExecutionArtifacts {
  const dateStr  = formatDate(date ?? new Date());
  const rootAbs  = path.join(WORKSPACE_ROOT, 'reports', clientId, dateStr, executionId);

  const paths = {
    rootDir:        toRelative(rootAbs),
    htmlReport:     toRelative(path.join(rootAbs, 'html')),
    jsonReport:     toRelative(path.join(rootAbs, 'results.json')),
    junitReport:    toRelative(path.join(rootAbs, 'junit.xml')),
    tracesDir:      toRelative(path.join(rootAbs, 'traces')),
    screenshotsDir: toRelative(path.join(rootAbs, 'screenshots')),
    videosDir:      toRelative(path.join(rootAbs, 'videos')),
    logsDir:        toRelative(path.join(rootAbs, 'logs')),
  };

  return paths;
}

/**
 * Create the directory tree for the given artifact paths.
 * Called by the engine before spawning Playwright so reporters can write immediately.
 */
export function ensureArtifactDirs(artifacts: ExecutionArtifacts): void {
  const dirs = [
    artifacts.rootDir,
    artifacts.htmlReport,
    artifacts.tracesDir,
    artifacts.screenshotsDir,
    artifacts.videosDir,
    artifacts.logsDir,
    path.dirname(artifacts.jsonReport),   // parent of results.json
    path.dirname(artifacts.junitReport),  // parent of junit.xml
  ];

  for (const rel of dirs) {
    const abs = toAbsolute(rel);
    if (!fs.existsSync(abs)) {
      fs.mkdirSync(abs, { recursive: true });
    }
  }
}

/**
 * Write execution stdout/stderr to the logs directory.
 *
 * @param artifacts  - Artifact paths for this execution
 * @param stdout     - Playwright process stdout
 * @param stderr     - Playwright process stderr
 * @param planJson   - JSON-serialized execution plan (for traceability)
 */
export function writeExecutionLogs(
  artifacts: ExecutionArtifacts,
  stdout:    string,
  stderr:    string,
  planJson?: string,
): void {
  const logsAbs = toAbsolute(artifacts.logsDir);
  if (!fs.existsSync(logsAbs)) fs.mkdirSync(logsAbs, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  if (stdout) fs.writeFileSync(path.join(logsAbs, `stdout-${ts}.log`), stdout, 'utf8');
  if (stderr) fs.writeFileSync(path.join(logsAbs, `stderr-${ts}.log`), stderr, 'utf8');
  if (planJson) {
    fs.writeFileSync(path.join(logsAbs, 'execution-plan.json'), planJson, 'utf8');
  }
}

/**
 * Write a normalized execution result JSON alongside artifacts.
 */
export function writeExecutionResult(
  artifacts: ExecutionArtifacts,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result:    Record<string, any>,
): void {
  const rootAbs  = toAbsolute(artifacts.rootDir);
  if (!fs.existsSync(rootAbs)) fs.mkdirSync(rootAbs, { recursive: true });
  fs.writeFileSync(
    path.join(rootAbs, 'execution-result.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );
}

/**
 * List all execution IDs for a given client (and optional date).
 * Used by the dashboard to display run history.
 *
 * @param clientId - Client ID
 * @param date     - ISO date string (YYYY-MM-DD). Defaults to today.
 */
export function listExecutions(clientId: string, date?: string): string[] {
  const dateStr = date ?? formatDate(new Date());
  const dir     = path.join(WORKSPACE_ROOT, 'reports', clientId, dateStr);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name =>
    fs.statSync(path.join(dir, name)).isDirectory(),
  );
}

/**
 * Read the execution result for a specific execution ID.
 */
export function readExecutionResult(
  clientId:    string,
  executionId: string,
  date?:       string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | null {
  const dateStr    = date ?? formatDate(new Date());
  const resultPath = path.join(
    WORKSPACE_ROOT, 'reports', clientId, dateStr, executionId, 'execution-result.json',
  );
  if (!fs.existsSync(resultPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Purge artifact directories older than `retentionDays` for a given client.
 * Safe to call periodically from the dashboard server (e.g. on startup).
 *
 * @param clientId      - Client ID
 * @param retentionDays - Days to keep (default 30)
 */
export function purgeOldArtifacts(clientId: string, retentionDays = 30): void {
  const reportsDir = path.join(WORKSPACE_ROOT, 'reports', clientId);
  if (!fs.existsSync(reportsDir)) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const dateDirs = fs.readdirSync(reportsDir).filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name));
  for (const dateDir of dateDirs) {
    const dirDate = new Date(dateDir);
    if (!isNaN(dirDate.getTime()) && dirDate < cutoff) {
      const abs = path.join(reportsDir, dateDir);
      fs.rmSync(abs, { recursive: true, force: true });
    }
  }
}
