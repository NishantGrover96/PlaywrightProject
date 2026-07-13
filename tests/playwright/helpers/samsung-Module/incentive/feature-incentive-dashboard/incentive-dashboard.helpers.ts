import { type Page } from '@playwright/test';
import { IncentiveDashboardPage } from '../../../../pages/samsung-Module/incentive/feature-incentive-dashboard/IncentiveDashboardPage';
import testData from '../../../../data/samsung-Module/incentive/feature-incentive-dashboard/test-data.json';

export async function goToIncentiveDashboard(page: Page): Promise<IncentiveDashboardPage> {
  const featurePage = new IncentiveDashboardPage(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
