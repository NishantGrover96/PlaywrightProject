import { test, expect } from '../base-test';
import { FundMgmtPreapprovalPage } from '../../pages/modules/fund-management/fund-mgmt-preapproval.page';
import { FUND_MGMT_PREAPPROVAL_TEST_DATA } from '../../fixtures/test-data/fund-management/fund-mgmt-preapproval-data';

test.describe('Fund Management - Preapproval Request', () => {
  let fundMgmtPreapprovalPage: FundMgmtPreapprovalPage;

  test.beforeEach(async ({ page, auth }) => {
    await auth;
    fundMgmtPreapprovalPage = new FundMgmtPreapprovalPage(page);
  });

  test('should submit preapproval request for outdoor media type', async ({ page }) => {
    test.setTimeout(90000); // Follow copilot instructions - use 90s timeout
    
    // Use Page Object Model - navigate using proper method
    await fundMgmtPreapprovalPage.navigateToPreapprovalSubmission();
    await fundMgmtPreapprovalPage.waitForPageLoad();
    
    // Step 1: Enter Dealer Number using proper selectors and POM
    await fundMgmtPreapprovalPage.enterDealerNumberAndContinue(
      FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.dealerNumber
    );
    
    // Step 2: Select Media Type using POM
    await fundMgmtPreapprovalPage.selectMediaTypeAndContinue(
      FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.mediaType
    );
    
    // Step 3: Fill form data using POM (ignore "This Ad Includes an Offer" checkbox as requested)
    await fundMgmtPreapprovalPage.fillPreapprovalForm({
      adTitle: FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.adTitle,
      uploadFilePath: FUND_MGMT_PREAPPROVAL_TEST_DATA.filePaths.uploadFile,
      submissionComment: FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.submissionComment,
    });
    
    // Step 4: Submit form using POM
    const confirmationNumber = await fundMgmtPreapprovalPage.submitPreapprovalForm();
    
    // Step 5: Verify success using confirmation number (as per your requirement)
    expect(confirmationNumber).toContain('CONFIRMATION');
  });
});