import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// TEST_ENV: dev | testing | uat | production  (which environment to point at)
// BASE_URL:  direct URL override — takes precedence over .env file
//
// Tests are written once from the Functional Unit Catalog.
// Point them at any environment by setting BASE_URL or TEST_ENV.

const TEST_ENV = (process.env.TEST_ENV || 'production') as 'dev' | 'testing' | 'uat' | 'production';

dotenv.config({ path: path.resolve(__dirname, `.env.${TEST_ENV}`) });

const BASE_URL     = process.env.BASE_URL     || '';
const API_BASE_URL = process.env.API_BASE_URL || BASE_URL;

export default defineConfig({
  testDir: './tests/playwright/specs',
  fullyParallel: false,   // sticky sessions on ARR — 1 worker
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html',  { outputFolder: `reports/${TEST_ENV}-html`, open: 'never' }],
    ['json',  { outputFile: `reports/${TEST_ENV}/results.json` }],
    ['junit', { outputFile: `reports/${TEST_ENV}/junit.xml` }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },

  projects: [
    // ── Auth setup ─────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'setup-admin',
      testMatch: /auth\.setup\.admin\.ts/,
    },

    // ── Dealer role ────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/playwright/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ── Admin role ─────────────────────────────────────────
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/playwright/fixtures/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },

    // ── API tests (no browser) ─────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],

  outputDir: 'test-results/',
});
