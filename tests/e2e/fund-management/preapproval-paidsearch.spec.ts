// tests/e2e/fund-management/preapproval-paidsearch.spec.ts
import { test, expect } from '../../base-test';

test('Fund Management - Preapproval Paid Search', async ({ page, auth }) => {
  const isAuthenticated = await auth.isAuthenticated();
  if (!isAuthenticated) {
    await auth.ensureAuthenticated();
  }

  await page.goto('https://demoportaluat.channel-fusion.com/CoopManagement/PreApproval/Submit/SubmitPreApproval');
  await page.waitForLoadState('load');

  // Fill dealer number and continue
  await page.locator('#txtdealernumber').click();
  await page.locator('#txtdealernumber').fill('10000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForLoadState('load');

  // Select Paid Search option and continue
  await page.getByRole('link', { name: 'Paid Search' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForLoadState('load');

  // Fill ad title
  await page.locator('#txtAdTitle').click();
  await page.locator('#txtAdTitle').fill('Paid Search test');
  await page.locator('#txtAdTitle').press('ControlOrMeta+ArrowLeft');
  await page.locator('#txtAdTitle').press('ControlOrMeta+ArrowRight');

  // Upload file
  await page.locator('input[type="file"]').setInputFiles('static_files/excel/testcsv.xlsx');

  // Submit request
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForLoadState('load');

  // Assert success message
  await expect(page.locator('text=Congratulations')).toBeVisible({ timeout: 90000 });
});