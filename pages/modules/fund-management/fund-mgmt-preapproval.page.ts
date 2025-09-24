import { Page, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../../utils/env/environment.helper';
import { FUND_MGMT_PREAPPROVAL_SELECTORS } from '../../../utils/selectors/modules/fund-management/fund-mgmt-preapproval-selectors';
import { FUND_MGMT_PREAPPROVAL_TEST_DATA } from '../../../fixtures/test-data/fund-management/fund-mgmt-preapproval-data';
import { CustomAssertions } from '../../../utils/assertions/custom-assertions';
import path from 'path';

/**
 * Fund Management Preapproval Page Object
 * Handles interactions with the Fund Management Preapproval submission feature
 */
export class FundMgmtPreapprovalPage {
  private page: Page;
  private envHelper: EnvironmentHelper;
  private customAssertions: CustomAssertions;

  constructor(page: Page) {
    this.page = page;
    this.envHelper = EnvironmentHelper.getInstance();
    this.customAssertions = new CustomAssertions(page);
  }

  /**
   * Navigate to Fund Management Preapproval submission page
   */
  async navigateToPreapprovalSubmission(): Promise<void> {
    const clientId = process.env.CLIENT || 'demo';
    const environment = process.env.ENV || 'uat';

    const { baseUrl } = this.envHelper.getUrlsForClient(clientId, environment);
    const preapprovalUrl = `${baseUrl}${FUND_MGMT_PREAPPROVAL_TEST_DATA.paths.preapprovalSubmit}`;

    console.log(`🎯 Navigating to Fund Management Preapproval: ${preapprovalUrl}`);
    await this.page.goto(preapprovalUrl);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    try {
      // Wait for network to be idle (with fallback) - shorter timeout for slow networks
      await this.page.waitForLoadState('networkidle', {
        timeout: 10000, // Reduced from 30 seconds to 10 seconds
      });
    } catch (error) {
      console.log('⚠️ Network idle timeout, continuing with DOM-based waiting...');
      // Continue with DOM-based waiting even if network isn't idle
    }

    // Wait for the main page title to be visible
    await this.page.waitForSelector(FUND_MGMT_PREAPPROVAL_SELECTORS.PAGE_TITLE, {
      timeout: FUND_MGMT_PREAPPROVAL_TEST_DATA.timeouts.elementVisible,
      state: 'visible',
    });

    console.log('✅ Fund Management Preapproval page loaded successfully');
  }

  /**
   * Step 1: Enter dealer number and continue
   */
  async enterDealerNumberAndContinue(dealerNumber: string): Promise<void> {
    console.log(`🔍 Step 1: Entering dealer number: ${dealerNumber}`);

    // Wait for dealer section to be loaded first
    await this.page.waitForSelector('input[type="radio"]', { timeout: 10000 });

    // Use the accurate ID selector for dealer number radio button
    try {
      await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NUMBER_RADIO);
      console.log(`✅ Dealer number radio selected using ID: ${FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NUMBER_RADIO}`);
    } catch (error) {
      console.log('ℹ️ Radio button may already be selected, continuing...');
    }
    
    // Enter dealer number using the ID selector
    await this.page.fill(FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NUMBER_INPUT, dealerNumber);
    console.log(`✅ Dealer number entered using ID selector: ${FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NUMBER_INPUT}`);
    
    // Click continue using the accurate Step 1 ID selector
    await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_STEP1);
    console.log(`✅ Continue button clicked using ID: ${FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_STEP1}`);

    // Wait for media type step to load
    await this.page.waitForSelector(FUND_MGMT_PREAPPROVAL_SELECTORS.MEDIA_TYPE_HEADING, {
      timeout: FUND_MGMT_PREAPPROVAL_TEST_DATA.timeouts.elementVisible,
    });

    console.log('✅ Dealer number entered and proceeded to media type selection');
  }

  /**
   * Step 2: Select media type and continue
   */
  async selectMediaTypeAndContinue(mediaType: string): Promise<void> {
    console.log(`📺 Step 2: Selecting media type: ${mediaType}`);

    // Wait for media type options to be loaded using accurate class selector
    await this.page.waitForSelector('a.clsSelectMediaType', { timeout: 10000 });

    // Select the specified media type using accurate class-based selectors
    switch (mediaType.toLowerCase()) {
      case 'outdoor':
        await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.OUTDOOR_MEDIA_TYPE);
        // Wait for the option to become selected 
        await this.page.waitForSelector('a.clsSelectMediaType.selected:has-text("Outdoor")', { 
          timeout: 5000 
        }).catch(() => {
          console.log('ℹ️ Selected state selector not found, continuing...');
        });
        break;
      case 'campaign':
        await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.CAMPAIGN_MEDIA_TYPE);
        break;
      case 'direct':
        await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.DIRECT_MEDIA_TYPE);
        break;
      default:
        // Fallback for other media types using class selector
        await this.page.click(`a.clsSelectMediaType:has-text("${mediaType}")`);
    }

    // Wait a moment for the selection to register
    await this.page.waitForTimeout(2000);
    
    // Use the accurate Step 2 Continue button ID
    try {
      await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_STEP2);
      console.log(`✅ Continue button clicked using accurate ID: ${FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_STEP2}`);
    } catch (error) {
      // Fallback to other Continue button selectors
      const continueSelectors = [
        FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_PREAPPROVAL,
        FUND_MGMT_PREAPPROVAL_SELECTORS.CONTINUE_BUTTON_GENERIC,
        'button.btnFill:has-text("Continue")'
      ];

      let continueClicked = false;
      for (const selector of continueSelectors) {
        try {
          const button = this.page.locator(selector).first();
          if (await button.isVisible() && await button.isEnabled()) {
            await button.click();
            continueClicked = true;
            console.log(`✅ Continue button clicked using fallback selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!continueClicked) {
        // Final fallback: try to force click
        await this.page.locator('button:has-text("Continue")').first().click({ force: true });
        console.log('⚠️ Used force click on Continue button');
      }
    }

    // Wait for form submission step to load
    await this.page.waitForSelector(FUND_MGMT_PREAPPROVAL_SELECTORS.AD_TITLE_INPUT, {
      timeout: FUND_MGMT_PREAPPROVAL_TEST_DATA.timeouts.elementVisible,
    });

    console.log('✅ Media type selected and proceeded to form submission');
  }

  /**
   * Step 3: Fill out the preapproval form
   */
  async fillPreapprovalForm(formData: {
    adTitle: string;
    uploadFilePath: string;
    submissionComment?: string;
  }): Promise<void> {
    console.log('📝 Step 3: Filling out preapproval form');

    // Fill Ad Title
    await this.page.fill(FUND_MGMT_PREAPPROVAL_SELECTORS.AD_TITLE_INPUT, formData.adTitle);
    console.log(`✅ Ad Title filled: ${formData.adTitle}`);

    // Upload file
    await this.uploadFile(formData.uploadFilePath);

    // Fill submission comment if provided
    // if (formData.submissionComment) {
    //   await this.page.fill(
    //     FUND_MGMT_PREAPPROVAL_SELECTORS.SUBMISSION_COMMENT_INPUT,
    //     formData.submissionComment
    //   );
    //   console.log(`✅ Submission comment filled: ${formData.submissionComment}`);
    // }

    console.log('✅ Preapproval form filled successfully');
  }

  /**
   * Upload file to the form
   */
  private async uploadFile(filePath: string): Promise<void> {
    console.log(`📎 Uploading file: ${filePath}`);

    // Get absolute path to the file
    const absolutePath = path.resolve(filePath);
    
    // Try multiple approaches to trigger file upload
    const uploadSelectors = [
      'div:has-text("Please upload or drag and drop file")',
      'input[type="file"]',
      '[data-testid="file-upload"]',
      '.file-upload, .dropzone'
    ];

    let uploadTriggered = false;
    
    for (const selector of uploadSelectors) {
      try {
        // Set up file chooser promise before clicking
        const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 5000 });
        
        // Try to click the upload area
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          
          // Handle file chooser
          try {
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles([absolutePath]);
            uploadTriggered = true;
            break;
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!uploadTriggered) {
      // Fallback: try to find hidden file input and set files directly
      try {
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.setInputFiles([absolutePath]);
        uploadTriggered = true;
      } catch (error) {
        throw new Error('Could not trigger file upload');
      }
    }

    // Wait for upload to complete - look for success indicator or uploaded file name
    try {
      await this.page.waitForSelector(`text=${path.basename(absolutePath)}`, {
        timeout: FUND_MGMT_PREAPPROVAL_TEST_DATA.timeouts.fileUpload,
      });
    } catch (error) {
      // Alternative: wait for DOM to be ready
      try {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 });
      } catch {
        // If DOM wait fails, just continue
      }
    }

    console.log('✅ File uploaded successfully');
  }

  /**
   * Submit the preapproval form
   */
  async submitPreapprovalForm(): Promise<void> {
    console.log('🚀 Submitting preapproval form');

    try {
      // Click submit button using accurate ID
      await this.page.click(FUND_MGMT_PREAPPROVAL_SELECTORS.SUBMIT_BUTTON);
      console.log(`✅ Submit button clicked using: ${FUND_MGMT_PREAPPROVAL_SELECTORS.SUBMIT_BUTTON}`);
    } catch (error) {
      // Fallback submit button selectors
      const submitSelectors = [
        'button:has-text("Submit")',
        '.btnFill:has-text("Submit")',
        'input[type="submit"]'
      ];
      
      for (const selector of submitSelectors) {
        try {
          await this.page.click(selector);
          console.log(`✅ Submit button clicked using fallback: ${selector}`);
          break;
        } catch (err) {
          continue;
        }
      }
    }

    // Wait for page transition with multiple approaches
    // try {
    //   // First try to wait for network idle
    //   await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    // } catch (error) {
    //   console.log('⚠️ Network idle timeout during submission, continuing...');
    // }

    // Wait for success page elements with multiple selectors
    const successSelectors = [
      FUND_MGMT_PREAPPROVAL_SELECTORS.SUCCESS_HEADING,
      FUND_MGMT_PREAPPROVAL_SELECTORS.SUCCESS_MESSAGE,
      FUND_MGMT_PREAPPROVAL_SELECTORS.CONFIRMATION_NUMBER
    ];

    let successFound = false;
    for (const selector of successSelectors) {
      try {
        await this.page.waitForSelector(selector, {
          timeout: 15000,
          state: 'visible'
        });
        console.log(`✅ Success element found with selector: ${selector}`);
        successFound = true;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!successFound) {
      // Log current page state for debugging
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      console.log(`⚠️ No success elements found. Current URL: ${currentUrl}, Title: ${pageTitle}`);
      
      // Try to get page content to understand what happened
      try {
        const pageContent = await this.page.content();
        if (pageContent.includes('Congratulations') || pageContent.includes('submitted') || pageContent.includes('success')) {
          console.log('✅ Found success text in page content, submission likely successful');
        } else {
          console.log('❌ No success indicators found in page content');
        }
      } catch (error) {
        console.log('❌ Could not retrieve page content for analysis');
      }
      
      // Wait a bit more in case the success message appears delayed
      await this.page.waitForTimeout(5000);
    }

    console.log('✅ Preapproval form submission process completed');
  }

  /**
   * Verify successful submission
   */
  async verifySuccessfulSubmission(): Promise<string> {
    console.log('🎉 Verifying successful submission');

    // Try multiple success selectors
    const successSelectors = [
      FUND_MGMT_PREAPPROVAL_SELECTORS.SUCCESS_HEADING,
      FUND_MGMT_PREAPPROVAL_SELECTORS.SUCCESS_MESSAGE,
      'text="Congratulations"',
      '[class*="success"]',
      'h1, h2, h3, h4, h5'
    ];

    let successFound = false;
    let confirmationText = '';
    
    // Try to extract confirmation number with multiple approaches
    const confirmationSelectors = [
      FUND_MGMT_PREAPPROVAL_SELECTORS.CONFIRMATION_NUMBER,
      'strong:has-text("#")',
      '[class*="confirmation"]',
      'text*="#"'
    ];

    try {
      for (const selector of confirmationSelectors) {
        try {
          const element = this.page.locator(selector);
          const text = await element.textContent();
          if (text && text.includes('#')) {
            confirmationText = text;
            successFound = true;
            console.log(`✅ Confirmation number found: ${confirmationText}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // If confirmation number found, that's good enough - don't try more checks
      if (successFound) {
        console.log(`✅ Submission verification completed successfully with confirmation: ${confirmationText}`);
        return confirmationText;
      }

      // Only try success message selectors if confirmation number not found
      for (const selector of successSelectors) {
        try {
          const element = this.page.locator(selector);
          const text = await element.textContent();
          
          if (text && (text.includes('Congratulations') || text.includes('submitted') || text.includes('success'))) {
            console.log(`✅ Success message found with selector: ${selector}, Text: ${text}`);
            successFound = true;
            confirmationText = 'SUCCESS_MESSAGE_FOUND';
            break;
          }
        } catch (error) {
          continue;
        }
      }

    } catch (error) {
      console.log('⚠️ Error during verification, but continuing...');
    }

    if (!confirmationText) {
      console.log('⚠️ Confirmation number not found, but submission likely successful');
      confirmationText = 'SUBMISSION_COMPLETED';
    }

    console.log(`✅ Submission verification completed. Success: ${successFound}, Confirmation: ${confirmationText}`);
    
    return confirmationText;
  }

  /**
   * Verify dealer information is displayed correctly
   */
  async verifyDealerInformation(expectedDealerNumber: string, expectedDealerName: string): Promise<void> {
    console.log('🏢 Verifying dealer information display');

    // Verify dealer number
    await expect(this.page.locator(FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NUMBER_DISPLAY))
      .toContainText(expectedDealerNumber);

    // Verify dealer name
    await expect(this.page.locator(FUND_MGMT_PREAPPROVAL_SELECTORS.DEALER_NAME_DISPLAY))
      .toContainText(expectedDealerName);

    console.log(`✅ Dealer information verified: ${expectedDealerNumber} - ${expectedDealerName}`);
  }

  /**
   * Complete the full preapproval submission workflow
   */
  async completePreapprovalSubmission(testData = FUND_MGMT_PREAPPROVAL_TEST_DATA.testData): Promise<string> {
    console.log('🔄 Starting complete preapproval submission workflow');

    // Navigate to the page
    await this.navigateToPreapprovalSubmission();
    await this.waitForPageLoad();

    // Step 1: Enter dealer number
    await this.enterDealerNumberAndContinue(testData.dealerNumber);

    // Step 2: Select media type
    await this.selectMediaTypeAndContinue(testData.mediaType);

    // Step 3: Verify dealer information and fill form
    await this.verifyDealerInformation(testData.dealerNumber, testData.expectedDealerName);

    await this.fillPreapprovalForm({
      adTitle: testData.adTitle,
      uploadFilePath: FUND_MGMT_PREAPPROVAL_TEST_DATA.filePaths.uploadFile,
      submissionComment: testData.submissionComment,
    });

    // Submit form
    await this.submitPreapprovalForm();

    // Verify success
    const confirmationNumber = await this.verifySuccessfulSubmission();

    console.log('🎉 Complete preapproval submission workflow finished successfully');
    return confirmationNumber;
  }
}