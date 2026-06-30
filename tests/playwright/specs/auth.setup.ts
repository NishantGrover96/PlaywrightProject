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
  setup.setTimeout(240_000);
  const username = process.env.TEST_USER_EMAIL ?? '';
  const password = process.env.TEST_USER_PASSWORD ?? '';

  if (!username || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. Use dealer-custom role in dashboard or set in .env.production.');
  }

  await page.goto('/account/login');
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 });

  await page.fill('#UserLogin_Username', username);
  await page.fill('#UserLogin_Password', password);
  // Wait for navigation and click concurrently — avoids missing the navigation event
  await Promise.all([
    page.waitForURL((url) => !/\/login/i.test(url.pathname), { timeout: 90_000 }),
    page.click('#btnLogin'),
  ]).catch(() => { /* URL check below will surface a meaningful error */ });

  // Wait for the post-login page to be at least partially loaded before state capture
  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => {});

  const currentURL = page.url();
  if (/\/login/i.test(new URL(currentURL).pathname)) {
    throw new Error(`Dealer auth failed — still on login page: ${currentURL}. Check credentials in .env.${process.env.TEST_ENV || 'production'}`);
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
