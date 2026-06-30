import { type Page } from '@playwright/test';
import { ViewPackagePage, type ExpertFormData } from '../../../pages/engage-ads/feature-view-package/ViewPackagePage';
// import { measurePageLoad } from '../page-performance';
import testData from '@data/engage-ads/feature-view-package/test-data.json';

export async function goToViewPackage(page: Page): Promise<ViewPackagePage> {
  const viewPackage = new ViewPackagePage(page);
  // await measurePageLoad(
  //   async () => {
  //     await viewPackage.navigate();
  //     await viewPackage.waitForReady();
  //   },
  //   'ViewPackage',
  // );
  await viewPackage.navigate();
  await viewPackage.waitForReady();
  return viewPackage;
}

export async function selectPackageAndGoToStep2(page: Page, packageName = testData.packages.knownStandard.name): Promise<ViewPackagePage> {
  const viewPackage = await goToViewPackage(page);
  await viewPackage.selectPackageByName(packageName);
  await viewPackage.expectStep2Active();
  return viewPackage;
}

export async function selectPackageAndAcceptTerms(page: Page, packageName = testData.packages.knownStandard.name): Promise<ViewPackagePage> {
  const viewPackage = await selectPackageAndGoToStep2(page, packageName);
  await viewPackage.acceptTerms();
  return viewPackage;
}

export async function selectPackageApplyCoopAndAcceptTerms(page: Page, coopAmount: string): Promise<ViewPackagePage> {
  const viewPackage = await selectPackageAndAcceptTerms(page);
  await viewPackage.applyCoop(1, coopAmount);
  return viewPackage;
}

export async function openExpertModalForCustomPackage(page: Page): Promise<ViewPackagePage> {
  const viewPackage = await goToViewPackage(page);
  await viewPackage.openTalkToExpertForPackage(testData.packages.knownCustom.name);
  return viewPackage;
}

export async function fillAndSubmitExpertForm(page: Page, data: ExpertFormData): Promise<ViewPackagePage> {
  const viewPackage = new ViewPackagePage(page);
  await viewPackage.fillExpertForm(data);
  await viewPackage.submitExpertForm();
  return viewPackage;
}
