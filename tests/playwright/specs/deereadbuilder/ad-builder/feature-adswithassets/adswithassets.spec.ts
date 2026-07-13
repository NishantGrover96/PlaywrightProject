import { test, expect } from '@playwright/test';
import { AdswithassetsPage } from '../../../../pages/deereadbuilder/ad-builder/feature-adswithassets/AdswithassetsPage';
import testData from '../../../../data/deereadbuilder/ad-builder/feature-adswithassets/test-data.json';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../../../data/deereadbuilder/ad-builder/feature-adswithassets');

test.describe('Ad-Builder - Creative Library', () => {

  // ----------------------------------------------------------
  // Smoke Suite
  // ----------------------------------------------------------

  test.describe('Smoke', () => {

    test('AD_BUILDER-SMOKE-001 - page loads @smoke', async ({ page }) => {
      const featurePage = new AdswithassetsPage(page);
      await featurePage.navigate();
      await expect(page).toHaveURL(/adswithassets/i);
    });

  });

  // ----------------------------------------------------------
  // Happy Path
  // ----------------------------------------------------------

  test.describe('Happy Path', () => {

    test('AD_BUILDER-TC-001 - happy path @smoke @regression @critical', async ({ page }) => {
      const featurePage = new AdswithassetsPage(page);
      await featurePage.navigate();
      // TODO: implement
    });

  });

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  test.describe('Validation', () => {

    test('AD_BUILDER-TC-010 - required field validation @regression', async ({ page }) => {
      const featurePage = new AdswithassetsPage(page);
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
      await page.goto('/ad-builder/adswithassets');
      await expect(page).toHaveURL(/login|account/i);
      await context.close();
    });

  });

});


