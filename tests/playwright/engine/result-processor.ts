/**
 * Result Processor
 *
 * Normalizes raw Playwright CLI output and exit code into a structured
 * ExecutionResult that the dashboard and queue can consume.
 *
 * Responsibilities:
 *   - Parse test counts (passed/failed/skipped) from stdout
 *   - Classify exit code into ExecutionStatus
 *   - Compute duration in ms and human-readable format
 *   - Collect errors and warnings from stderr
 *   - Trim stdout/stderr to a memory-safe size
 */

import type {
  ExecutionPlan,
  ExecutionResult,
  ExecutionStatus,
  ExecutionArtifacts,
} from './execution-plan';

// ── Constants ──────────────────────────────────────────────────────────────

/** Max chars of stdout/stderr kept in memory per execution */
const MAX_OUTPUT_CHARS = 4_096;

// ── Duration Formatter ─────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1_000)   return `${ms}ms`;
  if (ms < 60_000)  return `${(ms / 1_000).toFixed(1)}s`;
  const min = Math.floor(ms / 60_000);
  const sec = Math.round((ms % 60_000) / 1_000);
  return `${min}m ${sec}s`;
}

// ── Test Count Extraction ──────────────────────────────────────────────────

interface TestCounts {
  passed:  number;
  failed:  number;
  skipped: number;
  total:   number;
}

/**
 * Extract test result counts from Playwright stdout.
 *
 * Playwright formats its summary line as one of:
 *   "  3 passed (5.2s)"
 *   "  1 failed (3.4s)"
 *   "  2 passed, 1 failed (8.1s)"
 *   "  5 passed, 2 skipped (10.3s)"
 */
function extractCounts(stdout: string): TestCounts {
  const counts: TestCounts = { passed: 0, failed: 0, skipped: 0, total: 0 };

  // Primary pattern: the summary block at the end
  const passedMatch  = stdout.match(/(\d+)\s+passed/);
  const failedMatch  = stdout.match(/(\d+)\s+failed/);
  const skippedMatch = stdout.match(/(\d+)\s+skipped/);

  if (passedMatch)  counts.passed  = parseInt(passedMatch[1],  10);
  if (failedMatch)  counts.failed  = parseInt(failedMatch[1],  10);
  if (skippedMatch) counts.skipped = parseInt(skippedMatch[1], 10);

  counts.total = counts.passed + counts.failed + counts.skipped;
  return counts;
}

// ── Error Collection ───────────────────────────────────────────────────────

function extractErrors(stdout: string, stderr: string): string[] {
  const errors: string[] = [];

  if (stderr.trim()) {
    // Capture distinct non-trivial stderr lines
    const lines = stderr.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 10 && !line.startsWith('Node.js')) {
        errors.push(line.slice(0, 300));
      }
    }
  }

  // Extract Playwright error headlines from stdout
  const errorLines = stdout.split(/\r?\n/).filter(l => /^\s+(✕|✗|FAILED|Error:)/.test(l));
  for (const line of errorLines.slice(0, 10)) {
    errors.push(line.trim().slice(0, 300));
  }

  return [...new Set(errors)];
}

function extractWarnings(stdout: string): string[] {
  const warnings: string[] = [];
  const lines = stdout.split(/\r?\n/).filter(l => /warning|warn:/i.test(l));
  for (const line of lines.slice(0, 5)) {
    warnings.push(line.trim().slice(0, 300));
  }
  return warnings;
}

// ── Status Classification ──────────────────────────────────────────────────

function classifyStatus(exitCode: number, counts: TestCounts): ExecutionStatus {
  if (exitCode === 0)              return 'passed';
  if (exitCode === 1)              return 'failed';   // test failures
  if (exitCode === 2)              return 'error';    // config / setup error
  if (exitCode === 124)            return 'error';    // timeout kill
  if (counts.failed > 0)          return 'failed';
  return 'error';
}

// ── Trim Helper ────────────────────────────────────────────────────────────

function trim(s: string): string {
  if (s.length <= MAX_OUTPUT_CHARS) return s;
  // Keep the tail — most useful for diagnosing failures
  return '…[truncated]…\n' + s.slice(-MAX_OUTPUT_CHARS);
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface RawRunOutput {
  exitCode: number;
  stdout:   string;
  stderr:   string;
  startMs:  number;
  endMs:    number;
}

/**
 * Convert raw Playwright output into a normalized ExecutionResult.
 *
 * @param plan   - The execution plan that was used (for metadata)
 * @param raw    - Raw output from the Playwright process
 */
export function processResult(
  plan: ExecutionPlan,
  raw:  RawRunOutput,
): ExecutionResult {
  const counts    = extractCounts(raw.stdout);
  const errors    = extractErrors(raw.stdout, raw.stderr);
  const warnings  = extractWarnings(raw.stdout);
  const status    = classifyStatus(raw.exitCode, counts);
  const durationMs = raw.endMs - raw.startMs;

  const startedAt = new Date(raw.startMs).toISOString();
  const endedAt   = new Date(raw.endMs).toISOString();

  return {
    executionId:       plan.executionId,
    clientId:          plan.clientId,
    environment:       plan.environment,
    role:              plan.role,
    status,

    startedAt,
    endedAt,
    durationMs,
    durationFormatted: formatDuration(durationMs),
    exitCode:          raw.exitCode,

    passed:   counts.passed,
    failed:   counts.failed,
    skipped:  counts.skipped,
    total:    counts.total,

    artifacts: plan.artifacts,

    repositoryBranch: plan.repositoryBranch,
    repositoryCommit: plan.repositoryCommit,

    errors:   [...plan.errors, ...errors],
    warnings: [...plan.warnings, ...warnings],

    stdout: trim(raw.stdout),
    stderr: trim(raw.stderr),

    plan,
  };
}

/**
 * Build a minimal failed result when the execution could not even start
 * (e.g. missing config, invalid plan).
 */
export function buildFailedResult(
  plan:         ExecutionPlan,
  error:        Error,
  artifacts:    ExecutionArtifacts,
  startedAt:    string,
): ExecutionResult {
  const now = Date.now();
  return {
    executionId:       plan.executionId,
    clientId:          plan.clientId,
    environment:       plan.environment,
    role:              plan.role,
    status:            'error',

    startedAt,
    endedAt:           new Date(now).toISOString(),
    durationMs:        0,
    durationFormatted: '0ms',
    exitCode:          -1,

    passed:  0,
    failed:  0,
    skipped: 0,
    total:   0,

    artifacts,

    errors:   [...plan.errors, error.message],
    warnings: plan.warnings,

    stderr: error.stack ?? error.message,

    plan,
  };
}
