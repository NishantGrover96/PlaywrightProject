import { defineConfig, devices } from '@playwright/test';

/**
 * UI Analysis Config - Coop Submit Claim
 * Multi-client, multi-dealer session analysis.
 *
 * 4 projects (run sequentially, 1 worker):
 *   demoportal-dealer1  - DemoPortal UAT, first dealer account
 *   demoportal-dealer2  - DemoPortal UAT, second dealer account
 *   certainteed-dealer1 - CertainTeed UAT, first dealer account
 *   certainteed-dealer2 - CertainTeed UAT, second dealer account
 *
 * Run:
 *   npx playwright test scripts/ui-analysis-coop-submit-claim.spec.ts `
 *     --config scripts/playwright.ui-analysis-coop.config.ts `
 *     --headed --workers=1
 *
 * Credentials: entered live via page.pause() at each login screen.
 * No storageState - every session starts fresh and logs in manually.
 */
export default defineConfig({
  testDir: __dirname,
  testMatch: /ui-analysis-coop-submit-claim\.spec\.ts/,
  timeout: 600_000,           // 10 min per test - allows for manual login + full wizard walk
  fullyParallel: false,
  workers: 1,
  use: {
    actionTimeout:     30_000,
    navigationTimeout: 60_000,
    trace:      'off',
    screenshot: 'only-on-failure',
    video:      'off',
    // No storageState - login manually each session
  },
  projects: [
    // -- DemoPortal UAT ------------------------------------------------
    {
      name: 'demoportal-dealer1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://demoportaluat.channel-fusion.com',
        launchOptions: { args: ['--start-maximized'] },
      },
    },
    {
      name: 'demoportal-dealer2',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://demoportaluat.channel-fusion.com',
        launchOptions: { args: ['--start-maximized'] },
      },
    },
    // -- CertainTeed UAT -----------------------------------------------
    {
      name: 'certainteed-dealer1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://certainteedportaluat.channel-fusion.com',
        launchOptions: { args: ['--start-maximized'] },
      },
    },
    {
      name: 'certainteed-dealer2',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://certainteedportaluat.channel-fusion.com',
        launchOptions: { args: ['--start-maximized'] },
      },
    },
  ],
});
