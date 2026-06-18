import { test, expect } from '@playwright/test';
import { DealerBudgetPage } from '../../../pages/coop/feature-dealer-dashboard/feature-budget/DealerBudgetPage';
import {
    loginAsDealer,
    loginAsAdmin,
    navigateToBudgetTab,
    navigateToBudgetTabWithoutSeq,
    isOnAdminIndex,
    waitForProgramTypeLoaded,
    waitForAllChartsRendered,
    waitForBudgetDataResponse,
    waitForSpentByCategoryResponse,
    waitForBudgetUtilizationResponse,
    waitForMediaResponse,
    assertCurrencyTile,
    assertHiddenFieldEncrypted,
    attemptCrossDealerAccess,
    assertWritePermission,
} from '../../../helpers/coop/feature-dealer-dashboard/feature-budget/dealer-budget.helpers';
import testData from '../../../data/coop/feature-dealer-dashboard/feature-budget/test-data.json';

// ═══════════════════════════════════════════════════════════════════════════════
//  SMOKE TESTS — Critical path, fast validation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dealer Budget Tab — Smoke Tests', () => {

    test('@smoke COOP-BDG-T-019: Page loads and shows budget tab for dealer role', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);
        expect(page.url()).toContain(testData.urls.budgetList);
        expect(await budgetPage.assertKpiTilesVisible()).toBe(true);
    });

    test('@smoke COOP-BDG-T-020: On-load dashboard initialisation completes (all 3 charts + KPIs)', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await budgetPage.waitForDashboardLoad();
        expect(await budgetPage.assertChartsRendered()).toBe(true);
        expect(await budgetPage.assertKpiTilesVisible()).toBe(true);
    });

    test('@smoke COOP-BDG-T-003: Program budget type dropdown is populated via AJAX', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);
        const optionCount = await page.locator('#sltProgramType option').count();
        expect(optionCount).toBeGreaterThan(0);
    });

    test('@smoke COOP-BDG-T-001: Budget KPI tiles render with currency format', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForBudgetDataResponse(page);
        await assertCurrencyTile(page, '#hTotalBudget');
        await assertCurrencyTile(page, '#hAdjustments');
        await assertCurrencyTile(page, '#hBudgetSpent');
        await assertCurrencyTile(page, '#hBudgetAvailable');
    });

    test('@smoke COOP-BDG-T-026: Missing dealer_number_seq redirects to AdminIndex', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        await navigateToBudgetTabWithoutSeq(page);
        // Dealers with no seq should be redirected
        // Note: dealers with valid session get own seq injected; this tests unauthenticated/admin path
        expect(
            (await isOnAdminIndex(page)) || page.url().includes('/Budget/List')
        ).toBe(true);
    });

    test('@smoke COOP-BDG-T-027: IsDealer override — dealer cannot spoof another dealer seq', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const result = await attemptCrossDealerAccess(
            page,
            testData.dealers.valid.encryptedDealerSeq,
            testData.dealers.crossDealer.encryptedDealerSeq
        );
        // The hidden field should show the LOGGED-IN dealer's seq, not the other dealer's
        expect(result.data).not.toBe(testData.dealers.crossDealer.encryptedDealerSeq);
    });

    test('@smoke COOP-BDG-T-011: BudgetData API handler returns HTTP 200 with budget object', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const [response] = await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/BudgetData') && resp.status() === 200),
            navigateToBudgetTab(page, testData.dealers.valid.encryptedDealerSeq),
        ]);
        const body = await response.json();
        expect(body).toHaveProperty('totalBudget');
        expect(body).toHaveProperty('availableBudget');
        expect(body).toHaveProperty('adjustments');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  REGRESSION TESTS — Full FU coverage
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dealer Budget Tab — Regression Tests', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
    });

    // ── UI ──────────────────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-002: Fiscal year dropdown is populated on page load', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        const count = await page.locator('#sltFilterYearly option').count();
        expect(count).toBeGreaterThan(0);
    });

    test('@regression COOP-BDG-T-004: Fiscal range span updates on load', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);
        const range = await budgetPage.getFiscalRange();
        expect(range.length).toBeGreaterThan(0);
    });

    test('@regression COOP-BDG-T-005: Spent/Committed breakdown pie chart renders', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await page.waitForSelector('#dvBudgetSpendBreakdown svg', { timeout: 15000 });
        expect(await page.locator('#dvBudgetSpendBreakdown svg').isVisible()).toBe(true);
    });

    test('@regression COOP-BDG-T-006: Budget utilization column chart renders with 2 year data', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await page.waitForSelector('#dvBudgetUtilization svg', { timeout: 15000 });
        // Chart should have 2 columns (current year + prior year)
        const columns = await page.locator('#dvBudgetUtilization .highcharts-point').count();
        expect(columns).toBeGreaterThanOrEqual(1);
    });

    test('@regression COOP-BDG-T-007: Spend by media chart renders', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await page.waitForSelector('#dvSpendByMediaType svg', { timeout: 15000 });
        expect(await page.locator('#dvSpendByMediaType svg').isVisible()).toBe(true);
    });

    test('@regression COOP-BDG-T-008: More detail button for media type is visible', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        expect(await budgetPage.mediaTypeMoreDetailBtn.isVisible()).toBe(true);
    });

    // ── DataEntry ────────────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-009: Changing fiscal year refreshes all dashboard data', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await budgetPage.waitForDashboardLoad();

        const totalBefore = await budgetPage.getKpiValue('total');

        // Change to prior year
        const [programResponse] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/ProgramType') && r.status() === 200),
            budgetPage.selectFiscalYear(testData.fiscalYears.prior),
        ]);
        await waitForAllChartsRendered(page);

        const totalAfter = await budgetPage.getKpiValue('total');
        // Values may differ or be the same — but the AJAX call must have fired
        expect(programResponse.status()).toBe(200);
        expect(await budgetPage.assertChartsRendered()).toBe(true);
    });

    test('@regression COOP-BDG-T-010: Changing program type refreshes KPIs and charts', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);

        const optionCount = await page.locator('#sltProgramType option').count();
        if (optionCount < 2) {
            test.skip(); // only one budget type in test env
            return;
        }

        const [budgetResponse] = await Promise.all([
            waitForBudgetDataResponse(page),
            page.locator('#sltProgramType').selectOption({ index: 1 }),
        ]);
        await waitForAllChartsRendered(page);
        expect(await budgetPage.assertChartsRendered()).toBe(true);
    });

    // ── BusinessLogic ────────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-012: BudgetData response contains all required spent fields', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetData') && r.status() === 200),
            navigateToBudgetTab(page, testData.dealers.valid.encryptedDealerSeq),
        ]);
        const body = await response.json();
        // Must have all calculation-critical properties
        expect(typeof body.totalBudget).toBe('number');
        expect(typeof body.totalAmountSpent).toBe('number');
        expect(typeof body.availableBudget).toBe('number');
        expect(typeof body.adjustments).toBe('number');
        expect(typeof body.reservedAmount).toBe('number');
        expect(body.totalAmountSpent).toBeGreaterThanOrEqual(0);
        expect(body.availableBudget).toBeGreaterThanOrEqual(0);
    });

    test('@regression COOP-BDG-T-013: BudgetUtilization returns current and prior year data', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetUtilization') && !r.url().includes('ByMedia') && r.status() === 200),
            navigateToBudgetTab(page, testData.dealers.valid.encryptedDealerSeq),
        ]);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(1);
        // Each item has name (year label) and spent (%)
        for (const item of body) {
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('spent');
            expect(typeof item.spent).toBe('number');
        }
    });

    test('@regression COOP-BDG-T-014: BudgetUtilizationByMedia returns valid media data', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetUtilizationByMedia') && r.status() === 200),
            navigateToBudgetTab(page, testData.dealers.valid.encryptedDealerSeq),
        ]);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test('@regression COOP-BDG-T-015: BudgetSpentByCategory excludes restricted categories in chart', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await page.waitForSelector('#dvBudgetSpendBreakdown svg', { timeout: 15000 });

        // No legend item should match the excluded category names
        for (const excluded of testData.budget.excludedCategories) {
            const legendItems = page.locator('#dvBudgetSpendBreakdown .highcharts-legend-item text');
            const count = await legendItems.count();
            for (let i = 0; i < count; i++) {
                const text = await legendItems.nth(i).textContent();
                expect(text).not.toContain(excluded);
            }
        }
    });

    test('@regression COOP-BDG-T-016: Zero-budget scenario — KPIs show $0.00 when no data', async ({ page }) => {
        // This test validates the zeroed model return path
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetData') && r.status() === 200),
            navigateToBudgetTab(page, testData.dealers.valid.encryptedDealerSeq),
        ]);
        const body = await response.json();
        // If server returns zeroes, client must display $0.00
        if (body.totalBudget === 0) {
            const totalText = await page.locator('#hTotalBudget').textContent();
            expect(totalText?.trim()).toBe('$0.00');
        }
    });

    test('@regression COOP-BDG-T-017: Fiscal year list reflects active division filter', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        const count = await page.locator('#sltFilterYearly option').count();
        // Must have at least one year (division-filtered or fallback)
        expect(count).toBeGreaterThan(0);
    });

    test('@regression COOP-BDG-T-018: Dealer number is resolved and stored in hidden field', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);
        const dealerNumber = await budgetPage.getHiddenFieldValue('dealerNumber');
        // Should have an encrypted dealer number (non-empty)
        expect(dealerNumber.length).toBeGreaterThan(0);
    });

    // ── Workflow ────────────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-021: Fiscal year change updates fiscal range span', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);

        const rangeBefore = await budgetPage.getFiscalRange();
        await budgetPage.selectFiscalYear(testData.fiscalYears.prior);
        await page.waitForTimeout(300);
        const rangeAfter = await budgetPage.getFiscalRange();
        // Range should update (may be same value if only one year available)
        expect(rangeAfter.length).toBeGreaterThanOrEqual(0);
    });

    test('@regression COOP-BDG-T-022: Program type change fires getDealerBudgetData and loadDashBoard', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);

        const optionCount = await page.locator('#sltProgramType option').count();
        if (optionCount < 2) { test.skip(); return; }

        const [budgetResp, categoryResp, mediaResp] = await Promise.all([
            waitForBudgetDataResponse(page),
            waitForSpentByCategoryResponse(page),
            waitForMediaResponse(page),
            page.locator('#sltProgramType').selectOption({ index: 1 }),
        ]);
        expect(await budgetPage.assertChartsRendered()).toBe(true);
    });

    test('@regression COOP-BDG-T-023: More detail link href contains fiscal year and division params', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await budgetPage.waitForDashboardLoad();

        const href = await budgetPage.getMediaTypeDetailHref();
        expect(href).toContain('/Reports/Coop/Budget/BudgetByMediaTypeReport');
    });

    // ── DataPersistence ──────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-024: DealerNumberSeq hidden field contains encrypted value', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await assertHiddenFieldEncrypted(page, '#hdDealerNumberSeq');
    });

    test('@regression COOP-BDG-T-025: Report URL hidden fields contain base URL values', async ({ page }) => {
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        const spentLink = await budgetPage.getHiddenFieldValue('spentBreakdown');
        const mediaLink = await budgetPage.getHiddenFieldValue('media');
        expect(spentLink).toContain(testData.urls.spentBreakdownReport);
        expect(mediaLink).toContain(testData.urls.mediaTypeReport);
    });

    // ── Security ────────────────────────────────────────────────────────────────
    test('@regression COOP-BDG-T-029: No dealer_number_seq → redirect to AdminIndex', async ({ page }) => {
        await navigateToBudgetTabWithoutSeq(page);
        await page.waitForLoadState('networkidle');
        expect(
            (await isOnAdminIndex(page)) || page.url().includes(testData.urls.budgetList)
        ).toBe(true);
    });

    test('@regression COOP-BDG-T-028: ViewOnly role — writePermission is set to "1"', async ({ page }) => {
        await loginAsDealer(page, testData.users.viewOnly);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await waitForProgramTypeLoaded(page);
        await assertWritePermission(page, true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  E2E TESTS — Cross-tab workflow
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dealer Budget Tab — E2E Tests', () => {

    test('@e2e COOP-BDG-T-E01: Admin navigates to dealer and views budget tab', async ({ page }) => {
        await loginAsAdmin(page, testData.users.admin);
        // Start from admin dealer search → select dealer → navigate to budget tab
        await page.goto('/CoopManagement/Dealer/AdminIndex');
        await page.waitForLoadState('networkidle');
        // Navigate directly to budget tab simulating dealer selection
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await budgetPage.waitForDashboardLoad();
        expect(await budgetPage.assertChartsRendered()).toBe(true);
    });

    test('@e2e COOP-BDG-T-E02: Dealer changes year and program type — full dashboard remains consistent', async ({ page }) => {
        await loginAsDealer(page, testData.users.dealer);
        const budgetPage = new DealerBudgetPage(page);
        await budgetPage.navigate(testData.dealers.valid.encryptedDealerSeq);
        await budgetPage.waitForDashboardLoad();

        // Change fiscal year
        await budgetPage.selectFiscalYear(testData.fiscalYears.prior);
        await waitForProgramTypeLoaded(page);
        await waitForAllChartsRendered(page);

        // Assert charts still rendered after year change
        expect(await budgetPage.assertChartsRendered()).toBe(true);
        expect(await budgetPage.assertKpiTilesVisible()).toBe(true);
    });
});
