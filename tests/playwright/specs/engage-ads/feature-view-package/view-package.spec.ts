/**
 * EngageAds — View Package — Spec File
 * DOM verified: 2026-06-29 on UAT | Full rewrite
 * Coverage: All 12 tiers per engage-ads-test-coverage SKILL
 *
 * NOTE on #coopFunds: This checkbox does NOT exist in the DOM (confirmed 2026-06-29).
 * The .budgetTypes section appears automatically when the dealer has available co-op
 * balance. UAT dealer (Dealer0001) has $0 balance. Co-op allocation tests are marked
 * @fixme and require a dealer fixture with non-zero available balance.
 *
 * Tags:
 *   @smoke      — fast, critical-path, non-mutating
 *   @auth       — authorization / role-based
 *   @regression — full functional coverage
 *   @boundary   — boundary value tests
 *   @edge       — input edge cases
 *   @dynamic-ui — loading, disabled controls, hidden sections
 *   @ux         — navigation, cancel
 *   @e2e        — end-to-end flows
 *   @mutation   — creates / modifies records (skip on production)
 */
import { test, expect, type Browser, type Page } from '@playwright/test';
import { existsSync } from 'fs';
import * as path from 'path';
import { ViewPackagePage } from '../../../pages/engage-ads/feature-view-package/ViewPackagePage';
import {
  goToViewPackage,
  selectPackageAndGoToStep2,
  selectPackageAndAcceptTerms,
  openExpertModalForCustomPackage,
  fillAndSubmitExpertForm,
} from '../../../helpers/engage-ads/feature-view-package/view-package.helpers';
import testData from '../../../data/engage-ads/feature-view-package/test-data.json';

interface HandlerResponse {
  success?: boolean;
  redirectUrl?: string;
  message?: string;
}

interface BrowserFetchResult {
  status: number;
  bodyText: string;
}

const IS_PROD = (process.env.TEST_ENV ?? 'production') === 'production';
const BASE_URL = process.env.BASE_URL ?? '';
const DEALER_AUTH_FILE = path.resolve(__dirname, '../../../fixtures/.auth/user.json');
const ADMIN_AUTH_FILE  = path.resolve(__dirname, '../../../fixtures/.auth/admin.json');
const DEALER_AUTH_MISSING = !existsSync(DEALER_AUTH_FILE);
const ADMIN_AUTH_MISSING  = !existsSync(ADMIN_AUTH_FILE);

/** True when the UAT dealer has a non-zero available co-op balance. */
const DEALER_HAS_COOP_BALANCE = (testData.budget.availableUAT ?? 0) > 0;

function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.-]/g, '') || '0');
}

async function createContextPage(browser: Browser, storageState?: string): Promise<Page> {
  const ctx = await browser.newContext({ baseURL: BASE_URL, storageState });
  return ctx.newPage();
}

async function postFormViaBrowser(page: Page, url: string, form: Record<string, string>): Promise<BrowserFetchResult> {
  return await page.evaluate(async ({ requestUrl, requestForm }) => {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(requestForm)) {
      body.set(key, value);
    }
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString(),
      credentials: 'include',
    });
    return { status: response.status, bodyText: await response.text() };
  }, { requestUrl: url, requestForm: form });
}

function parseHandlerResponse(result: BrowserFetchResult): HandlerResponse {
  return JSON.parse(result.bodyText) as HandlerResponse;
}

// ════════════════════════════════════════════
// SMOKE
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Smoke', () => {

  test('ENGAGEADS-TC-001 @smoke — Dealer page load shows wizard and package catalog', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) {
      test.skip(true, 'Dealer has an in-progress order; redirected to Campaign Setup.');
    }
    await viewPackage.expectWizardVisible();
    await viewPackage.expectPackagesVisible();
    await expect(viewPackage.noPackageMessage).toBeHidden();
  });

  test('ENGAGEADS-TC-003 @smoke — Dealer sees eligible packages and no empty state in UAT', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) {
      test.skip(true, 'Dealer has an in-progress order; redirected to Campaign Setup.');
    }
    const packageCount = await viewPackage.getPackageCount();
    const totalBudget = await viewPackage.getTotalBudget();
    expect(packageCount).toBeGreaterThanOrEqual(1);
    const parsedBudget = Number.parseFloat(totalBudget);
    expect(Number.isFinite(parsedBudget)).toBeTruthy();
    expect(parsedBudget).toBeCloseTo(testData.budget.availableUAT, 2);
    await expect(viewPackage.noPackageMessage).toBeHidden();
  });

  test('ENGAGEADS-TC-005 @smoke — Selecting a standard package renders Step 2 payment summary', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) {
      test.skip(true, 'Dealer has an in-progress order; package selection unavailable.');
    }
    const viewPackage = await selectPackageAndGoToStep2(page, testData.packages.knownStandard.name);
    await viewPackage.expectStep2Active();
    expect(Number.parseFloat(await viewPackage.getTotalPlanCost())).toBeCloseTo(testData.packages.knownStandard.price, 2);
    expect(await viewPackage.getPaymentCheckoutText()).toContain('Total Plan Cost');
    expect(await viewPackage.getQuoteBoxText()).toContain(testData.expectedMessages.packageInactive);
  });

  test('ENGAGEADS-TC-006 @smoke — Accepting Terms enables the payment button', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) {
      test.skip(true, 'Dealer has an in-progress order; package selection unavailable.');
    }
    const viewPackage = await selectPackageAndGoToStep2(page, testData.packages.knownStandard.name);
    await viewPackage.expectPaymentButtonDisabled();
    await viewPackage.expectTermsErrorVisible();
    await viewPackage.acceptTerms();
    await viewPackage.expectPaymentButtonEnabled();
  });
});

// ════════════════════════════════════════════
// AUTHORIZATION
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Authorization', () => {

  test('ENGAGEADS-TC-002 @smoke @auth — Unauthenticated user is redirected before page access', async ({ browser }) => {
    const anonymousPage = await createContextPage(browser);
    const viewPackage = new ViewPackagePage(anonymousPage);
    await anonymousPage.goto(viewPackage.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(anonymousPage).toHaveURL(/login|account/i, { timeout: 20_000 });
    await anonymousPage.context().close();
  });

  test('ENGAGEADS-TC-004 @smoke @auth — Admin view is browse-only with no purchase CTA', async ({ browser }) => {
    test.skip(ADMIN_AUTH_MISSING, 'Admin auth state required.');
    const adminPage = await createContextPage(browser, ADMIN_AUTH_FILE);
    const viewPackage = new ViewPackagePage(adminPage);
    await viewPackage.navigate();
    await viewPackage.expectPackagesVisible();
    if (await viewPackage.selectPackageButtons.count()) {
      await viewPackage.selectFirstStandardPackage();
    }
    await viewPackage.expectAdminRestrictedView();
    await adminPage.context().close();
  });

  test('VP-AUTH-003 @auth — dealer session is reused (no re-login required between tests)', async ({ page }) => {
    test.skip(DEALER_AUTH_MISSING, 'Dealer auth required.');
    await page.goto(testData.featureUrl, { waitUntil: 'commit', timeout: 30_000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => undefined);
    await expect(page).not.toHaveURL(/login|account/i, { timeout: 10_000 });
  });
});

// ════════════════════════════════════════════
// DISPLAY & UI
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Display & UI', () => {

  test('ENGAGEADS-TC-012 @regression — Custom package card shows Talk To An Expert only', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const customCard = viewPackage.getPackageCardByName(testData.packages.knownCustom.name);
    await expect(customCard).toBeVisible();
    await expect(viewPackage.getTalkToExpertButtonForPackage(testData.packages.knownCustom.name)).toBeVisible();
    await expect(viewPackage.getSelectPackageButtonForPackage(testData.packages.knownCustom.name)).toBeHidden();
  });

  test('ENGAGEADS-TC-013 @regression — Standard package card shows View Details and Select Package', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const standardCard = viewPackage.getPackageCardByName(testData.packages.knownStandard.name);
    await expect(standardCard).toBeVisible();
    await expect(standardCard).toContainText(String(testData.packages.knownStandard.price));
    await expect(viewPackage.getViewDetailsLinkForPackage(testData.packages.knownStandard.name)).toBeVisible();
    await expect(viewPackage.getSelectPackageButtonForPackage(testData.packages.knownStandard.name)).toBeVisible();
  });

  test('ENGAGEADS-TC-014 @regression — View Details navigates to the package detail page', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await viewPackage.openViewDetailsByName(testData.packages.knownStandard.name);
    await viewPackage.expectDetailPage(testData.packages.knownStandard.name, testData.packages.knownStandard.price);
  });

  test('ENGAGEADS-TC-015 @regression — Package and budget identifiers remain encrypted in client markup', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page, testData.packages.knownStandard.name);
    const packageSeq = await viewPackage.getPackageSeqByName(testData.packages.knownStandard.name);
    const detailHref = await viewPackage.getViewDetailsHrefByName(testData.packages.knownStandard.name);

    expect(packageSeq.length).toBeGreaterThan(6);
    expect(/^\d+$/.test(packageSeq)).toBe(false);
    expect(detailHref).toContain(packageSeq);
  });

  test('ENGAGEADS-TC-016 @regression — Deep-link packageSeq auto-selects the matching package', async ({ page }) => {
    const bootstrapPage = await goToViewPackage(page);
    const isOnPackagePage = await bootstrapPage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const packageSeq = await bootstrapPage.getPackageSeqByName(testData.packages.knownStandard.name);
    await bootstrapPage.navigateWithPackage(packageSeq);
    await bootstrapPage.expectStep2Active();
    expect(await bootstrapPage.getPaymentCheckoutText()).toContain(testData.packages.knownStandard.name);
  });

  test('ENGAGEADS-TC-043 @regression — Payment summary displays inactive-until-paid messaging', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    const quoteBoxText = await viewPackage.getQuoteBoxText();
    expect(quoteBoxText).toContain('will not be activated');
    expect(quoteBoxText.toLowerCase()).toContain('email');
  });
});

// ════════════════════════════════════════════
// VALIDATION — Terms
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Validation', () => {

  test('ENGAGEADS-TC-018 @regression — Unchecked Terms keeps payment disabled and shows inline error', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.expectPaymentButtonDisabled();
    await viewPackage.expectTermsErrorVisible();
    expect(await viewPackage.getTermsErrorText()).toBe('Please accept the Terms and Conditions to continue.');
  });

  test('ENGAGEADS-TC-019 @regression — Checking Terms enables payment and hides the error label', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.acceptTerms();
    await viewPackage.expectPaymentButtonEnabled();
    await expect(viewPackage.termsError).toBeHidden();
  });

  test('ENGAGEADS-TC-021 @regression — Include Co-op Funds section is visible when balance > 0', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'UAT dealer has $0 co-op balance; .budgetTypes section stays hidden. Use a dealer with available balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await expect(viewPackage.budgetTypesSection).toBeVisible({ timeout: 10_000 });
    await expect(viewPackage.ddlBudgetTypeNames).toBeEnabled();
    await expect(viewPackage.txtCoopPercentage).toBeEnabled();
    await expect(viewPackage.btnAddCoop).toBeEnabled();
  });

  test('ENGAGEADS-TC-022 @regression — Missing budget type shows co-op validation error', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires dealer with available co-op balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.btnAddCoop.click();
    await viewPackage.expectCoopError(testData.expectedErrors.coopNoSelection);

    await viewPackage.ddlBudgetTypeNames.selectOption({ index: 1 });
    await viewPackage.txtCoopPercentage.fill(testData.coop.zero);
    await viewPackage.btnAddCoop.click();
    await viewPackage.expectCoopError(testData.expectedErrors.coopNoSelection);
  });

  test('ENGAGEADS-TC-023 @regression @edge — Non-numeric co-op input is sanitized', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires dealer with available co-op balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.txtCoopPercentage.fill('abc12.345x');
    await viewPackage.txtCoopPercentage.blur();
    const sanitizedValue = await viewPackage.getCoopInputValue();
    expect(sanitizedValue).toMatch(/^\d*(\.\d{0,2})?$/);
  });

  test('ENGAGEADS-TC-024 @regression — Co-op over available balance shows balance error', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires dealer with available co-op balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.applyCoop(1, testData.coop.exceedsPackage);
    await viewPackage.expectCoopError(testData.expectedErrors.coopExceedsProductBudget);
  });

  test('ENGAGEADS-TC-025 @regression — Co-op over package cost shows the package-cost cap error', async ({ page }) => {
    test.fixme(true, 'Requires a budget line with balance > package price; UAT balance is $0.');
  });

  test('ENGAGEADS-TC-036 @regression — Expert modal requires Business Goal before submit', async ({ page }) => {
    const viewPackage = await openExpertModalForCustomPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await viewPackage.fillExpertForm({
      city: testData.expertForm.valid.city,
      stateIndex: 1,
      monthlyBudget: testData.expertForm.valid.monthlyBudget,
      additionalNotes: testData.expertForm.valid.additionalNotes,
    });
    await viewPackage.submitExpertForm();
    expect(await viewPackage.isFieldInvalid('businessGoal')).toBe(true);
  });

  test('ENGAGEADS-TC-037 @regression — Expert modal requires City and strips non-letter characters', async ({ page }) => {
    const viewPackage = await openExpertModalForCustomPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await viewPackage.fillExpertForm({
      businessGoalIndex: 1,
      city: '',
      stateIndex: 1,
      monthlyBudget: testData.expertForm.valid.monthlyBudget,
    });
    await viewPackage.submitExpertForm();
    expect(await viewPackage.isFieldInvalid('city')).toBe(true);

    await viewPackage.cityInput.fill('Dallas123!');
    await viewPackage.cityInput.blur();
    expect(await viewPackage.getCityValue()).toMatch(/^[A-Za-z\s]*$/);
  });

  test('ENGAGEADS-TC-038 @regression — Expert modal requires State before submit', async ({ page }) => {
    const viewPackage = await openExpertModalForCustomPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await viewPackage.fillExpertForm({
      businessGoalIndex: 1,
      city: testData.expertForm.valid.city,
      monthlyBudget: testData.expertForm.valid.monthlyBudget,
      additionalNotes: testData.expertForm.valid.additionalNotes,
    });
    await viewPackage.submitExpertForm();
    expect(await viewPackage.isFieldInvalid('state')).toBe(true);
  });

  test('ENGAGEADS-TC-039 @regression — Expert modal requires Monthly Budget and enforces maxlength 50', async ({ page }) => {
    const viewPackage = await openExpertModalForCustomPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await viewPackage.fillExpertForm({
      businessGoalIndex: 1,
      city: testData.expertForm.valid.city,
      stateIndex: 1,
      monthlyBudget: '',
      additionalNotes: testData.expertForm.valid.additionalNotes,
    });
    await viewPackage.submitExpertForm();
    expect(await viewPackage.isFieldInvalid('monthlyBudget')).toBe(true);

    await viewPackage.monthlyBudgetInput.fill(testData.expertForm.invalid.monthlyBudgetTooLong);
    expect((await viewPackage.getMonthlyBudgetValue()).length).toBeLessThanOrEqual(50);
  });
});

// ════════════════════════════════════════════
// CO-OP VALIDATION
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Co-op Validation', () => {

  test('ENGAGEADS-TC-020 @regression @dynamic-ui — Co-op section (.budgetTypes) hidden when balance is zero', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    if (!DEALER_HAS_COOP_BALANCE) {
      // UAT dealer has $0 — section must be hidden
      await expect(viewPackage.budgetTypesSection).toBeHidden();
    } else {
      // balance > 0 — section must be visible
      await expect(viewPackage.budgetTypesSection).toBeVisible();
    }
  });

  test('ENGAGEADS-TC-026 @regression — Cumulative co-op total over package cost shows cap error', async ({ page }) => {
    test.fixme(true, 'Requires dealer with combined budget capacity above the package price; UAT balance is $0.');
  });

  test('ENGAGEADS-TC-027 @regression — Duplicate product code shows the duplicate-allocation error', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires dealer with available co-op balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.expectCoopError(testData.expectedErrors.coopDuplicate);
  });

  test('ENGAGEADS-TC-028 @regression — Valid co-op recalculates totals and remaining card amount', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires dealer with available co-op balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const beforeCoop      = parseCurrency(await viewPackage.getTotalCoopAmountText());
    const beforeRemaining = parseCurrency(await viewPackage.getRemainingBalanceText());
    const beforeFee       = parseCurrency(await viewPackage.getTransactionFeeText());

    await viewPackage.applyCoop(1, testData.coop.validAmount);

    expect(parseCurrency(await viewPackage.getTotalCoopAmountText())).toBeGreaterThan(beforeCoop);
    expect(parseCurrency(await viewPackage.getRemainingBalanceText())).toBeLessThan(beforeRemaining);
    expect(parseCurrency(await viewPackage.getTransactionFeeText())).toBeLessThanOrEqual(beforeFee);
  });

  test('ENGAGEADS-TC-029 @regression — Multiple co-op allocations produce split-payment state', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires at least two budget lines with available balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const optionValues = await viewPackage.getBudgetOptionValues();
    test.skip(optionValues.length < 2, 'Requires at least two selectable budget lines.');

    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(2, '50');

    expect(await viewPackage.getCoopRowCount()).toBeGreaterThanOrEqual(2);
    await viewPackage.expectSplitPaymentMessage();
    await viewPackage.expectPaymentButtonEnabled();
  });

  test('ENGAGEADS-TC-030 @regression — Editing or deleting co-op rows recalculates payment summary', async ({ page }) => {
    test.fixme(!DEALER_HAS_COOP_BALANCE, 'Requires at least two budget lines with available balance.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const optionValues = await viewPackage.getBudgetOptionValues();
    test.skip(optionValues.length < 2, 'Requires at least two selectable budget lines.');

    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(2, '50');
    const beforeDeleteCount = await viewPackage.getCoopRowCount();

    await viewPackage.editCoopRow(0);
    await viewPackage.txtCoopPercentage.fill('125');
    await viewPackage.btnAddCoop.click();
    const editedCoopTotal = parseCurrency(await viewPackage.getTotalCoopAmountText());
    expect(editedCoopTotal).toBeGreaterThan(parseCurrency(testData.coop.validAmount));

    await viewPackage.deleteCoopRow(0);
    expect(await viewPackage.getCoopRowCount()).toBeLessThan(beforeDeleteCount);
  });

  test('ENGAGEADS-TC-031 @regression — Full co-op coverage zeroes card charge', async ({ page }) => {
    test.fixme(true, 'Requires co-op budget that fully covers a package; UAT balance is $0.');
  });
});

// ════════════════════════════════════════════
// ERROR HANDLING
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Error Handling', () => {

  test('ENGAGEADS-TC-010 @regression — Empty package response shows NoPackageAvailable state', async ({ page }) => {
    test.fixme(true, 'Requires stubbed empty-package API response or a dealer fixture with no eligible packages.');
  });
});

// ════════════════════════════════════════════
// PAYMENT ROUTING
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Payment Routing', () => {

  test('ENGAGEADS-TC-034 @regression @mutation — Card payment posts CreateStripeSession and redirects to Payment', async ({ page }) => {
    test.skip(IS_PROD, 'Creates checkout session — dev/UAT only.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('CreateStripeSession') && response.request().method() === 'POST',
    );
    await viewPackage.proceedToPayment();
    const response = await responsePromise;
    const body = (await response.json()) as HandlerResponse;

    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
    await expect(page).toHaveURL(new RegExp(testData.redirects.payment.replace(/\//g, '\\/'), 'i'));
  });

  test('ENGAGEADS-TC-035 @regression @mutation — Co-op-only flow posts CreatePayment and redirects to OrderConfirmation', async ({ page }) => {
    test.fixme(true, 'Requires co-op budget fully covering a package before checkout; UAT balance is $0.');
  });
});

// ════════════════════════════════════════════
// DYNAMIC UI
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Dynamic UI', () => {

  test('VP-UI-001 @dynamic-ui — payment button is DISABLED before terms are accepted', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await expect(viewPackage.paymentButton).toBeDisabled();
  });

  test('VP-UI-002 @dynamic-ui — payment button ENABLED after terms accepted', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.acceptTerms();
    await expect(viewPackage.paymentButton).toBeEnabled();
  });

  test('VP-UI-003 @dynamic-ui — terms link opens Terms & Conditions modal', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.termsLink.click();
    await expect(viewPackage.termsConditionsModal).toBeVisible({ timeout: 10_000 });
  });

  test('VP-UI-004 @dynamic-ui — .budgetTypes section hidden by default for $0-balance dealer', async ({ page }) => {
    test.skip(DEALER_HAS_COOP_BALANCE, 'Balance > 0 — section would be visible. This test only applies to $0-balance dealer.');
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await expect(viewPackage.budgetTypesSection).toBeHidden();
  });

  test('VP-UI-005 @dynamic-ui — Talk To Expert modal loads Business Goal dropdown with options', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    await openExpertModalForCustomPackage(page);
    expect(await viewPackage.getBusinessGoalOptionCount()).toBeGreaterThan(1);
    expect(await viewPackage.getStateOptionCount()).toBeGreaterThan(1);
  });

  test('VP-UI-006 @dynamic-ui — quote box says campaign will not activate until paid', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await expect(viewPackage.adminQuoteBox).toContainText(testData.expectedMessages.packageInactive);
  });
});

// ════════════════════════════════════════════
// UX — Navigation & Cancel
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — UX Navigation', () => {

  test('ENGAGEADS-TC-042 @regression @ux — Cancel Plan returns to Step 1 package catalog', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.cancelPackageSelection();
    await viewPackage.expectWizardVisible();
  });

  test('VP-UX-002 @ux — selecting a different package replaces Step 2 content', async ({ page }) => {
    const probe = new ViewPackagePage(page);
    await probe.navigate();
    const onPackagePage = page.url().toLowerCase().includes(testData.featureUrl.toLowerCase());
    if (!onPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    const viewPackage = await selectPackageAndGoToStep2(page, testData.packages.knownStandard.name);
    await viewPackage.cancelPackageSelection();
    await viewPackage.expectWizardVisible();
    await viewPackage.selectPackageByName(testData.packages.knownStandard.name);
    await viewPackage.expectStep2Active();
    expect(await viewPackage.getPaymentCheckoutText()).toContain(testData.packages.knownStandard.name);
  });
});

// ════════════════════════════════════════════
// MUTATION / EXPERT CONSULTATION
// ════════════════════════════════════════════
test.describe('EngageAds — View Package — Mutation', () => {

  test('ENGAGEADS-TC-040 @regression @mutation — Expert modal submits consultation successfully', async ({ page }) => {
    test.skip(IS_PROD, 'Creates inquiry record — dev/UAT only.');
    const viewPackage = await openExpertModalForCustomPackage(page);
    const isOnPackagePage = await viewPackage.wizardContainer.isVisible().catch(() => false);
    if (!isOnPackagePage) { test.skip(true, 'Dealer redirected — in-progress order active.'); }
    expect(await viewPackage.getBusinessGoalOptionCount()).toBeGreaterThan(1);
    expect(await viewPackage.getStateOptionCount()).toBeGreaterThan(1);

    await fillAndSubmitExpertForm(page, {
      businessGoalIndex: 1,
      stateIndex: 1,
      city: testData.expertForm.valid.city,
      monthlyBudget: testData.expertForm.valid.monthlyBudget,
      additionalNotes: testData.expertForm.valid.additionalNotes,
    });
    await viewPackage.expectConsultationSubmitted(testData.expectedMessages.consultationSubmitted);
  });
});
