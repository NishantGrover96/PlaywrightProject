import { type Page } from '@playwright/test';
import { NewOrderPage } from '../../../pages/popshop/feature-new-order/NewOrderPage';
import testData from '../../../data/popshop/feature-new-order/test-data.json';

export async function goToNewOrder(page: Page): Promise<NewOrderPage> {
  const featurePage = new NewOrderPage(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
