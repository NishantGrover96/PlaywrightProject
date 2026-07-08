import { type Page } from '@playwright/test';
import { FrmassetuploadPage } from '../../../pages/deereadbuilder/ad-builder/feature-frmassetupload/FrmassetuploadPage';
import testData from '../../../data/deereadbuilder/ad-builder/feature-frmassetupload/test-data.json';

export async function goToFrmassetupload(page: Page): Promise<FrmassetuploadPage> {
  const featurePage = new FrmassetuploadPage(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
