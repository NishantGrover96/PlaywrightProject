// tests/e2e/fund-management/preapproval-outdoor.spec.ts
import { test, expect } from '../../base-test';
import { PreapprovalPaidSearchPage } from '../../../pages/modules/fund-management/preapproval-paidsearch.page';
import { PreapprovalOutdoorTestData, PreapprovalOutdoorSelectors } from '../../../fixtures/test-data/fund-management/preapproval-outdoor-data';

test.describe('Fund Management - Preapproval Outdoor', () => {
  let preapprovalPage: PreapprovalPaidSearchPage;

  test.beforeEach(async ({ page, auth }) => {
    preapprovalPage = new PreapprovalPaidSearchPage(page);
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should successfully submit outdoor pre-approval request', async ({ page }) => {
    await page.goto('https://demoportaluat.channel-fusion.com/CoopManagement/PreApproval/Submit/SubmitPreApproval');
    await page.waitForLoadState('load');

    // Fill dealer number and continue
    await page.locator('#txtdealernumber').click();
    await page.locator('#txtdealernumber').fill(PreapprovalOutdoorTestData.dealer.number);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('load');

    // Select Outdoor option and continue
    await page.getByRole('link', { name: 'Outdoor' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('load');

    // Fill ad title
    await page.locator('#txtAdTitle').click();
    await page.locator('#txtAdTitle').fill(PreapprovalOutdoorTestData.adContent.title);

    // Upload file
    // await page.locator('#dropzone_fuBGImage i').click();
    await page.locator('input[type="file"]').setInputFiles(PreapprovalOutdoorTestData.uploadFiles.validFile);

    // Submit request
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForLoadState('load');

    // Assert success message
    await expect(page.locator('text=Congratulations')).toBeVisible({ timeout: 90000 });
  });
});
