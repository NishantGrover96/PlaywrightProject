import { test, expect } from '@playwright/test';
import { NewOrderPage } from '../../../pages/popshop/feature-new-order/NewOrderPage';
import testData from '../../../data/popshop/feature-new-order/test-data.json';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../../data/popshop/feature-new-order');

test.describe('Popshop - New Order', () => {

  // ----------------------------------------------------------
  // Smoke Suite
  // ----------------------------------------------------------

  test.describe('Smoke', () => {

    test('POPSHOP-SMOKE-001 - page loads @smoke', async ({ page }) => {
      const featurePage = new NewOrderPage(page);
      await featurePage.navigate();
      await expect(page).toHaveURL(/new-order/i);
    });

  });

  // ----------------------------------------------------------
  // Happy Path
  // ----------------------------------------------------------

  test.describe('Happy Path', () => {

    test('POPSHOP-TC-001 - happy path @smoke @regression @critical', async ({ page }) => {
      const featurePage = new NewOrderPage(page);
      await featurePage.navigate();
      // TODO: implement
    });

  });

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  test.describe('Validation', () => {

    test('POPSHOP-TC-010 - required field validation @regression', async ({ page }) => {
      const featurePage = new NewOrderPage(page);
      await featurePage.navigate();
      // TODO: implement
    });

  });

  // ----------------------------------------------------------
  // Authorization
  // ----------------------------------------------------------

  test.describe('Authorization', () => {

    test('POPSHOP-TC-038 - unauthenticated access redirects to login @smoke @regression @critical', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('/popshop/new-order');
      await expect(page).toHaveURL(/login|account/i);
      await context.close();
    });

  });

});


