import { type Page } from '@playwright/test';
import { Frmloadrtr2oPage } from '../../../pages/deereadbuilder/ad-builder/feature-frmloadrtr2o/Frmloadrtr2oPage';
import testData from '../../../data/deereadbuilder/ad-builder/feature-frmloadrtr2o/test-data.json';

export async function goToFrmloadrtr2o(page: Page): Promise<Frmloadrtr2oPage> {
  const featurePage = new Frmloadrtr2oPage(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
