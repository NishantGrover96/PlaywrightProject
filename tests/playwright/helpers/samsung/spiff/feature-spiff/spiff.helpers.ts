import { type Page, expect } from '@playwright/test';
import {
  SpiffClaimPage,
  SpiffAdminProcessPage,
  SpiffClaimHistoryPage,
  type ClaimHeaderInput,
} from '../../../../pages/samsung/spiff/feature-spiff/SpiffPage';

// -----------------------------------------------------------------------------
// Login helpers
// -----------------------------------------------------------------------------
// Selectors match config/clients/samsung.json's authentication block
// (usernameSelector/passwordSelector/submitSelector) - kept local here so
// spec-level tests don't need to reach into config for this one flow.

/**
 * Log in as a Sales Associate (or any SPIFF-eligible role) and wait for a
 * successful, authenticated landing (redirected away from /account/login).
 *
 * Does NOT check for a "SPIFF" nav link here - confirmed live that the
 * post-login /Index landing page does not reliably show one for every
 * role (it's a tile-based dashboard, not the top nav bar SPIFF pages use).
 * Use expectSpiffAccessible()/expectSpiffNotAccessible() to assert SPIFF
 * access specifically.
 */
export async function loginAsSpiffUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/account/login', { waitUntil: 'load' });
  await page.locator('#UserLogin_Username').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#UserLogin_Username').fill(email);
  await page.locator('#UserLogin_Password').fill(password);
  await page.locator('#btnLogin').click();
  await page.waitForURL((url) => !/\/account\/login/i.test(url.pathname), { timeout: 30_000 });
}

/**
 * Confirm the current session can actually reach SPIFF, by navigating to
 * CurrentSPIFF and checking for its "Current SPIFF" heading - a reliable,
 * SPIFF-specific indicator, unlike the top-nav "SPIFF" link which isn't
 * present on every page/role.
 */
export async function expectSpiffAccessible(page: Page): Promise<void> {
  await page.goto('/Rewards/Spiff/CurrentSpiff', { waitUntil: 'load' });
  await expect(page.getByRole('heading', { name: 'Current SPIFF', level: 4 })).toBeVisible({
    timeout: 20_000,
  });
}

/** Inverse of expectSpiffAccessible() - for roles that should not have SPIFF access. */
export async function expectSpiffNotAccessible(page: Page): Promise<void> {
  await page.goto('/Rewards/Spiff/CurrentSpiff', { waitUntil: 'load' });
  await expect(page.getByRole('heading', { name: 'Current SPIFF', level: 4 })).toBeHidden({
    timeout: 10_000,
  });
}

/**
 * Attempt a login expected to fail (wrong password) and wait for the
 * login-error element to appear. Shares the same selectors as
 * loginAsSpiffUser() rather than duplicating them at the spec level.
 */
export async function attemptLoginExpectFailure(
  page: Page,
  email: string,
  loginErrorSelector: string
): Promise<void> {
  await page.goto('/account/login', { waitUntil: 'load' });
  await page.locator('#UserLogin_Username').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#UserLogin_Username').fill(email);
  await page.locator('#UserLogin_Password').fill('WrongPassword@0000');
  await page.locator('#btnLogin').click();
  await expect(page.locator(loginErrorSelector)).toBeVisible({ timeout: 45_000 });
}

/** Log out via the user icon -> Sign Out, matching flip-program-test-suite.spec.js. */
export async function logoutSpiffUser(page: Page): Promise<void> {
  const userIconBtn = page
    .locator('.userBlock .dropdown-toggle, .head_userInfo .dropdown-toggle, .welcomedropdown')
    .first();
  await userIconBtn.waitFor({ state: 'visible', timeout: 15_000 });
  await userIconBtn.click();

  const signOutLink = page.locator('a.signout').first();
  await signOutLink.waitFor({ state: 'visible', timeout: 10_000 });
  await signOutLink.click();

  await page.locator('#UserLogin_Username').waitFor({ state: 'visible', timeout: 15_000 });
}

// -----------------------------------------------------------------------------
// Claim submission helpers
// -----------------------------------------------------------------------------

/**
 * Navigate to CurrentSPIFF, open the claim form for `programName`, and wait
 * for the form to be ready. Used by all claim-submission tests.
 */
export async function openClaimForm(page: Page, programName: string): Promise<SpiffClaimPage> {
  const claimPage = new SpiffClaimPage(page);
  await claimPage.openClaimFormForProgram(programName);
  return claimPage;
}

/**
 * Full end-to-end claim submission: fill header fields, tonnage, upload the
 * invoice, add the line item, accept terms, and submit.
 * Returns the generated claim number - throws a descriptive error if the
 * submission does not produce one (mirrors flip-claim-submission.spec.js /
 * flip-program-test-suite.spec.js TC-05).
 */
export async function submitFullClaim(
  claimPage: SpiffClaimPage,
  claim: ClaimHeaderInput,
  tonnage: { r410a: string; other: string },
  invoicePath: string
): Promise<string> {
  await claimPage.fillHeaderFields(claim);
  await claimPage.fillTonnage(tonnage.r410a, tonnage.other);
  await claimPage.uploadInvoiceDocument(invoicePath);
  await claimPage.addLineItem();

  const lineCount = await claimPage.getClaimLineCount();
  if (lineCount === 0) {
    throw new Error(
      'Expected at least one claim line after "Add line item", but #tblClaimLines has zero rows.'
    );
  }

  await claimPage.acceptTerms();
  await claimPage.submitClaim();
  await claimPage.waitForClaimSubmitted();

  const claimNumber = await claimPage.getClaimNumber();
  return claimNumber;
}

/**
 * Attempt to add a line item with an invalid engineering phone number and
 * assert the field-level validation blocks it (no claim line is added).
 * Mirrors flip-program-test-suite.spec.js TC-06.
 *
 * Fills every other required header field with valid synthetic values first,
 * so the resulting #spnPhoneError can only be attributed to the phone field
 * itself - not to unrelated missing-required-field validation on an
 * otherwise-empty form.
 */
export async function expectInvalidPhoneBlocksLineItem(
  claimPage: SpiffClaimPage,
  invalidPhone: string
): Promise<void> {
  const today = new Date();
  const dateOfSale = [
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
    today.getFullYear(),
  ].join('/');

  await claimPage.fillHeaderFields({
    quoteNumber: 'QA-PHONE-VALIDATION-TEST',
    dateOfSale,
    projectName: 'QA Validation Test Project',
    projectCity: 'Ridgeland',
    projectState: 'MS',
    originalBOD: 'Carrier',
    engineeringFirm: 'QA Engineering LLC',
    engineeringContact: 'QA Tester',
    engineeringPhone: invalidPhone,
    engineeringEmail: 'qa-test@example.com',
  });
  await claimPage.fillTonnage('1', '0');

  await claimPage.addLineItemButton.click();
  await claimPage.expectPhoneValidationError();
  await claimPage.expectNoClaimLines();
}

// -----------------------------------------------------------------------------
// Admin claim processing helpers
// -----------------------------------------------------------------------------

/**
 * From an already-loaded SpiffClaimHistoryPage search result, open the
 * "Process" action for `claimId` and return the resulting admin process page.
 * The encrypted RebateId is never constructed manually - it comes from the
 * rendered action link, per SpiffAdminProcessPage's class-level note.
 */
export async function openProcessClaimFromHistory(
  historyPage: SpiffClaimHistoryPage,
  claimId: string
): Promise<SpiffAdminProcessPage> {
  await historyPage.clickProcessIconForClaim(claimId);
  const processPage = new SpiffAdminProcessPage(historyPage.page);
  await processPage.waitForReady();
  return processPage;
}

/**
 * Approve the first claim line and deny the rest (if more than one), filling
 * a denial reason and comment for each - mirrors the admin flow in
 * flip-program-test-suite.spec.js TC-07 / flip-claim-submission.spec.js Test 2.
 */
export async function processClaimApproveFirstDenyRest(
  processPage: SpiffAdminProcessPage,
  approvedComment = 'Approved',
  deniedComment = 'Denied'
): Promise<void> {
  const lineCount = await processPage.getLineItemCount();
  if (lineCount === 0) {
    throw new Error('Expected at least one claim line to process, but #tblClaimLines has zero rows.');
  }

  await processPage.checkAllLineItems();

  await processPage.setLineStatus(0, 'approve');
  for (let i = 1; i < lineCount; i++) {
    await processPage.setLineStatus(i, 'deny');
  }

  for (let i = 0; i < lineCount; i++) {
    await processPage.selectDenialReason(i);
  }

  await processPage.fillComments(0, approvedComment);
  for (let i = 1; i < lineCount; i++) {
    await processPage.fillComments(i, deniedComment);
  }

  await processPage.clickProcess();
  await processPage.waitForProcessed();
}

// -----------------------------------------------------------------------------
// Claim history / search helpers
// -----------------------------------------------------------------------------

/** Navigate to View Claim History (SA/dealer-facing, default mode). */
export async function navigateToClaimHistory(page: Page): Promise<SpiffClaimHistoryPage> {
  const historyPage = new SpiffClaimHistoryPage(page);
  await historyPage.navigate('history');
  await historyPage.waitForReady();
  return historyPage;
}

/** Navigate to the admin claim-processing search (?action=process). */
export async function navigateToProcessSearch(page: Page): Promise<SpiffClaimHistoryPage> {
  const historyPage = new SpiffClaimHistoryPage(page);
  await historyPage.navigate('process');
  await historyPage.waitForReady();
  return historyPage;
}

/** Search claim history by Claim # and wait for the results table to render. */
export async function searchClaimHistoryByClaimId(
  page: Page,
  claimId: string
): Promise<SpiffClaimHistoryPage> {
  const historyPage = await navigateToClaimHistory(page);
  await historyPage.searchByClaimId(claimId);
  await historyPage.clickSearch('history');
  await expect(historyPage.resultsTable).toBeVisible({ timeout: 20_000 });
  return historyPage;
}
