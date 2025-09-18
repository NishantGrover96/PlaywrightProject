import { test, expect } from '@playwright/test';

test('basic test setup validation', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
