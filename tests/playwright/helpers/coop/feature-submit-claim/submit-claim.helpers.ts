import { Page, expect } from '@playwright/test';
import { existsSync } from 'fs';
import * as path from 'path';
import { SubmitClaimPage } from '../../../pages/coop/feature-submit-claim/SubmitClaimPage';
import testData from '@data/coop/feature-submit-claim/test-data.json';

export const DATA_DIR    = path.resolve(__dirname, '../../data/coop/feature-submit-claim');
export const INVOICE_PDF = path.join(DATA_DIR, 'sample-invoice.pdf');

/** True when no sample invoice exists — skip upload-dependent tests with this flag. */
export const INVOICE_MISSING = !existsSync(INVOICE_PDF);

// ── Navigation ────────────────────────────────────────────────────────────────

export async function goToSubmitClaim(page: Page): Promise<SubmitClaimPage> {
  const claim = new SubmitClaimPage(page);
  await claim.navigate();
  return claim;
}

// ── Wizard navigation helpers ─────────────────────────────────────────────────

/**
 * Navigate the claim wizard to Step 4 (activity form).
 * Path: Step 1 (No-PA, continue) → Step 3 (select tile) → Step 4 (activity form visible).
 */
export async function navigateToActivityForm(
  page: Page,
  tileName = testData.valid.mediaType,
): Promise<SubmitClaimPage> {
  const claim = new SubmitClaimPage(page);
  await claim.navigate();
  await claim.advanceFromStep1();
  await expect(claim.mediaTiles.first()).toBeVisible({ timeout: 20_000 });
  await claim.selectMediaTile(tileName);
  await claim.advanceFromMediaStep();
  return claim;
}

// ── Full-flow helpers (used by 2+ tests) ──────────────────────────────────────

/**
 * Navigate to the activity form, fill one activity, upload invoice, and return
 * the page object ready for save or submit.
 * Skips if sample invoice is missing — caller should guard with INVOICE_MISSING.
 */
export async function setupActivityReady(page: Page): Promise<SubmitClaimPage> {
  const claim = await navigateToActivityForm(page);
  await claim.fillActivity({
    mediaName:     testData.valid.mediaName,
    invoiceNumber: testData.valid.invoiceNumber,
    invoiceAmount: testData.valid.invoiceAmount,
  });
  await claim.uploadInvoice(INVOICE_PDF);
  return claim;
}

/** Full draft-save flow: setup activity → save for later → return page object at success panel. */
export async function setupDraftSaved(page: Page): Promise<{ claim: SubmitClaimPage; tempNumber: string }> {
  const claim = await setupActivityReady(page);
  await claim.saveForLater();
  await claim.expectDraftSuccess();
  const tempNumber = await claim.getTempClaimNumber();
  return { claim, tempNumber };
}

/** Full submit flow: setup activity → submit → return page object at success panel. */
export async function setupClaimSubmitted(page: Page): Promise<{ claim: SubmitClaimPage; claimNumber: string }> {
  const claim = await setupActivityReady(page);
  await claim.submitClaim();
  await claim.expectSubmitSuccess();
  const claimNumber = await claim.getFinalClaimNumber();
  return { claim, claimNumber };
}

// ── Assertion helpers ─────────────────────────────────────────────────────────

export async function assertPageText(page: Page, ...fragments: string[]): Promise<void> {
  const body = await page.textContent('body') ?? '';
  for (const fragment of fragments) {
    expect(body, `Expected page to contain: ${fragment}`).toContain(fragment);
  }
}
