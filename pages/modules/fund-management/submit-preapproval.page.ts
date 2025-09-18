import { Page, expect } from '@playwright/test';
import { SubmitPreapprovalSelectors } from '../../../utils/selectors/modules/fund-management/submit-preapproval-selectors';

/**
 * Submit PreApproval Page Object Model
 * 
 * Handles all interactions for the Fund Management Submit PreApproval feature.
 * Follows the Page Object Model pattern for maintainable test automation.
 */
export class SubmitPreapprovalPage {
  constructor(private _page: Page) {}

  // Getter for page access in tests
  get page(): Page {
    return this._page;
  }

  // Navigation Methods
  async navigateToSubmitPreapproval(): Promise<void> {
    await this._page.goto('/CoopManagement/PreApproval/Submit/SubmitPreApproval');
    await this._page.waitForLoadState('networkidle');
  }

  async waitForPageLoad(): Promise<void> {
    await this._page.waitForSelector(SubmitPreapprovalSelectors.wizard.step1Tab);
    await this._page.waitForLoadState('networkidle');
  }

  // Step 1 - Dealer Selection Methods
  async selectDealerByNumber(dealerNumber: string): Promise<void> {
    // Select "Do you know Dealer #?" radio button
    await this._page.click(SubmitPreapprovalSelectors.dealerStep.dealerNumberRadio);
    
    // Enter dealer number
    await this._page.fill(SubmitPreapprovalSelectors.dealerStep.dealerNumberInput, dealerNumber);
    
    // Click Continue
    await this._page.click(SubmitPreapprovalSelectors.wizard.step1ContinueButton);
    
    // Wait for media type step to be active (Step 2)
    await this._page.waitForSelector('[aria-selected="true"]:has-text("Media Type")');
  }

  async selectDealerByName(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.dealerStep.dealerNameRadio);
  }

  async clickRecentDealerViewed(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.dealerStep.recentDealerButton);
    await this._page.waitForSelector(SubmitPreapprovalSelectors.modals.recentDealerModal);
  }

  // Step 2 - Media Type Selection Methods  
  async selectMediaType(mediaType: string): Promise<void> {
    const mediaTypeSelectors = {
      'Campaign': SubmitPreapprovalSelectors.mediaTypeStep.campaignMediaType,
      'Direct': SubmitPreapprovalSelectors.mediaTypeStep.directMediaType,
      'Display Advertising': SubmitPreapprovalSelectors.mediaTypeStep.displayAdvertisingMediaType,
      'Paid Search': SubmitPreapprovalSelectors.mediaTypeStep.paidSearchMediaType,
      'Paid Social': SubmitPreapprovalSelectors.mediaTypeStep.paidSocialMediaType,
      'Screens': SubmitPreapprovalSelectors.mediaTypeStep.screensMediaType,
      'Shows and Events': SubmitPreapprovalSelectors.mediaTypeStep.showsEventsMediaType,
      'Sponsorships': SubmitPreapprovalSelectors.mediaTypeStep.sponsorshipsMediaType,
    };

    const selector = mediaTypeSelectors[mediaType as keyof typeof mediaTypeSelectors];
    if (!selector) {
      throw new Error(`Unsupported media type: ${mediaType}`);
    }

    await this._page.click(selector);
    await this._page.click(SubmitPreapprovalSelectors.wizard.step2ContinueButton);
    
    // Wait for form submission step to be active (Step 3)
    await this._page.waitForSelector('[aria-selected="true"]:has-text("Form Submission")');
  }

  // Campaign Methods
  async fillCampaignTitle(title: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.campaignTitleInput, title);
  }

  async checkCampaignAdOffer(expirationDate?: string): Promise<void> {
    await this._page.check(SubmitPreapprovalSelectors.formSubmission.campaignAdOfferCheckbox);
    
    if (expirationDate) {
      await this._page.fill(SubmitPreapprovalSelectors.formSubmission.campaignExpirationDate, expirationDate);
    }
  }

  async selectCampaignMediaType(mediaType: string): Promise<void> {
    const campaignMediaSelectors = {
      'Display Advertising': SubmitPreapprovalSelectors.formSubmission.campaignDisplayAdvertising,
      'Paid Search': SubmitPreapprovalSelectors.formSubmission.campaignPaidSearch,
      'Paid Social': SubmitPreapprovalSelectors.formSubmission.campaignPaidSocial,
      'Screens': SubmitPreapprovalSelectors.formSubmission.campaignScreens,
    };

    const selector = campaignMediaSelectors[mediaType as keyof typeof campaignMediaSelectors];
    if (!selector) {
      throw new Error(`Unsupported campaign media type: ${mediaType}`);
    }

    await this._page.click(selector);
  }

  async addToCampaign(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.addToCampaignButton);
    
    // Wait for campaign table to update
    await this._page.waitForSelector(SubmitPreapprovalSelectors.formSubmission.campaignTable);
  }

  async addAdditionalMediaType(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.addAdditionalMediaTypeButton);
    
    // Wait for media selection to appear
    await this._page.waitForSelector(SubmitPreapprovalSelectors.formSubmission.campaignDisplayAdvertising);
  }

  async getCampaignTableRowCount(): Promise<number> {
    const rows = await this._page.locator(`${SubmitPreapprovalSelectors.formSubmission.campaignTable} tbody tr`);
    return await rows.count();
  }

  // Standard Media Methods
  async fillAdTitle(title: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.adTitleInput, title);
  }

  async fillAdLandingUrl(url: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.adLandingUrlInput, url);
  }

  async fillMultipleAdUrls(urls: string[]): Promise<void> {
    const urlText = urls.join(',');
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.adLandingUrlMultipleInput, urlText);
  }

  async checkAdOffer(expirationDate?: string): Promise<void> {
    await this._page.check(SubmitPreapprovalSelectors.formSubmission.adOfferCheckbox);
    
    if (expirationDate) {
      await this._page.fill(SubmitPreapprovalSelectors.formSubmission.adExpirationDate, expirationDate);
    }
  }

  // File Upload Methods
  async uploadFile(filePath: string): Promise<void> {
    await this._page.setInputFiles(SubmitPreapprovalSelectors.formSubmission.fileUploadArea, filePath);
    
    // Wait for file to be processed
    await this._page.waitForTimeout(2000);
  }

  async uploadFileViaDropzone(filePath: string): Promise<void> {
    // Click on dropzone to trigger file selector
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.fileDropzone);
    
    // Handle file chooser
    const fileChooserPromise = this._page.waitForEvent('filechooser');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    
    // Wait for upload to complete
    await this._page.waitForTimeout(3000);
  }

  async removeUploadedFile(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.fileRemoveButton);
  }

  // Email Notification Methods
  async fillEmailMe(email: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.emailMeInput, email);
  }

  async checkEmailMeNotification(): Promise<void> {
    await this._page.check(SubmitPreapprovalSelectors.formSubmission.emailMeCheckbox);
  }

  async addOtherContact(email: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.otherContactInput, email);
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.addOtherContactButton);
  }

  async selectDealershipContacts(contacts: string[]): Promise<void> {
    for (const contact of contacts) {
      await this._page.check(`${SubmitPreapprovalSelectors.formSubmission.dealershipContacts}[value="${contact}"]`);
    }
  }

  // Shows and Events Methods
  async fillShowsEventForm(data: any): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsTitleInput, data.title);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsLocationAddress, data.address);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsLocationCity, data.city);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsLocationState, data.state);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsLocationZip, data.zip);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsStartDate, data.startDate);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsEndDate, data.endDate);
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.showsEligibleCost, data.cost);
  }

  async addEquipment(equipmentName: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.showsEvents.equipmentNameInput, equipmentName);
    await this._page.click(SubmitPreapprovalSelectors.showsEvents.addEquipmentButton);
  }

  // Sponsorship Methods
  async fillSponsorshipForm(data: any): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.sponsorship.sponsorshipTitleInput, data.title);
    await this._page.fill(SubmitPreapprovalSelectors.sponsorship.sponsorshipStartDate, data.startDate);
    await this._page.fill(SubmitPreapprovalSelectors.sponsorship.sponsorshipEndDate, data.endDate);
  }

  // Comment Methods
  async fillSubmissionComment(comment: string): Promise<void> {
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.submissionComment, comment);
  }

  // Form Submission Methods
  async submitPreapproval(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.submitButton);
  }

  async resetForm(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.resetFormButton);
  }

  // Validation Methods
  async getValidationMessage(field: string): Promise<string> {
    const validationSelectors = {
      'campaignTitle': SubmitPreapprovalSelectors.validationMessages.campaignTitleError,
      'adTitle': SubmitPreapprovalSelectors.validationMessages.adTitleError,
      'adUrl': SubmitPreapprovalSelectors.validationMessages.adUrlError,
      'fileUpload': SubmitPreapprovalSelectors.validationMessages.fileUploadError,
      'emailMe': SubmitPreapprovalSelectors.validationMessages.emailMeError,
    };

    const selector = validationSelectors[field as keyof typeof validationSelectors];
    if (!selector) {
      throw new Error(`Unsupported validation field: ${field}`);
    }

    return await this._page.textContent(selector) || '';
  }

  async hasValidationError(field: string): Promise<boolean> {
    try {
      const message = await this.getValidationMessage(field);
      return message.trim().length > 0;
    } catch {
      return false;
    }
  }

  // Modal and Dialog Methods
  async handleCampaignErrorModal(): Promise<string> {
    await this._page.waitForSelector(SubmitPreapprovalSelectors.modals.campaignErrorModal);
    const errorText = await this._page.textContent(SubmitPreapprovalSelectors.modals.campaignErrorModal);
    await this._page.click(SubmitPreapprovalSelectors.modals.modalOkButton);
    return errorText || '';
  }

  async waitForConfirmation(): Promise<string> {
    await this._page.waitForSelector(SubmitPreapprovalSelectors.confirmation.confirmationModal);
    const confirmationNumber = await this._page.textContent(SubmitPreapprovalSelectors.confirmation.confirmationNumber);
    return confirmationNumber || '';
  }

  // Assertion Methods
  async verifyPageLoaded(): Promise<void> {
    await expect(this._page.locator('h4:has-text("Request a Pre-Approval")')).toBeVisible();
  }

  async verifyDealerSelected(dealerNumber: string, dealerName: string): Promise<void> {
    await expect(this._page.locator(`text=Dealer #: ${dealerNumber}`)).toBeVisible();
    await expect(this._page.locator(`text=Dealer Name: ${dealerName}`)).toBeVisible();
  }

  async verifyMediaTypeSelected(mediaType: string): Promise<void> {
    await expect(this._page.locator(`h6:has-text("Media: ${mediaType}")`)).toBeVisible();
  }

  async verifyCampaignMediaAdded(mediaType: string, url?: string): Promise<void> {
    await expect(this._page.locator(SubmitPreapprovalSelectors.formSubmission.campaignTable)).toBeVisible();
    await expect(this._page.locator(`td:has-text("${mediaType}")`)).toBeVisible();
    
    if (url) {
      await expect(this._page.locator(`td:has-text("${url}")`)).toBeVisible();
    }
  }

  async verifyValidationError(field: string, expectedMessage: string): Promise<void> {
    const actualMessage = await this.getValidationMessage(field);
    expect(actualMessage).toContain(expectedMessage);
  }

  async verifySubmissionSuccess(expectedConfirmationNumber?: string): Promise<void> {
    const confirmationNumber = await this.waitForConfirmation();
    
    if (expectedConfirmationNumber) {
      expect(confirmationNumber).toBe(expectedConfirmationNumber);
    } else {
      expect(confirmationNumber).toBeTruthy();
    }
  }

  // Utility Methods
  async getCurrentStep(): Promise<number> {
    const step1Active = await this._page.isVisible('[aria-selected="true"]:has-text("Dealer")');
    const step2Active = await this._page.isVisible('[aria-selected="true"]:has-text("Media Type")');
    const step3Active = await this._page.isVisible('[aria-selected="true"]:has-text("Form Submission")');
    
    if (step1Active) return 1;
    if (step2Active) return 2;
    if (step3Active) return 3;
    return 0;
  }

  async goToStep(stepNumber: number): Promise<void> {
    const stepSelectors = {
      1: SubmitPreapprovalSelectors.wizard.step1Tab,
      2: SubmitPreapprovalSelectors.wizard.step2Tab,
      3: SubmitPreapprovalSelectors.wizard.step3Tab,
    };

    const selector = stepSelectors[stepNumber as keyof typeof stepSelectors];
    if (selector) {
      await this._page.click(selector);
      await this._page.waitForLoadState('networkidle');
    }
  }

  // Helper method to complete full campaign flow
  async createCampaignWithMultipleMedia(campaignData: any): Promise<void> {
    // Fill campaign title
    await this.fillCampaignTitle(campaignData.title);
    
    // Add campaign offer if specified
    if (campaignData.hasOffer) {
      await this.checkCampaignAdOffer(campaignData.expirationDate);
    }
    
    // Add first media type
    await this.selectCampaignMediaType(campaignData.mediaTypes[0].type);
    
    if (campaignData.mediaTypes[0].url) {
      await this.fillAdLandingUrl(campaignData.mediaTypes[0].url);
    }
    
    if (campaignData.mediaTypes[0].filePath) {
      await this.uploadFileViaDropzone(campaignData.mediaTypes[0].filePath);
    }
    
    await this.addToCampaign();
    
    // Add additional media types
    for (let i = 1; i < campaignData.mediaTypes.length; i++) {
      await this.addAdditionalMediaType();
      await this.selectCampaignMediaType(campaignData.mediaTypes[i].type);
      
      if (campaignData.mediaTypes[i].url) {
        await this.fillAdLandingUrl(campaignData.mediaTypes[i].url);
      }
      
      if (campaignData.mediaTypes[i].filePath) {
        await this.uploadFileViaDropzone(campaignData.mediaTypes[i].filePath);
      }
      
      await this.addToCampaign();
    }
    
    // Fill submission comment
    if (campaignData.comment) {
      await this.fillSubmissionComment(campaignData.comment);
    }
    
    // Setup email notifications
    if (campaignData.emailMe) {
      await this.fillEmailMe(campaignData.emailMe);
      await this.checkEmailMeNotification();
    }
    
    if (campaignData.otherContacts) {
      for (const contact of campaignData.otherContacts) {
        await this.addOtherContact(contact);
      }
    }
  }
}
