// pages/modules/fund-management/preapproval-paidsearch.page.ts
import { Page } from '@playwright/test';
import { PreapprovalPaidSearchTestData } from '../../../fixtures/test-data/fund-management/preapproval-paidsearch-data';

export class PreapprovalPaidSearchPage {
  constructor(private page: Page) {}

  /**
   * Navigate to Fund Management Dashboard
   */
  async navigateToFundManagement(): Promise<void> {
    await this.page.getByRole('link', { name: 'Fund Mgmt' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Navigate to Pre-Approval Request
   */
  async navigateToPreApprovalRequest(): Promise<void> {
    await this.page.getByRole('link', { name: 'Request Pre-Approval Pre-' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Fill dealer number and continue
   */
  async fillDealerNumber(dealerNumber: string = PreapprovalPaidSearchTestData.dealer.number): Promise<void> {
    await this.page.locator('#txtdealernumber').click();
    await this.page.locator('#txtdealernumber').fill(dealerNumber);
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Select Paid Search option
   */
  async selectPaidSearch(): Promise<void> {
    await this.page.getByRole('link', { name: 'Paid Search' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Fill ad title
   */
  async fillAdTitle(title: string = PreapprovalPaidSearchTestData.adContent.title): Promise<void> {
    await this.page.locator('#txtAdTitle').click();
    await this.page.locator('#txtAdTitle').fill(title);
  }

  /**
   * Upload file to dropzone
   */
  async uploadFile(fileName: string = PreapprovalPaidSearchTestData.uploadFiles.validFile): Promise<void> {
//   await this.page.locator('#dropzone_fuBGImage div').click();
  // Use the file input element for upload, not body
  await this.page.locator('input[type="file"]').setInputFiles(fileName);
  }

  /**
   * Submit the pre-approval request
   */
  async submitRequest(): Promise<void> {
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(): Promise<void> {
  // Check for any element containing 'Congratulations' text
  await this.page.locator('text=Congratulations').waitFor();
  }

  /**
   * Complete full paid search pre-approval workflow
   */
  /**
   * Complete paid search pre-approval workflow, assuming already at feature page
   */
  async completePaidSearchPreapprovalFromFeaturePage(
    dealerNumber?: string,
    adTitle?: string,
    fileName?: string
  ): Promise<void> {
    await this.fillDealerNumber(dealerNumber);
    await this.selectPaidSearch();
    await this.fillAdTitle(adTitle);
    await this.uploadFile(fileName);
    await this.submitRequest();
  }
}