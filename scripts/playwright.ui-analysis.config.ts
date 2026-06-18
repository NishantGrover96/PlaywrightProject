import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const TEST_ENV = process.env.TEST_ENV || 'uat';

dotenv.config({ path: path.resolve(__dirname, `../.env.${TEST_ENV}`) });

export default defineConfig({
  testDir: __dirname,
  timeout: 240_000,
  use: {
    baseURL: process.env.BASE_URL || 'https://demoportaluat.channel-fusion.com',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, '../tests/playwright/fixtures/.auth/user.json'),
      },
    },
  ],
});
