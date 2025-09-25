// tests/e2e/fund-management/preapproval-direct.spec.ts
import { test, expect } from '../../base-test';
<<<<<<< HEAD
import { PreapprovalPaidSearchPage } from '../../../pages/modules/fund-management/preapproval.page';
=======
import { PreapprovalPaidSearchPage } from '../../../pages/modules/fund-management/preapproval-paidsearch.page';
>>>>>>> 719a87f48eb437ce241bae199b21c2a5ba3ddf24
import { PreapprovalDirectTestData } from '../../../fixtures/test-data/fund-management/preapproval-direct-data';

test.describe('Fund Management - Preapproval Direct', () => {
  let preapprovalPage: PreapprovalPaidSearchPage;

  test.beforeEach(async ({ page, auth }) => {
    preapprovalPage = new PreapprovalPaidSearchPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully submit direct pre-approval request', async ({ page }) => {
    await page.goto('https://demoportaluat.channel-fusion.com/CoopManagement/PreApproval/Submit/SubmitPreApproval');
    await page.waitForLoadState('load');

    // Fill dealer number and continue
    await page.locator('#txtdealernumber').click();
    await page.locator('#txtdealernumber').fill(PreapprovalDirectTestData.dealer.number);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('load');

    // Select Direct option and continue
    await page.getByRole('link', { name: 'Direct' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('load');

    // Fill ad title and perform extra key actions
    await page.locator('#txtAdTitle').click();
    await page.locator('#txtAdTitle').fill(PreapprovalDirectTestData.adContent.title);
    await page.locator('#txtAdTitle').press('ControlOrMeta+a');
    await page.locator('#txtAdTitle').press('ControlOrMeta+c');

    // Upload file
    // await page.locator('#dropzone_fuBGImage i').click();
    await page.locator('input[type="file"]').setInputFiles(PreapprovalDirectTestData.uploadFiles.validFile);

    // Submit request
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForLoadState('load');

    // Assert success message
    await expect(page.locator('text=Congratulations')).toBeVisible({ timeout: 90000 });
  });
});
