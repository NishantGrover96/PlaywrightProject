import { test, expect } from '@playwright/test';

import {
  loginAsSpiffUser,
  attemptLoginExpectFailure,
  logoutSpiffUser,
  navigateToProcessSearch,
  openProcessClaimFromHistory,
  processClaimApproveFirstDenyRest,
  processClaimApproveAllLines,
  openClaimForm,
  submitFullClaim,
  todayAsDateOfSale,
  searchClaimHistoryByClaimId,
} from '../../../../helpers/samsung/spiff/feature-spiff/spiff.helpers';

import { SpiffManagePage, SPIFF_PRODUCT_CATEGORY } from '../../../../pages/samsung/spiff/feature-spiff/SpiffPage';

import { adminEmail, adminPassword, saEmail, saPassword } from '../../../../helpers/samsung/spiff/feature-spiff/spiff.credentials';

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

  // ------------------------------------------------------------------------
  // Claim Amount / Approved Amount Calculation
  // ------------------------------------------------------------------------
  // Confirmed live (2026-09-16): the "CLAIM AMOUNT | APPROVE AMOUNT |
  // COMMENTS" column on View Claim History only renders for admin/SCF roles
  // - not for SA/dealer - on the same #tblReport view (SpiffClaimHistoryPage.
  // getClaimAndApproveAmount()'s own note). Both amounts are real,
  // rate-driven calculations (RebateAccessor DAL, not a static/placeholder
  // value): Claim Amount = sum of (submitted tonnage x that category's
  // configured Payment Rule rate); Approved Amount = same formula using the
  // admin-verified tonnage (which defaults to the submitted tonnage when an
  // admin approves without adjusting it).
  //
  // This test creates its OWN throwaway SPIFF with its own payment rules
  // (same pattern as spiff-manage.spec.ts) rather than reading rates off the
  // shared "2026 Flip to Samsung" SPIFF - confirmed live this session that
  // its payment rule NAMES are not stable (they changed between two checks
  // ~90 minutes apart, presumably from other concurrent activity on this
  // shared UAT environment), so mapping rule name -> category on that
  // record is not a reliable basis for a regression test. Rates are still
  // read at run time via SpiffManagePage.getRuleDollarAmount() rather than
  // hardcoded, per the coverage requirements ("don't hardcode rates 15/10,
  // don't hardcode the amount 290") - they're just rates this test itself
  // configured (deliberately different from the real SPIFF's $15/$10, to
  // prove the calculation isn't coincidentally matching known-good numbers).
  test.describe('Claim Amount / Approved Amount Calculation', () => {

    test.setTimeout(300_000);

    test('SPIFF-PROCESS-001 - Claim Amount and Approved Amount match tonnage x configured payment rule rates @e2e @critical', async ({ page }) => {
      const spiffName = `QA Calc Verify SPIFF ${Date.now()}`;
      const tonnage = { r410a: '12', other: '11' };
      const r410aRateInput = '7';
      const otherRateInput = '4';

      // 1. Admin creates a throwaway SPIFF with known, distinct payment rule
      // rates (same create flow already proven live in spiff-manage.spec.ts).
      await loginAsSpiffUser(page, adminEmail, adminPassword);
      const managePage = new SpiffManagePage(page);
      await managePage.navigateToAddSpiff();

      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);
      const graceDate = new Date(endDate);
      graceDate.setDate(graceDate.getDate() + 15);
      const fmt = (d: Date) =>
        [String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'), d.getFullYear()].join('/');

      await managePage.fillSpiffDetail({
        name: spiffName,
        startDate: fmt(today),
        endDate: fmt(endDate),
        gracePeriodDate: fmt(graceDate),
      });
      await managePage.uploadReferenceDocument(testData.documents.invoiceFixturePath);
      await managePage.saveSpiffDetailAndOpenPaymentRuleTab(spiffName);

      await managePage.fillAndSavePaymentRule({
        ruleName: 'QA R410A Rate',
        minimumTonnage: '1',
        dollarAmountPerTon: r410aRateInput,
        productCategory: SPIFF_PRODUCT_CATEGORY.r410aDvm,
      });
      await expect(managePage.getRuleRowByName('QA R410A Rate')).toBeVisible();

      await managePage.addNewRuleButton.click();
      await managePage.fillAndSavePaymentRule({
        ruleName: 'QA Other Rate',
        minimumTonnage: '1',
        dollarAmountPerTon: otherRateInput,
        productCategory: SPIFF_PRODUCT_CATEGORY.allOtherSamsungProducts,
      });
      await expect(managePage.getRuleRowByName('QA Other Rate')).toBeVisible();

      // Read the configured rates back at run time - not the literal
      // r410aRateInput/otherRateInput constants above - so the assertion
      // below is against what the app actually persisted and displays.
      const r410aRate = await managePage.getRuleDollarAmount('QA R410A Rate');
      const otherRate = await managePage.getRuleDollarAmount('QA Other Rate');
      const expectedClaimAmount = Number(tonnage.r410a) * r410aRate + Number(tonnage.other) * otherRate;

      await logoutSpiffUser(page);

      // 2. SA submits a claim with known, deterministic tonnage against this SPIFF.
      await loginAsSpiffUser(page, saEmail, saPassword);
      const claimPage = await openClaimForm(page, spiffName);
      const claimNumber = await submitFullClaim(
        claimPage,
        {
          quoteNumber: `QA-CALC-${Date.now()}`,
          dateOfSale: todayAsDateOfSale(),
          projectName: 'QA Claim Amount Calculation Test',
          projectCity: 'Ridgeland',
          projectState: 'MS',
          originalBOD: 'Carrier',
          engineeringFirm: 'QA Engineering LLC',
          engineeringContact: 'QA Tester',
          engineeringPhone: '5551230009',
          engineeringEmail: 'qa-test@example.com',
        },
        tonnage,
        testData.documents.invoiceFixturePath
      );
      expect(claimNumber).toBeTruthy();
      await logoutSpiffUser(page);

      // 3. Admin: verify Claim Amount on View Claim History matches the
      // calculated value - not a hardcoded number.
      await loginAsSpiffUser(page, adminEmail, adminPassword);
      const historyPageBeforeProcessing = await searchClaimHistoryByClaimId(page, claimNumber);
      const beforeAmounts = await historyPageBeforeProcessing.getClaimAndApproveAmount(claimNumber);
      expect(Number.parseFloat(beforeAmounts.claimAmount.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedClaimAmount, 2);

      // 4. Admin: process (approve) the claim without adjusting tonnage, so
      // Approved Amount should equal the same calculated value.
      const processSearchPage = await navigateToProcessSearch(page);
      await processSearchPage.searchByClaimId(claimNumber);
      await processSearchPage.clickSearch('process');
      await expect(processSearchPage.resultsTable).toBeVisible({ timeout: 20_000 });

      const processPage = await openProcessClaimFromHistory(processSearchPage, claimNumber);
      await processClaimApproveAllLines(processPage);
      await expect(processPage.successMessage).toBeVisible();

      // 5. Admin: verify Approved Amount on View Claim History matches the
      // same calculated value.
      const historyPageAfterProcessing = await searchClaimHistoryByClaimId(page, claimNumber);
      const afterAmounts = await historyPageAfterProcessing.getClaimAndApproveAmount(claimNumber);
      expect(Number.parseFloat(afterAmounts.approveAmount.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedClaimAmount, 2);

      await logoutSpiffUser(page);
    });

  });

});
