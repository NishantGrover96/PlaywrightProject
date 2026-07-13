import { test, expect } from '@playwright/test';
import { Frmloadrtr2oPage } from '../../../../pages/deereadbuilder/ad-builder/feature-frmloadrtr2o/Frmloadrtr2oPage';
import testData from '../../../../data/deereadbuilder/ad-builder/feature-frmloadrtr2o/test-data.json';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../../../data/deereadbuilder/ad-builder/feature-frmloadrtr2o');

test.describe('Ad-Builder - Load RTR', () => {

  // ----------------------------------------------------------
  // Smoke Suite
  // ----------------------------------------------------------

  test.describe('Smoke', () => {

    test('AD_BUILDER-SMOKE-001 - page loads @smoke', async ({ page }) => {
      const featurePage = new Frmloadrtr2oPage(page);
      await featurePage.navigate();
      await expect(page).toHaveURL(/frmloadrtr2o/i);
    });

  });

  // ----------------------------------------------------------
  // Happy Path
  // ----------------------------------------------------------

  test.describe('Happy Path', () => {

    test('AD_BUILDER-TC-001 - happy path @smoke @regression @critical', async ({ page }) => {
      const featurePage = new Frmloadrtr2oPage(page);
      await featurePage.navigate();
      // TODO: implement
    });

  });

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  test.describe('Validation', () => {

    test('AD_BUILDER-TC-010 - required field validation @regression', async ({ page }) => {
      const featurePage = new Frmloadrtr2oPage(page);
      await featurePage.navigate();
      // TODO: implement
    });

  });

  // ----------------------------------------------------------
  // Authorization
  // ----------------------------------------------------------

  test.describe('Authorization', () => {

    test('AD_BUILDER-TC-038 - unauthenticated access redirects to login @smoke @regression @critical', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('/ad-builder/frmloadrtr2o');
      await expect(page).toHaveURL(/login|account/i);
      await context.close();
    });

  });

});


