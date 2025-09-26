// tests/e2e/fund-management/preapproval-outdoor.spec.ts
import { test, expect } from '../../base-test';
import { PreapprovalPage } from '../../../pages/modules/fund-management/preapproval.page';
import { PreapprovalTestData } from '../../../fixtures/test-data/fund-management/preapproval-data';

test.describe('Fund Management - Preapproval Outdoor', () => {
  let preapprovalPage: PreapprovalPage;
  
  test.beforeEach(async ({ page, auth }) => {
    preapprovalPage = new PreapprovalPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully submit outdoor pre-approval request', async ({ page }) => {
      await preapprovalPage.navigateToFundManagement();
  
      // Fill dealer number and continue
      await preapprovalPage.fillDealerNumber(PreapprovalTestData.dealer.number);

      // Select Outdoor option and continue
      await preapprovalPage.selectType('Outdoor');
  
      // Fill ad title and perform extra key actions
      await preapprovalPage.fillAdTitle(PreapprovalTestData.adContent.title);
  
      // Upload file
      await preapprovalPage.uploadFile(PreapprovalTestData.uploadFiles.Img);

      // Submit request
      await preapprovalPage.submitRequest();  
  
      // Assert success message
      await preapprovalPage.verifySuccessMessage();
    });
});
