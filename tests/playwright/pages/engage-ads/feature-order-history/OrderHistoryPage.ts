/**
 * OrderHistoryPage — Page Object
 * Module: engage-ads | Feature: order-history
 * URL: /EngageAds/OrderHistory
 *
 * Locators verified against live DOM on 2026-06-29.
 * See Locator Validation Report at end of file.
 *
 * Column map (fixed — DataTables static header):
 *   td:nth-child(1)  Action
 *   td:nth-child(2)  Order ID
 *   td:nth-child(3)  Package Name
 *   td:nth-child(4)  Total Spend
 *   td:nth-child(5)  Co-op Used
 *   td:nth-child(6)  Card Payment
 *   td:nth-child(7)  Order Date
 *   td:nth-child(8)  Status  (contains <span class="OrderStatusBadge">)
 *   td:nth-child(9)  Campaign Form Submitted
 *   td:nth-child(10) Campaign Form Submitted Date
 */
import { expect, type Locator, type Page } from '@playwright/test';

export class OrderHistoryPage {
  readonly page: Page;
  readonly url = '/EngageAds/OrderHistory';

  // ── Table ────────────────────────────────────────────────────
  readonly orderTable:       Locator; // #orderHistoryTable
  readonly orderBody:        Locator; // #orderHistoryBody
  readonly orderRows:        Locator; // #orderHistoryBody tr  (data rows after load)
  readonly loadingCell:      Locator; // td containing loading text — wait for hidden
  readonly noOrdersMessage:  Locator; // td.dataTables_empty   — DataTables empty state

  // ── Action column locators (scoped to tbody) ─────────────────
  readonly viewDetailsLinks: Locator; // a.actionLink.viewOrderDetails  — opens modal
  readonly editOrderLinks:   Locator; // a[href*="CampaignSetup"]        — navigates

  // ── Status badges ────────────────────────────────────────────
  readonly statusBadges:     Locator; // span.OrderStatusBadge in tbody

  // ── Page heading ─────────────────────────────────────────────
  readonly pageHeading:      Locator; // h4 "Order Details / Order History"

  // ── Filter inputs (all have stable IDs) ──────────────────────
  readonly startDateInput:    Locator; // #txtStartDate
  readonly endDateInput:      Locator; // #txtEndDate
  readonly orderIdInput:      Locator; // #txtOrderId
  readonly packageNameInput:  Locator; // #txtPackageName
  readonly paymentTypeSelect: Locator; // #ddlPaymentType
  readonly statusSelect:      Locator; // #ddlStatus
  readonly searchBtn:         Locator; // #btnSearch
  readonly resetBtn:          Locator; // #btnReset
  readonly exportBtn:         Locator; // #btnExportOrderHistory

  // ── Pagination ───────────────────────────────────────────────
  readonly pagination:        Locator; // #orderHistoryPagination
  readonly pageSizeSelect:    Locator; // #ddlOrderHistoryPageSize
  readonly totalRecordsSpan:  Locator; // #orderHistoryTotalRecords
  readonly showingStartSpan:  Locator; // #orderHistoryShowingStart
  readonly showingEndSpan:    Locator; // #orderHistoryShowingEnd

  // ── Order Details Modal ──────────────────────────────────────
  // NOTE: "View Details" opens a modal (href="#") — NOT a page navigation.
  readonly orderDetailsModal: Locator; // #orderDetailsModal
  readonly modalCloseBtn:     Locator; // #orderDetailsModal button[aria-label="Close"]
  readonly modalOrderId:      Locator; // #modalOrderId
  readonly modalPackageName:  Locator; // #modalPackageName
  readonly modalStatus:       Locator; // #modalStatus
  readonly modalTotalSpend:   Locator; // #modalTotalSpend
  readonly modalCoopUsed:     Locator; // #modalCoopUsed
  readonly modalCardPayment:  Locator; // #modalCardPayment
  readonly modalOrderDate:    Locator; // #modalOrderDate

  constructor(page: Page) {
    this.page = page;

    // ── Table ──────────────────────────────────────────────────
    this.orderTable      = page.locator('#orderHistoryTable');
    this.orderBody       = page.locator('#orderHistoryBody');
    this.orderRows       = page.locator('#orderHistoryBody tr');
    this.loadingCell     = page.locator('#orderHistoryBody td').filter({ hasText: 'Loading order history' });
    this.noOrdersMessage = page.locator('td.dataTables_empty');

    // ── Action column ──────────────────────────────────────────
    this.viewDetailsLinks = page.locator('#orderHistoryBody a.actionLink.viewOrderDetails');
    this.editOrderLinks   = page.locator('#orderHistoryBody a[href*="CampaignSetup"]');

    // ── Status badges ──────────────────────────────────────────
    this.statusBadges = page.locator('#orderHistoryBody span.OrderStatusBadge');

    // ── Page heading ───────────────────────────────────────────
    this.pageHeading = page.getByRole('heading', { name: /Order Details.*Order History/i });

    // ── Filter inputs ──────────────────────────────────────────
    this.startDateInput    = page.locator('#txtStartDate');
    this.endDateInput      = page.locator('#txtEndDate');
    this.orderIdInput      = page.locator('#txtOrderId');
    this.packageNameInput  = page.locator('#txtPackageName');
    this.paymentTypeSelect = page.locator('#ddlPaymentType');
    this.statusSelect      = page.locator('#ddlStatus');
    this.searchBtn         = page.locator('#btnSearch');
    this.resetBtn          = page.locator('#btnReset');
    this.exportBtn         = page.locator('#btnExportOrderHistory');

    // ── Pagination ─────────────────────────────────────────────
    this.pagination       = page.locator('#orderHistoryPagination');
    this.pageSizeSelect   = page.locator('#ddlOrderHistoryPageSize');
    this.totalRecordsSpan = page.locator('#orderHistoryTotalRecords');
    this.showingStartSpan = page.locator('#orderHistoryShowingStart');
    this.showingEndSpan   = page.locator('#orderHistoryShowingEnd');

    // ── Order Details Modal ────────────────────────────────────
    this.orderDetailsModal = page.locator('#orderDetailsModal');
    this.modalCloseBtn     = page.locator('#orderDetailsModal button[aria-label="Close"]');
    this.modalOrderId      = page.locator('#modalOrderId');
    this.modalPackageName  = page.locator('#modalPackageName');
    this.modalStatus       = page.locator('#modalStatus');
    this.modalTotalSpend   = page.locator('#modalTotalSpend');
    this.modalCoopUsed     = page.locator('#modalCoopUsed');
    this.modalCardPayment  = page.locator('#modalCardPayment');
    this.modalOrderDate    = page.locator('#modalOrderDate');
  }

  // ── Navigation ───────────────────────────────────────────────
  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'commit', timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => undefined);
  }

  /**
   * waitForReady — waits for the loading row to disappear and confirms
   * URL + heading are visible. The tbody initially contains a single row
   * with "Loading order history..." which is replaced by AJAX data rows
   * (or td.dataTables_empty when there are no records).
   */
  /**
   * waitForReady — confirmed loading sequence against live DOM (2026-06-29):
   *   1. URL must be on /EngageAds/OrderHistory
   *   2. Page heading must be visible
   *   3. Loading cell (#orderHistoryBody td containing "Loading order history") must be hidden
   *      — this td is the only row in tbody during AJAX fetch; it disappears when data arrives
   *      — do NOT use waitForLoadState('networkidle') or #loadingRow (does not exist in DOM)
   */
  async waitForReady(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.url, 'i'), { timeout: 20_000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 20_000 });
    await expect(this.loadingCell).toBeHidden({ timeout: 20_000 });
  }

  /**
   * waitForTableReload — call after any filter/search/pagination action
   * to wait for the AJAX reload to complete before reading results.
   */
  // async waitForTableReload(): Promise<void> {
  //   await expect(this.loadingCell).toBeHidden({ timeout: 20_000 });
  // }
  async waitForTableReload(): Promise<void> {
  // Wait until the loading row is removed if it appears
  await this.page
    .waitForSelector('#loadingRow', {
      state: 'detached',
      timeout: 20_000,
    })
    .catch(() => {});

  // Wait until the table body exists
  await expect(this.page.locator('#orderHistoryBody')).toBeVisible();

  // Give the browser a chance to finish rendering
  await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Page assertions ──────────────────────────────────────────
  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.url, 'i'), { timeout: 20_000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 20_000 });
  }

  async expectOrderTableVisible(): Promise<void> {
    await expect(this.orderTable).toBeVisible({ timeout: 10_000 });
  }

  async expectAtLeastOneOrder(): Promise<void> {
    const count = await this.getOrderCount();
    if (count === 0) {
      throw new Error('Expected at least one order row after loading, but the table is empty.');
    }
    await expect(this.orderRows.first()).toBeVisible({ timeout: 10_000 });
  }

  async expectNoOrdersMessage(): Promise<void> {
    await expect(this.noOrdersMessage).toBeVisible({ timeout: 10_000 });
  }

  // ── Row data helpers ─────────────────────────────────────────
  /**
   * Returns the number of data rows currently visible.
   * Returns 0 if DataTables shows the empty-state cell.
   */
  async getOrderCount(): Promise<number> {
    const count = await this.orderRows.count();
    if (count === 1) {
      const isEmpty = await this.noOrdersMessage.isVisible().catch(() => false);
      if (isEmpty) return 0;
    }
    return count;
  }

  async getTotalRecordCount(): Promise<number> {
    const text = (await this.totalRecordsSpan.textContent()) ?? '0';
    return parseInt(text.trim(), 10) || 0;
  }

  async getOrderIdByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index).locator('td:nth-child(2)').textContent()) ?? '').trim();
  }

  async getPackageNameByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index).locator('td:nth-child(3)').textContent()) ?? '').trim();
  }

  async getTotalSpendByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index).locator('td:nth-child(4)').textContent()) ?? '').trim();
  }

  async getOrderDateByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index).locator('td:nth-child(7)').textContent()) ?? '').trim();
  }

  /**
   * Returns the status text from the OrderStatusBadge span inside td:nth-child(8).
   * Example: "PAID", "Submitted", "Cancelled"
   */
  async getStatusByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index)
      .locator('td:nth-child(8) span.OrderStatusBadge')
      .textContent()) ?? '').trim();
  }

  async getCampaignFormSubmittedByIndex(index: number): Promise<string> {
    return ((await this.orderRows.nth(index).locator('td:nth-child(9)').textContent()) ?? '').trim();
  }

  async isEmpty(): Promise<boolean> {
    return (await this.getOrderCount()) === 0;
  }

  // ── Action column ────────────────────────────────────────────
  /**
   * Clicks the View Details link for the given row index.
   * This opens #orderDetailsModal — it does NOT navigate to another page.
   */
  async clickViewDetailsByIndex(index: number): Promise<void> {
    await this.orderRows.nth(index).locator('a.actionLink.viewOrderDetails').click();
    await expect(this.orderDetailsModal).toBeVisible({ timeout: 10_000 });
  }

  async closeOrderDetailsModal(): Promise<void> {
    await this.modalCloseBtn.click();
    await expect(this.orderDetailsModal).toBeHidden({ timeout: 5_000 });
  }

  async getModalOrderId(): Promise<string> {
    return ((await this.modalOrderId.textContent()) ?? '').trim();
  }

  async getModalPackageName(): Promise<string> {
    return ((await this.modalPackageName.textContent()) ?? '').trim();
  }

  async getModalStatus(): Promise<string> {
    return ((await this.modalStatus.textContent()) ?? '').trim();
  }

  /**
   * Returns true if the row at `index` has an Edit Order link.
   * Edit links only appear for orders still within the edit window.
   */
  async hasEditLinkAtIndex(index: number): Promise<boolean> {
    return await this.orderRows.nth(index)
      .locator('a[href*="CampaignSetup"]')
      .isVisible()
      .catch(() => false);
  }

  async clickEditOrderByIndex(index: number): Promise<void> {
    await this.orderRows.nth(index).locator('a[href*="CampaignSetup"]').click();
  }

  // ── Filter / search ──────────────────────────────────────────
  async filterByStatus(status: string): Promise<void> {
    await this.statusSelect.selectOption(status);
    await this.searchBtn.click();
    await this.waitForTableReload();
  }

  async filterByPaymentType(paymentType: string): Promise<void> {
    await this.paymentTypeSelect.selectOption(paymentType);
    await this.searchBtn.click();
    await this.waitForTableReload();
  }

  async filterByOrderId(orderId: string): Promise<void> {
    await this.orderIdInput.fill(orderId);
    await this.searchBtn.click();
    await this.waitForTableReload();
  }

  async filterByPackageName(name: string): Promise<void> {
    await this.packageNameInput.fill(name);
    await this.searchBtn.click();
    await this.waitForTableReload();
  }

  async filterByDateRange(startDate: string, endDate: string): Promise<void> {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.searchBtn.click();
    await this.waitForTableReload();
  }

  async resetFilters(): Promise<void> {
    await this.resetBtn.click();
    await this.waitForTableReload();
  }

  // ── Pagination ───────────────────────────────────────────────
  async goToPage(pageNumber: number): Promise<void> {
    await this.pagination.locator(`a.orderHistoryPageLink[data-page="${pageNumber}"]`).click();
    await this.waitForTableReload();
  }

  async setPageSize(size: '10' | '25' | '50' | '100'): Promise<void> {
    await this.pageSizeSelect.selectOption(size);
    await this.waitForTableReload();
  }
}

/*
 * ════════════════════════════════════════════════════════════════
 * LOCATOR VALIDATION REPORT — verified against live DOM 2026-06-29
 * ════════════════════════════════════════════════════════════════
 *
 * Locator                                            | Matches                                          | Why chosen                                  | Stability | Fixed col?
 * ---------------------------------------------------|--------------------------------------------------|---------------------------------------------|-----------|------------
 * #orderHistoryTable                                 | <table id="orderHistoryTable">                   | Stable element ID                           | High      | No
 * #orderHistoryBody                                  | <tbody id="orderHistoryBody">                    | Stable element ID                           | High      | No
 * #orderHistoryBody tr                               | <tr> rows in tbody                               | Scoped to known tbody ID                    | High      | No
 * #orderHistoryBody td:filter(Loading order history) | Loading <td>                                     | Unique text, used to detect loading state   | High      | No
 * td.dataTables_empty                                | <td class="dataTables_empty">                    | Standard DataTables empty-state element     | High      | No
 * a.actionLink.viewOrderDetails                      | <a class="actionLink viewOrderDetails">          | Two stable classes confirmed in DOM         | High      | No
 * a[href*="CampaignSetup"]                           | <a href="/EngageAds/CampaignSetup?orderSeq=..."> | Stable href pattern for editable orders     | High      | No
 * span.OrderStatusBadge                              | <span class="OrderStatusBadge">                  | Stable class confirmed in DOM               | High      | No
 * getByRole('heading',{name:/Order Details.*Order History/i}) | <h4>Order Details / Order History</h4>  | Accessible role — survives tag/class changes | High    | No
 * #txtStartDate / #txtEndDate                        | <input id="txtStart/EndDate">                    | Stable element IDs                          | High      | No
 * #txtOrderId / #txtPackageName                      | <input id="txtOrderId/PackageName">              | Stable element IDs                          | High      | No
 * #ddlPaymentType / #ddlStatus                       | <select id="ddlPaymentType/Status">              | Stable element IDs                          | High      | No
 * #btnSearch / #btnReset / #btnExportOrderHistory    | <button id="btnSearch/Reset/Export...">          | Stable element IDs                          | High      | No
 * #orderHistoryPagination                            | <ul id="orderHistoryPagination">                 | Stable element ID                           | High      | No
 * a.orderHistoryPageLink[data-page]                  | <a class="orderHistoryPageLink" data-page="N">   | Stable class + data attribute               | High      | No
 * #ddlOrderHistoryPageSize                           | <select id="ddlOrderHistoryPageSize">            | Stable element ID                           | High      | No
 * #orderHistoryTotalRecords                          | <span id="orderHistoryTotalRecords">             | Stable element ID                           | High      | No
 * #orderDetailsModal                                 | <div id="orderDetailsModal" class="modal fade">  | Stable element ID                           | High      | No
 * #modalOrderId / #modalPackageName / etc.           | <p id="modalOrderId"> etc.                       | Stable element IDs on modal fields          | High      | No
 * td:nth-child(2..10) via row.locator()              | Column cells by position                         | No td ids/classes; column order is FIXED    | Medium    | Yes
 *
 * ── Removed (were invented — not in live DOM) ──────────────────
 * .order-history-table       — not in DOM
 * .order-row                 — not in DOM
 * .no-orders / .empty-state  — not in DOM (use td.dataTables_empty)
 * td[data-col="packageName"] — not in DOM
 * td.status / td.order-seq   — not in DOM
 * .btn-cancel-order          — does not exist (no cancel feature in DOM)
 * #cancelOrderModal          — does not exist
 * #btnConfirmCancel          — does not exist
 * #statusFilter              — does not exist (correct ID is #ddlStatus)
 * #orderSearch               — does not exist (use #txtOrderId / #txtPackageName)
 * #btnClearSearch            — does not exist (correct ID is #btnReset)
 * a[href*="OrderConfirmation"] — View Details opens a MODAL, not page navigation
 */

