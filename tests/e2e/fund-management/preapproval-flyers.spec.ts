// tests/e2e/fund-management/preapproval-flyers.spec.ts
import { test, expect } from '../../base-test';
import { PreapprovalPage } from '../../../pages/modules/fund-management/preapproval.page';
import { PreapprovalTestData } from '../../../fixtures/test-data/fund-management/preapproval-data';

test.describe('Fund Management - Preapproval Flyers & Inserts', () => {
  let preapprovalPage: PreapprovalPage;
  
  test.beforeEach(async ({ page, auth }) => {
    preapprovalPage = new PreapprovalPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully submit flyers & inserts pre-approval request', async ({ page }) => {
    await preapprovalPage.navigateToFundManagement();

    // Complete Flyers & Inserts pre-approval workflow
    await preapprovalPage.completeFlyersInsertsPreapproval(
      PreapprovalTestData.dealer.number,
      PreapprovalTestData.flyersInserts.title,
      PreapprovalTestData.uploadFiles.Img
    );

    // Verify success message is displayed
    await preapprovalPage.verifySuccessMessage();
    
    await preapprovalPage.navigateToFundManagement();

    // Fill dealer number and continue
    await preapprovalPage.fillDealerNumber(PreapprovalTestData.dealer.number);

    // Select Flyers & Inserts option and continue
    await preapprovalPage.selectType('FLYERS / INSERTS');

    // Fill different ad title
    await preapprovalPage.fillAdTitle(PreapprovalTestData.flyersInserts.validTitles[0]);

    // Upload file
    await preapprovalPage.uploadFile(PreapprovalTestData.uploadFiles.Img);

    // Submit request
    await preapprovalPage.submitRequest();

    // Verify success message is displayed
    await preapprovalPage.verifySuccessMessage();
  });
});