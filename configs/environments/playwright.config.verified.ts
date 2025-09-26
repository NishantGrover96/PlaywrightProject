import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Focused Test Configuration - Verified Modules Only
 *
 * This configuration runs tests only for modules verified via MCP:
 * - Ads & Assets ✅
 * - Brand Shop ✅
 *
 * Optimized for session reuse testing with minimal overhead
 */
export default defineConfig({
  testDir: '../../tests',

  /* Run tests in files in parallel */
  fullyParallel: false, // Disable for session reuse validation

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Single worker for session reuse testing

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['line'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 90000,

    /* Maximum time each navigation can take */
    navigationTimeout: 60000,

    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://demoportaldev.channel-fusion.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('../../fixtures/global-fixtures/global.setup.ts'),
  globalTeardown: require.resolve('../../fixtures/global-fixtures/global.teardown.ts'),

  /* Configure projects for major browsers */
  projects: [
    // Main test project - demo admin dev (verified modules only)
    // Uses our session reuse mechanism instead of storage state
    {
      name: 'demo-admin-dev-verified',
      use: {
        ...devices['Desktop Chrome'],
        // Don't use storage state - rely on our session reuse mechanism
      },
      testMatch: '**/verified-modules.spec.ts', // Only run verified modules test
    },
  ],

  /* Timeout configuration */
  timeout: 90000, // 90 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
});
