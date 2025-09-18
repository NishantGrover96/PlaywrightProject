import { Page, Locator, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../utils/env/environment.helper';

export class BasePage {
  protected page: Page;
  protected envHelper: EnvironmentHelper;
  protected clientId: string;

  constructor(page: Page, clientId?: string) {
    this.page = page;
    this.envHelper = EnvironmentHelper.getInstance();
    this.clientId = clientId || process.env.CLIENT || 'demo';
  }

  // Common navigation methods
  async goto(path: string = ''): Promise<void> {
    const urls = this.envHelper.getUrlsForClient(this.clientId);
    const fullUrl = `${urls.baseUrl}${path}`;

    console.log(`🎯 Navigating to: ${fullUrl}`);
    await this.page.goto(fullUrl);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 90000 });
    await this.page.waitForSelector('body', { timeout: 15000 });
  }

  // Common element interactions
  async clickElement(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async fillInput(selector: string, text: string): Promise<void> {
    await this.page.locator(selector).fill(text);
  }

  async selectDropdown(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  // Common verifications
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async verifyElementText(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  // Wait for element
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ timeout });
    return locator;
  }

  // Screenshot helper
  async takeScreenshot(name?: string): Promise<void> {
    const screenshotName = name || `${this.constructor.name}_${Date.now()}`;
    await this.page.screenshot({ path: `test-results/${screenshotName}.png` });
  }

  // Get page URL
  getCurrentUrl(): string {
    return this.page.url();
  }

  // Check for error messages
  async checkForErrors(): Promise<boolean> {
    const errorSelectors = [
      'text=/error/i',
      'text=/404/i',
      'text=/500/i',
      'text=/access denied/i',
      '[class*="error"]',
      '[class*="alert-danger"]',
    ];

    for (const selector of errorSelectors) {
      const errorCount = await this.page.locator(selector).count();
      if (errorCount > 0) {
        console.log(`⚠️ Error found with selector: ${selector}`);
        return true;
      }
    }
    return false;
  }
}
