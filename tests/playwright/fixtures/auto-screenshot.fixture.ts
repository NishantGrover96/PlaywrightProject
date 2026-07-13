/**
 * Auto-Screenshot Fixture
 *
 * Extends Playwright's `test` so that after every non-skipped test a
 * screenshot is saved to:
 *
 *   <spec-file-dir>/Test_Case_Screenshot/<sanitized-title>_<status>.png
 *
 * Usage - import `test` and `expect` from this file instead of
 * `@playwright/test`:
 *
 *   import { test, expect } from '../../../fixtures/auto-screenshot.fixture';
 *
 * Works for:
 *  - `{ page }` tests  - screenshots the main page automatically
 *  - `{ browser }` tests - screenshots ALL open pages in the context
 */

import {
  test as base,
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

export { expect };

// -- helpers -------------------------------------------------------------------

function sanitize(name: string): string {
  return name
    .replace(/\x1B\[[0-9;]*m/g, '')    // strip ANSI
    .replace(/[^\w\s-]/g, ' ')          // keep word chars, spaces, dashes
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 110);
}

async function saveScreenshot(
  page: Page,
  testInfo: TestInfo,
  suffix = '',
): Promise<void> {
  try {
    const destDir = path.join(path.dirname(testInfo.file), 'Test_Case_Screenshot');
    fs.mkdirSync(destDir, { recursive: true });

    const titleSlug  = sanitize(testInfo.title);
    const statusSlug = testInfo.status ?? 'unknown';
    const fileName   = `${titleSlug}_${statusSlug}${suffix ? `_${suffix}` : ''}.png`;
    const destPath   = path.join(destDir, fileName);

    await page.screenshot({ path: destPath, fullPage: true, timeout: 10_000 });
  } catch {
    // Non-fatal - page may already be closed
  }
}

// -- fixture override: `page` ---------------------------------------------------

export const test = base.extend<{
  autoScreenshotPage: void;
}>({
  /**
   * Shadow the built-in `page` fixture to take a screenshot after each test.
   * Re-uses the same page object - no extra browser context created.
   */
  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Only screenshot when the test actually ran (not skipped)
    if (testInfo.status !== 'skipped') {
      await saveScreenshot(page, testInfo);
    }
  },

  /**
   * Dummy fixture that captures all pages open on a `browser`-based test.
   * Auto-screenshots every open page when the test concludes.
   *
   * Tests using `{ browser }` must list `autoScreenshotPage` in their
   * destructure to opt in, or call `saveScreenshotForBrowserTest()` manually.
   */
  autoScreenshotPage: [async ({ browser }, use, testInfo) => {
    await use();

    if (testInfo.status === 'skipped') return;

    // Screenshot every open context/page created via `browser`
    const contexts: BrowserContext[] = browser.contexts();
    let pageIdx = 0;
    for (const ctx of contexts) {
      for (const pg of ctx.pages()) {
        const suffix = contexts.length > 1 || ctx.pages().length > 1
          ? `ctx${pageIdx++}`
          : '';
        await saveScreenshot(pg, testInfo, suffix);
      }
    }
  }, { auto: true }],   // `auto: true` - runs for EVERY test automatically
});

// -- convenience re-export ----------------------------------------------------

export type { Page, BrowserContext, TestInfo };
export type { Browser } from '@playwright/test';
