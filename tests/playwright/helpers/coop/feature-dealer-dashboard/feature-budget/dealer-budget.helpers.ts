import { Page, APIRequestContext, expect } from '@playwright/test';

/**
 * Helpers — Dealer Budget Tab
 * Feature: COOP Dealer Dashboard / Budget
 * FUs: COOP-FU-BDG-001 to COOP-FU-BDG-029
 */

// ── Authentication ─────────────────────────────────────────────────────────────

export async function loginAsDealer(page: Page, credentials: { username: string; password: string }): Promise<void> {
    await page.goto('/Account/Login');
    await page.fill('input[name="username"], input[name="UserName"], input[id="UserName"]', credentials.username);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
}

export async function loginAsAdmin(page: Page, credentials: { username: string; password: string }): Promise<void> {
    await loginAsDealer(page, credentials); // same form
}

// ── Navigation ─────────────────────────────────────────────────────────────────

export async function navigateToBudgetTab(page: Page, encryptedDealerSeq: string): Promise<void> {
    await page.goto(
        `/CoopManagement/Dealer/Budget/List?dealer_number_seq=${encodeURIComponent(encryptedDealerSeq)}`
    );
    await page.waitForLoadState('networkidle');
}

export async function navigateToBudgetTabWithoutSeq(page: Page): Promise<void> {
    await page.goto('/CoopManagement/Dealer/Budget/List');
    await page.waitForLoadState('networkidle');
}

// ── Page State Assertions ──────────────────────────────────────────────────────

/** Assert page was redirected to AdminIndex (missing dealer_number_seq guard) */
export async function isOnAdminIndex(page: Page): Promise<boolean> {
    return page.url().includes('/Dealer/AdminIndex') || page.url().includes('/dealer/AdminIndex');
}

/** Wait for program type AJAX to complete and dropdown to be populated */
export async function waitForProgramTypeLoaded(page: Page): Promise<void> {
    await page.waitForFunction(
        () => (document.querySelector('#sltProgramType') as HTMLSelectElement)?.options?.length > 0,
        { timeout: 10000 }
    );
}

/** Wait for all three Highcharts SVGs to render */
export async function waitForAllChartsRendered(page: Page): Promise<void> {
    await Promise.all([
        page.waitForSelector('#dvBudgetSpendBreakdown svg', { timeout: 15000 }),
        page.waitForSelector('#dvBudgetUtilization svg', { timeout: 15000 }),
        page.waitForSelector('#dvSpendByMediaType svg', { timeout: 15000 }),
    ]);
}

/** Assert KPI tile is visible and not $0.00 (data was loaded) */
export async function assertKpiHasData(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeVisible();
    const text = await page.locator(selector).textContent();
    expect(text?.trim()).not.toBe('');
}

// ── AJAX Intercept Helpers ────────────────────────────────────────────────────

/** Wait for the BudgetData AJAX call to complete */
export async function waitForBudgetDataResponse(page: Page): Promise<void> {
    await page.waitForResponse(
        resp => resp.url().includes('/BudgetData') && resp.status() === 200,
        { timeout: 10000 }
    );
}

/** Wait for the BudgetSpentByCategory AJAX call */
export async function waitForSpentByCategoryResponse(page: Page): Promise<void> {
    await page.waitForResponse(
        resp => resp.url().includes('/BudgetSpentByCategory') && resp.status() === 200,
        { timeout: 10000 }
    );
}

/** Wait for the BudgetUtilization AJAX call */
export async function waitForBudgetUtilizationResponse(page: Page): Promise<void> {
    await page.waitForResponse(
        resp => resp.url().includes('/BudgetUtilization') && !resp.url().includes('ByMedia') && resp.status() === 200,
        { timeout: 10000 }
    );
}

/** Wait for the BudgetUtilizationByMedia AJAX call */
export async function waitForMediaResponse(page: Page): Promise<void> {
    await page.waitForResponse(
        resp => resp.url().includes('/BudgetUtilizationByMedia') && resp.status() === 200,
        { timeout: 10000 }
    );
}

// ── Validation Helpers ─────────────────────────────────────────────────────────

/** Parse currency string like "$1,234.56" to number */
export function parseCurrency(value: string): number {
    return parseFloat(value.replace(/[$,]/g, '')) || 0;
}

/** Assert a currency KPI shows a non-negative dollar value */
export async function assertCurrencyTile(page: Page, selector: string): Promise<void> {
    const text = (await page.locator(selector).textContent()) ?? '';
    const value = parseCurrency(text);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(text).toMatch(/^\$[\d,]+\.\d{2}$/);
}

/** Assert hidden field contains encrypted (non-empty, non-plain) value */
export async function assertHiddenFieldEncrypted(page: Page, selector: string): Promise<void> {
    const val = await page.locator(selector).getAttribute('value');
    expect(val).toBeTruthy();
    expect(val?.length).toBeGreaterThan(10);
    // Should not look like a plain integer (must be encrypted)
    expect(/^\d+$/.test(val ?? '')).toBe(false);
}

// ── Security Helpers ───────────────────────────────────────────────────────────

/** Attempt to access budget tab with a different dealer's seq (cross-dealer test) */
export async function attemptCrossDealerAccess(
    page: Page,
    ownEncryptedSeq: string,
    otherEncryptedSeq: string
): Promise<{ url: string; data: string | null }> {
    // As a dealer, navigate with another dealer's seq — should be overridden
    await page.goto(
        `/CoopManagement/Dealer/Budget/List?dealer_number_seq=${encodeURIComponent(otherEncryptedSeq)}`
    );
    await page.waitForLoadState('networkidle');
    const actualSeq = await page.locator('#hdDealerNumberSeq').getAttribute('value');
    return { url: page.url(), data: actualSeq };
}

/** Assert the write permission script is or is not injected (ViewOnly check) */
export async function assertWritePermission(page: Page, expected: boolean): Promise<void> {
    const writePermission = await page.evaluate(() => {
        return (window as unknown as Record<string, unknown>)['writePermission'];
    });
    if (expected) {
        expect(writePermission).toBe('1');
    } else {
        expect(writePermission).toBeUndefined();
    }
}
