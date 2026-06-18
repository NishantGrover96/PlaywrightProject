/**
 * EngageAds — View Package — Spec File
 * Module: engage-ads | Feature: view-package
 * Generated: 2026-06-18 | Pipeline: Step 3 (Playwright Test Generation)
 *
 * Catalog reference:
 *   docs/functional-catalogs/engage-ads/feature-view-package/test-catalog.md
 *   docs/functional-catalogs/engage-ads/feature-view-package/smoke-suite.md
 *   docs/functional-catalogs/engage-ads/feature-view-package/regression-suite.md
 *   docs/functional-catalogs/engage-ads/feature-view-package/e2e-suite.md
 *
 * Run tags:
 *   @smoke      — critical-path, fast, safe for non-mutating coverage
 *   @regression — full functional coverage
 *   @e2e        — end-to-end flows
 *   @mutation   — creates/modifies downstream records
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
const ADMIN_AUTH_FILE = path.resolve(__dirname, '../../../fixtures/.auth/admin.json');
const ADMIN_AUTH_MISSING = !existsSync(ADMIN_AUTH_FILE);

function parseCurrency(value: string): number {
  const numeric = value.replace(/[^0-9.-]/g, '');
  return Number.parseFloat(numeric || '0');
}

async function createContextPage(browser: Browser, storageState?: string): Promise<Page> {
  const context = await browser.newContext({
    baseURL: BASE_URL,
    storageState,
  });

  return await context.newPage();
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

    return {
      status: response.status,
      bodyText: await response.text(),
    };
  }, { requestUrl: url, requestForm: form });
}

function parseHandlerResponse(result: BrowserFetchResult): HandlerResponse {
  return JSON.parse(result.bodyText) as HandlerResponse;
}

async function buildStripePayload(viewPackage: ViewPackagePage, packageSeq: string, overrides: Record<string, string> = {}): Promise<Record<string, string>> {
  return {
    packageSeq,
    cardAmount: await viewPackage.getCardAmountValue(),
    coopAmount: await viewPackage.getCoopAmountValue(),
    totalAmount: await viewPackage.getOrderTotalWithFee(),
    transactionFee: await viewPackage.getTransactionFeeValue(),
    baseCardAmount: await viewPackage.getBaseCardAmountValue(),
    budgetAllocations: '[]',
    email: '',
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// SMOKE
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Smoke', () => {
  test('ENGAGEADS-TC-001 @smoke — Dealer page load shows wizard and package catalog', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    await viewPackage.expectWizardVisible();
    await viewPackage.expectPackagesVisible();
    await expect(page).toHaveURL(new RegExp(testData.featureUrl.replace(/\//g, '\\/'), 'i'));
    await expect(viewPackage.noPackageMessage).toBeHidden();
  });

  test('ENGAGEADS-TC-003 @smoke — Dealer sees eligible packages and no empty state in UAT', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const packageCount = await viewPackage.getPackageCount();
    const totalBudget = await viewPackage.getTotalBudget();

    expect(packageCount).toBeGreaterThanOrEqual(7);
    expect(Number.parseFloat(totalBudget)).toBeCloseTo(testData.budget.availableUAT, 2);
    await expect(viewPackage.noPackageMessage).toBeHidden();
  });

  test('ENGAGEADS-TC-005 @smoke — Selecting a standard package renders Step 2 payment summary', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page, testData.packages.knownStandard.name);
    await viewPackage.expectStep2Active();
    expect(Number.parseFloat(await viewPackage.getTotalPlanCost())).toBeCloseTo(testData.packages.knownStandard.price, 2);
    expect(await viewPackage.getPaymentCheckoutText()).toContain('Total Plan Cost');
    expect(await viewPackage.getQuoteBoxText()).toContain(testData.expectedMessages.packageInactive);
  });

  test('ENGAGEADS-TC-006 @smoke — Accepting Terms enables payment and co-op interactions', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page, testData.packages.knownStandard.name);
    await viewPackage.expectPaymentButtonDisabled();
    await viewPackage.expectTermsErrorVisible();
    await viewPackage.acceptTerms();
    await viewPackage.expectPaymentButtonEnabled();
    await expect(viewPackage.coopFundsCheckbox).toBeEnabled();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// DISPLAY & UI
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Display & UI', () => {
  test('ENGAGEADS-TC-012 @regression — Custom package card shows Talk To An Expert only', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const customCard = viewPackage.getPackageCardByName(testData.packages.knownCustom.name);
    await expect(customCard).toBeVisible();
    await expect(viewPackage.getTalkToExpertButtonForPackage(testData.packages.knownCustom.name)).toBeVisible();
    await expect(viewPackage.getSelectPackageButtonForPackage(testData.packages.knownCustom.name)).toBeHidden();
  });

  test('ENGAGEADS-TC-013 @regression — Standard package card shows View Details and Select Package', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    const standardCard = viewPackage.getPackageCardByName(testData.packages.knownStandard.name);
    await expect(standardCard).toBeVisible();
    await expect(standardCard).toContainText(String(testData.packages.knownStandard.price));
    await expect(viewPackage.getViewDetailsLinkForPackage(testData.packages.knownStandard.name)).toBeVisible();
    await expect(viewPackage.getSelectPackageButtonForPackage(testData.packages.knownStandard.name)).toBeVisible();
  });

  test('ENGAGEADS-TC-014 @regression — View Details navigates to the package detail page', async ({ page }) => {
    const viewPackage = await goToViewPackage(page);
    await viewPackage.openViewDetailsByName(testData.packages.knownStandard.name);
    await viewPackage.expectDetailPage(testData.packages.knownStandard.name, testData.packages.knownStandard.price);
  });

  test('ENGAGEADS-TC-015 @regression — Package and budget identifiers remain encrypted in client markup', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page, testData.packages.knownStandard.name);
    const packageSeq = await viewPackage.getPackageSeqByName(testData.packages.knownStandard.name);
    const detailHref = await viewPackage.getViewDetailsHrefByName(testData.packages.knownStandard.name);
    const budgetValues = (await viewPackage.getBudgetOptionValues()).filter((value) => value.trim().length > 0);

    expect(packageSeq.length).toBeGreaterThan(6);
    expect(/^\d+$/.test(packageSeq)).toBe(false);
    expect(detailHref).toContain(packageSeq);
    for (const value of budgetValues) {
      expect(/^\d+$/.test(value), `Budget option should be encrypted: ${value}`).toBe(false);
    }
  });

  test('ENGAGEADS-TC-016 @regression — Deep-link packageSeq auto-selects the matching package', async ({ page }) => {
    const bootstrapPage = await goToViewPackage(page);
    const packageSeq = await bootstrapPage.getPackageSeqByName(testData.packages.knownStandard.name);

    await bootstrapPage.navigateWithPackage(packageSeq);
    await bootstrapPage.expectStep2Active();
    expect(await bootstrapPage.getPaymentCheckoutText()).toContain(testData.packages.knownStandard.name);
  });

  test('ENGAGEADS-TC-021 @regression — Include Co-op Funds reveals the allocation controls', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.coopFundsCheckbox.check();
    await expect(viewPackage.budgetTypesSection).toBeVisible();
    await expect(viewPackage.ddlBudgetTypeNames).toBeEnabled();
    await expect(viewPackage.txtCoopPercentage).toBeEnabled();
    await expect(viewPackage.btnAddCoop).toBeEnabled();
  });

  test('ENGAGEADS-TC-040 @regression @mutation — Expert modal loads dropdown data and submits successfully', async ({ page }) => {
    test.skip(IS_PROD, 'Creates inquiry record — dev/testing/UAT only.');
    const viewPackage = await openExpertModalForCustomPackage(page);
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

  test('ENGAGEADS-TC-042 @regression — Cancel Plan returns the user from Step 2 to the package catalog', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.cancelPackageSelection();
    await viewPackage.expectWizardVisible();
  });

  test('ENGAGEADS-TC-043 @regression — Payment summary displays inactive-until-paid messaging', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page);
    const quoteBoxText = await viewPackage.getQuoteBoxText();
    expect(quoteBoxText).toContain('will not be activated');
    expect(quoteBoxText.toLowerCase()).toContain('email');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Validation', () => {
  test('ENGAGEADS-TC-018 @regression — Unchecked Terms keeps payment disabled and shows the exact inline error', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.expectPaymentButtonDisabled();
    await viewPackage.expectTermsErrorVisible();
    expect(await viewPackage.getTermsErrorText()).toBe('Please accept the Terms and Conditions to continue.');
  });

  test('ENGAGEADS-TC-019 @regression — Checking Terms enables payment and hides the error label', async ({ page }) => {
    const viewPackage = await selectPackageAndGoToStep2(page);
    await viewPackage.acceptTerms();
    await viewPackage.expectPaymentButtonEnabled();
    await expect(viewPackage.termsError).toBeHidden();
    await expect(viewPackage.coopFundsCheckbox).toBeEnabled();
  });

  test('ENGAGEADS-TC-022 @regression — Missing budget type or invalid amount shows the shared co-op validation error', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.coopFundsCheckbox.check();
    await viewPackage.btnAddCoop.click();
    await viewPackage.expectCoopError(testData.expectedErrors.coopNoSelection);

    await viewPackage.ddlBudgetTypeNames.selectOption({ index: 1 });
    await viewPackage.txtCoopPercentage.fill(testData.coop.zero);
    await viewPackage.btnAddCoop.click();
    await viewPackage.expectCoopError(testData.expectedErrors.coopNoSelection);
  });

  test('ENGAGEADS-TC-023 @regression — Non-numeric co-op input is sanitized to numeric-only format', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.coopFundsCheckbox.check();
    await viewPackage.txtCoopPercentage.fill('abc12.345x');
    await viewPackage.txtCoopPercentage.blur();
    const sanitizedValue = await viewPackage.getCoopInputValue();
    expect(sanitizedValue).toMatch(/^\d*(\.\d{0,2})?$/);
  });

  test('ENGAGEADS-TC-024 @regression — Co-op amount over available product balance shows the exact balance error', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.applyCoop(1, testData.coop.exceedsPackage);
    await viewPackage.expectCoopError(testData.expectedErrors.coopExceedsProductBudget);
  });

  test('ENGAGEADS-TC-025 @regression — Single co-op amount over the package cost shows the package-cost cap error', async ({ page }) => {
    test.fixme(true, 'Requires a budget line with available balance greater than the package price; current UAT dealer balance cannot reach this validation branch.');
  });

  test('ENGAGEADS-TC-036 @regression — Expert modal requires Business Goal before submit', async ({ page }) => {
    const viewPackage = await openExpertModalForCustomPackage(page);
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

// ──────────────────────────────────────────────────────────────────────────────
// CO-OP VALIDATION
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Co-op Validation', () => {
  test('ENGAGEADS-TC-020 @regression — Co-op option is hidden when available budget is zero', async ({ page }) => {
    test.fixme(true, 'Requires a zero-budget dealer fixture or stubbed budget response.');
  });

  test('ENGAGEADS-TC-026 @regression — Cumulative co-op total over package cost shows the same cap error', async ({ page }) => {
    test.fixme(true, 'Requires dealer data with combined budget capacity above the package price; current UAT balance cannot reach this branch.');
  });

  test('ENGAGEADS-TC-027 @regression — Duplicate product code shows the duplicate-allocation error', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.expectCoopError(testData.expectedErrors.coopDuplicate);
  });

  test('ENGAGEADS-TC-028 @regression — Valid single co-op allocation recalculates totals and remaining card amount', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const beforeCoop = parseCurrency(await viewPackage.getTotalCoopAmountText());
    const beforeRemaining = parseCurrency(await viewPackage.getRemainingBalanceText());
    const beforeFee = parseCurrency(await viewPackage.getTransactionFeeText());

    await viewPackage.applyCoop(1, testData.coop.validAmount);

    expect(parseCurrency(await viewPackage.getTotalCoopAmountText())).toBeGreaterThan(beforeCoop);
    expect(parseCurrency(await viewPackage.getRemainingBalanceText())).toBeLessThan(beforeRemaining);
    expect(parseCurrency(await viewPackage.getTransactionFeeText())).toBeLessThanOrEqual(beforeFee);
  });

  test('ENGAGEADS-TC-029 @regression — Multiple distinct co-op allocations produce split-payment state', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const optionValues = await viewPackage.getBudgetOptionValues();
    test.skip(optionValues.length < 2, 'Requires at least two selectable budget lines.');

    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(2, '50');

    expect(await viewPackage.getCoopRowCount()).toBeGreaterThanOrEqual(2);
    await viewPackage.expectSplitPaymentMessage();
    await viewPackage.expectPaymentButtonEnabled();
  });

  test('ENGAGEADS-TC-030 @regression — Editing or deleting co-op rows recalculates the payment summary', async ({ page }) => {
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

  test('ENGAGEADS-TC-031 @regression — Full co-op coverage zeroes card charge and hides fee rows', async ({ page }) => {
    test.fixme(true, 'Requires dealer fixture with co-op budget that fully covers a package; current UAT balance is below the lowest standard package price.');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT ROUTING
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Payment Routing', () => {
  test('ENGAGEADS-TC-034 @regression @mutation — Card or split-payment flow posts CreateStripeSession and redirects to /EngageAds/Payment', async ({ page }) => {
    test.skip(IS_PROD, 'Creates checkout session — dev/testing/UAT only.');
    const viewPackage = await selectPackageAndAcceptTerms(page);

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('CreateStripeSession') && response.request().method() === 'POST',
    );

    await viewPackage.proceedToPayment();
    const response = await responsePromise;
    const body = (await response.json()) as HandlerResponse;

    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
    await expect(page).toHaveURL(new RegExp(testData.redirects.payment.replace(/\//g, '\\/'), 'i'));
  });

  test('ENGAGEADS-TC-035 @regression @mutation — Co-op-only flow posts CreatePayment and redirects to OrderConfirmation', async ({ page }) => {
    test.fixme(true, 'Requires dealer fixture with co-op budget that fully covers a package before checkout.');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// AUTHORIZATION
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Authorization', () => {
  test('ENGAGEADS-TC-002 @smoke — Unauthenticated user is redirected before page access', async ({ browser }) => {
    const anonymousPage = await createContextPage(browser);
    const viewPackage = new ViewPackagePage(anonymousPage);

    await anonymousPage.goto(viewPackage.url, { waitUntil: 'domcontentloaded' });
    await expect(anonymousPage).toHaveURL(/login|account/i);

    await anonymousPage.context().close();
  });

  test('ENGAGEADS-TC-004 @smoke — Admin view is browse-only with no purchase CTA', async ({ browser }) => {
    test.skip(ADMIN_AUTH_MISSING, 'Admin auth state is required for admin-role assertions.');
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
});

// ──────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — Error Handling', () => {
  test('ENGAGEADS-TC-010 @regression — Empty package response shows NoPackageAvailable state', async ({ page }) => {
    test.fixme(true, 'Requires package-catalog stubbing to force the empty-state branch.');
  });

  test('ENGAGEADS-TC-011 @regression — Custom-only catalog hides wizard payment actions', async ({ page }) => {
    test.fixme(true, 'Requires package-catalog stubbing to return only custom packages.');
  });

  test('ENGAGEADS-TC-017 @regression — Invalid package selection returns Package not found', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const validPackageSeq = await viewPackage.getSelectedPackageSeq();
    const payload = await buildStripePayload(viewPackage, validPackageSeq, { packageSeq: 'invalid-package-token' });
    const result = await postFormViaBrowser(page, `${testData.featureUrl}?handler=CreateStripeSession`, payload);
    const body = parseHandlerResponse(result);

    expect(result.status).toBe(200);
    expect(body.success).toBe(false);
    expect(body.message).toBe(testData.expectedErrors.packageNotFound);
  });

  test('ENGAGEADS-TC-032 @regression — Fee API failure uses fallback calculation and keeps checkout available', async ({ page }) => {
    test.fixme(true, 'Requires test-environment support to force the upstream fee API failure path.');
  });

  test('ENGAGEADS-TC-033 @regression — CreateStripeSession rejects a zero or negative card amount', async ({ page }) => {
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const packageSeq = await viewPackage.getSelectedPackageSeq();
    const payload = await buildStripePayload(viewPackage, packageSeq, {
      cardAmount: testData.coop.zero,
      baseCardAmount: testData.coop.zero,
      totalAmount: testData.coop.zero,
      transactionFee: testData.coop.zero,
    });
    const result = await postFormViaBrowser(page, `${testData.featureUrl}?handler=CreateStripeSession`, payload);
    const body = parseHandlerResponse(result);

    expect(result.status).toBe(200);
    expect(body.success).toBe(false);
    expect(body.message).toBe(testData.expectedErrors.cardAmountZero);
  });

  test('ENGAGEADS-TC-041 @regression — Stripe configuration failure degrades gracefully', async ({ page }) => {
    test.fixme(true, 'Requires test-environment stubbing to force Stripe configuration load failure on page load.');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// E2E
// ──────────────────────────────────────────────────────────────────────────────

test.describe('EngageAds — View Package — E2E', () => {
  test('ENGAGEADS-TC-E2E-001 @e2e @mutation — Dealer completes a full Stripe-funded purchase flow', async ({ page }) => {
    test.skip(IS_PROD, 'Creates checkout session — dev/testing/UAT only.');
    const viewPackage = await selectPackageAndAcceptTerms(page);

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('CreateStripeSession') && response.request().method() === 'POST',
    );

    await viewPackage.proceedToPayment();
    const response = await responsePromise;
    const body = (await response.json()) as HandlerResponse;

    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
    await expect(page).toHaveURL(new RegExp(testData.redirects.payment.replace(/\//g, '\\/'), 'i'));
  });

  test('ENGAGEADS-TC-E2E-002 @e2e @mutation — Dealer completes a full co-op-only checkout', async ({ page }) => {
    test.fixme(true, 'Requires dealer fixture with enough co-op balance to cover the selected package fully.');
  });

  test('ENGAGEADS-TC-E2E-003 @e2e @mutation — Dealer completes a split-payment checkout using co-op plus card', async ({ page }) => {
    test.skip(IS_PROD, 'Creates checkout session — dev/testing/UAT only.');
    const viewPackage = await selectPackageAndAcceptTerms(page);
    const optionValues = await viewPackage.getBudgetOptionValues();
    test.skip(optionValues.length < 2, 'Requires at least two selectable budget lines.');

    await viewPackage.applyCoop(1, testData.coop.validAmount);
    await viewPackage.applyCoop(2, '50');
    await viewPackage.expectSplitPaymentMessage();

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('CreateStripeSession') && response.request().method() === 'POST',
    );

    await viewPackage.proceedToPayment();
    const response = await responsePromise;
    const body = (await response.json()) as HandlerResponse;

    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
    await expect(page).toHaveURL(new RegExp(testData.redirects.payment.replace(/\//g, '\\/'), 'i'));
  });

  test('ENGAGEADS-TC-E2E-004 @e2e @mutation — Custom package inquiry is submitted successfully from the modal', async ({ page }) => {
    test.skip(IS_PROD, 'Creates inquiry record — dev/testing/UAT only.');
    const viewPackage = await openExpertModalForCustomPackage(page);

    await fillAndSubmitExpertForm(page, {
      businessGoalIndex: 1,
      stateIndex: 1,
      city: testData.expertForm.valid.city,
      monthlyBudget: testData.expertForm.valid.monthlyBudget,
      additionalNotes: testData.expertForm.valid.additionalNotes,
    });

    await viewPackage.expectConsultationSubmitted(testData.expectedMessages.consultationSubmitted);
  });

  test('ENGAGEADS-TC-E2E-005 @e2e @mutation — Deep-link package selection can complete checkout without manual Step 1 interaction', async ({ page }) => {
    test.skip(IS_PROD, 'Creates checkout session — dev/testing/UAT only.');
    const viewPackage = await goToViewPackage(page);
    const packageSeq = await viewPackage.getPackageSeqByName(testData.packages.knownStandard.name);

    await viewPackage.navigateWithPackage(packageSeq);
    await viewPackage.expectStep2Active();
    await viewPackage.acceptTerms();

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('CreateStripeSession') && response.request().method() === 'POST',
    );

    await viewPackage.proceedToPayment();
    const response = await responsePromise;
    const body = (await response.json()) as HandlerResponse;

    expect(body.success).toBeTruthy();
    expect(body.redirectUrl ?? '').toContain(testData.redirects.payment);
    await expect(page).toHaveURL(new RegExp(testData.redirects.payment.replace(/\//g, '\\/'), 'i'));
  });
});
