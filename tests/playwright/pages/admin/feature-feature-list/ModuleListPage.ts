import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Module List (Admin)
 *
 * URL: /Admin/Feature/ModuleList
 *
 * Responsibilities:
 * - Paginated module listing
 * - Filter by module name and status
 * - Toggle module active/inactive with confirmation
 */
export class ModuleListPage {
    readonly page: Page;

    // Filter form
    readonly moduleNameInput: Locator;
    readonly statusSelect: Locator;
    readonly searchButton: Locator;

    // Results table
    readonly resultsTable: Locator;
    readonly tableRows: Locator;
    readonly noDataPartial: Locator;

    // Confirmation modal
    readonly confirmModal: Locator;
    readonly confirmButton: Locator;
    readonly cancelButton: Locator;
    readonly confirmMessage: Locator;

    // Pagination
    readonly pageSizeContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        this.moduleNameInput = page.locator('input.searchtxt');
        this.statusSelect = page.locator('#status');
        this.searchButton = page.locator('#btnSubmit');

        this.resultsTable = page.locator('#tblReport');
        this.tableRows = page.locator('#tblReport tbody tr');
        this.noDataPartial = page.locator('partial[name="_NoReportDataFound"], [class*="no-data"], [class*="noData"]').first();

        this.confirmModal = page.locator('#dvREModal');
        this.confirmButton = page.locator('#confirmBtn');
        this.cancelButton = page.locator('#cancelEmail');
        this.confirmMessage = page.locator('#confirmMessage');

        this.pageSizeContainer = page.locator('#divPageSize');
    }

    async navigate(): Promise<void> {
        await this.page.goto('/Admin/Feature/ModuleList', { waitUntil: 'commit' });
        await this.resultsTable.waitFor({ state: 'visible', timeout: 60000 });
        // Brief grace period for Bootstrap handlers to bind
        await this.page.waitForTimeout(500);
    }

    async searchModules(moduleName: string, status: string = ''): Promise<void> {
        await this.moduleNameInput.fill(moduleName);
        if (status) await this.statusSelect.selectOption(status);
        // Search triggers GET form navigation - await it before checking the table
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'commit', timeout: 60000 }),
            this.searchButton.click(),
        ]);
        await this.resultsTable.waitFor({ state: 'visible', timeout: 30000 });
    }

    async toggleModule(rowIndex: number): Promise<void> {
        await this.tableRows.nth(rowIndex).waitFor({ state: 'visible', timeout: 10000 });
        // Bootstrap switch renders a zero-size hidden checkbox.
        // Call showConfirmDialog directly (global fn from onchange attr) to open the confirm modal.
        const toggle = this.tableRows.nth(rowIndex).locator('input[type="checkbox"]');
        await toggle.evaluate((el) => {
            const input = el as HTMLInputElement;
            input.checked = !input.checked;
            (window as any).showConfirmDialog(input);
        });
        await this.confirmModal.waitFor({ state: 'visible', timeout: 15000 });
    }

    async confirmToggle(): Promise<void> {
        await this.confirmButton.click();
        await this.confirmModal.waitFor({ state: 'hidden' });
        // Wait for AJAX success and page reload
        await this.page.waitForLoadState('domcontentloaded');
    }

    async cancelToggle(): Promise<void> {
        await this.cancelButton.click();
        await this.confirmModal.waitFor({ state: 'hidden' });
    }

    async getRowCount(): Promise<number> {
        // Table only renders when there is data; if absent, return 0
        const tableVisible = await this.resultsTable.isVisible().catch(() => false);
        if (!tableVisible) return 0;
        return this.tableRows.count();
    }
}
