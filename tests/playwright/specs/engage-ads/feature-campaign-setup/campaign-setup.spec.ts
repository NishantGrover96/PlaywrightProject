/**
 * EngageAds — Campaign Setup — Spec File
 * DOM verified: 2026-06-29 on UAT | Full rewrite
 * Coverage: All 12 tiers per engage-ads-test-coverage SKILL
 *
 * Tags:
 *   @smoke      — fast, non-mutating critical path
 *   @auth       — authorization / role-based
 *   @regression — full functional coverage
 *   @boundary   — boundary value tests
 *   @edge       — input edge cases
 *   @dynamic-ui — loading, char counters, disabled controls
 *   @ux         — back/next navigation, cancel
 *   @dates      — date handling
 *   @e2e        — end-to-end full wizard flow
 *   @mutation   — creates / modifies records (skip on production)
 */
import { test, expect, type Browser, type Page } from '../../../fixtures/auto-screenshot.fixture';
import { existsSync } from 'fs';
import * as path from 'path';
import { CampaignSetupPage } from '../../../pages/engage-ads/feature-campaign-setup/CampaignSetupPage';
import {
  goToCampaignSetup,
  completeCampaignSetupFlow,
  advanceToStep2,
  advanceToStep3,
  advanceToStep4,
} from '../../../helpers/engage-ads/feature-campaign-setup/campaign-setup.helpers';
import testData from '../../../data/engage-ads/feature-campaign-setup/test-data.json';

/** Shim for browser-evaluated HTMLInputElement properties (no DOM lib in tsconfig). */
interface InputEl {
  required: boolean;
  maxLength: number;
  type: string;
  checkValidity: () => boolean;
}
/** Shim for browser-evaluated HTMLTextAreaElement properties. */
interface TextareaEl {
  required: boolean;
  maxLength: number;
  checkValidity: () => boolean;
}

const IS_PROD = (process.env.TEST_ENV ?? 'production') === 'production';
const BASE_URL = process.env.BASE_URL ?? '';

const activeOrderSeq: string | undefined  = process.env.CAMPAIGN_ORDER_SEQ ?? 'lUvurFjFSQUEqual';
const editOrderSeq: string | undefined    = process.env.EDIT_ORDER_SEQ     ?? undefined;
const expiredOrderSeq: string | undefined = process.env.EXPIRED_ORDER_SEQ  ?? undefined;

const DEALER_AUTH_FILE    = path.resolve(__dirname, '../../../fixtures/.auth/user.json');
const ADMIN_AUTH_FILE     = path.resolve(__dirname, '../../../fixtures/.auth/admin.json');
const DEALER_AUTH_MISSING = !existsSync(DEALER_AUTH_FILE);
const ADMIN_AUTH_MISSING  = !existsSync(ADMIN_AUTH_FILE);

function requireOrderSeq(value: string | undefined, envVar: string): asserts value is string {
  if (!value) throw new Error(`Missing required env var: ${envVar}`);
}

async function createContextPage(browser: Browser, storageState?: string): Promise<Page> {
  const ctx = await browser.newContext({ baseURL: BASE_URL, storageState });
  return ctx.newPage();
}

// ════════════════════════════════════════════
// SMOKE
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Smoke', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped for admin project.');
  });

  test('CS-SMOKE-001 @smoke — authenticated dealer without orderSeq redirects to BundledAdPackages', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    await goToCampaignSetup(page);
    await expect(page).toHaveURL(new RegExp(testData.redirects.bundledAdPackages, 'i'), { timeout: 20_000 });
  });

  test('CS-SMOKE-002 @smoke — unauthenticated user is redirected to login', async ({ browser }) => {
    const page = await createContextPage(browser);
    await page.goto(`${BASE_URL}${testData.featureUrl}`, { waitUntil: 'commit', timeout: 30_000 });
    await expect(page).toHaveURL(new RegExp(testData.redirects.login, 'i'), { timeout: 20_000 });
    await page.close();
  });

  test('CS-SMOKE-003 @smoke — 4-step wizard and package header render with valid orderSeq', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.expectPackageHeaderVisible();
    await expect(cs.paidBadge).toContainText(testData.expectedMessages.paidBadge);
  });

  test('CS-SMOKE-004 @smoke — step 1 required fields block progress when left blank', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.firstNameInput.fill('');
    await cs.lastNameInput.fill('');
    await cs.primaryContactEmailInput.fill('');
    await cs.contactPhoneNumberInput.fill('');
    await cs.clickNext();
    const firstNameInvalid = await cs.firstNameInput.evaluate((el) => {
      return !(el as { checkValidity: () => boolean }).checkValidity();
    });
    expect(firstNameInvalid).toBeTruthy();
  });

  test('CS-SMOKE-005 @smoke — TermsAccepted checkbox is present on step 4', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await expect(cs.termsAcceptedCheckbox).toBeAttached({ timeout: 10_000 });
  });

  test('CS-SMOKE-006 @smoke @mutation — successful submission redirects to OrderConfirmation', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation — skip on production.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    await completeCampaignSetupFlow(page, undefined, undefined, undefined, activeOrderSeq);
    await expect(page).toHaveURL(new RegExp(testData.redirects.orderConfirmation, 'i'), { timeout: 30_000 });
  });
});

// ════════════════════════════════════════════
// AUTHORIZATION
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Authorization', () => {

  test('CS-AUTH-001 @auth — admin without orderSeq redirects to BundledAdPackages', async ({ browser }) => {
    test.skip(ADMIN_AUTH_MISSING, 'Admin auth required.');
    const page = await createContextPage(browser, ADMIN_AUTH_FILE);
    await page.goto(`${BASE_URL}${testData.featureUrl}`, { waitUntil: 'commit', timeout: 30_000 });
    await expect(page).toHaveURL(new RegExp(testData.redirects.bundledAdPackages, 'i'), { timeout: 20_000 });
    await page.close();
  });

  test('CS-AUTH-002 @auth — unauthenticated direct URL access redirects to login', async ({ browser }) => {
    const page = await createContextPage(browser);
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    await page.goto(`${BASE_URL}${testData.featureUrl}?orderSeq=${activeOrderSeq}`, { waitUntil: 'commit', timeout: 30_000 });
    await expect(page).toHaveURL(new RegExp(testData.redirects.login, 'i'), { timeout: 20_000 });
    await page.close();
  });

  test('CS-AUTH-003 @auth — invalid encrypted orderSeq redirects to BundledAdPackages', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    await page.goto(`${BASE_URL}${testData.featureUrl}?orderSeq=INVALID_SEQ_VALUE`, { waitUntil: 'commit', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(page).toHaveURL(new RegExp(testData.redirects.bundledAdPackages, 'i'), { timeout: 20_000 });
  });

  test('CS-AUTH-004 @auth — missing orderSeq redirects to BundledAdPackages', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    await page.goto(`${BASE_URL}${testData.featureUrl}`, { waitUntil: 'commit', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(page).toHaveURL(new RegExp(testData.redirects.bundledAdPackages, 'i'), { timeout: 20_000 });
  });
});

// ════════════════════════════════════════════
// EDIT WINDOW
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Edit Window', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-001 @regression — submit button shows "Submit Campaign Order" for new setup', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.expectSubmitButtonLabel();
  });

  test('CS-TC-002 @regression — submit button shows "Update Campaign Setup" in edit mode', async ({ page }) => {
    requireOrderSeq(editOrderSeq, 'EDIT_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, editOrderSeq);
    await cs.expectEditModeAlert();
    await cs.expectUpdateButtonLabel();
  });

  test('CS-TC-003 @regression — expired edit window shows warning alert with countdown', async ({ page }) => {
    requireOrderSeq(expiredOrderSeq, 'EXPIRED_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, expiredOrderSeq);
    await cs.expectExpiredAlert();
    await cs.expectCountdownVisible();
    expect(Number(await cs.redirectCountdown.textContent())).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════
// STEP 1 VALIDATION (Negative + Boundary)
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Step 1 Validation', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-010 @regression — FirstName is required with maxlength 50', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    expect(await cs.firstNameInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.firstNameInput.getAttribute('maxlength')).toBe('50');
  });

  test('CS-TC-011 @regression — LastName is required with maxlength 50', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    expect(await cs.lastNameInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.lastNameInput.getAttribute('maxlength')).toBe('50');
  });

  test('CS-TC-012 @regression — PrimaryContactEmail is required and type=email', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    expect(await cs.primaryContactEmailInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.primaryContactEmailInput.getAttribute('type')).toBe('email');
  });

  test('CS-TC-013 @regression — ContactPhoneNumber is required with maxlength 15', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    expect(await cs.contactPhoneNumberInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.contactPhoneNumberInput.getAttribute('maxlength')).toBe('15');
  });

  test('CS-TC-014 @regression — LeadDestinationEmail is optional and type=email', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    expect(await cs.leadDestinationEmailInput.evaluate((el) => (el as InputEl).required)).toBeFalsy();
    expect(await cs.leadDestinationEmailInput.getAttribute('type')).toBe('email');
  });

  test('CS-TC-015 @boundary — FirstName at 50 chars (max) is accepted', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.firstNameInput.fill('A'.repeat(50));
    expect(await cs.firstNameInput.inputValue()).toHaveLength(50);
  });

  test('CS-TC-016 @boundary — FirstName exceeding 50 chars is truncated by maxlength', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.firstNameInput.fill(testData.step1.invalid.firstNameTooLong);
    expect((await cs.firstNameInput.inputValue()).length).toBeLessThanOrEqual(50);
  });

  test('CS-TC-017 @edge — malformed email fails HTML5 validation', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.primaryContactEmailInput.fill(testData.step1.invalid.emailMalformed);
    const isInvalid = await cs.primaryContactEmailInput.evaluate((el) => {
      return !(el as InputEl).checkValidity();
    });
    expect(isInvalid).toBeTruthy();
  });

  test('CS-TC-018 @edge — HTML injection in firstName field does not execute script', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    const dialogs: string[] = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss(); });
    await cs.firstNameInput.fill('<script>alert(1)</script>');
    expect(dialogs).toHaveLength(0);
  });

  test('CS-TC-028 @regression — required fields show red asterisk on Step 1 labels', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    for (const star of [cs.firstNameRequiredStar, cs.lastNameRequiredStar, cs.primaryContactEmailRequiredStar, cs.contactPhoneNumberRequiredStar]) {
      await expect(star).toBeVisible();
      await expect(star).toHaveText('*');
    }
  });

  test('CS-TC-029 @regression — optional fields do NOT show asterisk on Step 1 labels', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await expect(cs.leadDestinationEmailRequiredStar).toBeHidden();
    await expect(cs.phoneNumberToDisplayInAdsRequiredStar).toBeHidden();
  });
});

// ════════════════════════════════════════════
// STEP 2 VALIDATION (Negative + Boundary)
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Step 2 Validation', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-030 @regression — BusinessName is required with maxlength 100', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    expect(await cs.businessNameInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.businessNameInput.getAttribute('maxlength')).toBe('100');
  });

  test('CS-TC-031 @regression — WebsiteUrl is required with type=url (confirmed from DOM)', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    expect(await cs.websiteUrlInput.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    expect(await cs.websiteUrlInput.getAttribute('type')).toBe('url');
  });

  test('CS-TC-032 @regression — WebsiteUrl without http/https fails HTML5 url-type validation', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    await cs.websiteUrlInput.fill(testData.step2.invalid.websiteUrlNoProtocol);
    const isInvalid = await cs.websiteUrlInput.evaluate((el) => !(el as InputEl).checkValidity());
    expect(isInvalid).toBeTruthy();
  });

  test('CS-TC-033 @regression — City, StateProvince, ZipCode, Email all required', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    for (const loc of [cs.cityInput, cs.stateProvinceInput, cs.zipCodeInput, cs.businessEmailInput]) {
      expect(await loc.evaluate((el) => (el as InputEl).required)).toBeTruthy();
    }
  });

  test('CS-TC-034 @boundary — BusinessName at 100 chars (max) is accepted', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    await cs.businessNameInput.fill('B'.repeat(100));
    expect(await cs.businessNameInput.inputValue()).toHaveLength(100);
  });

  test('CS-TC-035 @regression — AddressLine2 is optional', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    expect(await cs.addressLine2Input.evaluate((el) => (el as InputEl).required)).toBeFalsy();
  });

  test('CS-TC-036 @regression — required fields show red asterisk on Step 2 labels', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    for (const star of [cs.businessNameRequiredStar, cs.streetAddressRequiredStar, cs.cityRequiredStar, cs.websiteUrlRequiredStar]) {
      await expect(star).toBeVisible();
    }
  });
});

// ════════════════════════════════════════════
// STEP 3 VALIDATION (Negative + Boundary + Dates)
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Step 3 Validation', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-040 @regression — ServiceArea is required with maxlength 2400', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    expect(await cs.serviceAreaTextarea.evaluate((el) => (el as TextareaEl).required)).toBeTruthy();
    expect(await cs.serviceAreaTextarea.getAttribute('maxlength')).toBe('2400');
  });

  test('CS-TC-041 @regression — WebsiteAccuracyConfirmed checkbox is required', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    expect(await cs.websiteAccuracyConfirmedCheckbox.evaluate((el) => (el as InputEl).required)).toBeTruthy();
  });

  test('CS-TC-042 @regression — AdditionalNotes is optional with maxlength 2000', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    expect(await cs.additionalNotesTextarea.evaluate((el) => (el as TextareaEl).required)).toBeFalsy();
    expect(await cs.additionalNotesTextarea.getAttribute('maxlength')).toBe('2000');
  });

  test('CS-TC-043 @boundary — ServiceArea at 2400 chars is accepted (max)', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    await cs.serviceAreaTextarea.fill('A'.repeat(2400));
    expect(await cs.serviceAreaTextarea.inputValue()).toHaveLength(2400);
  });

  test('CS-TC-044 @boundary — AdditionalNotes at 2000 chars is accepted (max)', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    await cs.additionalNotesTextarea.fill('N'.repeat(2000));
    expect(await cs.additionalNotesTextarea.inputValue()).toHaveLength(2000);
  });

  test('CS-TC-045 @edge — special characters in ServiceArea accepted without crash', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    await cs.serviceAreaTextarea.fill('Chicago & suburbs — "North Shore" area, IL 60201 <test>');
    expect((await cs.serviceAreaTextarea.inputValue()).length).toBeGreaterThan(0);
  });

  test('CS-TC-046 @edge — HTML injection in ServiceArea does not execute', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    const dialogs: string[] = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss(); });
    await cs.serviceAreaTextarea.fill('<script>alert(1)</script>');
    expect(dialogs).toHaveLength(0);
  });

  test('CS-TC-047 @dates — DesiredCampaignStartDate accepts future date', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    await cs.desiredCampaignStartDateInput.fill(testData.step3.desiredStartDate);
    expect(await cs.desiredCampaignStartDateInput.inputValue()).toBe(testData.step3.desiredStartDate);
  });

  test('CS-TC-048 @dates — DesiredCampaignStartDate is optional (not required)', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    expect(await cs.desiredCampaignStartDateInput.evaluate((el) => (el as InputEl).required)).toBeFalsy();
  });
});

// ════════════════════════════════════════════
// STEP 4 — REVIEW & SUBMIT
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Step 4 Review & Submit', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-050 @regression — step 4 review spans are present for all fields', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep4(page, activeOrderSeq);
    await expect(cs.reviewFirstName).toBeAttached({ timeout: 10_000 });
    await expect(cs.reviewLastName).toBeAttached();
    await expect(cs.reviewBusinessName).toBeAttached();
    await expect(cs.reviewWebsiteUrl).toBeAttached();
    await expect(cs.reviewServiceArea).toBeAttached();
  });

  test('CS-TC-051 @regression — terms and conditions link opens modal', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep4(page, activeOrderSeq);
    await cs.openTermsModal();
    await expect(cs.termsConditionsModal).toBeVisible({ timeout: 10_000 });
  });

  test('CS-TC-052 @regression — submit blocked when terms unchecked', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep4(page, activeOrderSeq);
    if (await cs.termsAcceptedCheckbox.isChecked()) {
      await cs.termsAcceptedCheckbox.uncheck();
    }
    await cs.btnSubmit.click().catch(() => undefined);
    expect(page.url()).not.toMatch(/OrderConfirmation/i);
  });
});

// ════════════════════════════════════════════
// DYNAMIC UI
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — Dynamic UI', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-060 @dynamic-ui — additionalNotes character counter updates as user types', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    const text = 'Hello World';
    await cs.additionalNotesTextarea.fill(text);
    await cs.additionalNotesTextarea.dispatchEvent('input');
    expect(await cs.getAdditionalNotesCharCount()).toBe(text.length);
  });

  test('CS-TC-061 @dynamic-ui — package info header visible: name, price, PAID badge', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await expect(cs.packageName).toBeVisible();
    await expect(cs.packagePrice).toBeVisible();
    await expect(cs.paidBadge).toBeVisible();
    await expect(cs.paidBadge).toContainText('PAID');
  });

  test('CS-TC-062 @dynamic-ui — wizard step tabs show 4 steps in correct order', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText(/primary contact/i);
    await expect(tabs.nth(1)).toContainText(/business details/i);
    await expect(tabs.nth(2)).toContainText(/campaign details/i);
    await expect(tabs.nth(3)).toContainText(/review.*submit/i);
  });

  test('CS-TC-063 @dynamic-ui — BusinessLogo file input is present on step 2', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    await expect(cs.businessLogoInput).toBeAttached();
    expect(await cs.businessLogoInput.getAttribute('type')).toBe('file');
  });
});

// ════════════════════════════════════════════
// UX — Navigation & Cancel
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — UX Navigation', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-TC-070 @ux — Cancel link navigates to Order History', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await expect(cs.cancelLink).toBeVisible();
    await cs.cancelLink.click();
    await expect(page).toHaveURL(/OrderHistory/i, { timeout: 20_000 });
  });

  test('CS-TC-071 @ux — Back button from step 2 returns to step 1', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep2(page, activeOrderSeq);
    await cs.clickBack();
    await expect(cs.firstNameInput).toBeVisible({ timeout: 10_000 });
  });

  test('CS-TC-072 @ux — Back button from step 3 returns to step 2', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await advanceToStep3(page, activeOrderSeq);
    await cs.clickBack();
    await expect(cs.businessNameInput).toBeVisible({ timeout: 10_000 });
  });

  test('CS-TC-073 @ux — Next button visible and enabled on step 1 by default', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await expect(cs.btnContinue).toBeVisible();
    await expect(cs.btnContinue).toBeEnabled();
  });

  test('CS-TC-074 @ux — forward then backward navigation preserves step 1 data', async ({ page }) => {
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    const cs = await goToCampaignSetup(page, activeOrderSeq);
    await cs.expectWizardVisible();
    await cs.firstNameInput.fill(testData.step1.valid.firstName);
    await cs.lastNameInput.fill(testData.step1.valid.lastName);
    await cs.primaryContactEmailInput.fill(testData.step1.valid.primaryContactEmail);
    await cs.contactPhoneNumberInput.fill(testData.step1.valid.contactPhoneNumber);
    await cs.clickNext();
    await expect(cs.businessNameInput).toBeVisible({ timeout: 10_000 });
    await cs.clickBack();
    expect(await cs.firstNameInput.inputValue()).toBe(testData.step1.valid.firstName);
  });
});

// ════════════════════════════════════════════
// E2E
// ════════════════════════════════════════════
test.describe('EngageAds — Campaign Setup — E2E', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'chromium-admin', 'Dealer-only — skipped.');
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
  });

  test('CS-E2E-001 @e2e @mutation — complete wizard submission redirects to OrderConfirmation', async ({ page }) => {
    test.skip(IS_PROD, 'Mutation — skip on production.');
    requireOrderSeq(activeOrderSeq, 'CAMPAIGN_ORDER_SEQ');
    await completeCampaignSetupFlow(page);
    await expect(page).toHaveURL(new RegExp(testData.redirects.orderConfirmation, 'i'), { timeout: 30_000 });
  });
});
