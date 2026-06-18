import { Page, expect } from '@playwright/test';
import { existsSync } from 'fs';
import * as path from 'path';
import { SubmitPreapprovalPage } from '../../../pages/coop/feature-submit-preapproval/SubmitPreapprovalPage';
import testData from '../../data/coop/feature-submit-preapproval/test-data.json';

export const DATA_DIR      = path.resolve(__dirname, '../../data/coop/feature-submit-preapproval');
export const SAMPLE_FILE   = path.join(DATA_DIR, 'sample-preapproval.pdf');

/** True when no sample file exists — skip upload-dependent tests with this flag. */
export const FILE_MISSING = !existsSync(SAMPLE_FILE);

// ── Navigation ────────────────────────────────────────────────────────────────

export async function goToSubmitPreapproval(page: Page): Promise<SubmitPreapprovalPage> {
  const preapproval = new SubmitPreapprovalPage(page);
  await preapproval.navigate();
  return preapproval;
}

// ── Wizard navigation helpers ─────────────────────────────────────────────────

/**
 * Navigate to the form submission step for a standard mainbranch media type.
 * Path: Page → media tile selection → form step.
 */
export async function navigateToFormStep(
  page: Page,
  mediaName = testData.valid.mainbranchMediaName,
): Promise<SubmitPreapprovalPage> {
  const preapproval = new SubmitPreapprovalPage(page);
  await preapproval.navigate();
  await expect(preapproval.mediaTiles.first()).toBeVisible({ timeout: 20_000 });
  await preapproval.selectMediaTile(mediaName);
  await preapproval.advanceFromMediaStep();
  return preapproval;
}

/**
 * Navigate to form step for an individual show media type.
 */
export async function navigateToShowFormStep(page: Page): Promise<SubmitPreapprovalPage> {
  return navigateToFormStep(page, testData.valid.showMediaName);
}

/**
 * Navigate to form step for a sponsorship media type.
 */
export async function navigateToSponsorFormStep(page: Page): Promise<SubmitPreapprovalPage> {
  return navigateToFormStep(page, testData.valid.sponsorMediaName);
}

/**
 * Navigate to form step for a campaign media type.
 */
export async function navigateToCampaignFormStep(page: Page): Promise<SubmitPreapprovalPage> {
  return navigateToFormStep(page, testData.valid.campaignMediaName);
}

// ── Full-flow helpers (used by 2+ tests) ──────────────────────────────────────

/**
 * Navigate to form step, fill ad title, upload file, and return page ready for submit.
 * Skips if sample file is missing — caller should guard with FILE_MISSING.
 */
export async function setupMainbranchReady(page: Page): Promise<SubmitPreapprovalPage> {
  const preapproval = await navigateToFormStep(page);
  await preapproval.fillAdTitle(testData.valid.adTitle);
  await preapproval.uploadFile(SAMPLE_FILE);
  return preapproval;
}

/**
 * Full mainbranch preapproval submit: navigate → fill → upload → submit → return page at success.
 * Skips upload if FILE_MISSING.
 */
export async function submitMainbranchPreapproval(
  page: Page,
): Promise<{ preapproval: SubmitPreapprovalPage; confirmationNumber: string }> {
  const preapproval = await setupMainbranchReady(page);
  await preapproval.clickSubmit();
  await preapproval.expectSuccessPanel();
  const confirmationNumber = await preapproval.expectConfirmationNumber();
  return { preapproval, confirmationNumber };
}

/**
 * Full individual show preapproval submit.
 */
export async function submitShowPreapproval(
  page: Page,
): Promise<{ preapproval: SubmitPreapprovalPage; confirmationNumber: string }> {
  const preapproval = await navigateToShowFormStep(page);
  await preapproval.fillShowDetails({
    name:      testData.valid.showName,
    address:   testData.valid.showAddress,
    city:      testData.valid.showCity,
    state:     testData.valid.showState,
    zip:       testData.valid.showZip,
    startDate: testData.valid.showStartDate,
    endDate:   testData.valid.showEndDate,
    cost:      testData.valid.showCost,
  });
  if (!FILE_MISSING) {
    await preapproval.uploadFile(SAMPLE_FILE);
  }
  await preapproval.clickSubmit();
  await preapproval.expectSuccessPanel();
  const confirmationNumber = await preapproval.expectConfirmationNumber();
  return { preapproval, confirmationNumber };
}

/**
 * Full sponsorship preapproval submit.
 */
export async function submitSponsorPreapproval(
  page: Page,
): Promise<{ preapproval: SubmitPreapprovalPage; confirmationNumber: string }> {
  const preapproval = await navigateToSponsorFormStep(page);
  await preapproval.fillSponsorDetails({
    name:      testData.valid.sponsorName,
    startDate: testData.valid.sponsorStartDate,
    endDate:   testData.valid.sponsorEndDate,
  });
  if (!FILE_MISSING) {
    await preapproval.uploadFile(SAMPLE_FILE);
  }
  await preapproval.clickSubmit();
  await preapproval.expectSuccessPanel();
  const confirmationNumber = await preapproval.expectConfirmationNumber();
  return { preapproval, confirmationNumber };
}
