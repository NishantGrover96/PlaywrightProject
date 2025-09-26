// tests/e2e/fund-management/preapproval-paidsearch.spec.ts
import { test, expect } from '../../base-test';
import { PreapprovalPage } from '../../../pages/modules/fund-management/preapproval.page';
import { PreapprovalTestData } from '../../../fixtures/test-data/fund-management/preapproval-data';


test.describe('Fund Management - Preapproval Paid Search', () => {
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

      // Select Paid Search option and continue
      await preapprovalPage.selectType('Paid Search');
  
      // Fill ad title and perform extra key actions
      await preapprovalPage.fillAdTitle(PreapprovalTestData.adContent.title);
  
      // Upload file
      await preapprovalPage.uploadFile(PreapprovalTestData.uploadFiles.Excel);

      // Submit request
      await preapprovalPage.submitRequest();
  
      // Assert success message
      await preapprovalPage.verifySuccessMessage();
    });
});