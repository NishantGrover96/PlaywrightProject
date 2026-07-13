import { type Page } from '@playwright/test';
import { AdswithassetsPage } from '../../../../pages/deereadbuilder/ad-builder/feature-adswithassets/AdswithassetsPage';
import testData from '../../../../data/deereadbuilder/ad-builder/feature-adswithassets/test-data.json';

export async function goToAdswithassets(page: Page): Promise<AdswithassetsPage> {
  const featurePage = new AdswithassetsPage(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
