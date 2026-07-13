/**
 * ViewPackagePage.ts - EngageAds BundledAdPackages Page Object
 * DOM verified: 2026-06-29 on https://demoportaluat.channel-fusion.com/EngageAds/BundledAdPackages
 *
 * Locator Validation Report
 * | Locator                          | HTML element matched              | Why chosen                       | Stable |
 * |----------------------------------|-----------------------------------|----------------------------------|--------|
 * | .commonWizard                    | div.commonWizard                  | Unique wizard shell class        | High   |
 * | .card                            | div.card (each package card)      | Confirmed class on package cards | High   |
 * | .cardBadge                       | span.cardBadge[packageseq]        | Package name + seq attribute     | High   |
 * | button.selectPackage             | button.btnFill.selectPackage      | Confirmed class from DOM         | High   |
 * | a.btnBordered[href*="Detail"]     | a with View Details href          | Href+class stable selector       | High   |
 * | .talkToExpertBtn                 | a.btnBordered.talkToExpertBtn     | Confirmed class                  | High   |
 * | #termsAndConditions              | input[type=checkbox]              | Confirmed ID from DOM            | High   |
 * | #lblTermsAndConditions           | label.field-validation-error      | Confirmed ID from DOM            | High   |
 * | a.termsLink                      | a.termsLink                       | Confirmed class from DOM         | High   |
 * | button.btnCancelPlan             | button.btnBordered.btnCancelPlan  | Confirmed class from DOM         | High   |
 * | button.btnPayment                | button.btnFill.btnPayment         | Confirmed class from DOM         | High   |
 * | .budgetTypes                     | div.budgetTypes                   | Confirmed class from DOM         | High   |
 * | .dvWithCoop .availableFunds      | div with available balance row    | Stable class chain               | High   |
 * | #ddlBudgetTypeNames              | select#ddlBudgetTypeNames         | Confirmed ID from DOM            | High   |
 * | #txtCoopPercentage               | input#txtCoopPercentage           | Confirmed ID from DOM            | High   |
 * | #btnAddCoop                      | input[type=button]#btnAddCoop     | Confirmed ID from DOM            | High   |
 * | .spnTotalCoopAmount etc.         | span.spnTotalCoopAmount           | Confirmed classes from DOM       | High   |
 * | .quoteBox                        | div.quoteBox                      | Confirmed class from DOM         | High   |
 * | .paymentCheckout                 | div.paymentCheckout               | Confirmed class from DOM         | High   |
 * | #talkToExpertModal               | div#talkToExpertModal.modal.fade  | Confirmed ID from DOM            | High   |
 * | #termsConditionsModal            | div#termsConditionsModal.modal    | Confirmed ID from DOM            | High   |
 * | #businessGoal                    | select#businessGoal in expert     | Confirmed ID from DOM            | High   |
 * | #txtCity                         | input#txtCity in expert modal     | Confirmed ID from DOM            | High   |
 * | #ddlState                        | select#ddlState in expert modal   | Confirmed ID from DOM            | High   |
 * | #submitExpertConsultation        | button ("Request Consultation")   | Confirmed ID from DOM            | High   |
 * | #coopFunds                       | NOT IN DOM - REMOVED              | No such ID exists on UAT         | N/A    |
 */
import { expect, type Locator, type Page } from '@playwright/test';

export interface ExpertFormData {
  city: string;
  monthlyBudget: string;
  businessGoalIndex?: number;
  stateIndex?: number;
  additionalNotes?: string;
}

export class ViewPackagePage {
  readonly page: Page;
  readonly url = '/EngageAds/BundledAdPackages';

  readonly packageCards: Locator;
  readonly selectPackageButtons: Locator;
  readonly viewDetailsLinks: Locator;
  readonly talkToExpertButtons: Locator;
  readonly hdnTotalBudget: Locator;
  readonly hdnIsAdminOrCFAdmin: Locator;
  readonly hdnStripeEnabled: Locator;
  readonly hdnTotalPlanCost: Locator;
  readonly hdnOrderTotalWithFee: Locator;
  readonly hdnTransactionFee: Locator;
  readonly hdnCardAmount: Locator;
  readonly hdnCoopAmount: Locator;
  readonly hdnBaseCardAmount: Locator;
  readonly termsCheckbox: Locator;
  readonly termsError: Locator;
  readonly paymentButton: Locator;
  readonly cancelPlanButton: Locator;
  // Co-op section
  // NOTE: #coopFunds checkbox does NOT exist in DOM (confirmed 2026-06-29).
  // The .budgetTypes row is always present but hidden via style="display:none".
  // It becomes visible only when the dealer has available co-op balance (> $0).
  // Tests that interact with co-op allocation require a dealer with available funds.
  readonly coopFundsAvailableBalance: Locator;  // .dvWithCoop .availableFunds .costValue
  readonly budgetTypesSection: Locator;          // .budgetTypes (shown when balance > 0)
  readonly ddlBudgetTypeNames: Locator;
  readonly txtCoopPercentage: Locator;
  readonly btnAddCoop: Locator;
  readonly coopErrorMsg: Locator;
  readonly spnTotalCoopAmount: Locator;
  readonly spnRemainingBalance: Locator;
  readonly spnTransactionFee: Locator;
  readonly spnCardChargeTotal: Locator;
  readonly spnOrderTotalWithFee: Locator;
  readonly noPackageMessage: Locator;
  readonly wizardContainer: Locator;
  readonly talkToExpertModal: Locator;
  readonly businessGoalSelect: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly monthlyBudgetInput: Locator;
  readonly additionalNotesInput: Locator;
  readonly submitExpertConsultation: Locator;
  readonly termsConditionsModal: Locator;
  readonly termsLink: Locator;
  readonly splitPaymentMsg: Locator;
  readonly adminQuoteBox: Locator;
  readonly paymentCheckoutSection: Locator;

  readonly heading: Locator;
  readonly packageBadges: Locator;
  readonly budgetAllocationRows: Locator;
  readonly budgetEditButtons: Locator;
  readonly budgetDeleteButtons: Locator;
  readonly selectedPackageSeq: Locator;
  readonly availableBudgetHidden: Locator;
  readonly quoteText: Locator;
  readonly successToast: Locator;
  readonly detailHeading: Locator;
  readonly detailProceedToCheckout: Locator;
  readonly detailBackLink: Locator;
  readonly detailPriceHero: Locator;
  readonly cookieAcceptButton: Locator;
  readonly skipButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    this.packageCards = page.locator('.card');
    this.selectPackageButtons = page.locator('.selectPackage');
    this.viewDetailsLinks = page.locator('a.btnBordered[href*="Detail"]');
    this.talkToExpertButtons = page.locator('.talkToExpertBtn');
    this.hdnTotalBudget = page.locator('#hdnTotalBudget');
    this.hdnIsAdminOrCFAdmin = page.locator('#hdnIsAdminOrCFAdmin');
    this.hdnStripeEnabled = page.locator('#hdnStripeEnabled');
    this.hdnTotalPlanCost = page.locator('#hdnTotalPlanCost');
    this.hdnOrderTotalWithFee = page.locator('#hdnOrderTotalWithFee');
    this.hdnTransactionFee = page.locator('#hdnTransactionFee');
    this.hdnCardAmount = page.locator('#hdnCardAmount');
    this.hdnCoopAmount = page.locator('#hdnCoopAmount');
    this.hdnBaseCardAmount = page.locator('#hdnBaseCardAmount');
    this.termsCheckbox = page.locator('#termsAndConditions');
    this.termsError = page.locator('#lblTermsAndConditions');
    this.paymentButton = page.locator('.btnPayment');
    this.cancelPlanButton = page.locator('.btnCancelPlan');
    // Co-op section - #coopFunds does NOT exist in DOM (verified 2026-06-29)
    this.coopFundsAvailableBalance = page.locator('.dvWithCoop .availableFunds .costValue'); // ✅ confirmed
    this.budgetTypesSection = page.locator('.budgetTypes');                                  // ✅ confirmed (hidden until balance > 0)
    this.ddlBudgetTypeNames = page.locator('#ddlBudgetTypeNames');
    this.txtCoopPercentage = page.locator('#txtCoopPercentage');
    this.btnAddCoop = page.locator('#btnAddCoop');
    this.coopErrorMsg = page.locator('#coopErrorMsg');
    this.spnTotalCoopAmount = page.locator('.spnTotalCoopAmount');
    this.spnRemainingBalance = page.locator('.spnRemainingBalance');
    this.spnTransactionFee = page.locator('.spnTransactionFee');
    this.spnCardChargeTotal = page.locator('.spnCardChargeTotal');
    this.spnOrderTotalWithFee = page.locator('.spnOrderTotalWithFee');
    this.noPackageMessage = page.locator('.noPackage');
    this.wizardContainer = page.locator('.commonWizard');
    this.talkToExpertModal = page.locator('#talkToExpertModal');
    this.businessGoalSelect = page.locator('#businessGoal');
    this.cityInput = page.locator('#txtCity');
    this.stateSelect = page.locator('#ddlState');
    this.monthlyBudgetInput = page.locator('#monthlyBudget');
    this.additionalNotesInput = page.locator('#additionalNotes');
    this.submitExpertConsultation = page.locator('#submitExpertConsultation');
    this.termsConditionsModal = page.locator('#termsConditionsModal');
    this.termsLink = page.locator('.termsLink');
    this.splitPaymentMsg = page.locator('#splitPaymentMsg');
    this.adminQuoteBox = page.locator('.quoteBox');
    this.paymentCheckoutSection = page.locator('.paymentCheckout');

    this.heading = page.getByRole('heading', { name: /bundled ad packages/i });
    this.packageBadges = page.locator('.cardBadge');
    this.budgetAllocationRows = page.locator('.spnBudgetType tbody tr, .spnBudgetType tr');
    this.budgetEditButtons = page.locator('.btn-edit');
    this.budgetDeleteButtons = page.locator('.btn-delete');
    this.selectedPackageSeq = page.locator('#selectedPackageSeq');
    this.availableBudgetHidden = page.locator('#hdnAvailableBudget');
    this.quoteText = page.locator('.quoteBox, .quoteBox *');
    this.successToast = page.locator('.toast-success, .toast-message, [role="alert"]');
    this.detailHeading = page.getByRole('heading').first();
    this.detailProceedToCheckout = page.getByRole('button', { name: /proceed to checkout/i });
    this.detailBackLink = page.getByRole('link', { name: /^back$/i });
    this.detailPriceHero = page.locator('text=/\\$\\s*\\d+[\\d,]*(\\.\\d{2})?\\s*\\/campaign|\\/mailing/i').first();
    this.cookieAcceptButton = page.getByRole('button', { name: /accept/i });
    this.skipButton = page.getByRole('button', { name: /skip/i });
    this.loadingSpinner = page.locator(
      '.loading-overlay, .spinner-overlay, [data-loading], .spinner-border, .loader',
    ).first();
  }

  private async dismissTransientUi(): Promise<void> {
    if (await this.skipButton.isVisible().catch(() => false)) {
      await this.skipButton.click();
    }

    if (await this.cookieAcceptButton.isVisible().catch(() => false)) {
      await this.cookieAcceptButton.click();
    }
  }

  private async readTrimmedText(locator: Locator): Promise<string> {
    return ((await locator.first().textContent()) ?? '').replace(/\s+/g, ' ').trim();
  }

  private async readInputValue(locator: Locator): Promise<string> {
    return await locator.first().inputValue();
  }

  getPackageCardByName(name: string): Locator {
    return this.packageCards.filter({
      has: this.page.locator('.cardBadge', { hasText: new RegExp(name, 'i') }),
    }).first();
  }

  getSelectPackageButtonForPackage(name: string): Locator {
    return this.getPackageCardByName(name).locator('.selectPackage').first();
  }

  getViewDetailsLinkForPackage(name: string): Locator {
    return this.getPackageCardByName(name).locator('a.btnBordered[href*="Detail"]').first();
  }

  getTalkToExpertButtonForPackage(name: string): Locator {
    return this.getPackageCardByName(name).locator('.talkToExpertBtn').first();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'commit', timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await this.dismissTransientUi();
  }

  /**
   * Guideline 1 - Page Readiness:
   * Waits for the loading spinner to disappear, then confirms the wizard
   * container is visible before any test interaction begins.
   * URL assertion is omitted: a dealer with an in-progress order is redirected
   * to CampaignSetup instead of BundledAdPackages.
   */
  async waitForReady(): Promise<void> {
    await expect(this.loadingSpinner)
      .toBeHidden({ timeout: 15_000 })
      .catch(() => undefined); // spinner may not be present on every load
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
  }

  async navigateWithPackage(encryptedSeq: string): Promise<void> {
    const targetUrl = `${this.url}?packageSeq=${encodeURIComponent(encryptedSeq)}`;
    await this.page.goto(targetUrl, { waitUntil: 'commit', timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await this.dismissTransientUi();
  }

  async selectFirstStandardPackage(): Promise<void> {
    await expect(this.selectPackageButtons.first()).toBeVisible({ timeout: 20_000 });
    await this.selectPackageButtons.first().click();
    await this.expectStep2Active();
  }

  async selectPackageByName(name: string): Promise<void> {
    const button = this.getSelectPackageButtonForPackage(name);
    await expect(button).toBeVisible({ timeout: 20_000 });
    await button.click();
    await this.expectStep2Active();
  }

  async acceptTerms(): Promise<void> {
    await expect(this.termsCheckbox).toBeVisible({ timeout: 20_000 });
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.check();
    }
    await this.expectPaymentButtonEnabled();
  }

  async applyCoop(budgetTypeIndex: number, amount: string): Promise<void> {
    // #coopFunds checkbox does NOT exist in DOM. budgetTypes section is shown automatically
    // when the dealer has available co-op balance. Guard before attempting to interact.
    const isVisible = await this.budgetTypesSection.isVisible().catch(() => false);
    if (!isVisible) {
      throw new Error(
        'Co-op allocation controls (.budgetTypes) are not visible. ' +
        'This dealer may have $0 available co-op balance. ' +
        'Use a dealer account with available co-op funds for this test.',
      );
    }
    await this.ddlBudgetTypeNames.selectOption({ index: budgetTypeIndex });
    await this.txtCoopPercentage.fill(amount);
    await this.btnAddCoop.click();
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  async openTalkToExpert(buttonIndex = 0): Promise<void> {
    await expect(this.talkToExpertButtons.nth(buttonIndex)).toBeVisible({ timeout: 20_000 });
    await this.talkToExpertButtons.nth(buttonIndex).click();
    await expect(this.talkToExpertModal).toBeVisible({ timeout: 10_000 });
  }

  async openTalkToExpertForPackage(name: string): Promise<void> {
    const button = this.getTalkToExpertButtonForPackage(name);
    await expect(button).toBeVisible({ timeout: 20_000 });
    await button.click();
    await expect(this.talkToExpertModal).toBeVisible({ timeout: 10_000 });
  }

  async fillExpertForm(data: ExpertFormData): Promise<void> {
    if (data.businessGoalIndex !== undefined) {
      await this.businessGoalSelect.selectOption({ index: data.businessGoalIndex });
    }

    await this.cityInput.fill(data.city);

    if (data.stateIndex !== undefined) {
      await this.stateSelect.selectOption({ index: data.stateIndex });
    }

    await this.monthlyBudgetInput.fill(data.monthlyBudget);

    if (data.additionalNotes !== undefined) {
      await this.additionalNotesInput.fill(data.additionalNotes);
    }
  }

  async submitExpertForm(): Promise<void> {
    await this.submitExpertConsultation.click();
    await this.page.waitForTimeout(500);
  }

  async cancelPackageSelection(): Promise<void> {
    await this.cancelPlanButton.click();
    await expect(this.packageCards.first()).toBeVisible({ timeout: 20_000 });
    await expect(this.paymentCheckoutSection).toBeHidden({ timeout: 20_000 });
  }

  async openTermsModal(): Promise<void> {
    await this.termsLink.click();
    await expect(this.termsConditionsModal).toBeVisible({ timeout: 10_000 });
  }

  async openViewDetailsByName(name: string): Promise<void> {
    const link = this.getViewDetailsLinkForPackage(name);
    await expect(link).toBeVisible({ timeout: 20_000 });
    await Promise.all([
      this.page.waitForURL(/\/EngageAds\/Detail\?packageSeq=/i, { timeout: 20_000 }),
      link.click(),
    ]);
  }

  async proceedToPayment(): Promise<void> {
    await this.paymentButton.click();
  }

  async editCoopRow(index: number): Promise<void> {
    await this.budgetEditButtons.nth(index).click();
  }

  async deleteCoopRow(index: number): Promise<void> {
    await this.budgetDeleteButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async getPackageCount(): Promise<number> {
    return await this.packageCards.count();
  }

  async getPackageNameAt(index: number): Promise<string> {
    return await this.readTrimmedText(this.packageBadges.nth(index));
  }

  async getPackageSeqByName(name: string): Promise<string> {
    const selectButtonValue = await this.getSelectPackageButtonForPackage(name).getAttribute('packageSeq');
    if (selectButtonValue) {
      return selectButtonValue;
    }
    const badgeValue = await this.getPackageCardByName(name).locator('.cardBadge').first().getAttribute('packageSeq');
    return badgeValue ?? '';
  }

  async getViewDetailsHrefByName(name: string): Promise<string> {
    return (await this.getViewDetailsLinkForPackage(name).getAttribute('href')) ?? '';
  }

  async getSelectedPackageSeq(): Promise<string> {
    return (await this.paymentButton.first().getAttribute('packageSeq')) ?? (await this.selectedPackageSeq.inputValue().catch(() => ''));
  }

  async getTotalBudget(): Promise<string> {
    return await this.readInputValue(this.hdnTotalBudget);
  }

  async getIsAdmin(): Promise<string> {
    return await this.readInputValue(this.hdnIsAdminOrCFAdmin);
  }

  async getStripeEnabled(): Promise<string> {
    return await this.readInputValue(this.hdnStripeEnabled);
  }

  async getTotalPlanCost(): Promise<string> {
    return await this.readInputValue(this.hdnTotalPlanCost);
  }

  async getOrderTotalWithFee(): Promise<string> {
    return await this.readInputValue(this.hdnOrderTotalWithFee);
  }

  async getTransactionFeeValue(): Promise<string> {
    return await this.readInputValue(this.hdnTransactionFee);
  }

  async getCardAmountValue(): Promise<string> {
    return await this.readInputValue(this.hdnCardAmount);
  }

  async getCoopAmountValue(): Promise<string> {
    return await this.readInputValue(this.hdnCoopAmount);
  }

  async getBaseCardAmountValue(): Promise<string> {
    return await this.readInputValue(this.hdnBaseCardAmount);
  }

  async getTermsErrorText(): Promise<string> {
    return await this.readTrimmedText(this.termsError);
  }

  async getQuoteBoxText(): Promise<string> {
    return await this.readTrimmedText(this.adminQuoteBox);
  }

  async getPaymentCheckoutText(): Promise<string> {
    return await this.readTrimmedText(this.paymentCheckoutSection);
  }

  async getTotalCoopAmountText(): Promise<string> {
    return await this.readTrimmedText(this.spnTotalCoopAmount);
  }

  async getRemainingBalanceText(): Promise<string> {
    return await this.readTrimmedText(this.spnRemainingBalance);
  }

  async getTransactionFeeText(): Promise<string> {
    return await this.readTrimmedText(this.spnTransactionFee);
  }

  async getCardChargeTotalText(): Promise<string> {
    return await this.readTrimmedText(this.spnCardChargeTotal);
  }

  async getOrderTotalWithFeeText(): Promise<string> {
    return await this.readTrimmedText(this.spnOrderTotalWithFee);
  }

  async getCoopInputValue(): Promise<string> {
    return await this.txtCoopPercentage.inputValue();
  }

  async getCityValue(): Promise<string> {
    return await this.cityInput.inputValue();
  }

  async getMonthlyBudgetValue(): Promise<string> {
    return await this.monthlyBudgetInput.inputValue();
  }

  async getBusinessGoalOptionCount(): Promise<number> {
    return await this.businessGoalSelect.locator('option').count();
  }

  async getStateOptionCount(): Promise<number> {
    return await this.stateSelect.locator('option').count();
  }

  async getBudgetOptionValues(): Promise<string[]> {
    return await this.ddlBudgetTypeNames.locator('option').evaluateAll((options) =>
      options
        .map((option) => option.getAttribute('value') ?? '')
        .filter((value) => value.trim().length > 0),
    );
  }

  async getBudgetOptionTexts(): Promise<string[]> {
    return await this.ddlBudgetTypeNames.locator('option').evaluateAll((options) =>
      options
        .map((option) => (option.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter((text) => text.length > 0),
    );
  }

  async getCoopRowCount(): Promise<number> {
    return await this.budgetAllocationRows.count();
  }

  async isFieldInvalid(field: 'businessGoal' | 'city' | 'state' | 'monthlyBudget'): Promise<boolean> {
    const locator = {
      businessGoal: this.businessGoalSelect,
      city: this.cityInput,
      state: this.stateSelect,
      monthlyBudget: this.monthlyBudgetInput,
    }[field];

    return await locator.evaluate((element) => {
      const el = element as { checkValidity?: () => boolean };
      return typeof el.checkValidity === 'function' ? !el.checkValidity() : false;
    });
  }

  async expectWizardVisible(): Promise<void> {
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
    await expect(this.packageCards.first()).toBeVisible({ timeout: 20_000 });
  }

  async expectNoPackageMessage(): Promise<void> {
    await expect(this.noPackageMessage).toBeVisible({ timeout: 20_000 });
  }

  async expectPackagesVisible(): Promise<void> {
    const count = await this.getPackageCount();
    expect(count).toBeGreaterThan(0);
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
  }

  async expectStep2Active(): Promise<void> {
    await expect(this.paymentCheckoutSection).toBeVisible({ timeout: 20_000 });
    await expect(this.paymentCheckoutSection).toContainText(/payment|checkout|total plan cost|cost estimation/i);
  }

  async expectPaymentButtonDisabled(): Promise<void> {
    await expect(this.paymentButton).toBeDisabled();
  }

  async expectPaymentButtonEnabled(): Promise<void> {
    await expect(this.paymentButton).toBeEnabled({ timeout: 20_000 });
  }

  async expectCoopError(message: string): Promise<void> {
    await expect(this.coopErrorMsg).toContainText(message);
  }

  async expectSplitPaymentMessage(): Promise<void> {
    await expect(this.splitPaymentMsg).toBeVisible({ timeout: 10_000 });
  }

  async expectTermsErrorVisible(): Promise<void> {
    await expect(this.termsError).toBeVisible({ timeout: 10_000 });
  }

  async expectAdminRestrictedView(): Promise<void> {
    const buttonCount = await this.paymentButton.count();
    if (buttonCount > 0) {
      await expect(this.paymentButton.first()).toBeHidden();
    }
    await expect(this.adminQuoteBox).toBeVisible({ timeout: 20_000 });
  }

  async expectConsultationSubmitted(message: string): Promise<void> {
    await expect(this.successToast).toContainText(message, { timeout: 20_000 });
  }

  async expectDetailPage(name: string, price: number): Promise<void> {
    await expect(this.page).toHaveURL(/\/EngageAds\/Detail\?packageSeq=/i);
    await expect(this.detailHeading).toContainText(name);
    await expect(this.detailPriceHero).toContainText(String(price));
    await expect(this.detailProceedToCheckout).toBeVisible();
    await expect(this.detailBackLink).toBeVisible();
  }
}
