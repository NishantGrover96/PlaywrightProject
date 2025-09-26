// pages/modules/fund-management/preapproval-paidsearch.page.ts
import { Page } from '@playwright/test';
import { expect } from '../../../tests/base-test';
import { PreapprovalTestData } from '../../../fixtures/test-data/fund-management/preapproval-data';

export class PreapprovalPage {
  constructor(private page: Page) {}

  /**
   * Navigate to Fund Management Dashboard
   */
  async navigateToFundManagement(): Promise<void> {
    await this.page.goto('https://demoportaluat.channel-fusion.com/CoopManagement/PreApproval/Submit/SubmitPreApproval');
    await this.page.waitForLoadState('load');
  }

  /**
   * Navigate to Pre-Approval Request
   */
  // async navigateToPreApprovalRequest(): Promise<void> {
  //   await this.page.getByRole('link', { name: 'Request Pre-Approval Pre-' }).click();
  //   await this.page.waitForLoadState('load');
  // }

  /**
   * Fill dealer number and continue
   */
  async fillDealerNumber(dealerNumber: string = PreapprovalTestData.dealer.number): Promise<void> {
    await this.page.locator('#txtdealernumber').click();
    await this.page.locator('#txtdealernumber').fill(dealerNumber);
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Select Paid Search option
   */
  async selectType(preapprovalType: string = 'Direct'): Promise<void> {
    await this.page.getByRole('link', { name: preapprovalType }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('load');
  }

  /**
   * Fill ad title
   */
  async fillAdTitle(title: string = PreapprovalTestData.adContent.title): Promise<void> {
    await this.page.locator('#txtAdTitle').click();
    await this.page.locator('#txtAdTitle').fill(title);
    await this.page.locator('#txtAdTitle').press('ControlOrMeta+a');
    await this.page.locator('#txtAdTitle').press('ControlOrMeta+c');
  }

  /**
   * Upload file to dropzone
   */
  async uploadFile(fileName: string = PreapprovalTestData.uploadFiles.Img): Promise<void> {
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
    await expect(this.page.locator('text=Congratulations')).toBeVisible({ timeout: 90000 });
  }

  /**
   * Complete full paid search pre-approval workflow
   */
  /**
   * Fill ad landing URL for Digital Display
   */
  async fillAdLandingURL(landingURL: string = PreapprovalTestData.digitalDisplay.landingURL): Promise<void> {
    await this.page.locator('#txtAdLandingURL').click();
    await this.page.locator('#txtAdLandingURL').fill(landingURL);
  }

  /**
   * Complete Digital Display pre-approval workflow
   */
  async completeDigitalDisplayPreapproval(
    dealerNumber?: string,
    landingURL?: string,
    adTitle?: string,
    fileName?: string
  ): Promise<void> {
    await this.fillDealerNumber(dealerNumber);
    await this.selectType('Display Advertising (Digital');
    await this.fillAdLandingURL(landingURL);
    await this.fillAdTitle(adTitle);
    await this.uploadFile(fileName);
    await this.submitRequest();
  }

  /**
   * Complete Flyers & Inserts pre-approval workflow
   */
  async completeFlyersInsertsPreapproval(
    dealerNumber?: string,
    adTitle?: string,
    fileName?: string
  ): Promise<void> {
    await this.fillDealerNumber(dealerNumber);
    await this.selectType('FLYERS / INSERTS');
    await this.fillAdTitle(adTitle);
    await this.uploadFile(fileName);
    await this.submitRequest();
  }

  /**
   * Complete paid search pre-approval workflow, assuming already at feature page
   */
  async completePaidSearchPreapprovalFromFeaturePage(
    dealerNumber?: string,
    adTitle?: string,
    fileName?: string
  ): Promise<void> {
    await this.fillDealerNumber(dealerNumber);
    await this.selectType('Direct');
    await this.fillAdTitle(adTitle);
    await this.uploadFile(fileName);
    await this.submitRequest();
  }
}