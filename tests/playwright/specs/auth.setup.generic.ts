/**
 * Generic Authentication Setup
 *
 * A single, reusable setup spec that any client can use — no code change needed
 * when adding a new client.
 *
 * Reads all configuration from environment variables injected by the engine:
 *
 *   AUTH_STORAGE_PATH  — where to write the storageState JSON
 *   LOGIN_PATH         — e.g. /account/login or /Account/Login?Internal
 *   TEST_USER_EMAIL    — email / username
 *   TEST_USER_PASSWORD — password
 *   CLIENT_ID          — for logging
 *   ROLE               — for logging
 *   TEST_ENV           — for error messages
 *
 * This spec is registered in playwright.config.ts as the testMatch for any
 * non-legacy client setup project (setup-{clientId}).
 *
 * Legacy clients (demoportal, certainteed, samsung) continue to use:
 *   auth.setup.ts       — dealer auth
 *   auth.setup.admin.ts — admin auth
 */

import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs   from 'fs';

setup('generic authentication', async ({ page }) => {
  setup.setTimeout(240_000);

  // ── Resolve env vars ────────────────────────────────────────────────────
  const storagePath = process.env.AUTH_STORAGE_PATH;
  const loginPath   = process.env.LOGIN_PATH         || '/account/login';
  const email       = process.env.TEST_USER_EMAIL    || process.env.ADMIN_EMAIL    || '';
  const password    = process.env.TEST_USER_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const clientId    = process.env.CLIENT_ID  || 'unknown';
  const role        = process.env.ROLE       || 'dealer';
  const testEnv     = process.env.TEST_ENV   || 'production';

  if (!email || !password) {
    throw new Error(
      `[auth] Credentials not set for client '${clientId}' / role '${role}'. ` +
      `Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.${testEnv} or via the dashboard.`,
    );
  }

  if (!storagePath) {
    throw new Error(
      `[auth] AUTH_STORAGE_PATH not set. ` +
      `The engine must inject this before spawning the setup project.`,
    );
  }

  // Ensure the .auth directory exists
  const authDir = path.dirname(storagePath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // ── Navigate to login ───────────────────────────────────────────────────
  await page.goto(loginPath);
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 });

  // ── Fill credentials ────────────────────────────────────────────────────
  // Tries multiple common selector patterns, falling back gracefully.
  const usernameSelectors = [
    '#UserLogin_Username',
    'input[name="username"]',
    'input[type="email"]',
    '[data-testid="username"]',
    '[data-testid="email"]',
  ];
  const passwordSelectors = [
    '#UserLogin_Password',
    'input[name="password"]',
    'input[type="password"]',
    '[data-testid="password"]',
  ];
  const submitSelectors = [
    '#btnLogin',
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
  ];

  // Fill username
  let filledEmail = false;
  for (const sel of usernameSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await el.fill(email);
      filledEmail = true;
      break;
    }
  }
  if (!filledEmail) {
    throw new Error(`[auth] Could not find username/email field on login page: ${page.url()}`);
  }

  // Fill password
  let filledPassword = false;
  for (const sel of passwordSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await el.fill(password);
      filledPassword = true;
      break;
    }
  }
  if (!filledPassword) {
    throw new Error(`[auth] Could not find password field on login page: ${page.url()}`);
  }

  // Submit
  let submitted = false;
  for (const sel of submitSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await Promise.all([
        page.waitForURL(url => !/\/login/i.test(url.pathname), { timeout: 90_000 }),
        el.click(),
      ]).catch(() => { /* URL check below will surface a meaningful error */ });
      submitted = true;
      break;
    }
  }
  if (!submitted) {
    throw new Error(`[auth] Could not find submit button on login page: ${page.url()}`);
  }

  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => {});

  // ── Verify success ──────────────────────────────────────────────────────
  const currentURL = page.url();
  if (/\/login/i.test(new URL(currentURL).pathname)) {
    throw new Error(
      `[auth] Still on login page after submit. ` +
      `Client: ${clientId}, Role: ${role}, URL: ${currentURL}. ` +
      `Check credentials in .env.${testEnv}`,
    );
  }

  // ── Dismiss common overlays ─────────────────────────────────────────────
  const skipBtn = page.locator("button:has-text('Skip')");
  if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await skipBtn.click();

  const acceptBtn = page.locator("button:has-text('Accept')");
  if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await acceptBtn.click();

  // ── Save storage state ──────────────────────────────────────────────────
  await page.context().storageState({ path: storagePath });
  console.log(`[auth] Session saved for client '${clientId}' / role '${role}' → ${storagePath}`);
});
