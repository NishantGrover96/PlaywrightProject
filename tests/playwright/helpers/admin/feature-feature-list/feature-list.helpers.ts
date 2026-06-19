import { Page, expect } from '@playwright/test';
import { FeatureListPage } from '../../../pages/admin/feature-feature-list/FeatureListPage';
import { ModuleListPage } from '../../../pages/admin/feature-feature-list/ModuleListPage';

/**
 * Helper: Log in as admin user and navigate to Feature List
 */
export async function loginAndNavigateToFeatureList(page: Page, credentials: { username: string; password: string }): Promise<FeatureListPage> {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Fill login form - adjust selectors to match actual login page
    const usernameInput = page.locator('#txtUsername, input[name="username"], input[type="email"]').first();
    const passwordInput = page.locator('#txtPassword, input[name="password"], input[type="password"]').first();
    const loginButton = page.locator('#btnLogin, button[type="submit"]').first();
    await usernameInput.fill(credentials.username);
    await passwordInput.fill(credentials.password);
    await loginButton.click();
    await page.waitForLoadState('networkidle');

    const featureListPage = new FeatureListPage(page);
    await featureListPage.navigate();
    return featureListPage;
}

/**
 * Helper: Enable edit mode by clicking AutoPlay and entering PIN
 */
export async function enableEditMode(page: Page, featureListPage: FeatureListPage, pin: string): Promise<void> {
    await featureListPage.editModeToggle.click();
    await featureListPage.pinModal.waitFor({ state: 'visible' });
    await featureListPage.pinInput.fill(pin);
    await featureListPage.pinSubmitButton.click();
    await featureListPage.pinModal.waitFor({ state: 'hidden' });
    await expect(featureListPage.editModeCheckbox).toBeChecked();
}

/**
 * Helper: Verify edit mode controls are visible (after PIN unlock)
 */
export async function verifyEditModeActive(page: Page, featureListPage: FeatureListPage): Promise<void> {
    await expect(featureListPage.page.locator('#actionColumn')).toBeVisible();
    await expect(featureListPage.page.locator('#statusColumn')).toBeVisible();
    await expect(featureListPage.addFeatureButton).toBeVisible();
    await expect(featureListPage.downloadButton).toBeVisible();
    await expect(featureListPage.uploadButton).toBeVisible();
}

/**
 * Helper: Verify edit mode controls are hidden (edit mode off)
 */
export async function verifyEditModeInactive(page: Page): Promise<void> {
    await expect(page.locator('#actionColumn')).toBeHidden();
    await expect(page.locator('#statusColumn')).toBeHidden();
    await expect(page.locator('#btnAddFeature')).toBeHidden();
}

/**
 * Helper: Get tab count badge value for a module
 * Returns the numeric count extracted from tab text like "Claims (12)"
 */
export async function getTabCount(page: Page, moduleName: string): Promise<number | null> {
    const tabText = await page.locator(`.tabModule[value="${moduleName}"]`).innerText();
    const match = tabText.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Helper: Wait for feature table to load data (tbody has rows)
 */
export async function waitForFeatureTableRows(page: Page, minRows: number = 1): Promise<void> {
    await page.waitForFunction(
        (min) => document.querySelectorAll('#_AllProgramFeature tbody tr').length >= min,
        minRows,
        { timeout: 20000 }
    );
}

/**
 * Helper: Get all visible feature names from the current tab
 */
export async function getVisibleFeatureNames(page: Page): Promise<string[]> {
    const rows = page.locator('#_AllProgramFeature tbody tr:visible');
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
        const name = await rows.nth(i).locator('td').first().innerText();
        names.push(name.trim());
    }
    return names;
}

/**
 * Helper: Toggle a feature flag (requires edit mode active)
 * Returns the new status visible in the row after toggle
 */
export async function toggleFeatureFlag(page: Page, rowIndex: number): Promise<void> {
    const toggle = page.locator('#_AllProgramFeature tbody tr').nth(rowIndex).locator('input[type="checkbox"]');
    await toggle.click();
    await page.waitForResponse(resp =>
        resp.url().includes('ProgramFeatureActiveFlag') && resp.status() === 200
    );
}

/**
 * Helper: Open the User Group modal for a feature row
 */
export async function openUserGroupModal(page: Page, rowIndex: number): Promise<void> {
    const roleIcon = page.locator('#_AllProgramFeature tbody tr').nth(rowIndex).locator('[data-action="usergroup"], .role-icon, .userRoleBtn').first();
    await roleIcon.click();
    await page.locator('#exampleModal').waitFor({ state: 'visible' });
}

/**
 * Helper: Open Scope modal for a feature row
 */
export async function openScopeModal(page: Page, rowIndex: number): Promise<void> {
    const scopeIcon = page.locator('#_AllProgramFeature tbody tr').nth(rowIndex).locator('[data-action="scope"], .scope-icon, .scopeBtn').first();
    await scopeIcon.click();
    await page.locator('#scopeModal').waitFor({ state: 'visible' });
}

/**
 * Helper: Create a mock .xlsx file buffer for import testing
 * Returns the path to a temporary test excel file if it exists in test-data
 */
export function getTestExcelPath(filename: string): string {
    return `tests/playwright/data/admin/feature-feature-list/${filename}`;
}

/**
 * Helper: Navigate to ModuleList page and return page object
 */
export async function navigateToModuleList(page: Page): Promise<ModuleListPage> {
    const moduleListPage = new ModuleListPage(page);
    await moduleListPage.navigate();
    return moduleListPage;
}
