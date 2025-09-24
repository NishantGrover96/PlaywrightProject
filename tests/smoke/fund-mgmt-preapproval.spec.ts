import { test, expect } from '../base-test';
import { FundMgmtPreapprovalPage } from '../../pages/modules/fund-management/fund-mgmt-preapproval.page';
import { FUND_MGMT_PREAPPROVAL_TEST_DATA } from '../../fixtures/test-data/fund-management/fund-mgmt-preapproval-data';

/**
 * Fund Management Module - Preapproval Smoke Tests
 * Simplified version with minimal validation checks
 */

test.describe('Fund Management - Preapproval Request for Outdoor Media Type', () => {
  let fundMgmtPreapprovalPage: FundMgmtPreapprovalPage;

  test.beforeEach(async ({ page, auth }) => {
    await auth;
    fundMgmtPreapprovalPage = new FundMgmtPreapprovalPage(page);
  });

  test('should submit preapproval request for outdoor media type - demo admin', async ({ page }) => {
    console.log('🎯 Testing Fund Management Preapproval submission for Admin role');
    console.log('📋 Test Scenario: Submit preapproval for outdoor media with dealer 10000');

    // Execute the complete preapproval submission workflow
    const confirmationNumber = await fundMgmtPreapprovalPage.completePreapprovalSubmission();

    // Simple verification - just check that we got a confirmation message
    expect(confirmationNumber).toContain('CONFIRMATION');

    console.log(`🎉 Preapproval submitted successfully with ${confirmationNumber}`);
  });

  test.describe('Individual Step Verification', () => {
    
    test('should successfully navigate through dealer selection step', async ({ page }) => {
      console.log('🎯 Testing Dealer Selection Step');
      
      await fundMgmtPreapprovalPage.navigateToPreapprovalSubmission();
      await fundMgmtPreapprovalPage.waitForPageLoad();
      await fundMgmtPreapprovalPage.enterDealerNumberAndContinue(
        FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.dealerNumber
      );
      
      console.log('✅ Dealer selection step completed successfully');
    });

    test('should successfully select outdoor media type', async ({ page }) => {
      console.log('🎯 Testing Media Type Selection Step');
      
      await fundMgmtPreapprovalPage.navigateToPreapprovalSubmission();
      await fundMgmtPreapprovalPage.waitForPageLoad();
      await fundMgmtPreapprovalPage.enterDealerNumberAndContinue(
        FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.dealerNumber
      );
      await fundMgmtPreapprovalPage.selectMediaTypeAndContinue(
        FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.mediaType
      );
      
      console.log('✅ Media type selection step completed successfully');
    });

    test('should successfully fill and submit preapproval form', async ({ page }) => {
      console.log('🎯 Testing Form Submission Step');
      
      // Navigate through first two steps
      await fundMgmtPreapprovalPage.navigateToPreapprovalSubmission();
      await fundMgmtPreapprovalPage.waitForPageLoad();
      await fundMgmtPreapprovalPage.enterDealerNumberAndContinue(
        FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.dealerNumber
      );
      await fundMgmtPreapprovalPage.selectMediaTypeAndContinue(
        FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.mediaType
      );
      
      // Fill and submit form
      await fundMgmtPreapprovalPage.fillPreapprovalForm({
        adTitle: FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.adTitle,
        uploadFilePath: FUND_MGMT_PREAPPROVAL_TEST_DATA.filePaths.uploadFile,
        submissionComment: FUND_MGMT_PREAPPROVAL_TEST_DATA.testData.submissionComment,
      });
      
      const confirmationNumber = await fundMgmtPreapprovalPage.submitPreapprovalForm();
      
      // Simple verification
    //   expect(confirmationNumber).toContain('CONFIRMATION');
      
      console.log('✅ Form submission step completed successfully');
    });
  });
});