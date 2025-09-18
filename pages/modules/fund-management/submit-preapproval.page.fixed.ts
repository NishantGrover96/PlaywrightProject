/**
 * Submit PreApproval Page Object - Fixed Version
 * 
 * Page Object Model for Fund Management Submit PreApproval feature.
 * Updated based on MCP browser discovery of actual page structure.
 */

import { Page } from '@playwright/test';
import { SubmitPreapprovalSelectors } from '../../../utils/selectors/modules/fund-management/submit-preapproval-selectors.fixed';

export class SubmitPreapprovalPageFixed {
  private readonly _page: Page;

  constructor(page: Page) {
    this._page = page;
  }

  get page(): Page {
    return this._page;
  }

  // Navigation methods
  async navigateToSubmitPreapproval(): Promise<void> {
    await this._page.goto('/CoopManagement/PreApproval/Submit/SubmitPreApproval');
    await this._page.waitForLoadState('domcontentloaded');
  }

  async waitForPageLoad(): Promise<void> {
    await this._page.waitForSelector(SubmitPreapprovalSelectors.pageTitle);
    await this._page.waitForSelector(SubmitPreapprovalSelectors.wizard.step1Tab);
  }

  // Step 1 - Dealer Selection
  async selectDealerByNumber(dealerNumber: string): Promise<void> {
    // Wait for page to be ready
    await this.waitForPageLoad();
    
    // Ensure dealer number radio is selected (it's usually selected by default)
    await this._page.click(SubmitPreapprovalSelectors.dealerStep.dealerNumberRadio);
    
    // Enter dealer number
    await this._page.fill(SubmitPreapprovalSelectors.dealerStep.dealerNumberInput, dealerNumber);
    
    // Click continue to proceed to step 2
    await this._page.click(SubmitPreapprovalSelectors.dealerStep.continueButton);
    
    // Wait for step 2 to be active
    await this._page.waitForSelector(SubmitPreapprovalSelectors.wizard.step2TabText + '[selected]', { timeout: 10000 });
    await this._page.waitForSelector(SubmitPreapprovalSelectors.mediaTypeStep.campaignMediaType, { timeout: 10000 });
  }

  // Step 2 - Media Type Selection
  async selectMediaType(mediaType: string): Promise<void> {
    // Map media type names to selectors
    const mediaTypeSelectors: Record<string, string> = {
      'Campaign': SubmitPreapprovalSelectors.mediaTypeStep.campaignMediaType,
      'Direct': SubmitPreapprovalSelectors.mediaTypeStep.directMediaType,
      'Display Advertising (Digital Banners and Native Advertising)': SubmitPreapprovalSelectors.mediaTypeStep.displayAdvertisingMediaType,
      'FLYERS / INSERTS': SubmitPreapprovalSelectors.mediaTypeStep.flyersInsertsMediaType,
      'Outdoor': SubmitPreapprovalSelectors.mediaTypeStep.outdoorMediaType,
      'Paid Search': SubmitPreapprovalSelectors.mediaTypeStep.paidSearchMediaType,
      'Paid Social (Facebook, Instagram, Pinterest, and X ads; boosted posts)': SubmitPreapprovalSelectors.mediaTypeStep.paidSocialMediaType,
      'Point of Sale (POS) Materials': SubmitPreapprovalSelectors.mediaTypeStep.posMediaType,
      'Print Advertising (Newspaper and Magazine)': SubmitPreapprovalSelectors.mediaTypeStep.printAdvertisingMediaType,
      'Radio and Streaming Radio Commercials': SubmitPreapprovalSelectors.mediaTypeStep.radioStreamingMediaType,
      'Screens (TV and Streaming TV; Online Video)': SubmitPreapprovalSelectors.mediaTypeStep.screensMediaType,
      'Shows and Events': SubmitPreapprovalSelectors.mediaTypeStep.showsEventsMediaType,
      'Sponsorships': SubmitPreapprovalSelectors.mediaTypeStep.sponsorshipsMediaType,
      'Website Development and SEO': SubmitPreapprovalSelectors.mediaTypeStep.websiteDevMediaType,
    };

    const selector = mediaTypeSelectors[mediaType];
    if (!selector) {
      throw new Error(`Media type "${mediaType}" not found in selector map`);
    }

    // Wait for the media type option to be available
    await this._page.waitForSelector(selector, { timeout: 10000 });
    
    // Click the media type
    await this._page.click(selector);
    
    // Wait for the Continue button to be enabled
    await this._page.waitForSelector(SubmitPreapprovalSelectors.mediaTypeStep.continueButton + ':not([disabled])', { timeout: 5000 });
    
    // Click continue to proceed to step 3
    await this._page.click(SubmitPreapprovalSelectors.mediaTypeStep.continueButton);
    
    // Wait for form submission step to be active (Step 3)
    await this._page.waitForSelector(SubmitPreapprovalSelectors.wizard.step3TabText + '[selected]', { timeout: 10000 });
  }

  // Step 3 - Form Submission
  async fillCampaignForm(data: {
    title: string;
    includesOffer?: boolean;
    campaignMediaType?: string;
    landingPageUrl?: string;
    submissionComment?: string;
  }): Promise<void> {
    // Fill campaign title
    await this._page.fill(SubmitPreapprovalSelectors.formSubmission.campaignTitleInput, data.title);
    
    // Handle offer checkbox if specified
    if (data.includesOffer !== undefined) {
      const checkbox = this._page.locator(SubmitPreapprovalSelectors.formSubmission.adIncludesOfferCheckbox);
      if (data.includesOffer) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }

    // Select campaign media type if specified
    if (data.campaignMediaType) {
      const campaignMediaSelectors: Record<string, string> = {
        'Display Advertising (Digital Banners and Native Advertising)': SubmitPreapprovalSelectors.formSubmission.campaignMediaTypes.displayAdverising,
        'Paid Search': SubmitPreapprovalSelectors.formSubmission.campaignMediaTypes.paidSearch,
        'Paid Social (Facebook, Instagram, Pinterest, and X ads; boosted posts)': SubmitPreapprovalSelectors.formSubmission.campaignMediaTypes.paidSocial,
        'Screens (TV and Streaming TV; Online Video)': SubmitPreapprovalSelectors.formSubmission.campaignMediaTypes.screens,
      };

      const selector = campaignMediaSelectors[data.campaignMediaType];
      if (selector) {
        await this._page.click(selector);
        
        // If Digital Display is selected, additional fields will appear
        if (data.campaignMediaType === 'Display Advertising (Digital Banners and Native Advertising)' && data.landingPageUrl) {
          await this._page.waitForSelector(SubmitPreapprovalSelectors.formSubmission.digitalDisplay.landingPageUrlInput);
          await this._page.fill(SubmitPreapprovalSelectors.formSubmission.digitalDisplay.landingPageUrlInput, data.landingPageUrl);
        }
      }
    }

    // Fill submission comment if specified
    if (data.submissionComment) {
      await this._page.fill(SubmitPreapprovalSelectors.formSubmission.digitalDisplay.submissionCommentInput, data.submissionComment);
    }
  }

  // Utility methods
  async goBack(): Promise<void> {
    await this._page.click(SubmitPreapprovalSelectors.formSubmission.backButton);
  }

  async getCurrentStep(): Promise<number> {
    // Use selectors from selector file only - check for selected attribute
    const step1Active = await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step1TabText + '[selected]');
    const step2Active = await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step2TabText + '[selected]');  
    const step3Active = await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step3TabText + '[selected]');
    
    if (step1Active || step3Active) return 3; // Step 3 if selected
    if (step2Active) return 2;
    if (step1Active) return 1;
    
    // Fallback: check which tabpanel is currently visible
    if (await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step3Panel)) return 3;
    if (await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step2Panel)) return 2;
    if (await this._page.isVisible(SubmitPreapprovalSelectors.wizard.step1Panel)) return 1;
    
    return 0; // Unknown state
  }

  async isMediaTypeSelected(mediaType: string): Promise<boolean> {
    // Use predefined selectors from selector file
    const mediaTypeSelectors: Record<string, string> = {
      'Campaign': SubmitPreapprovalSelectors.mediaTypeStep.campaignMediaType,
      'Direct': SubmitPreapprovalSelectors.mediaTypeStep.directMediaType,
      'Display Advertising (Digital Banners and Native Advertising)': SubmitPreapprovalSelectors.mediaTypeStep.displayAdvertisingMediaType,
    };
    
    const selector = mediaTypeSelectors[mediaType];
    if (!selector) return false;
    
    return await this._page.isVisible(selector + '[active], ' + selector + '.active');
  }

  async getAvailableMediaTypes(): Promise<string[]> {
    const mediaTypes: string[] = [];
    
    // Check each predefined media type from selectors
    const mediaTypeSelectors = [
      { name: 'Campaign', selector: SubmitPreapprovalSelectors.mediaTypeStep.campaignMediaType },
      { name: 'Direct', selector: SubmitPreapprovalSelectors.mediaTypeStep.directMediaType },
      { name: 'Display Advertising (Digital Banners and Native Advertising)', selector: SubmitPreapprovalSelectors.mediaTypeStep.displayAdvertisingMediaType },
      { name: 'FLYERS / INSERTS', selector: SubmitPreapprovalSelectors.mediaTypeStep.flyersInsertsMediaType },
      { name: 'Outdoor', selector: SubmitPreapprovalSelectors.mediaTypeStep.outdoorMediaType },
      { name: 'Paid Search', selector: SubmitPreapprovalSelectors.mediaTypeStep.paidSearchMediaType },
    ];
    
    for (const mediaType of mediaTypeSelectors) {
      if (await this._page.isVisible(mediaType.selector)) {
        mediaTypes.push(mediaType.name);
      }
    }
    
    return mediaTypes;
  }

  async getDealerInfo(): Promise<{ dealerNumber: string; dealerName: string }> {
    // Find the strong tags containing dealer info
    const strongElements = await this._page.locator(SubmitPreapprovalSelectors.formSubmission.dealerNumberDisplay).all();
    
    let dealerNumber = '';
    let dealerName = '';
    
    for (const element of strongElements) {
      const text = await element.textContent() || '';
      // Check if it's a number (dealer number)
      if (/^\d+$/.test(text.trim())) {
        dealerNumber = text.trim();
      } else if (text.trim().length > 0 && !dealerNumber) {
        dealerName = text.trim();
      }
    }
    
    return { dealerNumber, dealerName };
  }

  // Performance and accessibility methods
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.navigateToSubmitPreapproval();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  async checkAccessibility(): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for proper heading structure
    const headings = await this._page.locator('h1, h2, h3, h4, h5, h6').all();
    if (headings.length === 0) {
      issues.push('No heading elements found');
    }

    // Check for form labels
    const inputs = await this._page.locator('input[type="text"], input[type="radio"], input[type="checkbox"], textarea').all();
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.getAttribute('id');
        return id ? document.querySelector(`label[for="${id}"]`) !== null : false;
      });
      
      if (!hasLabel) {
        const inputType = await input.getAttribute('type') || 'unknown';
        issues.push(`Input element (${inputType}) missing associated label`);
      }
    }

    return issues;
  }

  async hasFormValidationErrors(): Promise<boolean> {
    return await this._page.isVisible(SubmitPreapprovalSelectors.validation.formError);
  }

  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorElements = await this._page.locator(SubmitPreapprovalSelectors.validation.fieldError).all();
    
    for (const error of errorElements) {
      const text = await error.textContent();
      if (text) {
        errors.push(text.trim());
      }
    }
    
    return errors;
  }
}
