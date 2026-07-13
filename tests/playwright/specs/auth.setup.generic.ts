/**
 * Generic Authentication Setup
 *
 * A single, reusable setup spec that any client can use - no code change needed
 * when adding a new client.
 *
 * Reads all configuration from environment variables injected by the engine:
 *
 *   AUTH_STORAGE_PATH  - where to write the storageState JSON
 *   LOGIN_PATH         - e.g. /account/login or /Account/Login?Internal
 *   TEST_USER_EMAIL    - email / username
 *   TEST_USER_PASSWORD - password
 *   CLIENT_ID          - for logging
 *   ROLE               - for logging
 *   TEST_ENV           - for error messages
 *
 * This spec is registered in playwright.config.ts as the testMatch for any
 * non-legacy client setup project (setup-{clientId}).
 *
 * Legacy clients (demoportal, certainteed, samsung) continue to use:
 *   auth.setup.ts       - dealer auth
 *   auth.setup.admin.ts - admin auth
 */

import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs   from 'fs';

setup('generic authentication', async ({ page }) => {
  setup.setTimeout(240_000);

  // -- Resolve env vars ----------------------------------------------------
  const storagePath = process.env.AUTH_STORAGE_PATH;
  // Use ?? so that an explicitly empty LOGIN_PATH ("") means "base URL IS the login page"
  const rawLoginPath = process.env.LOGIN_PATH;
  const loginPath    = rawLoginPath !== undefined ? rawLoginPath : '/account/login';
  const loginUrl     = loginPath || '/';  // empty string -> navigate to site root
  const authType     = process.env.AUTH_TYPE || 'forms';
  const email        = process.env.TEST_USER_EMAIL    || process.env.ADMIN_EMAIL    || '';
  const password     = process.env.TEST_USER_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const clientId     = process.env.CLIENT_ID  || 'unknown';
  const role         = process.env.ROLE       || 'dealer';
  const testEnv      = process.env.TEST_ENV   || 'production';

  // username-only clients have no password - only require email/username
  if (!email) {
    throw new Error(
      `[auth] Username/email not set for client '${clientId}' / role '${role}'. ` +
      `Set TEST_USER_EMAIL in .env.${testEnv} or via the dashboard.`,
    );
  }
  if (!password && authType !== 'username-only') {
    throw new Error(
      `[auth] Password not set for client '${clientId}' / role '${role}'. ` +
      `Set TEST_USER_PASSWORD in .env.${testEnv} or via the dashboard.`,
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

  // -- Navigate to login ---------------------------------------------------
  // loginUrl is '/' when loginPath is '' (base URL is the login page)
  await page.goto(loginUrl);
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 });

  // -- Fill credentials ----------------------------------------------------
  // Tries multiple common selector patterns, falling back gracefully.
  const usernameSelectors = [
    // Explicit IDs used by known platforms
    '#UserLogin_Username',
    '#username',
    '#userName',
    '#racfid',
    '#RACFId',
    '#loginId',
    '#userId',
    // Common name attributes
    'input[name="username"]',
    'input[name="userName"]',
    'input[name="racfid"]',
    'input[name="RACFId"]',
    'input[name="loginId"]',
    'input[name="userId"]',
    'input[name="login"]',
    // Email-type input (email+password platforms)
    'input[type="email"]',
    // Aria / test IDs
    '[aria-label="Username"]',
    '[aria-label="username"]',
    '[aria-label="User Login"]',
    '[aria-label="RACF ID"]',
    '[aria-label="RACFId"]',
    '[aria-label="Login"]',
    '[aria-label="Email"]',
    '[data-testid="username"]',
    '[data-testid="email"]',
    '[data-testid="login"]',
    // Label text fallback - matches any input labelled with these words
    'input[placeholder*="username" i]',
    'input[placeholder*="user id" i]',
    'input[placeholder*="racf" i]',
    'input[placeholder*="login" i]',
    'input[placeholder*="email" i]',
    'input[placeholder*="dealer" i]',
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
    'button:has-text("Log In")',
    'button:has-text("Next")',
    'button:has-text("Continue")',
    'button:has-text("Submit")',
    '[type="submit"]',            // broad fallback - any element with type=submit
  ];

  console.log(`[auth] Starting login - client: '${clientId}', role: '${role}', authType: '${authType}', loginUrl: '${loginUrl}'`);

  // Fill username / email / dealer code
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

  // Fill password - skipped for username-only (dealer code, no password field)
  if (authType !== 'username-only') {
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
  }

  // Submit
  // When loginPath is set ('/login', etc.) wait for URL to leave the login path.
  // When base URL is the login page (loginPath=''), wait for network idle instead
  // because the current URL already doesn't match '/login'.
  const hasExplicitLoginPath = !!loginPath;
  let submitted = false;
  for (const sel of submitSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
      if (hasExplicitLoginPath) {
        await Promise.all([
          page.waitForURL(url => !/\/login/i.test(url.pathname), { timeout: 90_000 }),
          el.click(),
        ]).catch(() => { /* URL check below will surface a meaningful error */ });
      } else {
        // Base URL login - click and wait for network to settle after redirect
        await el.click();
        await page.waitForLoadState('networkidle', { timeout: 90_000 }).catch(() => {});
      }
      submitted = true;
      break;
    }
  }
  if (!submitted) {
    throw new Error(`[auth] Could not find submit button on login page: ${page.url()}`);
  }

  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => {});

  // -- Verify success ------------------------------------------------------
  // Only do the /login path check when we navigated to an explicit login path.
  // For base-URL logins the app may never have a /login segment to check.
  if (hasExplicitLoginPath) {
    const currentURL = page.url();
    if (/\/login/i.test(new URL(currentURL).pathname)) {
      throw new Error(
        `[auth] Still on login page after submit. ` +
        `Client: ${clientId}, Role: ${role}, URL: ${currentURL}. ` +
        `Check credentials in .env.${testEnv}`,
      );
    }
  }

  // -- Dismiss common overlays ---------------------------------------------
  const skipBtn = page.locator("button:has-text('Skip')");
  if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) await skipBtn.click();

  const acceptBtn = page.locator("button:has-text('Accept')");
  if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await acceptBtn.click();

  // -- Save storage state --------------------------------------------------
  await page.context().storageState({ path: storagePath });
  console.log(`[auth] Session saved for client '${clientId}' / role '${role}' -> ${storagePath}`);
});
