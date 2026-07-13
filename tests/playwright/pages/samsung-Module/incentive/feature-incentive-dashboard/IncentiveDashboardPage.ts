import { type Page, type Locator, expect } from '@playwright/test';

export class IncentiveDashboardPage {
  readonly page: Page;

  readonly url = '/incentive/incentive-dashboard';

  // Form fields - replace with actual locators
  readonly primaryButton: Locator;
  readonly successMessage: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    this.primaryButton = page.getByRole('button', { name: /submit/i });
    this.successMessage = page.locator('[data-testid="success-message"], .alert-success');
    this.errorSummary  = page.locator('[data-testid="error-summary"], .validation-summary-errors');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async expectSuccessMessage(text?: string): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    if (text) await expect(this.successMessage).toContainText(text);
  }

  async expectErrorMessage(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}

