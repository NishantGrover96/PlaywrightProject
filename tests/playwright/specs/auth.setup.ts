import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../fixtures/.auth/user.json');

/**
 * Dealer auth setup.
 * Login form selectors (Login.cshtml):
 *   #UserLogin_Username, #UserLogin_Password, #btnLogin
 * Credentials from env: TEST_USER_EMAIL / TEST_USER_PASSWORD
 * (Dashboard passes these via dealer-custom role config.)
 */
setup('authenticate dealer user', async ({ page }) => {
  setup.setTimeout(120_000);
  const username = process.env.TEST_USER_EMAIL ?? '';
  const password = process.env.TEST_USER_PASSWORD ?? '';

  if (!username || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. Use dealer-custom role in dashboard or set in .env.production.');
  }

  await page.goto('/CoopManagement/Dashboard');
  await page.waitForURL(/login|account/i, { timeout: 20_000 });

  await page.fill('#UserLogin_Username', username);
  await page.fill('#UserLogin_Password', password);
  await page.click('#btnLogin');
  await page.waitForLoadState('load', { timeout: 90_000 });

  const currentURL = page.url();
  if (/\/login/i.test(currentURL) && !/dashboard|coop|index/i.test(currentURL)) {
    throw new Error(`Dealer auth failed — still on login page: ${currentURL}. Check credentials.`);
  }

  // Dismiss welcome modal if present
  const skipBtn = page.locator("button:has-text('Skip')");
  if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await skipBtn.click();

  // Accept cookie banner if present
  const acceptBtn = page.locator("button:has-text('Accept')");
  if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await acceptBtn.click();

  await page.context().storageState({ path: AUTH_FILE });
  console.log(`[auth] Dealer session saved: ${username}`);
});
