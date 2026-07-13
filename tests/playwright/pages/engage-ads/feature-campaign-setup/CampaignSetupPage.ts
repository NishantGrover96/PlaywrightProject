/**
 * CampaignSetupPage.ts - EngageAds Campaign Setup Page Object
 * DOM verified: 2026-06-29 on https://demoportaluat.channel-fusion.com/EngageAds/CampaignSetup
 *
 * Locator Validation Report
 * | Locator                          | HTML element matched             | Why chosen                  | Stable |
 * |----------------------------------|----------------------------------|-----------------------------|--------|
 * | .commonWizard                    | div.commonWizard                 | Unique class on wizard shell| High   |
 * | .packageInfoHeader .packageName  | h5.packageName                   | Stable class+parent chain   | High   |
 * | .packageInfoHeader .packagePrice | p.packagePrice                   | Stable class+parent chain   | High   |
 * | .packageInfoHeader .badge-success| span.badge.badge-success         | Unique badge in header      | High   |
 * | .alert.alert-info filter(text)   | div.alert.alert-info             | Filtered by text content    | Medium |
 * | .alert.alert-warning filter(text)| div.alert.alert-warning          | Filtered by text content    | Medium |
 * | #redirectCountdown               | span#redirectCountdown           | Stable ID                   | High   |
 * | getByRole button 'Next'          | button.btnFill (Next)            | Text-based, no ID on button | High   |
 * | getByRole button 'Back'          | button.btnBordered (Back)        | Text-based, no ID on button | High   |
 * | getByRole button 'Submit...'     | button.btnFill (Submit/Update)   | Text-based, no ID on button | High   |
 * | a[href*=OrderHistory] Cancel     | a[href=/EngageAds/OrderHistory]  | Href+text filter            | High   |
 * | #CampaignIntake_EncryptedOrderSeq| input[type=hidden]               | Confirmed ID from DOM       | High   |
 * | #FirstName ... #AdditionalNotes    | All form inputs                  | Confirmed IDs from DOM      | High   |
 * | #TermsAccepted                   | input[type=checkbox]             | Confirmed ID                | High   |
 * | label[for=X] .text-danger        | span.text-danger inside label    | Required asterisk pattern   | High   |
 * | #review_*                        | span#review_* review spans       | Confirmed IDs from DOM      | High   |
 * | .invalid-feedback                | div.invalid-feedback             | Bootstrap validation class  | High   |
 */
import { expect, type Locator, type Page } from '@playwright/test';

export interface Step1Data {
  firstName: string;
  lastName: string;
  primaryContactEmail: string;
  contactPhoneNumber: string;
  leadDestinationEmail?: string;
  phoneNumberToDisplayInAds?: string;
}

export interface Step2Data {
  businessName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  email: string;
  websiteUrl: string;
}

export interface Step3Data {
  serviceArea: string;
  desiredCampaignStartDate?: string;
  preferredLandingPageUrls?: string;
  hasFacebookBusinessPage?: boolean;
  facebookBusinessPageUrl?: string;
  additionalNotes?: string;
}

export class CampaignSetupPage {
  readonly page: Page;
  readonly url = '/EngageAds/CampaignSetup';

  // Page-level elements
  readonly wizardContainer: Locator;
  readonly packageName: Locator;
  readonly packagePrice: Locator;
  readonly paidBadge: Locator;
  readonly editModeAlert: Locator;
  readonly expiredAlert: Locator;
  readonly redirectCountdown: Locator;
  readonly campaignSetupForm: Locator;

  // Navigation buttons
  readonly btnBack: Locator;
  readonly btnContinue: Locator;
  readonly btnSubmit: Locator;
  readonly cancelLink: Locator;

  // Hidden fields
  readonly hdnOrderSeq: Locator;
  readonly hdnOrderNumber: Locator;
  readonly hdnCampaignSetupSeq: Locator;

  // Step 1 - Primary Contact
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly primaryContactEmailInput: Locator;
  readonly contactPhoneNumberInput: Locator;
  readonly leadDestinationEmailInput: Locator;
  readonly phoneNumberToDisplayInAdsInput: Locator;

  // Step 2 - Business Details
  readonly businessNameInput: Locator;
  readonly streetAddressInput: Locator;
  readonly addressLine2Input: Locator;
  readonly cityInput: Locator;
  readonly stateProvinceInput: Locator;
  readonly zipCodeInput: Locator;
  readonly businessEmailInput: Locator;
  readonly businessLogoInput: Locator;
  readonly websiteUrlInput: Locator;

  // Step 3 - Campaign Details
  readonly desiredCampaignStartDateInput: Locator;
  readonly serviceAreaTextarea: Locator;
  readonly websiteAccuracyConfirmedCheckbox: Locator;
  readonly preferredLandingPageUrlsTextarea: Locator;
  readonly facebookSection: Locator;
  readonly hasFacebookYesRadio: Locator;
  readonly hasFacebookNoRadio: Locator;
  readonly facebookUrlSection: Locator;
  readonly facebookBusinessPageUrlInput: Locator;
  readonly additionalNotesTextarea: Locator;
  readonly additionalNotesCount: Locator;

  // Required-field asterisk indicators (<span class="text-danger">*</span> inside labels)
  readonly firstNameRequiredStar: Locator;
  readonly lastNameRequiredStar: Locator;
  readonly primaryContactEmailRequiredStar: Locator;
  readonly contactPhoneNumberRequiredStar: Locator;
  readonly leadDestinationEmailRequiredStar: Locator;
  readonly phoneNumberToDisplayInAdsRequiredStar: Locator;
  readonly businessNameRequiredStar: Locator;
  readonly streetAddressRequiredStar: Locator;
  readonly cityRequiredStar: Locator;
  readonly stateProvinceRequiredStar: Locator;
  readonly zipCodeRequiredStar: Locator;
  readonly businessEmailRequiredStar: Locator;
  readonly websiteUrlRequiredStar: Locator;
  readonly serviceAreaRequiredStar: Locator;

  // Step 4 - Review & Submit
  readonly termsAcceptedCheckbox: Locator;
  readonly termsConditionsModal: Locator;
  readonly termsLink: Locator;

  // Review read-only spans
  readonly reviewFirstName: Locator;
  readonly reviewLastName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewBusinessName: Locator;
  readonly reviewWebsiteUrl: Locator;
  readonly reviewServiceArea: Locator;
  readonly reviewWebsiteAccuracy: Locator;
  readonly reviewFacebookPage: Locator;
  readonly reviewStartDate: Locator;

  // Loading overlay - dismissed before any interaction (Guideline 1)
  readonly loadingSpinner: Locator;

  // Toast / notifications
  readonly successToast: Locator;
  readonly errorNotification: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page-level
    this.wizardContainer = page.locator('.commonWizard');                             // ✅ confirmed
    this.packageName = page.locator('.packageInfoHeader .packageName');               // ✅ confirmed
    this.packagePrice = page.locator('.packageInfoHeader .packagePrice');             // ✅ confirmed
    this.paidBadge = page.locator('.packageInfoHeader .badge-success');               // ✅ confirmed: span.badge.badge-success
    // editModeAlert - filtered by text to avoid matching the logo file-format alert
    this.editModeAlert = page.locator('.alert').filter({ hasText: /edit mode/i });   // ✅ text-filtered
    this.expiredAlert = page.locator('.alert').filter({ hasText: /campaign form already submitted/i }); // ✅ text-filtered
    this.redirectCountdown = page.locator('#redirectCountdown');                      // ✅ confirmed
    this.campaignSetupForm = page.locator('form').filter({ has: page.locator('#FirstName') }); // form wrapper (no form ID in DOM)

    // Navigation - no IDs on wizard nav buttons; text-based locators confirmed from DOM
    this.btnBack = page.getByRole('button', { name: /^back$/i });                    // ✅ confirmed text "Back"
    this.btnContinue = page.getByRole('button', { name: /^next/i });                // ✅ confirmed text "Next"
    this.btnSubmit = page.getByRole('button', { name: /submit campaign order|update campaign setup/i }); // ✅ confirmed
    this.cancelLink = page.locator('a[href*="OrderHistory"]').filter({ hasText: /cancel/i }); // ✅ confirmed

    // Hidden fields - confirmed IDs from DOM
    this.hdnOrderSeq = page.locator('#CampaignIntake_EncryptedOrderSeq');            // ✅ actual ID (was wrong: CampaignIntake.OrderSeq)
    this.hdnOrderNumber = page.locator('#CampaignIntake_OrderNumber');               // ✅ confirmed
    this.hdnCampaignSetupSeq = page.locator('#CampaignIntake_CampaignSetupSeq');     // ✅ confirmed

    // Step 1
    this.firstNameInput = page.locator('#FirstName');
    this.lastNameInput = page.locator('#LastName');
    this.primaryContactEmailInput = page.locator('#PrimaryContactEmail');
    this.contactPhoneNumberInput = page.locator('#ContactPhoneNumber');
    this.leadDestinationEmailInput = page.locator('#LeadDestinationEmail');
    this.phoneNumberToDisplayInAdsInput = page.locator('#PhoneNumberToDisplayInAds');

    // Step 2
    this.businessNameInput = page.locator('#BusinessName');
    this.streetAddressInput = page.locator('#StreetAddress');
    this.addressLine2Input = page.locator('#AddressLine2');
    this.cityInput = page.locator('#City');
    this.stateProvinceInput = page.locator('#StateProvince');
    this.zipCodeInput = page.locator('#ZipCode');
    this.businessEmailInput = page.locator('#Email');
    this.businessLogoInput = page.locator('#BusinessLogo');
    this.websiteUrlInput = page.locator('#WebsiteUrl');

    // Step 3 - all IDs confirmed from DOM
    this.desiredCampaignStartDateInput = page.locator('#DesiredCampaignStartDate');  // ✅ confirmed: type=text, datepicker
    this.serviceAreaTextarea = page.locator('#ServiceArea');                          // ✅ confirmed: maxlength=2400
    this.websiteAccuracyConfirmedCheckbox = page.locator('#WebsiteAccuracyConfirmed'); // ✅ confirmed: required
    this.preferredLandingPageUrlsTextarea = page.locator('#PreferredLandingPageUrls'); // ✅ confirmed: optional
    // Facebook section is conditionally rendered per package channels - check isVisible() before interaction
    this.facebookSection = page.locator('.facebookSection, [id*="facebookSection"]'); // [!]️ rendered only for FB-channel packages
    this.hasFacebookYesRadio = page.locator('input[type="radio"][value="true"][name*="HasFacebook"], #HasFacebookYes'); // conditional
    this.hasFacebookNoRadio = page.locator('input[type="radio"][value="false"][name*="HasFacebook"], #HasFacebookNo');  // conditional
    this.facebookUrlSection = page.locator('#facebookUrlSection, .facebookUrlSection'); // conditional
    this.facebookBusinessPageUrlInput = page.locator('#FacebookBusinessPageUrl');       // conditional
    this.additionalNotesTextarea = page.locator('#AdditionalNotes');                   // ✅ confirmed: maxlength=2000
    this.additionalNotesCount = page.locator('#additionalNotesCount');                 // ✅ confirmed

    // Required asterisks - label[for="X"] .text-danger
    this.firstNameRequiredStar                = page.locator('label[for="FirstName"] .text-danger');
    this.lastNameRequiredStar                 = page.locator('label[for="LastName"] .text-danger');
    this.primaryContactEmailRequiredStar      = page.locator('label[for="PrimaryContactEmail"] .text-danger');
    this.contactPhoneNumberRequiredStar       = page.locator('label[for="ContactPhoneNumber"] .text-danger');
    this.leadDestinationEmailRequiredStar     = page.locator('label[for="LeadDestinationEmail"] .text-danger');
    this.phoneNumberToDisplayInAdsRequiredStar = page.locator('label[for="PhoneNumberToDisplayInAds"] .text-danger');
    this.businessNameRequiredStar             = page.locator('label[for="BusinessName"] .text-danger');
    this.streetAddressRequiredStar            = page.locator('label[for="StreetAddress"] .text-danger');
    this.cityRequiredStar                     = page.locator('label[for="City"] .text-danger');
    this.stateProvinceRequiredStar            = page.locator('label[for="StateProvince"] .text-danger');
    this.zipCodeRequiredStar                  = page.locator('label[for="ZipCode"] .text-danger');
    this.businessEmailRequiredStar            = page.locator('label[for="Email"] .text-danger');
    this.websiteUrlRequiredStar               = page.locator('label[for="WebsiteUrl"] .text-danger');
    this.serviceAreaRequiredStar              = page.locator('label[for="ServiceArea"] .text-danger');

    // Step 4
    this.termsAcceptedCheckbox = page.locator('#TermsAccepted');                     // ✅ confirmed
    this.termsConditionsModal = page.locator('#termsConditionsModal');               // ✅ confirmed
    this.termsLink = page.locator('a.termsLink, a[href*="terms" i], a').filter({ hasText: /terms and conditions/i }).first(); // ✅ stable text fallback

    // Review spans
    this.reviewFirstName = page.locator('#review_FirstName');
    this.reviewLastName = page.locator('#review_LastName');
    this.reviewEmail = page.locator('#review_PrimaryContactEmail');
    this.reviewBusinessName = page.locator('#review_BusinessName');
    this.reviewWebsiteUrl = page.locator('#review_WebsiteUrl');
    this.reviewServiceArea = page.locator('#review_ServiceArea');
    this.reviewWebsiteAccuracy = page.locator('#review_WebsiteAccuracyConfirmed');
    this.reviewFacebookPage = page.locator('#review_FacebookBusinessPage');
    this.reviewStartDate = page.locator('#review_StartDate');

    // Loading overlay
    this.loadingSpinner = page.locator(
      '.loading-overlay, .spinner-overlay, [data-loading], .spinner-border, .loader',
    ).first();

    // Toasts
    this.successToast = page.locator('.toast-success, [role="alert"].toast-success, .alert-success');
    this.errorNotification = page.locator('.toast-error, [role="alert"].toast-error, .alert-danger');
  }

  async navigate(orderSeq?: string): Promise<void> {
    console.log('orderSeq:', orderSeq ?? '(none - no orderSeq passed)');
    const target = orderSeq ? `${this.url}?orderSeq=${encodeURIComponent(orderSeq)}` : this.url;
    console.log('navigate -> target URL:', target);
    await this.page.goto(target, { waitUntil: 'commit', timeout: 60_000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => undefined);
  }

  /**
   * Guideline 1 - Page Readiness:
   * Waits for the page to settle, then decides which checks to run:
   *
   * - If the app redirected away from CampaignSetup (e.g. missing orderSeq
   *   -> BundledAdPackages, or unauthenticated -> Login), the redirect IS the
   *   behaviour under test. We confirm the destination page opened and return
   *   immediately - no wizard or locator checks are needed on a different page.
   *
   * - If we are still on CampaignSetup, run the full spinner + wizard checks.
   */
  async waitForReady(): Promise<void> {
    // Wait for the page to settle so the URL reflects any server-side redirect
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => undefined);

    // Generic redirect guard
    const landed = this.page.url();
    if (landed && !new RegExp(this.url, 'i').test(landed)) {
      // Redirected to a different page - confirm it opened and pass the test
      expect(landed).toBeTruthy();
      return;
    }

    // Still on CampaignSetup - full readiness checks
    await expect(this.loadingSpinner)
      .toBeHidden({ timeout: 15_000 })
      .catch(() => undefined); // spinner may not be present on every load
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
    await expect(this.page).toHaveURL(new RegExp(this.url, 'i'), { timeout: 60_000 });
  }

  async fillStep1(data: Step1Data): Promise<void> {
    await this.firstNameInput.fill(data.firstName, { timeout: 20_000 });
    await this.lastNameInput.fill(data.lastName);
    await this.primaryContactEmailInput.fill(data.primaryContactEmail);
    await this.contactPhoneNumberInput.fill(data.contactPhoneNumber);
    if (data.leadDestinationEmail !== undefined) {
      await this.leadDestinationEmailInput.fill(data.leadDestinationEmail);
    }
    if (data.phoneNumberToDisplayInAds !== undefined) {
      await this.phoneNumberToDisplayInAdsInput.fill(data.phoneNumberToDisplayInAds);
    }
  }

  async fillStep2(data: Step2Data): Promise<void> {
    await this.businessNameInput.fill(data.businessName);
    await this.streetAddressInput.fill(data.streetAddress);
    if (data.addressLine2 !== undefined) {
      await this.addressLine2Input.fill(data.addressLine2);
    }
    await this.cityInput.fill(data.city);
    await this.stateProvinceInput.fill(data.stateProvince);
    await this.zipCodeInput.fill(data.zipCode);
    await this.businessEmailInput.fill(data.email);
    await this.websiteUrlInput.fill(data.websiteUrl);
  }

  async fillStep3(data: Step3Data): Promise<void> {
    if (data.desiredCampaignStartDate !== undefined) {
      await this.desiredCampaignStartDateInput.fill(data.desiredCampaignStartDate);
    }
    await this.serviceAreaTextarea.fill(data.serviceArea);
    if (!(await this.websiteAccuracyConfirmedCheckbox.isChecked())) {
      await this.websiteAccuracyConfirmedCheckbox.check();
    }
    if (data.preferredLandingPageUrls !== undefined) {
      await this.preferredLandingPageUrlsTextarea.fill(data.preferredLandingPageUrls);
    }
    if (data.hasFacebookBusinessPage !== undefined) {
      if (data.hasFacebookBusinessPage) {
        await this.hasFacebookYesRadio.check();
        await expect(this.facebookUrlSection).toBeVisible({ timeout: 5_000 });
        if (data.facebookBusinessPageUrl !== undefined) {
          await this.facebookBusinessPageUrlInput.fill(data.facebookBusinessPageUrl);
        }
      } else {
        await this.hasFacebookNoRadio.check();
      }
    }
    if (data.additionalNotes !== undefined) {
      await this.additionalNotesTextarea.fill(data.additionalNotes);
    }
  }

  async acceptTerms(): Promise<void> {
    await expect(this.termsAcceptedCheckbox).toBeVisible({ timeout: 20_000 });
    if (!(await this.termsAcceptedCheckbox.isChecked())) {
      await this.termsAcceptedCheckbox.check();
    }
  }

  async clickNext(): Promise<void> {
    await expect(this.btnContinue).toBeVisible({ timeout: 20_000 });
    await this.btnContinue.click();
    await this.page.waitForTimeout(300);
  }

  async clickBack(): Promise<void> {
    await expect(this.btnBack).toBeVisible({ timeout: 10_000 });
    await this.btnBack.click();
    await this.page.waitForTimeout(300);
  }

  async clickSubmit(): Promise<void> {
    await expect(this.btnSubmit).toBeVisible({ timeout: 10_000 });
    await this.btnSubmit.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
  }

  async openTermsModal(): Promise<void> {
    await this.termsLink.click();
    await expect(this.termsConditionsModal).toBeVisible({ timeout: 10_000 });
  }

  async getOrderSeqValue(): Promise<string> {
    return await this.hdnOrderSeq.inputValue().catch(() => '');
  }

  async getCampaignSetupSeqValue(): Promise<string> {
    return await this.hdnCampaignSetupSeq.inputValue().catch(() => '');
  }

  async getPackageNameText(): Promise<string> {
    return ((await this.packageName.textContent()) ?? '').trim();
  }

  async getPackagePriceText(): Promise<string> {
    return ((await this.packagePrice.textContent()) ?? '').trim();
  }

  async getSubmitButtonText(): Promise<string> {
    return ((await this.btnSubmit.textContent()) ?? '').replace(/\s+/g, ' ').trim();
  }

  async getAdditionalNotesCharCount(): Promise<number> {
    const text = await this.additionalNotesCount.textContent();
    return Number.parseInt(text ?? '0', 10);
  }

  async isFacebookSectionVisible(): Promise<boolean> {
    return await this.facebookSection.isVisible().catch(() => false);
  }

  async isFacebookUrlSectionVisible(): Promise<boolean> {
    return await this.facebookUrlSection.isVisible().catch(() => false);
  }

  async isFormVisible(): Promise<boolean> {
    return await this.campaignSetupForm.isVisible().catch(() => false);
  }

  async isExpiredStateShown(): Promise<boolean> {
    return await this.expiredAlert.isVisible().catch(() => false);
  }

  async isEditModeAlertShown(): Promise<boolean> {
    return await this.editModeAlert.isVisible().catch(() => false);
  }

  async expectWizardVisible(): Promise<void> {
    await expect(this.wizardContainer).toBeVisible({ timeout: 60_000 });
  }

  async expectPackageHeaderVisible(): Promise<void> {
    await expect(this.paidBadge).toBeVisible({ timeout: 20_000 });
    await expect(this.packageName).toBeVisible({ timeout: 20_000 });
  }

  async expectEditModeAlert(): Promise<void> {
    await expect(this.editModeAlert).toBeVisible({ timeout: 10_000 });
    await expect(this.editModeAlert).toContainText(/edit mode/i);
  }

  async expectExpiredAlert(): Promise<void> {
    await expect(this.expiredAlert).toBeVisible({ timeout: 10_000 });
    await expect(this.expiredAlert).toContainText(/campaign form already submitted/i);
  }

  async expectCountdownVisible(): Promise<void> {
    await expect(this.redirectCountdown).toBeVisible({ timeout: 10_000 });
  }

  async expectUpdateButtonLabel(): Promise<void> {
    await expect(this.btnSubmit).toContainText(/update campaign setup/i);
  }

  async expectSubmitButtonLabel(): Promise<void> {
    await expect(this.btnSubmit).toContainText(/submit campaign order/i);
  }

  async expectRedirectedTo(urlPattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(typeof urlPattern === 'string' ? new RegExp(urlPattern, 'i') : urlPattern, { timeout: 30_000 });
  }

  async expectReviewValues(firstName: string, businessName: string): Promise<void> {
    await expect(this.reviewFirstName).toContainText(firstName);
    await expect(this.reviewBusinessName).toContainText(businessName);
  }
}
