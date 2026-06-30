import { type Page } from '@playwright/test';
import {
  CampaignSetupPage,
  type Step1Data,
  type Step2Data,
  type Step3Data,
} from '../../../pages/engage-ads/feature-campaign-setup/CampaignSetupPage';
// import { measurePageLoad } from '../page-performance';
import testData from '@data/engage-ads/feature-campaign-setup/test-data.json';

export async function goToCampaignSetup(page: Page, orderSeq?: string): Promise<CampaignSetupPage> {
  const campaignSetup = new CampaignSetupPage(page);
  // await measurePageLoad(
  //   async () => {
  //     await campaignSetup.navigate(orderSeq);
  //     await campaignSetup.waitForReady();
  //   },
  //   'CampaignSetup',
  // );
  await campaignSetup.navigate(orderSeq);
  await campaignSetup.waitForReady();
  return campaignSetup;
}

export async function fillAllStepsAndSubmit(
  page: Page,
  step1Override?: Partial<Step1Data>,
  step2Override?: Partial<Step2Data>,
  step3Override?: Partial<Step3Data>,
  orderSeq?: string,
): Promise<CampaignSetupPage> {
  // Navigate and wait for the page to be ready before filling any fields.
  // Without this, fillStep1 times out because #FirstName isn't in the DOM yet.
  const campaignSetup = await goToCampaignSetup(page, orderSeq);

  const step1: Step1Data = {
    firstName: testData.step1.valid.firstName,
    lastName: testData.step1.valid.lastName,
    primaryContactEmail: testData.step1.valid.primaryContactEmail,
    contactPhoneNumber: testData.step1.valid.contactPhoneNumber,
    ...step1Override,
  };

  const step2: Step2Data = {
    businessName: testData.step2.valid.businessName,
    streetAddress: testData.step2.valid.streetAddress,
    city: testData.step2.valid.city,
    stateProvince: testData.step2.valid.stateProvince,
    zipCode: testData.step2.valid.zipCode,
    email: testData.step2.valid.email,
    websiteUrl: testData.step2.valid.websiteUrl,
    ...step2Override,
  };

  const step3: Step3Data = {
    serviceArea: testData.step3.valid.serviceArea,
    ...step3Override,
  };

  await campaignSetup.fillStep1(step1);
  await campaignSetup.clickNext();

  await campaignSetup.fillStep2(step2);
  await campaignSetup.clickNext();

  await campaignSetup.fillStep3(step3);
  await campaignSetup.clickNext();

  await campaignSetup.acceptTerms();

  return campaignSetup;
}

export async function completeCampaignSetupFlow(
  page: Page,
  step1Override?: Partial<Step1Data>,
  step2Override?: Partial<Step2Data>,
  step3Override?: Partial<Step3Data>,
  orderSeq?: string,
): Promise<CampaignSetupPage> {
  const campaignSetup = await fillAllStepsAndSubmit(page, step1Override, step2Override, step3Override, orderSeq);
  await campaignSetup.clickSubmit();
  return campaignSetup;
}

export async function navigateAndFillStep1(page: Page, orderSeq?: string): Promise<CampaignSetupPage> {
  const campaignSetup = await goToCampaignSetup(page, orderSeq);
  await campaignSetup.fillStep1({
    firstName: testData.step1.valid.firstName,
    lastName: testData.step1.valid.lastName,
    primaryContactEmail: testData.step1.valid.primaryContactEmail,
    contactPhoneNumber: testData.step1.valid.contactPhoneNumber,
  });
  return campaignSetup;
}

export async function advanceToStep2(page: Page, orderSeq?: string): Promise<CampaignSetupPage> {
  const campaignSetup = await navigateAndFillStep1(page, orderSeq);
  await campaignSetup.clickNext();
  return campaignSetup;
}

export async function advanceToStep3(page: Page, orderSeq?: string): Promise<CampaignSetupPage> {
  const campaignSetup = await advanceToStep2(page, orderSeq);
  await campaignSetup.fillStep2({
    businessName: testData.step2.valid.businessName,
    streetAddress: testData.step2.valid.streetAddress,
    city: testData.step2.valid.city,
    stateProvince: testData.step2.valid.stateProvince,
    zipCode: testData.step2.valid.zipCode,
    email: testData.step2.valid.email,
    websiteUrl: testData.step2.valid.websiteUrl,
  });
  await campaignSetup.clickNext();
  return campaignSetup;
}

export async function advanceToStep4(page: Page, orderSeq?: string): Promise<CampaignSetupPage> {
  const campaignSetup = await advanceToStep3(page, orderSeq);
  await campaignSetup.fillStep3({ serviceArea: testData.step3.valid.serviceArea });
  await campaignSetup.clickNext();
  return campaignSetup;
}
