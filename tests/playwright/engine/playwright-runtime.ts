/**
 * Playwright Runtime
 *
 * Sole responsibility: spawn the Playwright CLI, stream output, and return
 * the raw process result. No business logic.
 *
 * Input:  ExecutionPlan  (fully resolved — no further resolution happens here)
 * Output: RawRunOutput   (exit code + captured stdout/stderr + timing)
 *
 * The Runtime:
 *   - Resolves the Playwright binary path
 *   - Constructs the final CLI argument array from plan.cliArgs
 *   - Injects plan.envVars into the child process environment
 *   - Streams stdout/stderr line-by-line via the `onLine` callback
 *   - Honours a configurable kill timeout
 *   - Returns the raw output without any interpretation
 */

import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs   from 'fs';
import type { ExecutionPlan } from './execution-plan';
import type { RawRunOutput  } from './result-processor';

const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');

// ── Binary Resolution ──────────────────────────────────────────────────────

function resolvePlaywrightBin(): string {
  // Prefer local node_modules/.bin
  const local = path.join(WORKSPACE_ROOT, 'node_modules', '.bin', 'playwright');
  if (fs.existsSync(local))       return local;
  if (fs.existsSync(local + '.cmd')) return local + '.cmd';   // Windows

  // Fall back to global
  return 'playwright';
}

// ── Runtime Options ────────────────────────────────────────────────────────

export interface RuntimeOptions {
  /** Called for every stdout line (for streaming to SSE clients) */
  onLine?:       (line: string) => void;
  /** Called for every stderr line */
  onStderrLine?: (line: string) => void;
  /** Hard kill timeout in ms. Defaults to plan timeout + 60s buffer */
  killTimeout?:  number;
  /** Working directory. Defaults to workspace root */
  cwd?:          string;
}

// ── Spawn Helper ───────────────────────────────────────────────────────────

/**
 * Run Playwright with the plan's CLI args and env vars.
 *
 * @param plan    - Fully resolved execution plan
 * @param opts    - Runtime callbacks and options
 * @returns       - Raw output (exit code, stdout, stderr, timing)
 */
export async function spawnPlaywright(
  plan: ExecutionPlan,
  opts: RuntimeOptions = {},
): Promise<RawRunOutput> {
  const bin  = resolvePlaywrightBin();
  const args = plan.cliArgs; // already starts with 'test …'
  const env  = { ...plan.envVars };
  const cwd  = opts.cwd ?? WORKSPACE_ROOT;

  const killMs = opts.killTimeout ?? (plan.resolvedEnv.timeouts.global * plan.workers + 120_000);

  let stdoutBuf = '';
  let stderrBuf = '';
  const startMs = Date.now();

  return new Promise<RawRunOutput>((resolve, reject) => {
    let proc: ChildProcess;
    let killed = false;

    try {
      proc = spawn(bin, args, {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      });
    } catch (err) {
      reject(err);
      return;
    }

    // ── stdout ─────────────────────────────────────────────────────────
    let stdoutRemainder = '';
    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = stdoutRemainder + chunk.toString('utf8');
      const lines = text.split(/\r?\n/);
      stdoutRemainder = lines.pop() ?? '';  // incomplete last line

      for (const line of lines) {
        stdoutBuf += line + '\n';
        if (opts.onLine) opts.onLine(line);
      }
    });

    // ── stderr ─────────────────────────────────────────────────────────
    let stderrRemainder = '';
    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = stderrRemainder + chunk.toString('utf8');
      const lines = text.split(/\r?\n/);
      stderrRemainder = lines.pop() ?? '';

      for (const line of lines) {
        stderrBuf += line + '\n';
        if (opts.onStderrLine) opts.onStderrLine(line);
      }
    });

    // ── kill watchdog ───────────────────────────────────────────────────
    const watchdog = setTimeout(() => {
      killed = true;
      proc.kill('SIGKILL');
      stderrBuf += `\n[runtime] Execution killed after ${killMs}ms timeout\n`;
    }, killMs);

    // ── process exit ───────────────────────────────────────────────────
    proc.on('error', (err) => {
      clearTimeout(watchdog);
      reject(new Error(`Failed to spawn Playwright: ${err.message}`));
    });

    proc.on('close', (code) => {
      clearTimeout(watchdog);
      // Flush remainders
      if (stdoutRemainder) { stdoutBuf += stdoutRemainder; opts.onLine?.(stdoutRemainder); }
      if (stderrRemainder) { stderrBuf += stderrRemainder; }

      const exitCode = killed ? 124 : (code ?? -1);
      resolve({ exitCode, stdout: stdoutBuf, stderr: stderrBuf, startMs, endMs: Date.now() });
    });
  });
}

/**
 * Stop a running execution by its process handle.
 * Used by the dashboard stop button via the engine's active-run registry.
 */
export function killProcess(proc: ChildProcess): void {
  try { proc.kill('SIGTERM'); } catch { /* already dead */ }
}

// ── Active Run Registry ────────────────────────────────────────────────────
// Tracks in-flight processes so the engine can cancel them on demand.

const activeProcesses = new Map<string, ChildProcess>();

export function registerProcess(executionId: string, proc: ChildProcess): void {
  activeProcesses.set(executionId, proc);
  proc.on('close', () => activeProcesses.delete(executionId));
}

export function stopExecution(executionId: string): boolean {
  const proc = activeProcesses.get(executionId);
  if (!proc) return false;
  try { proc.kill('SIGTERM'); } catch { /* already dead */ }
  activeProcesses.delete(executionId);
  return true;
}

export function isRunning(executionId: string): boolean {
  return activeProcesses.has(executionId);
}
