import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path   from 'path';
import * as fs     from 'fs';
import {
  discoverClientIds,
  buildProjectDescriptors,
  getStorageStateFile,
  type ProjectDescriptor,
} from './tests/playwright/engine/auth-resolver';

/**
 * Metadata-driven Playwright configuration.
 *
 * Projects are built dynamically from config/clients/*.json - no code
 * change is needed when a new client is added.
 *
 * Key env vars (set by the execution engine at runtime):
 *   CLIENT_ID     - restrict execution to a single client
 *   TEST_ENV      - target environment (production | uat | testing | dev)
 *   AUTH_PROJECT  - which setup project to use (set per run by engine)
 *   BASE_URL      - explicit URL override
 */

// -- Environment setup --------------------------------------------------------

type EnvironmentName = 'dev' | 'testing' | 'uat' | 'production';

const TEST_ENV  = (process.env.TEST_ENV  || 'production') as EnvironmentName;
const CLIENT_ID = process.env.CLIENT_ID  || '';

dotenv.config({ path: path.resolve(__dirname, `.env.${TEST_ENV}`) });

const BASE_URL     = process.env.BASE_URL     || '';
const API_BASE_URL = process.env.API_BASE_URL || BASE_URL;

// -- Client discovery ---------------------------------------------------------

/**
 * Discover all configured client IDs.
 * Filtered to CLIENT_ID if set (single-client run from engine).
 */
function getActiveClients(): string[] {
  const all = discoverClientIds();
  if (CLIENT_ID && all.includes(CLIENT_ID)) return [CLIENT_ID];
  if (CLIENT_ID) return [CLIENT_ID]; // allow unknown client with fallback defaults
  return all;
}

// -- Project builders ----------------------------------------------------------

/**
 * Convert a ProjectDescriptor into a Playwright project config object.
 */
function buildPlaywrightProject(
  d: ProjectDescriptor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const DESKTOP_CHROME = {
    ...devices['Desktop Chrome'],
    launchOptions: { args: ['--start-maximized'] },
  };
  const DESKTOP_FIREFOX  = { ...devices['Desktop Firefox'] };
  const DESKTOP_WEBKIT   = { ...devices['Desktop Safari']  };

  switch (d.kind) {
    case 'setup':
      return {
        name:      d.name,
        testMatch: d.testMatch,
        use:       { baseURL: BASE_URL },
      };

    case 'browser': {
      const storageState = d.storageStateFile || undefined;
      const browserUse =
        (d.browser === 'firefox') ? DESKTOP_FIREFOX :
        (d.browser === 'webkit')  ? DESKTOP_WEBKIT  :
                                    DESKTOP_CHROME;
      return {
        name:         d.name,
        use:          { ...browserUse, storageState, baseURL: BASE_URL },
        dependencies: d.dependencies ?? [],
      };
    }

    case 'api':
      return {
        name:    'api',
        testDir: './tests/api',
        use:     {
          baseURL: API_BASE_URL,
          extraHTTPHeaders: { Accept: 'application/json' },
        },
      };

    default:
      return { name: d.name };
  }
}

// -- Global timeouts from active client ----------------------------------------

function resolveGlobalTimeout(): number {
  if (!CLIENT_ID) return 90_000;
  try {
    const cfgPath = path.join(__dirname, 'config', 'clients', `${CLIENT_ID}.json`);
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      return cfg?.execution?.timeouts?.global ?? cfg?.timeouts?.global ?? 90_000;
    }
  } catch { /* ignore */ }
  return 90_000;
}

// -- Output folder -------------------------------------------------------------

function resolveOutputFolder(): string {
  // When running via the engine, it injects artifact paths via reporter CLI args.
  // The outputDir here is the fallback for direct `playwright test` invocations.
  if (CLIENT_ID) return `reports/${CLIENT_ID}-${TEST_ENV}-html`;
  return `reports/${TEST_ENV}-html`;
}

// -- Build project list --------------------------------------------------------

const activeClients    = getActiveClients();
const descriptors      = buildProjectDescriptors(activeClients, ['chromium']);
const playwrightProjects = descriptors.map(buildPlaywrightProject);

// -- Playwright Configuration --------------------------------------------------

export default defineConfig({
  testDir:       './tests/playwright/specs',
  fullyParallel: false,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 1 : 0,
  workers:       1,
  timeout:       resolveGlobalTimeout(),
  expect:        { timeout: 10_000 },

  reporter: [
    ['html',  { outputFolder: resolveOutputFolder(), open: 'never' }],
    ['json',  { outputFile: `reports/${TEST_ENV}/results.json` }],
    ['junit', { outputFile: `reports/${TEST_ENV}/junit.xml` }],
    ['list'],
    ['./tests/playwright/reporters/screenshot-organizer.reporter.ts'],
  ],

  use: {
    baseURL:           BASE_URL,
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    actionTimeout:     30_000,
    navigationTimeout: 60_000,
  },

  projects: playwrightProjects,

  outputDir: 'test-results/',
});

