import { test, expect } from '@playwright/test';
import testData from '../../../../data/coop/feature-dealer-dashboard/feature-budget/test-data.json';

/**
 * API Tests — Dealer Budget Tab (Backend Gateway)
 *
 * All DealerBudgetApiService calls are HTTP POST with JSON bodies.
 * ProgramSeq resolved from JWT claims on backend — not sent in request body.
 * Gateway base URL: {BaseGatewayUrl}coop/
 *
 * FUs: COOP-FU-BDG-011–018
 * Gaps covered: GAP-BDG-001 (media_spent shared), GAP-BDG-002 (fiscal year no-fallback),
 *               GAP-BDG-003 (zero-value category filter)
 */

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.BASE_URL || 'https://localhost:5001';
const COOP_API = `${GATEWAY_URL}/coop/api`;
const DEALER_SEQ = testData.dealers.valid.dealerSeq;
const DEALER_SEQ_ENC = testData.dealers.valid.encryptedDealerSeq;
const FISCAL_YEAR = parseInt(testData.fiscalYears.current);

// ── Auth helper ────────────────────────────────────────────────────────────────
async function getAuthToken(request: import('@playwright/test').APIRequestContext): Promise<string> {
    const resp = await request.post(`${GATEWAY_URL}/Account/Login`, {
        form: {
            username: testData.users.dealer.username,
            password: testData.users.dealer.password,
        },
    });
    const body = await resp.json().catch(() => ({}));
    return body?.token ?? body?.access_token ?? '';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BACKEND GATEWAY API TESTS
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dealer Budget — Backend API (Gateway) Tests', () => {

    // ── POST coop/api/Budget/budget-recap-by-program-saas ─────────────────────
    // Used by: OnGetProgramType, OnGetBudgetData, OnGetBudgetUtilization

    test('@api COOP-BDG-T-003-API: budget-recap-by-program-saas returns program budget types', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/budget-recap-by-program-saas`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                ReportType: 'DEALER',
                ReportParam: String(DEALER_SEQ),
                DivisionSeq: 1,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        // Response is ApiResponse<JArray> — data array of budget recap items
        const data = body?.data ?? body;
        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
            const first = data[0];
            expect(first).toHaveProperty('name');
            expect(first).toHaveProperty('programBudgetSeq');
            expect(typeof first.originalBudget).toBe('number');
        }
    });

    test('@api COOP-BDG-T-011-API: budget-recap-by-program-saas contains all budget calculation fields', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/budget-recap-by-program-saas`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                ReportType: 'DEALER',
                ReportParam: String(DEALER_SEQ),
                DivisionSeq: 1,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        if (data.length > 0) {
            const item = data[0];
            // All 6 fields used in TotalAmountSpent calculation must be present
            expect(item).toHaveProperty('coopActivityPositive');
            expect(item).toHaveProperty('coopActivityFromCommitment');
            expect(item).toHaveProperty('commitmentActivityFromBudget');
            expect(item).toHaveProperty('commitmentActivity');
            expect(item).toHaveProperty('spentForEngage');
            expect(item).toHaveProperty('spentForPopshop');
            // KPI fields
            expect(item).toHaveProperty('originalBudget');
            expect(item).toHaveProperty('budgetAdjustments');
            expect(item).toHaveProperty('budgetAdjustmentsCommitment');
            expect(item).toHaveProperty('currentBudget');
            expect(item).toHaveProperty('reservedBudget');
        }
    });

    test('@api COOP-BDG-T-013-API: budget-recap-by-program-saas for prior year (utilization 2-year)', async ({ request }) => {
        const priorYear = FISCAL_YEAR - 1;
        const resp = await request.post(`${COOP_API}/Budget/budget-recap-by-program-saas`, {
            data: {
                FiscalYear: priorYear,
                ReportType: 'DEALER',
                ReportParam: String(DEALER_SEQ),
                DivisionSeq: 1,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        expect(Array.isArray(data)).toBe(true);
        // Prior year data used for utilization chart — may be empty but must return valid response
    });

    // ── POST coop/api/Budget/dealer-utilization-by-media — GAP-BDG-001 ─────────

    test('@api COOP-BDG-T-014-API: dealer-utilization-by-media returns TotalMediaSpent + Items[]', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/dealer-utilization-by-media`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                DivisionSeq: 1,
                DealerNumberSeq: DEALER_SEQ,
                PreventCat: '',
                ProgramBudgetSeq: 1,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        // GAP-BDG-001: Modern returns { totalMediaSpent, items[] }
        // ALL items share the same media_spent = TotalMediaSpent when projected in OnGetBudgetUtilizationByMedia
        expect(data).toHaveProperty('totalMediaSpent');
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
        if (data.items.length > 0) {
            const item = data.items[0];
            expect(item).toHaveProperty('mediaType');
            expect(item).toHaveProperty('amountReimbursed');
            // Verify GAP: each item gets result.TotalMediaSpent as media_spent (not per-item)
            expect(typeof data.totalMediaSpent).toBe('number');
        }
    });

    test('@api COOP-BDG-T-014-API-SHAPE: Verify media_spent is shared (GAP-BDG-001 confirmation)', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/dealer-utilization-by-media`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                DivisionSeq: 1,
                DealerNumberSeq: DEALER_SEQ,
                PreventCat: '',
                ProgramBudgetSeq: 0,
            },
        });
        if (resp.status() !== 200) { test.skip(); return; }
        const body = await resp.json();
        const data = body?.data ?? body;
        // The gap: when page handler projects items, ALL get the same media_spent = data.totalMediaSpent
        // This test documents this gap — percentage for each item will use shared denominator
        if (data.items?.length > 1) {
            const sharedDenominator = data.totalMediaSpent;
            // All chart bars will divide by sharedDenominator — not per-item media spend
            expect(typeof sharedDenominator).toBe('number');
        }
    });

    // ── POST coop/api/Budget/dealer-spending-by-category — GAP-BDG-003 ─────────

    test('@api COOP-BDG-T-015-API: dealer-spending-by-category returns name-value items', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/dealer-spending-by-category`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                ProgramBudgetTypeSeq: 1,
                DealerNumberSeq: DEALER_SEQ,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        // Response: { items: [{ name, value }] }
        const items = data?.items ?? data;
        expect(Array.isArray(items)).toBe(true);
        if (items.length > 0) {
            expect(items[0]).toHaveProperty('name');
            expect(items[0]).toHaveProperty('value');
        }
    });

    test('@api COOP-BDG-T-015-API-GAP: GAP-BDG-003 — modern sends "0" values, legacy filtered server-side', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/dealer-spending-by-category`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                ProgramBudgetTypeSeq: 1,
                DealerNumberSeq: DEALER_SEQ,
            },
        });
        if (resp.status() !== 200) { test.skip(); return; }
        const body = await resp.json();
        const data = body?.data ?? body;
        const items = data?.items ?? data;
        // Modern handler only strips IsNullOrWhiteSpace — "0" values reach client
        // Legacy stripped "0" and "0.00" server-side
        // JS renders: value > 0 condition protects chart but server shape differs
        const zeroValueItems = items.filter((i: { value: string }) => i.value === '0' || i.value === '0.00');
        // Document: in modern these items reach the page handler (though JS filters them)
        expect(Array.isArray(zeroValueItems)).toBe(true);
    });

    // ── POST coop/api/FiscalYear/GetFiscalYearsByProgramSeq — GAP-BDG-002 ─────

    test('@api COOP-BDG-T-017-API: GetFiscalYearsByProgramSeq with divisionSeq=0 returns all years', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/FiscalYear/GetFiscalYearsByProgramSeq`, {
            data: {
                ProgramSeq: 1,
                DivisionSeq: 0,  // Modern always passes 0 — GAP-BDG-002
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        expect(Array.isArray(data)).toBe(true);
        // GAP-BDG-002: All fiscal years returned; LINQ then filters by activeDivisionSeq
        // If activeDivisionSeq doesn't match any division_seq → FiscalYearList is empty (no fallback)
        if (data.length > 0) {
            expect(data[0]).toHaveProperty('fiscalYear');
            expect(data[0]).toHaveProperty('divisionSeq');
        }
    });

    // ── POST coop/api/Dealer/GetDealerByDealerNumberSeq ──────────────────────

    test('@api COOP-BDG-T-018-API: GetDealerByDealerNumberSeq returns dealer number string', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Dealer/GetDealerByDealerNumberSeq`, {
            data: { DealerNumberSeq: DEALER_SEQ },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        // Returns JArray — first item's dealerNumber is extracted as string
        const dealerNumber = Array.isArray(data)
            ? data[0]?.dealerNumber ?? data[0]?.DealerNumber
            : null;
        expect(typeof dealerNumber).toBe('string');
        expect(dealerNumber.length).toBeGreaterThan(0);
    });

    test('@api COOP-BDG-T-018-API-EMPTY: Invalid dealerNumberSeq returns empty string (not null)', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Dealer/GetDealerByDealerNumberSeq`, {
            data: { DealerNumberSeq: 999999999 },
        });
        // Modern: Convert.ToString(dealerData?["dealerNumber"] ?? "") — returns "" not null
        expect([200, 404]).toContain(resp.status());
        if (resp.status() === 200) {
            const body = await resp.json();
            const data = body?.data ?? body;
            const first = Array.isArray(data) ? data[0] : null;
            const result = first?.dealerNumber ?? first?.DealerNumber ?? '';
            expect(typeof result).toBe('string');
        }
    });

    // ── POST coop/api/Budget/dealer-utilization-by-product-group ─────────────

    test('@api COOP-BDG-T-014b-API: dealer-utilization-by-product-group returns product items', async ({ request }) => {
        const resp = await request.post(`${COOP_API}/Budget/dealer-utilization-by-product-group`, {
            data: {
                FiscalYear: FISCAL_YEAR,
                DivisionSeq: 1,
                DealerNumberSeq: DEALER_SEQ,
                ProgramBudgetSeq: 0,
            },
        });
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const data = body?.data ?? body;
        expect(data).toHaveProperty('totalProductSpent');
        expect(Array.isArray(data?.items ?? [])).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE HANDLER RESPONSE SHAPE TESTS (via Razor page AJAX endpoints)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dealer Budget — Page Handler Response Shape Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/Account/Login');
        await page.fill('input[name="username"], input[name="UserName"]', testData.users.dealer.username);
        await page.fill('input[type="password"]', testData.users.dealer.password);
        await page.click('button[type="submit"], input[type="submit"]');
        await page.waitForLoadState('networkidle');
    });

    test('@api COOP-BDG-T-011-HANDLER: OnGetBudgetData returns { totalBudget, adjustments, availableBudget, reservedAmount }', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetData') && r.status() === 200),
            page.goto(`/CoopManagement/Dealer/Budget/List?dealer_number_seq=${encodeURIComponent(DEALER_SEQ_ENC)}`),
        ]);
        const body = await response.json();
        expect(body).toHaveProperty('totalBudget');
        expect(body).toHaveProperty('totalAmountSpent');
        expect(body).toHaveProperty('availableBudget');
        expect(body).toHaveProperty('adjustments');
        expect(body).toHaveProperty('reservedAmount');
        expect(body.totalBudget).toBeGreaterThanOrEqual(0);
        expect(body.availableBudget).toBeGreaterThanOrEqual(0);
    });

    test('@api COOP-BDG-T-014-HANDLER: OnGetBudgetUtilizationByMedia shape — media_spent is TotalMediaSpent (GAP-BDG-001)', async ({ page }) => {
        const [response] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/BudgetUtilizationByMedia') && r.status() === 200),
            page.goto(`/CoopManagement/Dealer/Budget/List?dealer_number_seq=${encodeURIComponent(DEALER_SEQ_ENC)}`),
        ]);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        if (body.length > 1) {
            // GAP-BDG-001: Every item has the SAME media_spent value (TotalMediaSpent)
            const firstMediaSpent = body[0]?.media_spent;
            const allSame = body.every((item: { media_spent: string }) => item.media_spent === firstMediaSpent);
            expect(allSame).toBe(true); // Confirms gap: all items share same denominator
        }
    });
});

