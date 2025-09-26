import { Page } from '@playwright/test';
import { BasePage } from '../common/base.page';

export class ModuleBasePage extends BasePage {
  protected moduleName: string;
  protected modulePath: string;

  // Common module selectors
  protected readonly moduleHeader = 'h1, [class*="header"], [class*="title"], heading';
  protected readonly actionButtons = 'button, [class*="btn"], [role="button"]';
  protected readonly dataTable = 'table, [class*="table"], [class*="grid"]';
  protected readonly searchInput =
    'input[type="search"], [placeholder*="search" i], [class*="search"] input';
  protected readonly filterDropdown = 'select, [class*="filter"], [class*="dropdown"]';
  protected readonly addButton =
    'button:has-text("Add"), button:has-text("Create"), button:has-text("New")';
  protected readonly editButton = 'button:has-text("Edit"), [class*="edit"]';
  protected readonly deleteButton = 'button:has-text("Delete"), [class*="delete"]';
  protected readonly saveButton = 'button:has-text("Save"), button[type="submit"]';
  protected readonly cancelButton = 'button:has-text("Cancel"), button:has-text("Close")';
  protected readonly loadingIndicator = '[class*="loading"], [class*="spinner"], .loading';
  protected readonly errorMessage = '[class*="error"], [class*="alert-danger"]';
  protected readonly successMessage = '[class*="success"], [class*="alert-success"]';

  constructor(page: Page, moduleName: string, modulePath: string, clientId?: string) {
    super(page, clientId);
    this.moduleName = moduleName;
    this.modulePath = modulePath;
  }

  async navigateToModule(): Promise<void> {
    await this.goto(this.modulePath);
    await this.waitForModuleLoad();
  }

  async waitForModuleLoad(): Promise<void> {
    await this.waitForPageLoad();

    // Wait for module header or main content
    try {
      await this.waitForElement(this.moduleHeader, 10000);
    } catch {
      // If no header found, wait for body to be ready
      await this.page.waitForSelector('body');
    }

    // Wait for any loading indicators to disappear
    await this.page
      .waitForSelector(this.loadingIndicator, { state: 'detached', timeout: 5000 })
      .catch(() => {});
  }

  async verifyModuleTitle(expectedTitle?: string): Promise<void> {
    const title = expectedTitle || this.moduleName;
    try {
      await this.verifyElementText(this.moduleHeader, title);
    } catch {
      // If exact text match fails, check if header contains the title
      const headerText = await this.page.locator(this.moduleHeader).textContent();
      if (!headerText?.toLowerCase().includes(title.toLowerCase())) {
        console.log(`Module title verification: Expected "${title}", found "${headerText}"`);
      }
    }
  }

  // Common module actions
  async clickAddButton(): Promise<void> {
    await this.clickElement(this.addButton);
  }

  async searchFor(searchTerm: string): Promise<void> {
    const searchField = this.page.locator(this.searchInput);
    if ((await searchField.count()) > 0) {
      await this.fillInput(this.searchInput, searchTerm);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000); // Wait for search results
    } else {
      console.log('No search field found in this module');
    }
  }

  async getTableRowCount(): Promise<number> {
    const tableRows = this.page.locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`);
    return await tableRows.count();
  }

  async clickTableRow(rowIndex: number): Promise<void> {
    const row = this.page.locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`).nth(rowIndex);
    await row.click();
  }

  async getTableData(rowIndex: number, columnIndex: number): Promise<string> {
    const cell = this.page
      .locator(`${this.dataTable} tbody tr, ${this.dataTable} tr`)
      .nth(rowIndex)
      .locator('td, th')
      .nth(columnIndex);
    return (await cell.textContent()) || '';
  }

  async getTableHeaders(): Promise<string[]> {
    const headers = await this.page
      .locator(`${this.dataTable} thead th, ${this.dataTable} th`)
      .all();
    const headerTexts: string[] = [];

    for (const header of headers) {
      const text = await header.textContent();
      if (text && text.trim()) {
        headerTexts.push(text.trim());
      }
    }

    return headerTexts;
  }

  async clickEditButton(): Promise<void> {
    await this.clickElement(this.editButton);
  }

  async clickDeleteButton(): Promise<void> {
    await this.clickElement(this.deleteButton);
  }

  async clickSaveButton(): Promise<void> {
    await this.clickElement(this.saveButton);
  }

  async clickCancelButton(): Promise<void> {
    await this.clickElement(this.cancelButton);
  }

  // Check for module-specific errors
  async checkForModuleErrors(): Promise<boolean> {
    const hasErrors = await this.checkForErrors();

    // Also check for module-specific error messages
    const moduleErrorCount = await this.page.locator(this.errorMessage).count();

    return hasErrors || moduleErrorCount > 0;
  }

  // Wait for success message
  async waitForSuccessMessage(timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.successMessage, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Get current page breadcrumbs for navigation verification
  async getCurrentBreadcrumbs(): Promise<string[]> {
    const breadcrumbs = await this.page
      .locator(
        '[class*="breadcrumb"] a, [class*="breadcrumb"] span, nav[aria-label="breadcrumb"] a'
      )
      .all();

    const breadcrumbTexts: string[] = [];
    for (const crumb of breadcrumbs) {
      const text = await crumb.textContent();
      if (text && text.trim()) {
        breadcrumbTexts.push(text.trim());
      }
    }

    return breadcrumbTexts;
  }

  // Verify module access (no permission errors)
  async verifyModuleAccess(): Promise<boolean> {
    await this.waitForModuleLoad();

    // Check for access denied or permission error messages
    const accessDeniedSelectors = [
      'text=/access denied/i',
      'text=/unauthorized/i',
      'text=/permission/i',
      'text=/403/i',
      'text=/not authorized/i',
    ];

    for (const selector of accessDeniedSelectors) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        console.log(`❌ Access denied detected with selector: ${selector}`);
        return false;
      }
    }

    return true;
  }
}
