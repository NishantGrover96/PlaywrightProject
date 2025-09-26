// tests/e2e/fund-management/preapproval-digital.spec.ts
import { test, expect } from '../../base-test';
import { PreapprovalPage } from '../../../pages/modules/fund-management/preapproval.page';
import { PreapprovalTestData } from '../../../fixtures/test-data/fund-management/preapproval-data';

test.describe('Fund Management - Preapproval Digital Display', () => {
  let preapprovalPage: PreapprovalPage;
  
  test.beforeEach(async ({ page, auth }) => {
    preapprovalPage = new PreapprovalPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully submit digital display pre-approval request', async ({ page }) => {
    await preapprovalPage.navigateToFundManagement();

    // Complete Digital Display pre-approval workflow
    await preapprovalPage.completeDigitalDisplayPreapproval(
      PreapprovalTestData.dealer.number,
      PreapprovalTestData.digitalDisplay.landingURL,
      PreapprovalTestData.adContent.title,
      PreapprovalTestData.uploadFiles.Img
    );

    // Verify success message is displayed
    await preapprovalPage.verifySuccessMessage();
    
    await preapprovalPage.navigateToFundManagement();

    // Fill dealer number and continue
    await preapprovalPage.fillDealerNumber(PreapprovalTestData.dealer.number);

    // Select Digital Display option and continue
    await preapprovalPage.selectType('Display Advertising (Digital');

    // Fill different landing URL
    await preapprovalPage.fillAdLandingURL(PreapprovalTestData.digitalDisplay.validLandingURLs[1]);

    // Fill ad title
    await preapprovalPage.fillAdTitle(PreapprovalTestData.adContent.title);

    // Upload file
    await preapprovalPage.uploadFile(PreapprovalTestData.uploadFiles.Img);

    // Submit request
    await preapprovalPage.submitRequest();

    // Verify success message is displayed
    await preapprovalPage.verifySuccessMessage();
  });
});