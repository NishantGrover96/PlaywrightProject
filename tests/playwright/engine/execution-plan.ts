/**
 * Execution Plan - Central Data Contract for the Execution Engine
 *
 * This file defines all types shared across:
 *   - auth-resolver.ts
 *   - environment-resolver.ts
 *   - playwright-runtime.ts
 *   - result-processor.ts
 *   - execution-queue.ts
 *   - artifact-manager.ts
 *   - execution-engine.ts
 *   - dashboard/services/engine-adapter.js (JS mirror)
 *
 * The ExecutionPlan is the ONLY input to the Playwright Runtime.
 * No business logic flows past the plan boundary.
 */

// -- Primitive Enumerations -------------------------------------------------

export type AuthType =
  | 'forms'
  | 'email-password'
  | 'username-password'
  | 'username-only'
  | 'azure-ad'
  | 'oauth'
  | 'sso'
  | 'none';

export type BrowserType =
  | 'chromium'
  | 'firefox'
  | 'webkit';

export type EnvironmentName =
  | 'production'
  | 'uat'
  | 'testing'
  | 'dev'
  | string;

export type TierType =
  | 'smoke'
  | 'regression'
  | 'e2e';

export type ExecutionScope =
  | 'feature'    // single feature
  | 'module'     // all features in a module
  | 'client'     // all features for a client
  | 'platform';  // all features across all clients

export type ExecutionStatus =
  | 'queued'
  | 'running'
  | 'passed'
  | 'failed'
  | 'error'
  | 'cancelled';

export type RetryStrategy =
  | 'none'
  | 'fixed'
  | 'retry-failed-only';

export type TraceMode =
  | 'on'
  | 'off'
  | 'retain-on-failure';

export type VideoMode =
  | 'on'
  | 'off'
  | 'retain-on-failure';

export type ScreenshotMode =
  | 'on'
  | 'off'
  | 'only-on-failure';

// -- Feature Flags ----------------------------------------------------------

/**
 * Client-specific execution flags that control what is captured or skipped.
 * Loaded from config/clients/{clientId}.json -> execution.featureFlags
 */
export interface ExecutionFeatureFlags {
  runVisualTests:  boolean;
  runApiTests:     boolean;
  captureVideo:    boolean;
  captureTrace:    boolean;
  smokeOnly:       boolean;
}

// -- Timeout Configuration --------------------------------------------------

export interface TimeoutConfig {
  global:     number;  // per-test timeout (ms)
  action:     number;  // per-action timeout (ms)
  navigation: number;  // page.goto / waitForURL (ms)
  expect:     number;  // expect().toBeVisible() etc. (ms)
}

// -- Resolved Authentication ------------------------------------------------

/**
 * The output of AuthResolver. Describes which Playwright setup project to use
 * and what env vars supply credentials.
 */
export interface ResolvedAuth {
  /** Playwright project name that performs auth (empty string = no auth) */
  setupProject: string;
  /** Authentication mechanism */
  authType: AuthType;
  /** Path the setup spec navigates to for login */
  loginPath: string;
  /** File where Playwright storageState is saved (workspace-relative) */
  storageStateFile: string;
  /** Env var keys that carry credentials for this auth type */
  credentialEnvKey: {
    email:    string;
    password: string;
  };
}

// -- Resolved Environment ---------------------------------------------------

/**
 * The output of EnvironmentResolver. All values needed to run tests against
 * a specific client × environment combination.
 */
export interface ResolvedEnvironment {
  baseUrl:       string;
  apiUrl:        string;
  envFileName:   string;
  timeouts:      TimeoutConfig;
  featureFlags:  ExecutionFeatureFlags;
  extraHeaders?: Record<string, string>;
  cookies?:      Array<{ name: string; value: string; url?: string }>;
}

// -- Artifact Paths ---------------------------------------------------------

/**
 * All filesystem paths for execution artifacts.
 * Directory: reports/{clientId}/{YYYY-MM-DD}/{executionId}/
 */
export interface ExecutionArtifacts {
  rootDir:        string;  // reports/{clientId}/{date}/{executionId}/
  htmlReport:     string;  // .../html/
  jsonReport:     string;  // .../results.json
  junitReport:    string;  // .../junit.xml
  tracesDir:      string;  // .../traces/
  screenshotsDir: string;  // .../screenshots/
  videosDir:      string;  // .../videos/
  logsDir:        string;  // .../logs/
}

// -- Execution Request ------------------------------------------------------

/**
 * What the caller sends in. Validated and expanded into an ExecutionPlan.
 */
export interface ExecutionRequest {
  // Identity
  clientId:     string;
  environment:  EnvironmentName;
  role:         string;
  moduleId?:    string;
  featureId?:   string;
  features?:    string[];

  // Test selection
  tiers?:    TierType[];
  browser?:  BrowserType;
  workers?:  number;
  retries?:  number;

  // Runtime options
  trace?:   TraceMode;
  video?:   VideoMode;
  headed?:  boolean;

  // Credential overrides (pre-decrypted)
  username?: string;
  password?: string;
  baseUrl?:  string;

  // Feature flag overrides for this run
  featureFlags?: Partial<ExecutionFeatureFlags>;

  // Priority for queue ordering (lower = higher priority)
  priority?: number;
}

// -- Execution Plan ---------------------------------------------------------

/**
 * A fully resolved, validated plan ready for the Playwright Runtime.
 * The Runtime accepts ONLY an ExecutionPlan - it performs no further resolution.
 */
export interface ExecutionPlan {
  // -- Identity ---------------------------------------------------------
  executionId:  string;
  clientId:     string;
  moduleId:     string | null;
  featureId:    string | null;
  role:         string;
  environment:  EnvironmentName;
  scope:        ExecutionScope;

  // -- Repository Traceability -------------------------------------------
  repositoryBranch?: string;
  repositoryCommit?: string;

  // -- Test Selection ----------------------------------------------------
  specFiles:  string[];   // workspace-relative paths
  tiers:      TierType[];
  features:   string[];

  // -- Authentication ----------------------------------------------------
  auth: ResolvedAuth;

  // -- Environment -------------------------------------------------------
  resolvedEnv: ResolvedEnvironment;

  // -- Playwright Projects -----------------------------------------------
  projects: string[];   // e.g. ['setup', 'chromium'] or ['setup-certainteed', 'chromium-certainteed']

  // -- Browser & Parallelism ---------------------------------------------
  browser:       BrowserType;
  workers:       number;
  retries:       number;
  retryStrategy: RetryStrategy;

  // -- Capture -----------------------------------------------------------
  trace:      TraceMode;
  video:      VideoMode;
  screenshot: ScreenshotMode;
  headed:     boolean;

  // -- Artifacts ---------------------------------------------------------
  artifacts: ExecutionArtifacts;

  // -- Reporter ----------------------------------------------------------
  reporters:    string[];  // Playwright reporter names/paths
  outputDir:    string;    // Playwright test-results dir (for attachments)

  // -- Computed CLI Args & Env -------------------------------------------
  // These are the final inputs to playwright-runtime.ts.
  cliArgs: string[];
  envVars: Record<string, string>;

  // -- Validation --------------------------------------------------------
  errors:   string[];
  warnings: string[];

  // -- Timestamps --------------------------------------------------------
  createdAt: string;  // ISO 8601
}

// -- Execution Result -------------------------------------------------------

/**
 * Normalized output from result-processor.ts after Playwright exits.
 */
export interface ExecutionResult {
  executionId:       string;
  clientId:          string;
  environment:       EnvironmentName;
  role:              string;
  status:            ExecutionStatus;

  // Timing
  startedAt:         string;
  endedAt:           string;
  durationMs:        number;
  durationFormatted: string;
  exitCode:          number;

  // Test counts
  passed:   number;
  failed:   number;
  skipped:  number;
  total:    number;

  // Artifacts
  artifacts: ExecutionArtifacts;

  // Traceability
  repositoryBranch?: string;
  repositoryCommit?: string;

  // Diagnostics
  errors:   string[];
  warnings: string[];

  // Raw output (trimmed to last 4 KB for memory efficiency)
  stdout?: string;
  stderr?: string;

  // Back-reference to the resolved plan
  plan?: ExecutionPlan;
}

// -- Queue ------------------------------------------------------------------

/**
 * A single entry in the execution queue.
 */
export interface QueuedExecution {
  id:         string;
  request:    ExecutionRequest;
  plan?:      ExecutionPlan;
  status:     ExecutionStatus;
  enqueuedAt: string;
  startedAt?: string;
  endedAt?:   string;
  result?:    ExecutionResult;
  priority:   number;
}

// -- Engine Events ----------------------------------------------------------

/** Events emitted by ExecutionEngine / PlaywrightRuntime */
export interface EngineEvents {
  'plan:created':    (plan: ExecutionPlan) => void;
  'run:start':       (plan: ExecutionPlan) => void;
  'run:line':        (line: string, executionId: string) => void;
  'run:result':      (name: string, status: 'pass' | 'fail' | 'skip', duration?: string) => void;
  'run:end':         (result: ExecutionResult) => void;
  'run:error':       (error: Error, executionId: string) => void;
  'queue:enqueued':  (job: QueuedExecution) => void;
  'queue:started':   (job: QueuedExecution) => void;
  'queue:completed': (job: QueuedExecution) => void;
  'queue:cancelled': (jobId: string) => void;
}
