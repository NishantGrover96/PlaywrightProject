import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Dealer Index (Dealer Search View)
 * 
 * URL: /CoopManagement/Dealer/Index
 * 
 * Responsibilities:
 * - Fiscal year selection
 * - Dealer number search
 * - Agency dealer list display
 * - Authorization validation
 * 
 * User Roles: Dealer, Agency
 */
export class DealerIndexPage {
    readonly page: Page;
    
    // Locators
    readonly fiscalYearDropdown: Locator;
    readonly dealerNumberInput: Locator;
    readonly submitButton: Locator;
    readonly agencyDealerTable: Locator;
    readonly validationErrorsContainer: Locator;
    readonly validationErrorList: Locator;
    
    constructor(page: Page) {
        this.page = page;
        
        // Form elements
        this.fiscalYearDropdown = page.locator('#sltFilterYearly');
        this.dealerNumberInput = page.locator('input[name="DealerNumber"]');
        this.submitButton = page.locator('#DealerNumberButton');
        
        // Agency dealer list table
        this.agencyDealerTable = page.locator('#agencyDealerCaps');
        
        // Validation
        this.validationErrorsContainer = page.locator('.validation-summary-errors');
        this.validationErrorList = page.locator('.validation-summary-errors ul li');
    }
    
    /**
     * Navigate to Dealer Index page
     */
    async navigate(): Promise<void> {
        await this.page.goto('/CoopManagement/Dealer/Index');
    }
    
    /**
     * Select fiscal year from dropdown
     * @param year - Fiscal year (e.g., '2024', '2025', '2026')
     */
    async selectFiscalYear(year: string): Promise<void> {
        await this.fiscalYearDropdown.selectOption(year);
    }
    
    /**
     * Get currently selected fiscal year
     */
    async getSelectedFiscalYear(): Promise<string> {
        return await this.fiscalYearDropdown.inputValue();
    }
    
    /**
     * Enter dealer number in search input
     * @param dealerNumber - Dealer number to search
     */
    async enterDealerNumber(dealerNumber: string): Promise<void> {
        await this.dealerNumberInput.clear();
        await this.dealerNumberInput.fill(dealerNumber);
    }
    
    /**
     * Clear dealer number input
     */
    async clearDealerNumber(): Promise<void> {
        await this.dealerNumberInput.clear();
    }
    
    /**
     * Click submit button to perform search
     */
    async clickSubmit(): Promise<void> {
        await this.submitButton.click();
    }
    
    /**
     * Perform complete dealer search (fill + submit)
     * @param dealerNumber - Dealer number to search
     * @param fiscalYear - Optional fiscal year selection
     */
    async searchDealer(dealerNumber: string, fiscalYear?: string): Promise<void> {
        if (fiscalYear) {
            await this.selectFiscalYear(fiscalYear);
        }
        await this.enterDealerNumber(dealerNumber);
        await this.clickSubmit();
    }
    
    /**
     * Check if agency dealer list table is visible
     */
    async isAgencyDealerListVisible(): Promise<boolean> {
        return await this.agencyDealerTable.isVisible();
    }
    
    /**
     * Get count of agency dealers in the table
     */
    async getAgencyDealerCount(): Promise<number> {
        const rows = this.agencyDealerTable.locator('tbody tr');
        return await rows.count();
    }
    
    /**
     * Get agency dealer data from table
     * @param rowIndex - Zero-based row index
     */
    async getAgencyDealerData(rowIndex: number): Promise<{
        dealerNumber: string;
        dealerName: string;
        contactName: string;
        contactPhone: string;
        contactEmail: string;
        estimatedSpend: string;
        lastUpdated: string;
        updatedBy: string;
        status: string;
    }> {
        const row = this.agencyDealerTable.locator('tbody tr').nth(rowIndex);
        
        return {
            dealerNumber: await row.locator('td').nth(0).textContent() || '',
            dealerName: await row.locator('td').nth(1).textContent() || '',
            contactName: await row.locator('td').nth(2).textContent() || '',
            contactPhone: await row.locator('td').nth(3).textContent() || '',
            contactEmail: await row.locator('td').nth(4).textContent() || '',
            estimatedSpend: await row.locator('td').nth(5).textContent() || '',
            lastUpdated: await row.locator('td').nth(6).textContent() || '',
            updatedBy: await row.locator('td').nth(7).textContent() || '',
            status: await row.locator('td').nth(8).textContent() || ''
        };
    }
    
    /**
     * Click dealer link in agency dealer table
     * @param dealerNumber - Dealer number to click
     */
    async clickAgencyDealerLink(dealerNumber: string): Promise<void> {
        const link = this.agencyDealerTable.locator(`a[href*="dealerNumber=${dealerNumber}"]`);
        await link.click();
    }
    
    /**
     * Check if validation errors are displayed
     */
    async hasValidationErrors(): Promise<boolean> {
        return await this.validationErrorsContainer.isVisible();
    }
    
    /**
     * Get validation error message text
     */
    async getValidationErrorMessage(): Promise<string> {
        return await this.validationErrorList.textContent() || '';
    }
    
    /**
     * Check if specific error message is displayed
     * @param expectedMessage - Expected error message text
     */
    async hasErrorMessage(expectedMessage: string): Promise<boolean> {
        const actualMessage = await this.getValidationErrorMessage();
        return actualMessage.includes(expectedMessage);
    }
    
    /**
     * Check if fiscal year dropdown is visible
     */
    async isFiscalYearDropdownVisible(): Promise<boolean> {
        return await this.fiscalYearDropdown.isVisible();
    }
    
    /**
     * Check if dealer number input is visible
     */
    async isDealerNumberInputVisible(): Promise<boolean> {
        return await this.dealerNumberInput.isVisible();
    }
    
    /**
     * Check if submit button is enabled
     */
    async isSubmitButtonEnabled(): Promise<boolean> {
        return await this.submitButton.isEnabled();
    }
    
    /**
     * Get all available fiscal years from dropdown
     */
    async getAvailableFiscalYears(): Promise<string[]> {
        const options = await this.fiscalYearDropdown.locator('option').allTextContents();
        return options;
    }
    
    /**
     * Wait for page to fully load
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
    }
    
    /**
     * Check if Anti-CSRF token is present
     */
    async hasAntiForgeryToken(): Promise<boolean> {
        const token = await this.page.locator('input[name="__RequestVerificationToken"]').count();
        return token > 0;
    }
}
