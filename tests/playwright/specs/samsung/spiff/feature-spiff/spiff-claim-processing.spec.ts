import { test, expect } from '@playwright/test';

import {
  loginAsSpiffUser,
  attemptLoginExpectFailure,
  logoutSpiffUser,
  navigateToProcessSearch,
  openProcessClaimFromHistory,
  processClaimApproveFirstDenyRest,
} from '../../../../helpers/samsung/spiff/feature-spiff/spiff.helpers';

import { adminEmail, adminPassword } from '../../../../helpers/samsung/spiff/feature-spiff/spiff.credentials';

import testData from '../../../../data/samsung/spiff/feature-spiff/test-data.json';

/**
 * Admin-facing claim processing: login/access, the Process Claim search,
 * and approve/deny of submitted claims. SA-side claim submission lives in
 * spiff-claim-submission.spec.ts; SPIFF program / payment-rule creation
 * lives in spiff-manage.spec.ts.
 */
test.describe('Samsung - SPIFF (Flip to Samsung) - Claim Processing', () => {

  // ------------------------------------------------------------------------
  // Smoke Suite (SPIFF-SMOKE-005)
  // ------------------------------------------------------------------------

  test.describe('Smoke', () => {

    test('SPIFF-SMOKE-005 - admin logs in and can open Process Claim search @smoke @critical', async ({ page }) => {
      await loginAsSpiffUser(page, adminEmail, adminPassword);
      const historyPage = await navigateToProcessSearch(page);
      await expect(historyPage.claimIdInput).toBeVisible();
    });

  });

  // ------------------------------------------------------------------------
  // Authentication (SPIFF-TC-002 - SPIFF-TC-003)
  // ------------------------------------------------------------------------

  test.describe('Authentication', () => {

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
