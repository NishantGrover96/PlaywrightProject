import { defineConfig, devices } from '@playwright/test';
import { clientModulesConfig, ClientConfig } from '../clients/client-modules-access';
import * as dotenv from 'dotenv';

// Load environment variables for UAT environment
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.uat' });

/**
 * Generate dynamic auth file path based on current context
 * @param clientId - Client ID (demo, hankook)
 * @param role - User role (admin, dealer, distributor)
 * @param env - Environment (dev, test, uat, prod)
 */
function getAuthStoragePath(clientId?: string, role?: string, env?: string): string {
  const client = clientId || process.env.CLIENT || 'demo';
  const userRole = role || process.env.ROLE || 'admin';
  const environment = env || process.env.ENV || 'uat';

  return `fixtures/global-fixtures/auth-${client}-${userRole}-${environment}.json`;
}

/**
 * UAT Environment Configuration
 * Supports multiple clients with config-driven module access
 * Uses UAT environment URLs and credentials
 *
 * ✅ UAT testing with moderate parallel execution
 */

export default defineConfig({
  testDir: '../../tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined, // Conservative parallelism for UAT

  /* Global setup and teardown */
  globalSetup: require.resolve('../../fixtures/global-fixtures/global.setup.ts'),
  globalTeardown: require.resolve('../../fixtures/global-fixtures/global.teardown.ts'),

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://demoportaluat.channel-fusion.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Browser launch options */
    headless: process.env.HEADLESS !== 'false',

    /* Navigation timeout */
    navigationTimeout: 90000,

    /* Action timeout */
    actionTimeout: 90000,
  },

  /* Configure projects for major browsers */
  projects: (() => {
    const projects: any[] = [];

    // Setup project for authentication
    projects.push({
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    });

    const targetClient = process.env.CLIENT;

    if (targetClient) {
      // Run tests for specific client when CLIENT env var is set
      const clientConfig = clientModulesConfig.find(
        (c: ClientConfig) => c.clientId === targetClient
      );

      if (clientConfig) {
        // Chrome project for the specified client
        projects.push({
          name: `${targetClient}-chrome`,
          use: {
            ...devices['Desktop Chrome'],
            baseURL: clientConfig.baseUrl,
            storageState: getAuthStoragePath(targetClient),
          },
          testDir: './tests',
          testMatch: ['**/*.spec.ts'],
          dependencies: ['setup'],
          metadata: {
            clientId: clientConfig.clientId,
            clientName: clientConfig.clientName,
            modules: clientConfig.modules.map((m: any) => m.name),
          },
        });

        // Additional browsers for smoke tests only
        projects.push({
          name: `${targetClient}-firefox`,
          use: {
            ...devices['Desktop Firefox'],
            baseURL: clientConfig.baseUrl,
            storageState: getAuthStoragePath(targetClient),
          },
          testMatch: ['smoke/**/*.spec.ts'],
          dependencies: ['setup'],
          metadata: {
            clientId: clientConfig.clientId,
            clientName: clientConfig.clientName,
          },
        });

        projects.push({
          name: `${targetClient}-webkit`,
          use: {
            ...devices['Desktop Safari'],
            baseURL: clientConfig.baseUrl,
            storageState: getAuthStoragePath(targetClient),
          },
          testMatch: ['smoke/**/*.spec.ts'],
          dependencies: ['setup'],
          metadata: {
            clientId: clientConfig.clientId,
            clientName: clientConfig.clientName,
          },
        });
      }
    } else {
      // Run tests for all clients when no CLIENT env var is set
      clientModulesConfig.forEach((client: ClientConfig) => {
        projects.push({
          name: client.clientId,
          use: {
            ...devices['Desktop Chrome'],
            baseURL: client.baseUrl,
            storageState: getAuthStoragePath(client.clientId),
          },
          testDir: './tests',
          testMatch: ['**/*.spec.ts'],
          dependencies: ['setup'],
          metadata: {
            clientId: client.clientId,
            clientName: client.clientName,
            modules: client.modules.map((m: any) => m.name),
          },
        });
      });
    }

    return projects;
  })(),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Timeout configuration - 90 seconds default */
  timeout: 90000,
  expect: {
    timeout: 90000,
  },
});
