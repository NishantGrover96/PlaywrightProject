/**
 * Screenshot Organizer Reporter
 *
 * After every test completes, copies each screenshot attachment produced by
 * Playwright into a `Test_Case_Screenshot/` sub-folder that lives alongside
 * the spec file that generated it.
 *
 * Output layout:
 *   tests/playwright/specs/{module}/feature-{feature}/
 *     Test_Case_Screenshot/
 *       CS-SMOKE-001_page-loads_pass.png
 *       CS-TC-016_website-url-validation_fail.png
 *       ...
 *
 * Registration in playwright.config.ts:
 *   reporter: [
 *     ...existing reporters...
 *     ['./tests/playwright/reporters/screenshot-organizer.reporter.ts'],
 *   ]
 *
 * No changes required in individual spec files.
 */

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs   from 'fs';
import * as path from 'path';

const SCREENSHOT_FOLDER = 'Test_Case_Screenshot';

/** Strip ANSI codes, collapse whitespace, replace path-unsafe chars. */
function sanitize(name: string): string {
  return name
    .replace(/\x1B\[[0-9;]*m/g, '')   // ANSI colour codes
    .replace(/[^\w\s-]/g, ' ')         // non-word chars → space
    .replace(/\s+/g, '-')              // whitespace → dash
    .replace(/-{2,}/g, '-')            // collapse repeated dashes
    .replace(/^-|-$/g, '')             // trim leading/trailing dashes
    .toLowerCase()
    .slice(0, 120);                    // max 120 chars to stay filesystem-safe
}

export default class ScreenshotOrganizerReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    // Only handle tests that have screenshot attachments
    const screenshots = result.attachments.filter(
      (a) => a.name === 'screenshot' && a.contentType === 'image/png' && a.path,
    );
    if (screenshots.length === 0) return;

    // Derive the output folder: <specFileDir>/Test_Case_Screenshot/
    const specFile = test.location.file;
    const specDir  = path.dirname(specFile);
    const destDir  = path.join(specDir, SCREENSHOT_FOLDER);

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Build a readable base name from the test title
    const titleSlug  = sanitize(test.title);
    const statusSlug = result.status; // 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted'

    screenshots.forEach((attachment, idx) => {
      const srcPath = attachment.path!;
      if (!fs.existsSync(srcPath)) return;

      // If there are multiple screenshots for one test, append an index
      const suffix = screenshots.length > 1 ? `_${idx + 1}` : '';
      const destFileName = `${titleSlug}_${statusSlug}${suffix}.png`;
      const destPath = path.join(destDir, destFileName);

      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        // Non-fatal — don't break the test run
        console.error(`[screenshot-organizer] Failed to copy screenshot: ${err}`);
      }
    });
  }
}
