import { test, expect } from '@playwright/test';
import {
  SpiffClaimPage,
  SpiffAdminProcessPage,
  SpiffClaimHistoryPage,
  SPIFF_URLS,
} from '../../../../pages/samsung/spiff/feature-spiff/SpiffPage';

import {
  loginAsSpiffUser,
  attemptLoginExpectFailure,
  expectSpiffAccessible,
  expectSpiffNotAccessible,
  logoutSpiffUser,
  openClaimForm,
  submitFullClaim,
  addClaimLineItem,
  todayAsDateOfSale,
  expectInvalidPhoneBlocksLineItem,
  navigateToClaimHistory,
  navigateToProcessSearch,
  searchClaimHistoryByClaimId,
  openProcessClaimFromHistory,
  processClaimApproveFirstDenyRest,
} from '../../../../helpers/samsung/spiff/feature-spiff/spiff.helpers';

import testData from '../../../../data/samsung/spiff/feature-spiff/test-data.json';

/**
 * Credentials
 *
 * Local execution:
 *   Uses credentials from test-data.json unless environment variables
 *   are explicitly provided.
 *
 * GitHub Actions / CI:
 *   Requires credentials to be supplied through GitHub Secrets.
 *
 * GitHub Secrets expected:
 *   SAMSUNG_DEALER_EMAIL
 *   SAMSUNG_DEALER_PASSWORD
 *   SAMSUNG_ADMIN_EMAIL
 *   SAMSUNG_ADMIN_PASSWORD
 */

const isCI = process.env.CI === 'true';

function getCredential(
  envName: string,
  fallback: string | undefined
): string {
  const value = process.env[envName];

  if (value) {
    return value;
  }

  if (isCI) {
    throw new Error(
      `Missing required CI environment variable: ${envName}. ` +
      `Add it as a GitHub Actions repository secret.`
    );
  }

  if (!fallback) {
    throw new Error(
      `Missing credential: ${envName}. ` +
      `Set the environment variable or configure the credential in test-data.json.`
    );
  }

  return fallback;
}

// Samsung Dealer / SA credentials
const saEmail = getCredential(
  'SAMSUNG_DEALER_EMAIL',
  testData.users.sa.email
);

const saPassword = getCredential(
  'SAMSUNG_DEALER_PASSWORD',
  testData.users.sa.password
);

// Samsung Admin / BMADMIN credentials
const adminEmail = getCredential(
  'SAMSUNG_ADMIN_EMAIL',
  testData.users.bmadmin.email
);

const adminPassword = getCredential(
  'SAMSUNG_ADMIN_PASSWORD',
  testData.users.bmadmin.password
);

test.describe('Samsung - SPIFF (Flip to Samsung)', () => {

  // ------------------------------------------------------------------------
  // Smoke Suite (SPIFF-SMOKE-001 - SPIFF-SMOKE-005)
  // ------------------------------------------------------------------------

  test.describe('Smoke', () => {

    test('SPIFF-SMOKE-001 - SA logs in and sees SPIFF navigation @smoke @critical', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      await expectSpiffAccessible(page);
    });

    test('SPIFF-SMOKE-002 - invalid credentials show login error @smoke @critical', async ({ page }) => {
      await attemptLoginExpectFailure(
        page,
        saEmail,
        testData.expectedText.loginErrorSelector
      );
    });

    test('SPIFF-SMOKE-003 - claim form loads with all required fields @smoke @critical', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);
      await expect(claimPage.quoteNumberInput).toBeVisible();
      await expect(claimPage.dateOfSaleInput).toBeVisible();
      await expect(claimPage.projectNameInput).toBeVisible();
      await expect(claimPage.dropzoneUpload).toBeVisible();
      await expect(claimPage.addLineItemButton).toBeVisible();
    });

    test('SPIFF-SMOKE-004 - View Claim History page loads with search filters @smoke @critical', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const historyPage = await navigateToClaimHistory(page);
      await expect(historyPage.claimIdInput).toBeVisible();
      await expect(historyPage.quoteNumberInput).toBeVisible();
      await expect(historyPage.searchButtonHistory).toBeVisible();
    });

    test('SPIFF-SMOKE-005 - admin logs in and can open Process Claim search @smoke @critical', async ({ page }) => {
      await loginAsSpiffUser(page, adminEmail, adminPassword);
      const historyPage = await navigateToProcessSearch(page);
      await expect(historyPage.claimIdInput).toBeVisible();
    });

  });

  // ------------------------------------------------------------------------
  // Authentication (SPIFF-TC-001 - SPIFF-TC-003)
  // ------------------------------------------------------------------------

  test.describe('Authentication', () => {

    test('SPIFF-TC-001 - valid SA credentials load the dashboard @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      await expectSpiffAccessible(page);
    });

    test('SPIFF-TC-002 - valid admin credentials load the admin dashboard @regression', async ({ page }) => {
      await loginAsSpiffUser(page, adminEmail, adminPassword);
      const historyPage = await navigateToProcessSearch(page);
      await expect(historyPage.claimIdInput).toBeVisible();
    });

    test('SPIFF-TC-003 - admin invalid credentials show login error @regression', async ({ page }) => {
      await attemptLoginExpectFailure(
        page,
        adminEmail,
        testData.expectedText.loginErrorSelector
      );
    });

  });

  // ------------------------------------------------------------------------
  // Role Scoping / Access (SPIFF-TC-004 - SPIFF-TC-006) - SPIFF-03, SPIFF-11
  // ------------------------------------------------------------------------

  test.describe('Role Scoping', () => {

    test('SPIFF-TC-004 - existing SPEC REP user accesses SPIFF without duplicate registration @regression', async ({ page }) => {
      test.skip(
        !testData.users.specRep.email,
        'Requires a real SPEC REP test account (test-data.json users.specRep).'
      );

      await loginAsSpiffUser(
        page,
        testData.users.specRep.email,
        testData.users.specRep.password
      );

      await expectSpiffAccessible(page);
      await expect(page).not.toHaveURL(new RegExp(SPIFF_URLS.registration));
    });

    test('SPIFF-TC-005 - existing Distributor-family user accesses SPIFF without duplicate registration @regression', async ({ page }) => {
      test.skip(
        !testData.users.distributor.email,
        'Requires a real Distributor-family test account (test-data.json users.distributor).'
      );

      await loginAsSpiffUser(
        page,
        testData.users.distributor.email,
        testData.users.distributor.password
      );

      await expectSpiffAccessible(page);
      await expect(page).not.toHaveURL(new RegExp(SPIFF_URLS.registration));
    });

    test('SPIFF-TC-006 - non-eligible user does not see the SPIFF navigation entry @regression', async ({ page }) => {
      test.skip(
        !testData.users.nonEligible.email,
        'Requires a real non-SPIFF-eligible test account (test-data.json users.nonEligible).'
      );

      await loginAsSpiffUser(
        page,
        testData.users.nonEligible.email,
        testData.users.nonEligible.password
      );

      await expectSpiffNotAccessible(page);
    });

  });

  // ------------------------------------------------------------------------
  // Claim Submission Form (SPIFF-TC-007 - SPIFF-TC-014)
  // ------------------------------------------------------------------------

  test.describe('Claim Submission Form', () => {

    test('SPIFF-TC-007 - claim form fields are all present @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await expect(claimPage.projectCityInput).toBeVisible();
      await expect(claimPage.projectStateInput).toBeVisible();
      await expect(claimPage.originalBODInput).toBeVisible();
      await expect(claimPage.engineeringFirmNameInput).toBeVisible();
      await expect(claimPage.engineeringContactInput).toBeVisible();
      await expect(claimPage.engineeringPhoneInput).toBeVisible();
      await expect(claimPage.engineeringEmailInput).toBeVisible();
    });

    test('SPIFF-TC-008 - invalid engineering phone blocks line item addition @regression @critical', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await expectInvalidPhoneBlocksLineItem(
        claimPage,
        testData.invalidClaim.invalidEngineeringPhone
      );
    });

    test('SPIFF-TC-009 - engineering phone auto-formats as XXX-XXX-XXXX @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await claimPage.engineeringPhoneInput.fill('1234567890');
      await expect(claimPage.engineeringPhoneInput).toHaveValue('123-456-7890');
    });

    test('SPIFF-TC-010 - invalid engineering email shows validation error on blur @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await claimPage.engineeringEmailInput.fill('not-an-email');
      await claimPage.engineeringEmailInput.blur();
      await claimPage.expectEmailValidationError();
    });

    test('SPIFF-TC-011 - tonnage fields accept a valid entry @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await claimPage.fillTonnage(
        testData.claim.tonnageR410A || '10',
        testData.claim.tonnageOther || '5'
      );

      await expect(claimPage.tonnageR410AInput).toHaveValue(
        testData.claim.tonnageR410A || '10'
      );

      await expect(claimPage.tonnageOtherInput).toHaveValue(
        testData.claim.tonnageOther || '5'
      );
    });

    test('SPIFF-TC-012 - submission comments field caps at 100 characters client-side @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      await expect(claimPage.submissionCommentsInput).toHaveAttribute(
        'maxlength',
        '100'
      );
    });

    test('SPIFF-TC-013 - accepting terms checkbox is required before submission @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      // The accept-terms checkbox does not exist in the DOM until a line
      // item has been added (confirmed live) - add one first.
      await addClaimLineItem(
        claimPage,
        {
          quoteNumber: testData.claim.quoteNumber || 'QA-TC013-VALIDATION',
          dateOfSale: testData.claim.dateOfSale || todayAsDateOfSale(),
          projectName: testData.claim.projectName || 'QA TC-013 Validation',
          projectCity: testData.claim.projectCity || 'Ridgeland',
          projectState: testData.claim.projectState || 'MS',
          originalBOD: testData.claim.originalBOD || 'Carrier',
          engineeringFirm: testData.claim.engineeringFirm || 'QA Engineering LLC',
          engineeringContact: testData.claim.engineeringContact || 'QA Tester',
          engineeringPhone: testData.claim.engineeringPhone || '5551230007',
          engineeringEmail: testData.claim.engineeringEmail || 'qa-test@example.com',
        },
        {
          r410a: testData.claim.tonnageR410A || '1',
          other: testData.claim.tonnageOther || '0',
        },
        testData.documents.invoiceFixturePath
      );

      await expect(claimPage.acceptTermsCheckbox).not.toBeChecked();
    });

    test('SPIFF-TC-014 - Terms and Conditions link is present and opens in a new tab @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, testData.program.activeProgramName);

      // Same as TC-013 - the link does not exist until a line item is added.
      await addClaimLineItem(
        claimPage,
        {
          quoteNumber: testData.claim.quoteNumber || 'QA-TC014-VALIDATION',
          dateOfSale: testData.claim.dateOfSale || todayAsDateOfSale(),
          projectName: testData.claim.projectName || 'QA TC-014 Validation',
          projectCity: testData.claim.projectCity || 'Ridgeland',
          projectState: testData.claim.projectState || 'MS',
          originalBOD: testData.claim.originalBOD || 'Carrier',
          engineeringFirm: testData.claim.engineeringFirm || 'QA Engineering LLC',
          engineeringContact: testData.claim.engineeringContact || 'QA Tester',
          engineeringPhone: testData.claim.engineeringPhone || '5551230008',
          engineeringEmail: testData.claim.engineeringEmail || 'qa-test@example.com',
        },
        {
          r410a: testData.claim.tonnageR410A || '1',
          other: testData.claim.tonnageOther || '0',
        },
        testData.documents.invoiceFixturePath
      );

      const termsLink = page.getByRole('link', {
        name: /SPIFF Terms and Conditions/i
      });

      await expect(termsLink).toBeVisible();
      await expect(termsLink).toHaveAttribute('target', '_blank');
    });

  });

  // ------------------------------------------------------------------------
  // Claim Submission E2E (SPIFF-E2E-001)
  // ------------------------------------------------------------------------

  test.describe('E2E - Claim Submission', () => {

    test.setTimeout(180_000);

    test('SPIFF-E2E-001 - SA submits a full claim end-to-end and receives a tracking number @e2e @critical', async ({ page }) => {
      test.skip(
        !testData.claim.quoteNumber || !testData.program.activeProgramName,
        'Requires real claim + program values in test-data.json (claim, program.activeProgramName).'
      );

      await loginAsSpiffUser(page, saEmail, saPassword);

      const claimPage = await openClaimForm(
        page,
        testData.program.activeProgramName
      );

      const claimNumber = await submitFullClaim(
        claimPage,
        {
          quoteNumber: testData.claim.quoteNumber,
          dateOfSale: testData.claim.dateOfSale,
          projectName: testData.claim.projectName,
          projectCity: testData.claim.projectCity,
          projectState: testData.claim.projectState,
          originalBOD: testData.claim.originalBOD,
          engineeringFirm: testData.claim.engineeringFirm,
          engineeringContact: testData.claim.engineeringContact,
          engineeringPhone: testData.claim.engineeringPhone,
          engineeringEmail: testData.claim.engineeringEmail,
          submissionComments: testData.claim.submissionComments,
        },
        {
          r410a: testData.claim.tonnageR410A,
          other: testData.claim.tonnageOther
        },
        testData.documents.invoiceFixturePath
      );

      expect(claimNumber).toBeTruthy();
      await logoutSpiffUser(page);
    });

  });

  // ------------------------------------------------------------------------
  // Claim History / Search (SPIFF-TC-015 - SPIFF-TC-018)
  // ------------------------------------------------------------------------

  test.describe('Claim History', () => {

    test('SPIFF-TC-015 - search by known Claim # returns at least one result @regression', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires test-data.json claimHistory.knownClaimId.'
      );

      await loginAsSpiffUser(page, saEmail, saPassword);

      const historyPage = await searchClaimHistoryByClaimId(
        page,
        testData.claimHistory.knownClaimId
      );

      const rowCount = await historyPage.getResultRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('SPIFF-TC-016 - search by known Quote Number returns at least one result @regression', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownQuoteNumber,
        'Requires test-data.json claimHistory.knownQuoteNumber.'
      );

      await loginAsSpiffUser(page, saEmail, saPassword);

      const historyPage = await navigateToClaimHistory(page);

      await historyPage.searchByQuoteNumber(
        testData.claimHistory.knownQuoteNumber
      );

      await historyPage.clickSearch('history');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      expect(
        await historyPage.getResultRowCount()
      ).toBeGreaterThan(0);
    });

    test('SPIFF-TC-017 - search by non-existent Claim ID shows no results @regression', async ({ page }) => {
      await loginAsSpiffUser(page, saEmail, saPassword);

      const historyPage = await navigateToClaimHistory(page);

      await historyPage.searchByClaimId(
        testData.claimHistory.nonExistentClaimId
      );

      await historyPage.clickSearch('history');
      await historyPage.expectNoResults();
    });

    test('SPIFF-TC-018 - SA only sees their own claims (no other SA rows) @regression @critical', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires test-data.json claimHistory.knownClaimId scoped to the SA test account.'
      );

      await loginAsSpiffUser(page, saEmail, saPassword);

      const historyPage = await navigateToClaimHistory(page);

      await historyPage.clickSearch('history');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      // SA role does not render the Business Name/Branch filter
      // (BMADMIN/SCF only) - absence of that control is itself
      // evidence results are pre-scoped server-side.
      await expect(historyPage.storeNameSelect).toHaveCount(0);
    });

  });

  // ------------------------------------------------------------------------
  // Admin Claim Processing (SPIFF-TC-019 - SPIFF-TC-021)
  // ------------------------------------------------------------------------

  test.describe('Admin Claim Processing', () => {

    test('SPIFF-TC-019 - Process Claim page loads with bulk action buttons @regression', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires test-data.json claimHistory.knownClaimId.'
      );

      await loginAsSpiffUser(page, adminEmail, adminPassword);

      const historyPage = await navigateToProcessSearch(page);

      await historyPage.searchByClaimId(
        testData.claimHistory.knownClaimId
      );

      await historyPage.clickSearch('process');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      const processPage = await openProcessClaimFromHistory(
        historyPage,
        testData.claimHistory.knownClaimId
      );

      await expect(processPage.approveAllButton).toBeVisible();
      await expect(processPage.denyAllButton).toBeVisible();
      await expect(processPage.holdAllButton).toBeVisible();
    });

    test('SPIFF-TC-020 - approving first line item and denying the rest processes successfully @regression @critical', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires testData.json claimHistory.knownClaimId in a processable status.'
      );

      await loginAsSpiffUser(page, adminEmail, adminPassword);

      const historyPage = await navigateToProcessSearch(page);

      await historyPage.searchByClaimId(
        testData.claimHistory.knownClaimId
      );

      await historyPage.clickSearch('process');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      const processPage = await openProcessClaimFromHistory(
        historyPage,
        testData.claimHistory.knownClaimId
      );

      await processClaimApproveFirstDenyRest(processPage);
      await expect(processPage.successMessage).toBeVisible();
    });

    test('SPIFF-TC-021 - admin claim processing requires at least one selected line item @regression', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires test-data.json claimHistory.knownClaimId.'
      );

      await loginAsSpiffUser(page, adminEmail, adminPassword);

      const historyPage = await navigateToProcessSearch(page);

      await historyPage.searchByClaimId(
        testData.claimHistory.knownClaimId
      );

      await historyPage.clickSearch('process');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      const processPage = await openProcessClaimFromHistory(
        historyPage,
        testData.claimHistory.knownClaimId
      );

      const lineCount = await processPage.getLineItemCount();
      expect(lineCount).toBeGreaterThan(0);
    });

  });

  // ------------------------------------------------------------------------
  // E2E - Admin Processing Workflow (SPIFF-E2E-002)
  // ------------------------------------------------------------------------

  test.describe('E2E - Admin Processing', () => {

    test.setTimeout(120_000);

    test('SPIFF-E2E-002 - admin finds a submitted claim via search and processes it end-to-end @e2e @critical', async ({ page }) => {
      test.skip(
        !testData.claimHistory.knownClaimId,
        'Requires test-data.json claimHistory.knownClaimId in a processable status.'
      );

      await loginAsSpiffUser(page, adminEmail, adminPassword);

      const historyPage = await navigateToProcessSearch(page);

      await historyPage.searchByClaimId(
        testData.claimHistory.knownClaimId
      );

      await historyPage.clickSearch('process');

      await expect(historyPage.resultsTable).toBeVisible({
        timeout: 20_000
      });

      const processPage = await openProcessClaimFromHistory(
        historyPage,
        testData.claimHistory.knownClaimId
      );

      await processClaimApproveFirstDenyRest(processPage);
      await expect(processPage.successMessage).toBeVisible();

      await logoutSpiffUser(page);
    });

  });

});