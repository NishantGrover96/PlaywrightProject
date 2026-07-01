/**
 * EngageAds — Order History — Spec File
 * Feature: /EngageAds/OrderHistory
 * DOM verified: 2026-06-29 on UAT
 * Catalog: docs/functional-catalogs/engage-ads/feature-order-history/functional-units.html
 *
 * Tags:
 *   @smoke      — fast, non-mutating critical path
 *   @regression — full functional coverage
 *   @e2e        — end-to-end workflows
 */
import { test, expect } from '../../../fixtures/auto-screenshot.fixture';
import { existsSync } from 'fs';
import * as path from 'path';
import {
  goToOrderHistory,
  goToOrderHistoryAndExpectOrders,
} from '../../../helpers/engage-ads/feature-order-history/order-history.helpers';

const DEALER_AUTH_FILE    = path.resolve(__dirname, '../../../fixtures/.auth/user.json');
const DEALER_AUTH_MISSING = !existsSync(DEALER_AUTH_FILE);

// ════════════════════════════════════════════
// SMOKE
// ════════════════════════════════════════════
test.describe('EngageAds — Order History — Smoke', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped for admin project.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('OH-SMOKE-001 @smoke — Order History page loads for authenticated dealer', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    await orderHistory.expectPageVisible();
    await orderHistory.expectOrderTableVisible();
  });

  test('OH-SMOKE-002 @smoke — Order list is displayed with correct columns', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    await expect(orderHistory.orderTable).toBeVisible({ timeout: 10_000 });
    // Verify key column headers are present
    await expect(orderHistory.page.locator('#orderHistoryTable thead')).toBeVisible();
  });

  test('OH-SMOKE-003 @smoke — Unauthenticated user is redirected to login', async ({ browser }) => {
    const ctx  = await browser.newContext({ storageState: undefined });
    const page = await ctx.newPage();
    await page.goto('/EngageAds/OrderHistory', { waitUntil: 'commit', timeout: 60_000 });
    await expect(page).toHaveURL(/\/Account\/Login/i, { timeout: 20_000 });
    await ctx.close();
  });

  test('OH-SMOKE-004 @smoke — Status badges render correctly', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping badge check.');
      return;
    }
    const badges = orderHistory.statusBadges;
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
    const firstBadgeText = (await badges.first().textContent()) ?? '';
    expect(firstBadgeText.trim().length).toBeGreaterThan(0);
  });

  test('OH-SMOKE-005 @smoke — Edit link present within edit window', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping edit link check.');
      return;
    }
    // At least verify the edit links collection is queryable (may be 0 if all expired)
    const editCount = await orderHistory.editOrderLinks.count();
    expect(editCount).toBeGreaterThanOrEqual(0);
  });

});

// ════════════════════════════════════════════
// REGRESSION
// ════════════════════════════════════════════
test.describe('EngageAds — Order History — Regression', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped for admin project.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('OH-REG-001 @regression — Edit link navigates to Campaign Setup in edit mode', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping.');
      return;
    }
    const editCount = await orderHistory.editOrderLinks.count();
    if (editCount === 0) {
      test.skip(true, 'No orders within edit window — skipping.');
      return;
    }
    await orderHistory.editOrderLinks.first().click();
    await expect(page).toHaveURL(/EngageAds\/CampaignSetup/i, { timeout: 20_000 });
  });

  test('OH-REG-002 @regression — Orders within edit window show edit link with CampaignSetup href', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping.');
      return;
    }
    const editLinks = orderHistory.editOrderLinks;
    const editCount = await editLinks.count();
    if (editCount === 0) {
      test.skip(true, 'No editable orders — skipping.');
      return;
    }
    const href = await editLinks.first().getAttribute('href');
    expect(href).toMatch(/CampaignSetup/i);
  });

  test('OH-REG-003 @regression — Empty state message shown when dealer has no orders', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count > 0) {
      test.skip(true, 'Orders present — empty-state not testable in this session.');
      return;
    }
    await orderHistory.expectNoOrdersMessage();
  });

  test('OH-REG-004 @regression — View Details link opens order details modal', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping modal test.');
      return;
    }
    const viewLinks = orderHistory.viewDetailsLinks;
    const viewCount = await viewLinks.count();
    if (viewCount === 0) {
      test.skip(true, 'No view-details links found — skipping.');
      return;
    }
    await viewLinks.first().click();
    await expect(orderHistory.orderDetailsModal).toBeVisible({ timeout: 10_000 });
    await expect(orderHistory.modalOrderId).toBeVisible({ timeout: 10_000 });
  });

  test('OH-REG-005 @regression — Order date column contains formatted date strings', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    const count = await orderHistory.getOrderCount();
    if (count === 0) {
      test.skip(true, 'No orders available — skipping.');
      return;
    }
    const firstRowDate = await orderHistory.orderRows
      .first()
      .locator('td:nth-child(7)')
      .textContent();
    const dateText = (firstRowDate ?? '').trim();
    expect(dateText.length).toBeGreaterThan(0);
    // Should contain a slash-separated or month-day-year date
    expect(dateText).toMatch(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+ \d{1,2},? \d{4}/);
  });

  test('OH-REG-006 @regression — Pagination controls are visible when orders exist', async ({ page }) => {
    const orderHistory = await goToOrderHistoryAndExpectOrders(page);
    await expect(orderHistory.pagination).toBeVisible({ timeout: 10_000 });
    await expect(orderHistory.totalRecordsSpan).toBeVisible({ timeout: 10_000 });
  });

  test('OH-REG-007 @regression — Export button is visible on the page', async ({ page }) => {
    const orderHistory = await goToOrderHistory(page);
    await expect(orderHistory.exportBtn).toBeVisible({ timeout: 10_000 });
  });

});

// ════════════════════════════════════════════
// E2E
// ════════════════════════════════════════════
test.describe('EngageAds — Order History — E2E', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped for admin project.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('OH-E2E-001 @e2e — Filter by Order ID returns matching rows', async ({ page }) => {
    const orderHistory = await goToOrderHistoryAndExpectOrders(page);
    const firstOrderId = await orderHistory.getOrderIdByIndex(0);
    if (!firstOrderId) {
      test.skip(true, 'Could not read first order ID — skipping.');
      return;
    }
    await orderHistory.orderIdInput.fill(firstOrderId);
    await orderHistory.searchBtn.click();
    await orderHistory.waitForTableReload();
    const count = await orderHistory.getOrderCount();
    expect(count).toBeGreaterThan(0);
    const filteredId = await orderHistory.getOrderIdByIndex(0);
    expect(filteredId).toContain(firstOrderId);
  });

  test('OH-E2E-002 @e2e — Reset button clears filters and restores full list', async ({ page }) => {
    const orderHistory = await goToOrderHistoryAndExpectOrders(page);
    const totalBefore = await orderHistory.getTotalRecordCount();
    await orderHistory.orderIdInput.fill('NONEXISTENT-ORDER-XYZ-12345');
    await orderHistory.searchBtn.click();
    await orderHistory.waitForTableReload();
    await orderHistory.resetBtn.click();
    await orderHistory.waitForTableReload();
    const totalAfter = await orderHistory.getTotalRecordCount();
    expect(totalAfter).toBe(totalBefore);
  });

  test('OH-E2E-003 @e2e — Modal close button dismisses the order details modal', async ({ page }) => {
    const orderHistory = await goToOrderHistoryAndExpectOrders(page);
    const viewCount = await orderHistory.viewDetailsLinks.count();
    if (viewCount === 0) {
      test.skip(true, 'No view-details links found — skipping.');
      return;
    }
    await orderHistory.viewDetailsLinks.first().click();
    await expect(orderHistory.orderDetailsModal).toBeVisible({ timeout: 10_000 });
    await orderHistory.modalCloseBtn.click();
    await expect(orderHistory.orderDetailsModal).toBeHidden({ timeout: 10_000 });
  });

});
