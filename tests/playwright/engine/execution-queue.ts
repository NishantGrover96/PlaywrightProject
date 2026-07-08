/**
 * Execution Queue
 *
 * In-memory queue for serializing and prioritizing test execution requests.
 *
 * Guarantees:
 *   - Only ONE execution per client×environment runs concurrently by default
 *   - Jobs are processed in priority order (lower number = higher priority)
 *   - Duplicate detection: same client×environment×featureId won't enqueue twice
 *     unless the previous job has finished
 *   - EventEmitter for status transitions
 *
 * Note: Queue state is NOT persisted. Server restart clears the queue.
 *       A file-backed adapter can be added in Phase 6 via the QueueStore interface.
 */

import { EventEmitter } from 'events';
import type {
  ExecutionRequest,
  ExecutionResult,
  ExecutionPlan,
  QueuedExecution,
  ExecutionStatus,
} from './execution-plan';

// ── ID Generator ──────────────────────────────────────────────────────────

let _seq = 0;
function generateId(): string {
  const ts  = Date.now().toString(36);
  const seq = (++_seq).toString(36).padStart(4, '0');
  return `exec_${ts}_${seq}`;
}

// ── Deduplication Key ──────────────────────────────────────────────────────

function dedupeKey(req: ExecutionRequest): string {
  return [
    req.clientId,
    req.environment,
    req.role,
    req.moduleId  ?? '',
    req.featureId ?? '',
  ].join('::');
}

// ── Queue Store Interface (extension point for persistence) ───────────────

export interface QueueStore {
  getAll():              QueuedExecution[];
  upsert(job: QueuedExecution): void;
  remove(id: string):    void;
}

class InMemoryStore implements QueueStore {
  private readonly jobs = new Map<string, QueuedExecution>();

  getAll(): QueuedExecution[] {
    return [...this.jobs.values()];
  }
  upsert(job: QueuedExecution): void {
    this.jobs.set(job.id, { ...job });
  }
  remove(id: string): void {
    this.jobs.delete(id);
  }
}

// ── Execution Queue ────────────────────────────────────────────────────────

export type QueueCallback = (job: QueuedExecution) => Promise<ExecutionResult>;

export class ExecutionQueue extends EventEmitter {
  private readonly store:    QueueStore;
  private readonly running   = new Map<string, QueuedExecution>();
  private readonly dedupeMap = new Map<string, string>(); // dedupeKey → jobId
  private          processing = false;
  private          maxConcurrent: number;

  constructor(maxConcurrent = 1, store?: QueueStore) {
    super();
    this.maxConcurrent = maxConcurrent;
    this.store = store ?? new InMemoryStore();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Enqueue a new execution request.
   *
   * @param request   - The execution request
   * @param allowDupe - If true, skip deduplication check (for forced re-runs)
   * @returns         - The queued job (or the existing duplicate if deduplication blocked)
   */
  enqueue(request: ExecutionRequest, allowDupe = false): QueuedExecution {
    const key = dedupeKey(request);

    if (!allowDupe) {
      const existingId = this.dedupeMap.get(key);
      if (existingId) {
        const existing = this.store.getAll().find(j => j.id === existingId);
        if (existing && (existing.status === 'queued' || existing.status === 'running')) {
          // Return existing job — do not enqueue a duplicate
          return existing;
        }
      }
    }

    const job: QueuedExecution = {
      id:         generateId(),
      request,
      status:     'queued',
      enqueuedAt: new Date().toISOString(),
      priority:   request.priority ?? 50,
    };

    this.store.upsert(job);
    this.dedupeMap.set(key, job.id);
    this.emit('queue:enqueued', job);
    this._processNext();
    return job;
  }

  /**
   * Cancel a queued (not yet running) job.
   */
  cancel(jobId: string): boolean {
    const all = this.store.getAll();
    const job = all.find(j => j.id === jobId && j.status === 'queued');
    if (!job) return false;

    const updated: QueuedExecution = { ...job, status: 'cancelled', endedAt: new Date().toISOString() };
    this.store.upsert(updated);
    this.dedupeMap.delete(dedupeKey(job.request));
    this.emit('queue:cancelled', jobId);
    return true;
  }

  /**
   * Attach a callback that the queue calls when a job is ready to run.
   * The callback must return a Promise<ExecutionResult>.
   */
  setRunner(runner: QueueCallback): void {
    this._runner = runner;
    // Kickstart in case jobs were enqueued before the runner was set
    this._processNext();
  }

  /** Current queue snapshot (all statuses) */
  getAll(): QueuedExecution[] {
    return this.store.getAll();
  }

  /** Pending + running count */
  get size(): number {
    return this.store.getAll().filter(j => j.status === 'queued' || j.status === 'running').length;
  }

  /** Active running count */
  get runningCount(): number {
    return this.running.size;
  }

  // ── Internal ───────────────────────────────────────────────────────────

  private _runner?: QueueCallback;

  private _processNext(): void {
    if (this.processing) return;
    this.processing = true;
    // Yield to event loop so enqueue() can return before runner fires
    setImmediate(() => {
      this.processing = false;
      this._drainQueue();
    });
  }

  private _drainQueue(): void {
    if (!this._runner) return;
    if (this.running.size >= this.maxConcurrent) return;

    // Pick the highest-priority queued job (lowest priority number)
    const queued = this.store.getAll()
      .filter(j => j.status === 'queued')
      .sort((a, b) => a.priority - b.priority || a.enqueuedAt.localeCompare(b.enqueuedAt));

    const next = queued[0];
    if (!next) return;

    this._startJob(next);
  }

  private _startJob(job: QueuedExecution): void {
    if (!this._runner) return;

    const started: QueuedExecution = {
      ...job,
      status:    'running',
      startedAt: new Date().toISOString(),
    };
    this.store.upsert(started);
    this.running.set(started.id, started);
    this.emit('queue:started', started);

    this._runner(started)
      .then((result) => this._onJobDone(started, result))
      .catch((err: unknown) => {
        const fakeResult: ExecutionResult = {
          executionId:       started.id,
          clientId:          started.request.clientId,
          environment:       started.request.environment,
          role:              started.request.role,
          status:            'error',
          startedAt:         started.startedAt ?? new Date().toISOString(),
          endedAt:           new Date().toISOString(),
          durationMs:        0,
          durationFormatted: '0ms',
          exitCode:          -1,
          passed:   0,
          failed:   0,
          skipped:  0,
          total:    0,
          artifacts: job.plan?.artifacts ?? buildEmptyArtifacts(),
          errors:   [err instanceof Error ? err.message : String(err)],
          warnings: [],
        };
        this._onJobDone(started, fakeResult);
      });
  }

  private _onJobDone(job: QueuedExecution, result: ExecutionResult): void {
    const finished: QueuedExecution = {
      ...job,
      status:  result.status,
      endedAt: result.endedAt,
      result,
    };
    this.store.upsert(finished);
    this.running.delete(job.id);
    this.emit('queue:completed', finished);

    // Drain again — there may be more queued jobs
    this._drainQueue();
  }
}

// ── Default Export ─────────────────────────────────────────────────────────

/** Singleton queue used by the execution engine */
export const defaultQueue = new ExecutionQueue(1);

// ── Helpers ────────────────────────────────────────────────────────────────

function buildEmptyArtifacts() {
  return {
    rootDir:        '',
    htmlReport:     '',
    jsonReport:     '',
    junitReport:    '',
    tracesDir:      '',
    screenshotsDir: '',
    videosDir:      '',
    logsDir:        '',
  };
}
