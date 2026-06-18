import { test as setup } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../fixtures/.auth/admin.json');

/**
 * Admin auth setup.
 * Login form selectors (Login.cshtml):
 *   #UserLogin_Username, #UserLogin_Password, #btnLogin
 * Credentials from env: ADMIN_EMAIL / ADMIN_PASSWORD
 * (Dashboard passes these via admin-custom role config.)
 */
setup('authenticate admin user', async ({ page }) => {
  setup.setTimeout(120_000);
  const username = process.env.ADMIN_EMAIL ?? '';
  const password = process.env.ADMIN_PASSWORD ?? '';

  if (!username || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set. Use admin-custom role in dashboard or set in .env.production.');
  }

  await page.goto('/CoopManagement/Dashboard');
  await page.waitForURL(/login|account/i, { timeout: 20_000 });

  await page.fill('#UserLogin_Username', username);
  await page.fill('#UserLogin_Password', password);
  await page.click('#btnLogin');
  await page.waitForLoadState('load', { timeout: 90_000 });

  const currentURL = page.url();
  if (/\/login/i.test(currentURL) && !/dashboard|coop|index/i.test(currentURL)) {
    throw new Error(`Admin auth failed — still on login page: ${currentURL}. Check credentials.`);
  }

  const skipBtn = page.locator("button:has-text('Skip')");
  if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await skipBtn.click();

  const acceptBtn = page.locator("button:has-text('Accept')");
  if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await acceptBtn.click();

  await page.context().storageState({ path: AUTH_FILE });
  console.log(`[auth] Admin session saved: ${username}`);
});
