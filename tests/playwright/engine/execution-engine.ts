/**
 * Execution Engine — Principal Facade
 *
 * The single entry point for all execution requests.
 * Orchestrates the full pipeline:
 *
 *   ExecutionRequest
 *     → validate
 *     → auth-resolver      → ResolvedAuth
 *     → environment-resolver → ResolvedEnvironment
 *     → artifact-manager   → ExecutionArtifacts
 *     → buildCliArgs       → cliArgs, envVars
 *     → ExecutionPlan
 *     → queue              → QueuedExecution
 *     → playwright-runtime → RawRunOutput
 *     → result-processor   → ExecutionResult
 *     → artifact-manager   → write logs + result JSON
 *     → emit events        → dashboard SSE
 *
 * The engine is an EventEmitter. Callers subscribe to receive live updates.
 * It does NOT know about HTTP, SSE, or the dashboard directly.
 */

import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs   from 'fs';
import type {
  ExecutionRequest,
  ExecutionPlan,
  ExecutionResult,
  ExecutionScope,
  BrowserType,
  TierType,
  TraceMode,
  VideoMode,
  ScreenshotMode,
  RetryStrategy,
} from './execution-plan';

import { resolveAuth                      } from './auth-resolver';
import { resolveEnvironment, buildEnvVars } from './environment-resolver';
import { buildArtifactPaths, ensureArtifactDirs, writeExecutionLogs, writeExecutionResult } from './artifact-manager';
import { spawnPlaywright, registerProcess  } from './playwright-runtime';
import { processResult, buildFailedResult  } from './result-processor';
import { defaultQueue                      } from './execution-queue';
import type { RuntimeOptions               } from './playwright-runtime';

const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');

// ── Constants ──────────────────────────────────────────────────────────────

const TIER_TAGS: Record<string, string> = {
  smoke:      '@smoke',
  regression: '@regression',
  e2e:        '@e2e',
};

let _seq = 0;
function generateExecutionId(): string {
  const ts  = Date.now().toString(36);
  const rnd = (++_seq).toString(36).padStart(4, '0');
  return `exec_${ts}_${rnd}`;
}

// ── Engine Options ─────────────────────────────────────────────────────────

export interface EngineOptions {
  /** Called for each stdout line — wire this to your SSE broadcaster */
  onLine?:     (line: string, executionId: string) => void;
  /** Called for each test result line */
  onResult?:   (name: string, status: 'pass' | 'fail' | 'skip', duration?: string) => void;
  /** Called when the run completes */
  onComplete?: (result: ExecutionResult) => void;
  /** If true, bypass the queue and run immediately (for direct /api/run calls) */
  bypass?: boolean;
}

// ── Catalog / Client Service Imports ──────────────────────────────────────
// The engine reads catalog and client data the same way execution-resolver.js does,
// but through Node.js require (since these are JS dashboard services).

// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalogService = require('../../dashboard/services/catalog-service');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const clientService  = require('../../dashboard/services/client-service');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const repoService    = require('../../dashboard/services/repository-service');

// ── Spec Path Resolution ───────────────────────────────────────────────────

function resolveSpecPaths(
  clientId:  string,
  features:  string[],
  moduleId:  string | null,
  warnings:  string[],
): string[] {
  if (features.length === 0 || features.includes('all')) {
    return resolveModulePath(clientId, moduleId, warnings);
  }

  const paths: string[] = [];

  for (const fid of features) {
    const specPath = catalogService.getSpecPath(fid, clientId)
                  ?? catalogService.getSpecPath(fid, null);
    if (specPath) { paths.push(specPath); continue; }
    warnings.push(`Feature '${fid}': no spec path in catalog — skipping.`);
  }

  return [...new Set(paths)];
}

function resolveModulePath(
  clientId: string,
  moduleId: string | null,
  warnings: string[],
): string[] {
  const clientSpecDir = path.join('tests', 'playwright', 'clients', clientId, 'specs');
  if (fs.existsSync(path.join(WORKSPACE_ROOT, clientSpecDir))) {
    if (moduleId) {
      const mod = path.join(clientSpecDir, moduleId.toLowerCase());
      if (fs.existsSync(path.join(WORKSPACE_ROOT, mod))) return [mod];
      warnings.push(`Module dir not found: ${mod}`);
    }
    return [clientSpecDir];
  }

  const legacyDir = path.join('tests', 'playwright', 'specs');
  if (moduleId) {
    const mod = path.join(legacyDir, moduleId.toLowerCase());
    if (fs.existsSync(path.join(WORKSPACE_ROOT, mod))) return [mod];
    warnings.push(`Module dir not found: ${mod} — running all specs.`);
  }
  return [legacyDir];
}

// ── Scope Classifier ───────────────────────────────────────────────────────

function classifyScope(req: ExecutionRequest): ExecutionScope {
  if (req.featureId)                return 'feature';
  if (req.moduleId)                 return 'module';
  if (req.clientId)                 return 'client';
  return 'platform';
}

// ── CLI Args Builder ───────────────────────────────────────────────────────

function buildCliArgs(
  specPaths:   string[],
  tiers:       TierType[],
  projects:    string[],
  req:         ExecutionRequest,
  artifacts:   ReturnType<typeof buildArtifactPaths>,
): string[] {
  const args = ['test'];

  // Spec paths
  for (const p of specPaths) args.push(p);

  // Tier grep
  const active = tiers.filter(t => TIER_TAGS[t]);
  if (active.length > 0) {
    args.push('--grep', active.map(t => TIER_TAGS[t]).join('|'));
  }

  // Projects
  const isApiOnly = specPaths.every(p => p.includes('/api/'));
  if (isApiOnly) {
    args.push('--project=api');
  } else {
    for (const p of projects) args.push(`--project=${p}`);
  }

  // Runtime flags
  if (typeof req.retries === 'number') args.push(`--retries=${req.retries}`);
  if (typeof req.workers === 'number') args.push(`--workers=${req.workers}`);
  if (req.headed) args.push('--headed');

  // Reporters (write into artifacts dir)
  args.push('--reporter=list');
  args.push(`--reporter=json:${artifacts.jsonReport}`);
  args.push(`--reporter=junit:${artifacts.junitReport}`);
  args.push(`--reporter=html:${artifacts.htmlReport}`);

  return args;
}

// ── Env Vars Builder ───────────────────────────────────────────────────────

function buildExtraEnvVars(
  req:  ExecutionRequest,
  auth: ReturnType<typeof resolveAuth>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repo: any,
): Record<string, string> {
  const extras: Record<string, string> = {
    ROLE:         req.role,
    AUTH_PROJECT: auth.setupProject,
    LOGIN_PATH:   auth.loginPath,
  };

  if (req.moduleId)  extras.MODULE_ID  = req.moduleId;
  if (req.featureId) extras.FEATURE_ID = req.featureId;

  if (req.username) extras[auth.credentialEnvKey.email]    = req.username;
  if (req.password) extras[auth.credentialEnvKey.password] = req.password;

  if (req.baseUrl)  extras.BASE_URL = req.baseUrl;

  // Repository traceability
  if (repo?.branch)     extras.REPOSITORY_BRANCH = repo.branch;
  if (repo?.lastCommit) extras.REPOSITORY_COMMIT  = repo.lastCommit;

  // Trace / video
  const trace = req.trace ?? 'retain-on-failure';
  const video = req.video ?? 'off';
  extras.PLAYWRIGHT_TRACE = trace;
  extras.PLAYWRIGHT_VIDEO = video;

  return extras;
}

// ── Plan Builder ───────────────────────────────────────────────────────────

function buildPlan(req: ExecutionRequest): ExecutionPlan {
  const errors:   string[] = [];
  const warnings: string[] = [];

  const clientId  = req.clientId  || 'demoportal';
  const role      = req.role      || 'dealer';
  const envName   = req.environment || 'production';
  const moduleId  = req.moduleId  ?? null;
  const featureId = req.featureId ?? null;
  const tiers     = (req.tiers    ?? []) as TierType[];
  const browser   = (req.browser  ?? 'chromium') as BrowserType;
  const workers   = req.workers   ?? 1;
  const retries   = req.retries   ?? 0;
  const features  = Array.isArray(req.features) ? req.features : (featureId ? [featureId] : []);

  // 1. Validate client
  const clientCfg = clientService.getClient(clientId);
  if (!clientCfg) warnings.push(`Client '${clientId}' config not found — using defaults.`);

  // 2. Resolve auth
  const auth = resolveAuth(clientId, role, envName);

  // 3. Resolve environment
  const resolvedEnv = resolveEnvironment(clientId, envName, req.featureFlags);

  // 4. Repository info
  let repo: Record<string, string> | null = null;
  try { repo = repoService.getForClient(clientId); } catch { /* optional */ }

  // 5. Spec paths
  const specFiles = resolveSpecPaths(clientId, features, moduleId, warnings);

  // 6. Projects from client service
  const projects: string[] = clientService.getProjectsForRole(clientId, role) ?? [
    auth.setupProject,
    `${browser}${role === 'admin' ? '-admin' : ''}`,
  ].filter(Boolean);

  // 7. Artifacts
  const executionId = generateExecutionId();
  const artifacts   = buildArtifactPaths(clientId, executionId);

  // 8. CLI args
  const cliArgs = buildCliArgs(specFiles, tiers, projects, req, artifacts);

  // 9. Env vars
  const extras  = buildExtraEnvVars(req, auth, repo);
  const envVars = buildEnvVars(clientId, envName, resolvedEnv, extras);

  // 10. Validate
  if (specFiles.length === 0 && features.length > 0 && !features.includes('all')) {
    warnings.push(`No spec paths resolved. Tests may not run.`);
  }
  if (errors.length > 0) {
    // Hard errors: don't run
  }

  const trace:      TraceMode      = req.trace      ?? 'retain-on-failure';
  const video:      VideoMode      = req.video      ?? 'off';
  const screenshot: ScreenshotMode = 'only-on-failure';

  return {
    executionId,
    clientId,
    moduleId,
    featureId,
    role,
    environment:  envName,
    scope:        classifyScope(req),

    repositoryBranch: repo?.branch     ?? undefined,
    repositoryCommit: repo?.lastCommit ?? undefined,

    specFiles,
    tiers,
    features,

    auth,
    resolvedEnv,
    projects,

    browser,
    workers,
    retries,
    retryStrategy: (retries === 0 ? 'none' : 'fixed') as RetryStrategy,

    trace,
    video,
    screenshot,
    headed: req.headed ?? false,

    artifacts,
    reporters: ['list', 'json', 'junit', 'html'],
    outputDir: artifacts.tracesDir,

    cliArgs,
    envVars,

    errors,
    warnings,
    createdAt: new Date().toISOString(),
  };
}

// ── Execution Engine ───────────────────────────────────────────────────────

export class ExecutionEngine extends EventEmitter {
  constructor() {
    super();
    // Wire the queue to our internal runner
    defaultQueue.setRunner(async (job) => {
      const plan = job.plan ?? buildPlan(job.request);
      return this._runPlan(plan, {});
    });
  }

  /**
   * Build a plan and enqueue (or run immediately) based on options.
   *
   * @param request - Execution request from the dashboard / API
   * @param opts    - Callbacks for streaming and completion notification
   */
  async execute(
    request: ExecutionRequest,
    opts:    EngineOptions = {},
  ): Promise<{ executionId: string; queued: boolean }> {
    const plan = buildPlan(request);

    if (plan.errors.length > 0) {
      throw new Error(`Execution plan has errors: ${plan.errors.join('; ')}`);
    }

    this.emit('plan:created', plan);

    if (opts.bypass) {
      // Run immediately without going through the queue
      const result = await this._runPlan(plan, opts);
      opts.onComplete?.(result);
      return { executionId: plan.executionId, queued: false };
    }

    // Enqueue
    const job = defaultQueue.enqueue(request);
    job.plan  = plan;  // attach so the queue runner can reuse the plan

    // Forward queue events to engine-level callbacks
    defaultQueue.once('queue:completed', (finished) => {
      if (finished.id !== job.id) return;
      if (finished.result) opts.onComplete?.(finished.result);
    });

    return { executionId: plan.executionId, queued: true };
  }

  /**
   * Build a plan without running it (for preview / validation).
   */
  plan(request: ExecutionRequest): ExecutionPlan {
    return buildPlan(request);
  }

  /**
   * Stop a running execution by its execution ID.
   */
  stop(executionId: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { stopExecution } = require('./playwright-runtime') as typeof import('./playwright-runtime');
    const stopped = stopExecution(executionId);
    if (stopped) this.emit('run:stopped', executionId);
    return stopped;
  }

  /** Get queue snapshot */
  getQueue() {
    return defaultQueue.getAll();
  }

  // ── Internal Runner ────────────────────────────────────────────────────

  private async _runPlan(
    plan: ExecutionPlan,
    opts: EngineOptions,
  ): Promise<ExecutionResult> {
    ensureArtifactDirs(plan.artifacts);
    const startedAt = new Date().toISOString();

    this.emit('run:start', plan);

    const runtimeOpts: RuntimeOptions = {
      onLine: (line) => {
        this.emit('run:line', line, plan.executionId);
        opts.onLine?.(line, plan.executionId);
        // Detect result lines for granular progress
        const res = parseResultLine(line);
        if (res) {
          this.emit('run:result', res.name, res.status, res.duration);
          opts.onResult?.(res.name, res.status, res.duration);
        }
      },
    };

    let result: ExecutionResult;

    try {
      const raw = await spawnPlaywright(plan, runtimeOpts);
      result    = processResult(plan, raw);
    } catch (err) {
      result = buildFailedResult(
        plan,
        err instanceof Error ? err : new Error(String(err)),
        plan.artifacts,
        startedAt,
      );
    }

    // Write artifacts
    writeExecutionLogs(
      plan.artifacts,
      result.stdout  ?? '',
      result.stderr  ?? '',
      JSON.stringify(plan, null, 2),
    );
    writeExecutionResult(plan.artifacts, result as unknown as Record<string, unknown>);

    this.emit('run:end', result);
    return result;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

export const engine = new ExecutionEngine();

// ── Helpers ────────────────────────────────────────────────────────────────

interface ParsedResult {
  name:     string;
  status:   'pass' | 'fail' | 'skip';
  duration?: string;
}

function parseResultLine(line: string): ParsedResult | null {
  // Playwright list reporter format: "  ✓  test name (123ms)"
  const passMatch = line.match(/^\s*[✓✔]\s+(.+?)(?:\s+\((\d+ms|\d+\.\ds)\))?$/);
  if (passMatch) return { name: passMatch[1].trim(), status: 'pass', duration: passMatch[2] };

  const failMatch = line.match(/^\s*[✕✗×]\s+(.+?)(?:\s+\((\d+ms|\d+\.\ds)\))?$/);
  if (failMatch) return { name: failMatch[1].trim(), status: 'fail', duration: failMatch[2] };

  const skipMatch = line.match(/^\s*[-–]\s+(.+?)\s+›\s+skipped/i);
  if (skipMatch) return { name: skipMatch[1].trim(), status: 'skip' };

  return null;
}

// ── Named Exports ──────────────────────────────────────────────────────────

export { buildPlan };
