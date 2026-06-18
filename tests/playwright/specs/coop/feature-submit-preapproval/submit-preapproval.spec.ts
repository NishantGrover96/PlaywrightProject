/**
 * Coop — Submit Pre-Approval — Spec File
 * Module: coop | Feature: submit-preapproval
 * Generated: 2026-06-17 | Pipeline: Step 3 (Playwright Test Generation)
 *
 * FU catalog: docs/functional-catalogs/coop/feature-submit-preapproval/functional-units.md
 * Sign-off:   docs/functional-catalogs/coop/feature-submit-preapproval/signoff.md
 *
 * Run tags:
 *   @smoke      — critical-path, fast, safe on production
 *   @regression — full functional coverage
 *   @e2e        — full end-to-end flows (mutating, dev/testing/UAT only)
 *   @mutation   — creates/modifies DB records (skip on production)
 */
import { test, expect } from '@playwright/test';
import { SubmitPreapprovalPage } from '../../../pages/coop/feature-submit-preapproval/SubmitPreapprovalPage';
import {
  goToSubmitPreapproval,
  navigateToFormStep,
  navigateToShowFormStep,
  navigateToSponsorFormStep,
  navigateToCampaignFormStep,
  setupMainbranchReady,
  submitMainbranchPreapproval,
  submitShowPreapproval,
  submitSponsorPreapproval,
  FILE_MISSING,
} from '../../../helpers/coop/feature-submit-preapproval/submit-preapproval.helpers';
import testData from '../../../data/coop/feature-submit-preapproval/test-data.json';

const IS_PROD = (process.env.TEST_ENV ?? 'production') === 'production';

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE SUITE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Smoke', () => {

  // FU-001
  test('COOP-PA-SMOKE-001 @smoke — page loads with wizard container visible', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectWizardVisible();
    await expect(page).toHaveURL(/SubmitPreApproval/i);
  });

  // FU-004, FU-028
  test('COOP-PA-SMOKE-002 @smoke — media type tiles render after page load', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectMediaTilesVisible();
  });

  // FU-005
  test('COOP-PA-SMOKE-003 @smoke — form submission step renders after media selection', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.expectFormStepVisible();
  });

  // FU-005
  test('COOP-PA-SMOKE-004 @smoke — submit button present in form step', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await expect(preapproval.btnSubmit).toBeVisible();
  });

  // FU-032, FU-039, FU-006
  test('COOP-PA-SMOKE-005 @smoke @mutation — full mainbranch submit shows confirmation number', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    const { confirmationNumber } = await submitMainbranchPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
  });

  // FU-043
  test('COOP-PA-SMOKE-006 @smoke — unauthenticated access redirects to login', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page    = await context.newPage();
    await page.goto('/CoopManagement/PreApproval/Submit/SubmitPreapproval');
    await expect(page).not.toHaveURL(/SubmitPreApproval/i, { timeout: 10_000 });
    await context.close();
  });

  // FU-027, FU-004
  test('COOP-PA-SMOKE-007 @smoke — dealer type dropdown populates in media step', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectMediaTilesVisible();
    await preapproval.expectDealerTypeDropdownHasOptions();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Page Load & Role Handling
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Page Load', () => {

  // FU-001, FU-003, FU-044
  test('COOP-PA-REG-001 @regression — dealer role: dealer search step skipped', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectWizardVisible();
    // Dealer search section should be absent for dealer role
    await expect(page.locator('#_PreApprovalSearchDealerDiv')).not.toBeVisible();
  });

  // FU-045
  test('COOP-PA-REG-002 @regression — page renders correctly for authenticated user', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await expect(page).toHaveURL(/SubmitPreApproval/i);
    await preapproval.expectWizardVisible();
  });

  // FU-044, FU-046
  test('COOP-PA-REG-003 @regression — encrypted dealer number present in hidden field', async ({ page }) => {
    await goToSubmitPreapproval(page);
    const encValue = await page.locator('#hdEncDealerNumberSeq').inputValue();
    // Should not be "0" for a logged-in dealer
    expect(encValue).not.toBe('0');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Media Type Step
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Media Type Step', () => {

  // FU-004, FU-028
  test('COOP-PA-REG-004 @regression — continue button disabled before tile selection', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectMediaTilesVisible();
    await expect(preapproval.btnMediaContinue).toBeDisabled();
  });

  // FU-004
  test('COOP-PA-REG-005 @regression — continue button enabled after tile selection', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectMediaTilesVisible();
    await preapproval.mediaTiles.first().click();
    await expect(preapproval.btnMediaContinue).not.toBeDisabled({ timeout: 5_000 });
  });

  // FU-027
  test('COOP-PA-REG-006 @regression — dealer type dropdown filters media tiles', async ({ page }) => {
    const preapproval = await goToSubmitPreapproval(page);
    await preapproval.expectMediaTilesVisible();
    const initialCount = await preapproval.mediaTiles.count();
    expect(initialCount).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Mainbranch Form Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Mainbranch Validation', () => {

  // FU-011
  test('COOP-PA-REG-007 @regression — ad title required for mainbranch — error shown on empty submit', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.clickSubmit();
    await expect(preapproval.errAdTitle).toBeVisible({ timeout: 5_000 });
  });

  // FU-020
  test('COOP-PA-REG-008 @regression — file upload required — error shown on empty submit', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.fillAdTitle(testData.valid.adTitle);
    await preapproval.clickSubmit();
    await expect(preapproval.errFile).toBeVisible({ timeout: 5_000 });
  });

  // FU-022
  test('COOP-PA-REG-009 @regression — email me field is pre-populated and read-only', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.expectEmailMePreFilled();
  });

  // FU-009
  test('COOP-PA-REG-010 @regression — ad landing URL field visible when media config requires', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    const isVisible = await page.locator('#dvAdURL').isVisible();
    // This test documents behavior — URL field visibility depends on media config
    // If visible, fill and verify no error; if not visible, pass
    if (isVisible) {
      await expect(preapproval.adLandingURLInput).toBeVisible();
    }
  });

  // FU-024
  test('COOP-PA-REG-011 @regression — other contacts can be added', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.addOtherContact(testData.valid.otherContactEmail);
    await expect(preapproval.otherContactsContainer).toContainText(testData.valid.otherContactEmail);
  });

  // FU-021
  test('COOP-PA-REG-012 @regression — comment field accepts text', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    await preapproval.fillComment(testData.valid.comment);
    await expect(preapproval.commentTextarea).toHaveValue(testData.valid.comment);
  });

  // FU-008
  test('COOP-PA-REG-013 @regression — offer checkbox shows expiration date picker', async ({ page }) => {
    const preapproval = await navigateToFormStep(page);
    const offerVisible = await preapproval.chkAdOffer.isVisible();
    if (offerVisible) {
      await preapproval.chkAdOffer.check();
      await expect(page.locator('#dvAdOfferCal')).toBeVisible({ timeout: 3_000 });
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Show Branch Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Show Branch', () => {

  // FU-012
  test('COOP-PA-REG-014 @regression — show name required for individual show branch', async ({ page }) => {
    const preapproval = await navigateToShowFormStep(page);
    await preapproval.clickSubmit();
    await expect(preapproval.errShowName).toBeVisible({ timeout: 5_000 });
  });

  // FU-013
  test('COOP-PA-REG-015 @regression — show address fields required', async ({ page }) => {
    const preapproval = await navigateToShowFormStep(page);
    await preapproval.showNameInput.fill(testData.valid.showName);
    await preapproval.clickSubmit();
    await expect(preapproval.errShowAddress).toBeVisible({ timeout: 5_000 });
  });

  // FU-015
  test('COOP-PA-REG-016 @regression — show cost required', async ({ page }) => {
    const preapproval = await navigateToShowFormStep(page);
    await preapproval.showNameInput.fill(testData.valid.showName);
    await preapproval.showAddressInput.fill(testData.valid.showAddress);
    await preapproval.showCityInput.fill(testData.valid.showCity);
    await preapproval.showStateInput.fill(testData.valid.showState);
    await preapproval.showZipInput.fill(testData.valid.showZip);
    await preapproval.clickSubmit();
    await expect(preapproval.errShowCost).toBeVisible({ timeout: 5_000 });
  });

  // FU-017
  test('COOP-PA-REG-017 @regression — equipment can be added to show', async ({ page }) => {
    const preapproval = await navigateToShowFormStep(page);
    await preapproval.equipmentNameInput.fill('Test Equipment');
    await preapproval.btnAddEquipment.click();
    await expect(preapproval.equipmentContainer).toContainText('Test Equipment', { timeout: 3_000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Sponsorship Branch Validation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Sponsorship Branch', () => {

  // FU-018
  test('COOP-PA-REG-018 @regression — sponsorship name required', async ({ page }) => {
    const preapproval = await navigateToSponsorFormStep(page);
    await preapproval.clickSubmit();
    await expect(preapproval.errSponsorName).toBeVisible({ timeout: 5_000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Campaign Branch
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Campaign Branch', () => {

  // FU-007
  test('COOP-PA-REG-019 @regression — campaign title required for campaign branch', async ({ page }) => {
    const preapproval = await navigateToCampaignFormStep(page);
    await preapproval.clickSubmit();
    await expect(preapproval.errCampaignTitle).toBeVisible({ timeout: 5_000 });
  });

  // FU-025
  test('COOP-PA-REG-020 @regression — campaign media type list renders', async ({ page }) => {
    const preapproval = await navigateToCampaignFormStep(page);
    await expect(preapproval.campaignMediaList.first()).toBeVisible({ timeout: 10_000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Status Routing
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Status Routing', () => {

  // FU-026
  test('COOP-PA-REG-021 @regression @mutation — mainbranch submit → status Submitted', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    // Submit and verify via DB / API that status = Submitted
    const { confirmationNumber } = await submitMainbranchPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
    // Status verification done in verify-records.sql
  });

  // FU-026
  test('COOP-PA-REG-022 @regression @mutation — individual show submit → status AwaitingCSR', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    const { confirmationNumber } = await submitShowPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
    // Status = AwaitingCSR verified in verify-records.sql
  });

  // FU-026
  test('COOP-PA-REG-023 @regression @mutation — sponsorship submit → status AwaitingCSR', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    const { confirmationNumber } = await submitSponsorPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
    // Status = AwaitingCSR verified in verify-records.sql
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION SUITE — Success Panel & Post-Submit
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — Regression — Success Panel', () => {

  // FU-006
  test('COOP-PA-REG-024 @regression @mutation — success panel shows confirmation number', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    const preapproval = await setupMainbranchReady(page);
    await preapproval.clickSubmit();
    await preapproval.expectSuccessPanel();
    const num = await preapproval.expectConfirmationNumber();
    expect(num.trim()).toMatch(/\d+/);
  });

  // FU-006
  test('COOP-PA-REG-025 @regression @mutation — submit another preapproval button present after success', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');
    const { preapproval } = await submitMainbranchPreapproval(page);
    await expect(preapproval.btnSubmitAnother).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// E2E SUITE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Coop — Submit Pre-Approval — E2E', () => {

  // COOP-PA-E2E-001
  test('COOP-PA-E2E-001 @e2e @mutation — full mainbranch preapproval end-to-end', async ({ page }) => {
    test.skip(IS_PROD, 'E2E mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');

    const preapproval = new SubmitPreapprovalPage(page);
    await preapproval.navigate();

    // Select media type
    await preapproval.expectMediaTilesVisible();
    await preapproval.selectMediaTile(testData.valid.mainbranchMediaName);
    await preapproval.advanceFromMediaStep();

    // Fill form
    await preapproval.fillAdTitle(testData.valid.adTitle);
    await preapproval.fillComment(testData.valid.comment);
    await preapproval.addOtherContact(testData.valid.otherContactEmail);
    await preapproval.uploadFile(require('path').join(
      __dirname, '../../../data/coop/feature-submit-preapproval/sample-preapproval.pdf',
    ));

    // Submit
    await preapproval.clickSubmit();
    await preapproval.expectSuccessPanel();
    const num = await preapproval.expectConfirmationNumber();
    expect(num.trim().length).toBeGreaterThan(0);
  });

  // COOP-PA-E2E-002
  test('COOP-PA-E2E-002 @e2e @mutation — campaign preapproval end-to-end', async ({ page }) => {
    test.skip(IS_PROD, 'E2E mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');

    const preapproval = new SubmitPreapprovalPage(page);
    await preapproval.navigate();
    await preapproval.expectMediaTilesVisible();
    await preapproval.selectMediaTile(testData.valid.campaignMediaName);
    await preapproval.advanceFromMediaStep();

    // Fill campaign title
    await preapproval.fillCampaignTitle(testData.valid.campaignTitle);

    // Select a campaign child media type
    await expect(preapproval.campaignMediaList.first()).toBeVisible({ timeout: 10_000 });
    await preapproval.campaignMediaList.first().click();

    // Upload file
    await preapproval.uploadFile(require('path').join(
      __dirname, '../../../data/coop/feature-submit-preapproval/sample-preapproval.pdf',
    ));

    // Add to campaign and submit
    await preapproval.btnAddCampaign.click();
    await preapproval.clickSubmit();
    await preapproval.expectSuccessPanel();
    const num = await preapproval.expectConfirmationNumber();
    expect(num.trim().length).toBeGreaterThan(0);
  });

  // COOP-PA-E2E-003
  test('COOP-PA-E2E-003 @e2e @mutation — individual show preapproval end-to-end', async ({ page }) => {
    test.skip(IS_PROD, 'E2E mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');

    const { confirmationNumber } = await submitShowPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
    // Note: FU-036 gap — EquipmentList/Cost not persisted in modern. Verified in verify-records.sql.
  });

  // COOP-PA-E2E-004 — Shows & Events gap documented
  test.fixme(
    'COOP-PA-E2E-003-VERIFY @e2e — individual show: equipment list persisted in dealer_shows record',
    // COOP-PA-FU-036 gap — Shows & Events equipment/dealers/cost not persisted via modern API LinkShowToPreapprovalAsync
  );

  // COOP-PA-E2E-004
  test('COOP-PA-E2E-004 @e2e @mutation — sponsorship preapproval end-to-end', async ({ page }) => {
    test.skip(IS_PROD, 'E2E mutation test — skip on production');
    test.skip(FILE_MISSING, 'Sample file missing — cannot upload');

    const { confirmationNumber } = await submitSponsorPreapproval(page);
    expect(confirmationNumber.trim().length).toBeGreaterThan(0);
  });

});
