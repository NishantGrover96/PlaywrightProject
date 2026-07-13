import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Dealer Budget Tab
 *
 * URL: /CoopManagement/Dealer/Budget/List?dealer_number_seq=<encrypted>
 *
 * Responsibilities:
 * - Budget KPI summary display
 * - Fiscal year + program type selection
 * - Highcharts visualisation containers
 * - Report navigation links
 *
 * FUs: COOP-FU-BDG-001 through COOP-FU-BDG-029
 */
export class DealerBudgetPage {
    readonly page: Page;

    // -- Hidden fields ---------------------------------------------------------
    readonly hdDealerNumberSeq: Locator;
    readonly hdDealerNumber: Locator;
    readonly hdSpentBreakdownLink: Locator;
    readonly hdBudgetUtilizationLink: Locator;
    readonly hdMediaTypeLink: Locator;
    readonly hdProductGroupLink: Locator;

    // -- Filters ---------------------------------------------------------------
    readonly fiscalYearDropdown: Locator;
    readonly fiscalRangeSpan: Locator;
    readonly programTypeDropdown: Locator;

    // -- KPI tiles -------------------------------------------------------------
    readonly totalBudgetValue: Locator;
    readonly adjustmentsValue: Locator;
    readonly spentCommittedValue: Locator;
    readonly availableValue: Locator;

    // -- Chart containers ------------------------------------------------------
    readonly spendBreakdownChart: Locator;
    readonly budgetUtilizationChart: Locator;
    readonly spendByMediaChart: Locator;

    // -- Report links ----------------------------------------------------------
    readonly mediaTypeMoreDetailBtn: Locator;

    constructor(page: Page) {
        this.page = page;

        this.hdDealerNumberSeq = page.locator('#hdDealerNumberSeq');
        this.hdDealerNumber = page.locator('#hdDealerNumber');
        this.hdSpentBreakdownLink = page.locator('#hdSpentBreakdownLink');
        this.hdBudgetUtilizationLink = page.locator('#hdBudgetUtilizationLink');
        this.hdMediaTypeLink = page.locator('#hdMediaTypeLink');
        this.hdProductGroupLink = page.locator('#hdProductGroupLink');

        this.fiscalYearDropdown = page.locator('#sltFilterYearly');
        this.fiscalRangeSpan = page.locator('#fiscalrange');
        this.programTypeDropdown = page.locator('#sltProgramType');

        this.totalBudgetValue = page.locator('#hTotalBudget');
        this.adjustmentsValue = page.locator('#hAdjustments');
        this.spentCommittedValue = page.locator('#hBudgetSpent');
        this.availableValue = page.locator('#hBudgetAvailable');

        this.spendBreakdownChart = page.locator('#dvBudgetSpendBreakdown');
        this.budgetUtilizationChart = page.locator('#dvBudgetUtilization');
        this.spendByMediaChart = page.locator('#dvSpendByMediaType');

        this.mediaTypeMoreDetailBtn = page.locator('#btnMediaType');
    }

    /** Navigate directly to the budget tab for a given encrypted dealer seq */
    async navigate(encryptedDealerSeq: string): Promise<void> {
        await this.page.goto(
            `/CoopManagement/Dealer/Budget/List?dealer_number_seq=${encodeURIComponent(encryptedDealerSeq)}`
        );
    }

    /** Wait for the initial dashboard AJAX sequence to complete */
    async waitForDashboardLoad(): Promise<void> {
        // Program type dropdown must be populated first
        await this.page.waitForFunction(
            () => (document.querySelector('#sltProgramType') as HTMLSelectElement)?.options?.length > 0,
            { timeout: 10000 }
        );
        // KPI tiles must have a non-zero value
        await this.page.waitForFunction(
            () => document.querySelector('#hTotalBudget')?.textContent?.trim() !== '$0.00' ||
                  document.querySelector('#hBudgetAvailable')?.textContent?.trim() !== '$0.00',
            { timeout: 10000 }
        );
        // Charts rendered: Highcharts injects SVG elements
        await this.page.waitForSelector('#dvBudgetSpendBreakdown svg', { timeout: 15000 });
        await this.page.waitForSelector('#dvBudgetUtilization svg', { timeout: 15000 });
        await this.page.waitForSelector('#dvSpendByMediaType svg', { timeout: 15000 });
    }

    /** Select a fiscal year and wait for dashboard to refresh */
    async selectFiscalYear(year: string): Promise<void> {
        await this.fiscalYearDropdown.selectOption(year);
        await this.page.waitForTimeout(500); // allow Select2 change event to fire
    }

    /** Select a program budget type by visible text */
    async selectProgramType(name: string): Promise<void> {
        await this.programTypeDropdown.selectOption({ label: name });
        await this.page.waitForTimeout(300);
    }

    /** Get the current text of a KPI tile */
    async getKpiValue(tile: 'total' | 'adjustments' | 'spent' | 'available'): Promise<string> {
        const map = {
            total: this.totalBudgetValue,
            adjustments: this.adjustmentsValue,
            spent: this.spentCommittedValue,
            available: this.availableValue,
        };
        return (await map[tile].textContent())?.trim() ?? '';
    }

    /** Assert all four KPI tiles are visible and non-empty */
    async assertKpiTilesVisible(): Promise<boolean> {
        const tiles = [
            this.totalBudgetValue,
            this.adjustmentsValue,
            this.spentCommittedValue,
            this.availableValue,
        ];
        for (const t of tiles) {
            if (!(await t.isVisible())) return false;
        }
        return true;
    }

    /** Assert all three Highcharts chart containers are rendered (SVG present) */
    async assertChartsRendered(): Promise<boolean> {
        const charts = [
            '#dvBudgetSpendBreakdown svg',
            '#dvBudgetUtilization svg',
            '#dvSpendByMediaType svg',
        ];
        for (const sel of charts) {
            const el = this.page.locator(sel);
            if (!(await el.isVisible())) return false;
        }
        return true;
    }

    /** Get hidden field value (base64/encrypted) */
    async getHiddenFieldValue(field: 'dealerSeq' | 'dealerNumber' | 'spentBreakdown' | 'utilization' | 'media' | 'product'): Promise<string> {
        const map: Record<string, Locator> = {
            dealerSeq: this.hdDealerNumberSeq,
            dealerNumber: this.hdDealerNumber,
            spentBreakdown: this.hdSpentBreakdownLink,
            utilization: this.hdBudgetUtilizationLink,
            media: this.hdMediaTypeLink,
            product: this.hdProductGroupLink,
        };
        return (await map[field].getAttribute('value')) ?? '';
    }

    /** Assert fiscal range span is updated after fiscal year change */
    async getFiscalRange(): Promise<string> {
        return (await this.fiscalRangeSpan.textContent())?.trim() ?? '';
    }

    /** Get the href of the Media Type More Detail button */
    async getMediaTypeDetailHref(): Promise<string> {
        return (await this.mediaTypeMoreDetailBtn.getAttribute('href')) ?? '';
    }
}
