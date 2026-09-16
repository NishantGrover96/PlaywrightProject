import { test, expect } from '@playwright/test';
import { SpiffManagePage, SPIFF_PRODUCT_CATEGORY } from '../../../../pages/samsung/spiff/feature-spiff/SpiffPage';
import { loginAsSpiffUser } from '../../../../helpers/samsung/spiff/feature-spiff/spiff.helpers';
import { adminEmail, adminPassword } from '../../../../helpers/samsung/spiff/feature-spiff/spiff.credentials';
import testData from '../../../../data/samsung/spiff/feature-spiff/test-data.json';

/**
 * Admin-facing "Manage SPIFF" flow: creating a SPIFF program and its
 * payment rules. Locators and the full create -> save -> reopen -> add
 * rules round trip were confirmed live end-to-end (2026-09-16, tracking a
 * throwaway "QA Live DOM Check SPIFF" record that was created and then
 * deleted again via the admin UI as part of that verification).
 *
 * "Grace Period Date" (per the requirements doc) maps to this app's own
 * "Last Submission Date" field (#CutOffDate) - not a separately-labeled
 * field. It is a required, manually-set date (validated as >= End Date,
 * never auto-computed client-side - confirmed in jsCreateSpiff.js), so
 * these tests compute and set it explicitly rather than relying on any
 * automatic +15-day behavior in the app.
 *
 * Confirmed live: clicking "Next" on SPIFF Detail saves the SPIFF and
 * redirects to the Manage SPIFF list (not an in-page tab switch) - the
 * Payment Rule tab only becomes usable after reopening the saved SPIFF via
 * "Edit SPIFF". SpiffManagePage.saveSpiffDetailAndOpenPaymentRuleTab()
 * drives that whole real flow.
 */
test.describe('Samsung - SPIFF (Flip to Samsung) - Manage SPIFF', () => {

  test.describe('SPIFF Creation', () => {

    test.setTimeout(120_000);

    test('SPIFF-MANAGE-001 - Admin creates a new SPIFF with two payment rules @regression @critical', async ({ page }) => {
      await loginAsSpiffUser(page, adminEmail, adminPassword);

      const managePage = new SpiffManagePage(page);
      await managePage.navigateToAddSpiff();

      // Dates computed at run time (not hardcoded) so this test doesn't go
      // stale: Start = today, End = 14 days out, Grace Period = End + 15
      // days (per the requirements doc's stated rule).
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);
      const graceDate = new Date(endDate);
      graceDate.setDate(graceDate.getDate() + 15);

      const fmt = (d: Date) =>
        [String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'), d.getFullYear()].join('/');

      const spiffName = `QA Manage SPIFF Test ${Date.now()}`;

      await managePage.fillSpiffDetail({
        name: spiffName,
        startDate: fmt(today),
        endDate: fmt(endDate),
        gracePeriodDate: fmt(graceDate),
      });

      await managePage.uploadReferenceDocument(testData.documents.invoiceFixturePath);

      // Saves the SPIFF Detail step and re-opens it for editing - the only
      // real path to an enabled Payment Rule tab (see class + file note).
      await managePage.saveSpiffDetailAndOpenPaymentRuleTab(spiffName);

      // Rule 1 - R410A-DVM, per the requirements doc's example values.
      await managePage.fillAndSavePaymentRule({
        ruleName: 'QA R410A-DVM Rule',
        minimumTonnage: '20',
        dollarAmountPerTon: '15',
        productCategory: SPIFF_PRODUCT_CATEGORY.r410aDvm,
      });

      await expect(managePage.rulesTable).toBeVisible({ timeout: 15_000 });
      await expect(managePage.getRuleRowByName('QA R410A-DVM Rule')).toBeVisible();

      // Rule 2 - All Other Samsung Products.
      await managePage.addNewRuleButton.click();
      await managePage.fillAndSavePaymentRule({
        ruleName: 'QA All Other Products Rule',
        minimumTonnage: '20',
        dollarAmountPerTon: '10',
        productCategory: SPIFF_PRODUCT_CATEGORY.allOtherSamsungProducts,
      });

      await expect(managePage.getRuleRowByName('QA All Other Products Rule')).toBeVisible();

      // Both rules present under the same SPIFF.
      expect(await managePage.getRuleCount()).toBe(2);

      const rule1Row = managePage.getRuleRowByName('QA R410A-DVM Rule');
      await expect(rule1Row).toContainText('$ 15.00');

      const rule2Row = managePage.getRuleRowByName('QA All Other Products Rule');
      await expect(rule2Row).toContainText('$ 10.00');

      // Cleanup: remove the throwaway SPIFF this run created so repeated
      // runs don't accumulate records in Manage SPIFF.
      await managePage.deleteSpiffByName(spiffName);
    });

  });

});
