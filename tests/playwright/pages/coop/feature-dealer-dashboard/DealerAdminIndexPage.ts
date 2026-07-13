import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Dealer Admin Index (Admin Search View)
 * 
 * URL: /CoopManagement/Dealer/AdminIndex
 * 
 * Responsibilities:
 * - Multi-field dealer search
 * - Cascading dropdowns (Country -> State)
 * - Results table with pagination
 * - Admin-only access
 * 
 * User Roles: Admin
 */
export class DealerAdminIndexPage {
    readonly page: Page;
    
    // Search form locators
    readonly dealerNumberInput: Locator;
    readonly dealerNameInput: Locator;
    readonly countryDropdown: Locator;
    readonly stateDropdown: Locator;
    readonly cityInput: Locator;
    readonly divisionDropdown: Locator;
    readonly orderingAccountDropdown: Locator;
    readonly statusDropdown: Locator;
    readonly searchButton: Locator;
    
    // Results table
    readonly resultsTable: Locator;
    readonly noDataMessage: Locator;
    
    // Pagination
    readonly pageSizeDropdown: Locator;
    readonly paginationContainer: Locator;
    
    constructor(page: Page) {
        this.page = page;
        
        // Search form elements
        this.dealerNumberInput = page.locator('#txtDealerNumber');
        this.dealerNameInput = page.locator('#txtDealerName');
        this.countryDropdown = page.locator('#ddlCountry');
        this.stateDropdown = page.locator('#ddlState');
        this.cityInput = page.locator('#txtCity');
        this.divisionDropdown = page.locator('#lstDivision');
        this.orderingAccountDropdown = page.locator('#lstOrderingAccount');
        this.statusDropdown = page.locator('#lstStatus');
        this.searchButton = page.locator('#btnGo');
        
        // Results
        this.resultsTable = page.locator('#tblReport');
        this.noDataMessage = page.locator('.no-data-message, [name="_NoReportDataFound"]');
        
        // Pagination
        this.pageSizeDropdown = page.locator('.page_size select, select[name="pageSize"]');
        this.paginationContainer = page.locator('paging-navigation, .pagination');
    }
    
    /**
     * Navigate to Dealer Admin Index page
     */
    async navigate(): Promise<void> {
        await this.page.goto('/CoopManagement/Dealer/AdminIndex');
    }
    
    /**
     * Enter dealer number
     * @param dealerNumber - Dealer number to search
     */
    async enterDealerNumber(dealerNumber: string): Promise<void> {
        await this.dealerNumberInput.clear();
        await this.dealerNumberInput.fill(dealerNumber);
    }
    
    /**
     * Enter dealer name
     * @param dealerName - Dealer name to search
     */
    async enterDealerName(dealerName: string): Promise<void> {
        await this.dealerNameInput.clear();
        await this.dealerNameInput.fill(dealerName);
    }
    
    /**
     * Select country from dropdown
     * @param country - Country name or value
     */
    async selectCountry(country: string): Promise<void> {
        await this.countryDropdown.selectOption(country);
    }
    
    /**
     * Wait for state dropdown to update after country selection
     * This waits for AJAX call to populate states
     */
    async waitForStateDropdownUpdate(): Promise<void> {
        // Wait for network idle after country selection triggers AJAX
        await this.page.waitForLoadState('networkidle');
        
        // Wait for state dropdown to have more than just default option
        await this.page.waitForFunction(() => {
            const stateSelect = document.querySelector('#ddlState') as HTMLSelectElement;
            return stateSelect && stateSelect.options.length > 1;
        }, { timeout: 5000 });
    }
    
    /**
     * Select state from dropdown
     * @param state - State name or value
     */
    async selectState(state: string): Promise<void> {
        await this.stateDropdown.selectOption(state);
    }
    
    /**
     * Enter city
     * @param city - City name to search
     */
    async enterCity(city: string): Promise<void> {
        await this.cityInput.clear();
        await this.cityInput.fill(city);
    }
    
    /**
     * Click search button
     */
    async clickSearch(): Promise<void> {
        await this.searchButton.click();
    }
    
    /**
     * Search by dealer number only
     * @param dealerNumber - Dealer number to search
     */
    async searchByDealerNumber(dealerNumber: string): Promise<void> {
        await this.enterDealerNumber(dealerNumber);
        await this.clickSearch();
    }
    
    /**
     * Search using multiple fields
     * @param filters - Search filter object
     */
    async searchByMultipleFields(filters: {
        dealerNumber?: string;
        dealerName?: string;
        country?: string;
        state?: string;
        city?: string;
    }): Promise<void> {
        if (filters.dealerNumber) {
            await this.enterDealerNumber(filters.dealerNumber);
        }
        
        if (filters.dealerName) {
            await this.enterDealerName(filters.dealerName);
        }
        
        if (filters.country) {
            await this.selectCountry(filters.country);
            await this.waitForStateDropdownUpdate();
        }
        
        if (filters.state) {
            await this.selectState(filters.state);
        }
        
        if (filters.city) {
            await this.enterCity(filters.city);
        }
        
        await this.clickSearch();
    }
    
    /**
     * Clear all search fields
     */
    async clearAllFilters(): Promise<void> {
        await this.dealerNumberInput.clear();
        await this.dealerNameInput.clear();
        await this.cityInput.clear();
        // Dropdowns reset to first option
        await this.countryDropdown.selectOption({ index: 0 });
        await this.stateDropdown.selectOption({ index: 0 });
    }
    
    /**
     * Check if results table is visible
     */
    async isResultsTableVisible(): Promise<boolean> {
        return await this.resultsTable.isVisible();
    }
    
    /**
     * Get count of results in table
     */
    async getResultsCount(): Promise<number> {
        if (!await this.isResultsTableVisible()) {
            return 0;
        }
        const rows = this.resultsTable.locator('tbody tr');
        return await rows.count();
    }
    
    /**
     * Get dealer data from results table
     * @param rowIndex - Zero-based row index
     */
    async getDealerResultData(rowIndex: number): Promise<{
        dealerNumber: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        type: string;
        contract: string;
        orderingAccount: string;
    }> {
        const row = this.resultsTable.locator('tbody tr').nth(rowIndex);
        
        return {
            dealerNumber: await row.locator('td').nth(0).textContent() || '',
            name: await row.locator('td').nth(1).textContent() || '',
            address: await row.locator('td').nth(2).textContent() || '',
            city: await row.locator('td').nth(3).textContent() || '',
            state: await row.locator('td').nth(4).textContent() || '',
            zip: await row.locator('td').nth(5).textContent() || '',
            country: await row.locator('td').nth(6).textContent() || '',
            type: await row.locator('td').nth(7).textContent() || '',
            contract: await row.locator('td').nth(8).textContent() || '',
            orderingAccount: await row.locator('td').nth(9).textContent() || ''
        };
    }
    
    /**
     * Click dealer number link in results table
     * @param dealerNumber - Dealer number to click
     */
    async clickDealerLink(dealerNumber: string): Promise<void> {
        const dealerButton = this.resultsTable.locator(`button[asp-route-id="${dealerNumber}"]`);
        await dealerButton.click();
    }
    
    /**
     * Check if "No Data" message is displayed
     */
    async isNoDataMessageVisible(): Promise<boolean> {
        return await this.noDataMessage.isVisible();
    }
    
    /**
     * Change page size for pagination
     * @param size - Page size (e.g., 10, 25, 50, 100)
     */
    async changePageSize(size: number): Promise<void> {
        await this.pageSizeDropdown.selectOption(size.toString());
        await this.page.waitForLoadState('networkidle');
    }
    
    /**
     * Navigate to specific page number
     * @param pageNumber - Page number (1-based)
     */
    async goToPage(pageNumber: number): Promise<void> {
        const pageLink = this.paginationContainer.locator(`a:has-text("${pageNumber}")`);
        await pageLink.click();
        await this.page.waitForLoadState('networkidle');
    }
    
    /**
     * Get available countries from dropdown
     */
    async getAvailableCountries(): Promise<string[]> {
        const options = await this.countryDropdown.locator('option').allTextContents();
        return options.filter(opt => opt.trim() !== '');
    }
    
    /**
     * Get available states from dropdown (after country selection)
     */
    async getAvailableStates(): Promise<string[]> {
        const options = await this.stateDropdown.locator('option').allTextContents();
        return options.filter(opt => opt.trim() !== '');
    }
    
    /**
     * Check if country dropdown is populated
     */
    async isCountryDropdownPopulated(): Promise<boolean> {
        const count = await this.countryDropdown.locator('option').count();
        return count > 1; // More than just default/empty option
    }
    
    /**
     * Check if state dropdown is enabled
     */
    async isStateDropdownEnabled(): Promise<boolean> {
        return await this.stateDropdown.isEnabled();
    }
    
    /**
     * Wait for page to fully load
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
    }
    
    /**
     * Check if search form is visible
     */
    async isSearchFormVisible(): Promise<boolean> {
        return await this.dealerNumberInput.isVisible() &&
               await this.searchButton.isVisible();
    }
}
