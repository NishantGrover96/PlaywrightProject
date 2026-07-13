import { Page, Locator, expect } from '@playwright/test';

/**
 * SubmitPreapprovalPage - Page Object Model
 * URL: /CoopManagement/PreApproval/Submit/SubmitPreapproval
 *
 * Selectors sourced from:
 *   SubmitPreApproval.cshtml (legacy + modern - identical files, 2026-06-19)
 *   _PreApprovalMediaType.cshtml, _PreApprovalFormSubmission.cshtml
 *
 * Wizard steps for dealer role (no dealer-search step shown):
 *   Step 0 - Fiscal year selection (conditional)
 *   Step 1 - Dealer search (conditional, skipped for dealer role)
 *   Step 2 - Media type tile selection
 *   Step 3 - Form submission + email section
 *   Success - Confirmation panel
 *
 * FU-047 note: Modern POST handler calls GetMediaType(SelectedFiscalYear) before processing.
 *   hdnSelectedFiscalYear must be present and non-empty for correct media mapping.
 */
export class SubmitPreapprovalPage {
  readonly page: Page;
  readonly url = '/CoopManagement/PreApproval/Submit/SubmitPreapproval';

  // -- Wizard container ----------------------------------------------------------
  readonly wizardContainer: Locator;

  // -- Step 0 - Fiscal year (conditional) ---------------------------------------
  readonly fiscalYearRadios:      Locator;  // input.fiscalYearRadio
  readonly btnContinueAfterZero:  Locator;  // #ContinueAfterZero
  readonly hdnSelectedFiscalYear: Locator;  // #hdnSelectedFiscalYear (bound via SelectedFiscalYear property; required by modern POST handler FU-047)

  // -- Step 2 - Media type -------------------------------------------------------
  readonly mediaTiles:              Locator;  // ul#PreapprovalMediaList li a.clsSelectMediaType
  readonly dealerTypeDropdown:      Locator;  // #programDealerTypeDropdown
  readonly btnMediaContinue:        Locator;  // #btnContinue
  readonly btnMediaBack:            Locator;  // .clsBackClaimWizardMedia

  // -- Step 3 - Form: dealer header ---------------------------------------------
  readonly dealerNumberDisplay:     Locator;  // #_DealerNumber
  readonly dealerNameDisplay:       Locator;  // #_DealerName

  // -- Step 3 - Campaign block ---------------------------------------------------
  readonly campaignTitleInput:         Locator;  // #txtCampaingTitle maxlength=100
  readonly errCampaignTitle:           Locator;  // #spnErrorCampaingTitle
  readonly chkAdOfferCampaign:         Locator;  // #chkAdOfferCampaign
  readonly campaignExpirationDateInput:Locator;  // #hdtxtCalExpirationDateCampaign (hidden)
  readonly campaignExpirationDisplay:  Locator;  // #hdtxtCalExpirationDateCampaign visible
  readonly errCampaignExpDate:         Locator;  // #spnAdExpDateCampaign
  readonly campaignMediaList:          Locator;  // #campaignList li a
  readonly btnAddCampaign:             Locator;  // #btnAddCampaign
  readonly btnEditActivity:            Locator;  // #btnEditActivity
  readonly btnAddAdditionalMedia:      Locator;  // #btnAddAdditionalMedia
  readonly tblMediaCampaign:           Locator;  // #tblMediaCampaign

  // -- Step 3 - Screen/mainbranch block -----------------------------------------
  readonly chkAdOffer:              Locator;  // #chkAdOffer
  readonly adExpirationDateInput:   Locator;  // #hdtxtCalExpirationDate
  readonly adExpirationDisplay:     Locator;  // #hdtxtCalExpirationDate display input
  readonly errAdExpDate:            Locator;  // #spnAdExpDate
  readonly adLandingURLInput:       Locator;  // #txtAdLandingURL maxlength=550
  readonly errAdLandingURL:         Locator;  // #spnAdlandingPageURL
  readonly adLandingURLMultiple:    Locator;  // #txtAdLandingURLMultiple
  readonly btnAddMoreURL:           Locator;  // #AddMoreUrl
  readonly errAdLandingURLMultiple: Locator;  // #spnAdlandingPageURLMultiple
  readonly adTitleInput:            Locator;  // #txtAdTitle maxlength=100
  readonly errAdTitle:              Locator;  // #spnErrorAdTitle

  // -- Step 3 - Show block (indvshow/grpshow) ------------------------------------
  readonly showNameInput:        Locator;  // #txtShowsAdTitle maxlength=100
  readonly errShowName:          Locator;  // #spnErrorShowsAdTitle
  readonly showAddressInput:     Locator;  // #txtShowsLocationAddress maxlength=100
  readonly errShowAddress:       Locator;  // #spnErrorShowsAddress
  readonly showCityInput:        Locator;  // #txtShowsLocationCity maxlength=25
  readonly errShowCity:          Locator;  // #spnErrorShowsCity
  readonly showStateInput:       Locator;  // #txtShowsLocationState maxlength=25
  readonly errShowState:         Locator;  // #spnErrorShowsState
  readonly showZipInput:         Locator;  // #txtShowsLocationZip maxlength=7
  readonly errShowZip:           Locator;  // #spnErrorShowsZip
  readonly showStartDateInput:   Locator;  // #hdtxtCalShowsStartDate
  readonly errShowStartDate:     Locator;  // #spnShowsStartDate
  readonly showEndDateInput:     Locator;  // #hdtxtCalShowsEndDate
  readonly errShowEndDate:       Locator;  // #spnShowsEndDate
  readonly showCostInput:        Locator;  // #txtShowsEligibleCost maxlength=12
  readonly errShowCost:          Locator;  // #spnErrorShowsEquipmentCost
  readonly groupDealerInput:     Locator;  // #txtGroupDealerNumber maxlength=50
  readonly btnAddGroupDealer:    Locator;  // #btnAddShowsGroupDealer
  readonly dealerNumberContainer:Locator;  // #dvDealerNumberContainer
  readonly equipmentNameInput:   Locator;  // #txtEquipmentName maxlength=50
  readonly btnAddEquipment:      Locator;  // #btnAddEquipmentContact
  readonly equipmentContainer:   Locator;  // #dvEquipmentContainer

  // -- Step 3 - Sponsorship block ------------------------------------------------
  readonly sponsorNameInput:      Locator;  // #txtSponsorshipAdTitle maxlength=100
  readonly errSponsorName:        Locator;  // #spnErrorSponsorshipAdTitle
  readonly sponsorStartDateInput: Locator;  // #hdtxtCalSponsorShipStartDate
  readonly errSponsorStartDate:   Locator;  // #spnSponsorShipStartDate
  readonly sponsorEndDateInput:   Locator;  // #hdtxtCalSponsorShipEndDate
  readonly errSponsorEndDate:     Locator;  // #spnSponsorShipEndDate

  // -- Step 3 - Shared fields ----------------------------------------------------
  readonly dealerIdInput:     Locator;  // #txtDealerIdText maxlength=100
  readonly errDealerId:       Locator;  // #spnDealerIdText
  readonly fileDropzone:      Locator;  // #dropzone_fuBGImage
  readonly errFile:           Locator;  // #spnErrorFile
  readonly commentTextarea:   Locator;  // #txtMainComment maxlength=500

  // -- Step 3 - Email section ----------------------------------------------------
  readonly emailMeInput:            Locator;  // #txtEmailMe (readonly)
  readonly errEmailMe:              Locator;  // #spnEmailToMe
  readonly dealerContactCheckboxes: Locator;  // .clsDealerShipContact
  readonly otherContactInput:       Locator;  // #txtOtherMediaContact
  readonly btnAddOtherContact:      Locator;  // #btnAddOtherContact
  readonly errOtherContact:         Locator;  // #spnErrorOtherMediaContact
  readonly otherContactsContainer:  Locator;  // #dvOtherMediaContacts

  // -- Action buttons ------------------------------------------------------------
  readonly btnSubmit:               Locator;  // #btnSubmitPreApproval
  readonly btnReset:                Locator;  // #ResetPreApprovalForm
  readonly btnFormBack:             Locator;  // #FormSubmissionBackBtn

  // -- Success panel -------------------------------------------------------------
  readonly successPanel:            Locator;  // #CompleteConfirmationModel
  readonly confirmationNumber:      Locator;  // #spnPreApprovalConfirmationNumber
  readonly btnSubmitAnother:        Locator;  // #SubmitAnotherPreApproval
  readonly btnSubmitNew:            Locator;  // a href="/CoopManagement/PreApproval/Submit/SubmitPreApproval"

  constructor(page: Page) {
    this.page = page;

    this.wizardContainer     = page.locator('.commonWizard');

    // Step 0 - Fiscal year
    this.fiscalYearRadios     = page.locator('input.fiscalYearRadio');
    this.btnContinueAfterZero = page.locator('#ContinueAfterZero');
    this.hdnSelectedFiscalYear = page.locator('#hdnSelectedFiscalYear');

    // Step 2 - Media type
    this.mediaTiles              = page.locator('#PreapprovalMediaList li a.clsSelectMediaType');
    this.dealerTypeDropdown      = page.locator('#programDealerTypeDropdown');
    this.btnMediaContinue        = page.locator('#btnContinue');
    this.btnMediaBack            = page.locator('.clsBackClaimWizardMedia').first();

    // Dealer header
    this.dealerNumberDisplay = page.locator('#_DealerNumber');
    this.dealerNameDisplay   = page.locator('#_DealerName');

    // Campaign block
    this.campaignTitleInput          = page.locator('#txtCampaingTitle');
    this.errCampaignTitle            = page.locator('#spnErrorCampaingTitle');
    this.chkAdOfferCampaign          = page.locator('#chkAdOfferCampaign');
    this.campaignExpirationDateInput = page.locator('#txtCalExpirationDateCampaign');
    this.campaignExpirationDisplay   = page.locator('#hdtxtCalExpirationDateCampaign');
    this.errCampaignExpDate          = page.locator('#spnAdExpDateCampaign');
    this.campaignMediaList           = page.locator('#campaignList li a');
    this.btnAddCampaign              = page.locator('#btnAddCampaign');
    this.btnEditActivity             = page.locator('#btnEditActivity');
    this.btnAddAdditionalMedia       = page.locator('#btnAddAdditionalMedia');
    this.tblMediaCampaign            = page.locator('#tblMediaCampaign');

    // Screen/mainbranch
    this.chkAdOffer              = page.locator('#chkAdOffer');
    this.adExpirationDateInput   = page.locator('#txtCalExpirationDate');
    this.adExpirationDisplay     = page.locator('#hdtxtCalExpirationDate');
    this.errAdExpDate            = page.locator('#spnAdExpDate');
    this.adLandingURLInput       = page.locator('#txtAdLandingURL');
    this.errAdLandingURL         = page.locator('#spnAdlandingPageURL');
    this.adLandingURLMultiple    = page.locator('#txtAdLandingURLMultiple');
    this.btnAddMoreURL           = page.locator('#AddMoreUrl');
    this.errAdLandingURLMultiple = page.locator('#spnAdlandingPageURLMultiple');
    this.adTitleInput            = page.locator('#txtAdTitle');
    this.errAdTitle              = page.locator('#spnErrorAdTitle');

    // Show block
    this.showNameInput         = page.locator('#txtShowsAdTitle');
    this.errShowName           = page.locator('#spnErrorShowsAdTitle');
    this.showAddressInput      = page.locator('#txtShowsLocationAddress');
    this.errShowAddress        = page.locator('#spnErrorShowsAddress');
    this.showCityInput         = page.locator('#txtShowsLocationCity');
    this.errShowCity           = page.locator('#spnErrorShowsCity');
    this.showStateInput        = page.locator('#txtShowsLocationState');
    this.errShowState          = page.locator('#spnErrorShowsState');
    this.showZipInput          = page.locator('#txtShowsLocationZip');
    this.errShowZip            = page.locator('#spnErrorShowsZip');
    this.showStartDateInput    = page.locator('#hdtxtCalShowsStartDate');
    this.errShowStartDate      = page.locator('#spnShowsStartDate');
    this.showEndDateInput      = page.locator('#hdtxtCalShowsEndDate');
    this.errShowEndDate        = page.locator('#spnShowsEndDate');
    this.showCostInput         = page.locator('#txtShowsEligibleCost');
    this.errShowCost           = page.locator('#spnErrorShowsEquipmentCost');
    this.groupDealerInput      = page.locator('#txtGroupDealerNumber');
    this.btnAddGroupDealer     = page.locator('#btnAddShowsGroupDealer');
    this.dealerNumberContainer = page.locator('#dvDealerNumberContainer');
    this.equipmentNameInput    = page.locator('#txtEquipmentName');
    this.btnAddEquipment       = page.locator('#btnAddEquipmentContact');
    this.equipmentContainer    = page.locator('#dvEquipmentContainer');

    // Sponsor block
    this.sponsorNameInput      = page.locator('#txtSponsorshipAdTitle');
    this.errSponsorName        = page.locator('#spnErrorSponsorshipAdTitle');
    this.sponsorStartDateInput = page.locator('#hdtxtCalSponsorShipStartDate');
    this.errSponsorStartDate   = page.locator('#spnSponsorShipStartDate');
    this.sponsorEndDateInput   = page.locator('#hdtxtCalSponsorShipEndDate');
    this.errSponsorEndDate     = page.locator('#spnSponsorShipEndDate');

    // Shared fields
    this.dealerIdInput   = page.locator('#txtDealerIdText');
    this.errDealerId     = page.locator('#spnDealerIdText');
    this.fileDropzone    = page.locator('#dropzone_fuBGImage');
    this.errFile         = page.locator('#spnErrorFile');
    this.commentTextarea = page.locator('#txtMainComment');

    // Email section
    this.emailMeInput            = page.locator('#txtEmailMe');
    this.errEmailMe              = page.locator('#spnEmailToMe');
    this.dealerContactCheckboxes = page.locator('.clsDealerShipContact');
    this.otherContactInput       = page.locator('#txtOtherMediaContact');
    this.btnAddOtherContact      = page.locator('#btnAddOtherContact');
    this.errOtherContact         = page.locator('#spnErrorOtherMediaContact');
    this.otherContactsContainer  = page.locator('#dvOtherMediaContacts');

    // Actions
    this.btnSubmit   = page.locator('#btnSubmitPreApproval');
    this.btnReset    = page.locator('#ResetPreApprovalForm');
    this.btnFormBack = page.locator('#FormSubmissionBackBtn');

    // Success panel
    this.successPanel       = page.locator('#CompleteConfirmationModel');
    this.confirmationNumber = page.locator('#spnPreApprovalConfirmationNumber');
    this.btnSubmitAnother   = page.locator('#SubmitAnotherPreApproval');
    this.btnSubmitNew       = page.locator('a[href*="SubmitPreApproval"]').last();
  }

  // -- Navigation ----------------------------------------------------------------

  async navigate(): Promise<void> {
    // Use domcontentloaded - the preapproval page has background requests that
    // prevent the 'load' event from firing within the default 60s timeout.
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  // -- Wizard navigation ---------------------------------------------------------

  async selectFiscalYear(year: string): Promise<void> {
    await this.fiscalYearRadios.filter({ hasText: year }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectMediaTile(mediaName: string): Promise<void> {
    await expect(this.mediaTiles.first()).toBeVisible({ timeout: 20_000 });
    await this.mediaTiles.filter({ hasText: mediaName }).first().click();
    await expect(this.btnMediaContinue).not.toBeDisabled({ timeout: 5_000 });
  }

  async advanceFromMediaStep(): Promise<void> {
    await this.btnMediaContinue.click();
    // The form step is shown by TriggerNextStep(3) - wait for the Ad Title input
    // which is immediately visible. The Submit button only reveals after field
    // validation fires, so it cannot be used here.
    await expect(this.adTitleInput).toBeVisible({ timeout: 15_000 });
  }

  // -- Form filling --------------------------------------------------------------

  async fillAdTitle(title: string): Promise<void> {
    await this.adTitleInput.fill(title);
  }

  async fillCampaignTitle(title: string): Promise<void> {
    await this.campaignTitleInput.fill(title);
  }

  async fillAdLandingURL(url: string): Promise<void> {
    await this.adLandingURLInput.fill(url);
  }

  async fillShowDetails(data: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    startDate: string;
    endDate: string;
    cost: string;
  }): Promise<void> {
    await this.showNameInput.fill(data.name);
    await this.showAddressInput.fill(data.address);
    await this.showCityInput.fill(data.city);
    await this.showStateInput.fill(data.state);
    await this.showZipInput.fill(data.zip);
    await this.page.evaluate((d) => {
      (document.getElementById('txtCalShowsStartDate') as HTMLInputElement).value = d.startDate;
      (document.getElementById('txtCalShowsEndDate') as HTMLInputElement).value   = d.endDate;
    }, data);
    await this.showCostInput.fill(data.cost);
  }

  async fillSponsorDetails(data: { name: string; startDate: string; endDate: string }): Promise<void> {
    await this.sponsorNameInput.fill(data.name);
    await this.page.evaluate((d) => {
      (document.getElementById('txtCalSponsorShipStartDate') as HTMLInputElement).value = d.startDate;
      (document.getElementById('txtCalSponsorShipEndDate') as HTMLInputElement).value   = d.endDate;
    }, data);
  }

  async fillComment(comment: string): Promise<void> {
    await this.commentTextarea.fill(comment);
  }

  async addOtherContact(email: string): Promise<void> {
    await this.otherContactInput.fill(email);
    await this.btnAddOtherContact.click();
  }

  async uploadFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator('#dropzone_fuBGImage input[type=file]');
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1_000);
  }

  async clickSubmit(): Promise<void> {
    await this.btnSubmit.click();
  }

  // -- Assertions ----------------------------------------------------------------

  async expectWizardVisible(): Promise<void> {
    await expect(this.wizardContainer).toBeVisible();
  }

  async expectMediaTilesVisible(): Promise<void> {
    await expect(this.mediaTiles.first()).toBeVisible({ timeout: 20_000 });
  }

  async expectMediaTileCount(count: number): Promise<void> {
    await expect(this.mediaTiles).toHaveCount(count, { timeout: 10_000 });
  }

  async expectFormStepVisible(): Promise<void> {
    // Check the form step container is active - adTitleInput is always visible in this step.
    await expect(this.adTitleInput).toBeVisible({ timeout: 15_000 });
  }

  /** Assert the Submit button is revealed (requires at least one field to have changed). */
  async expectSubmitButtonVisible(): Promise<void> {
    await expect(this.btnSubmit).toBeVisible({ timeout: 15_000 });
  }

  async expectSuccessPanel(): Promise<void> {
    await expect(this.successPanel).toBeVisible({ timeout: 30_000 });
  }

  async expectConfirmationNumber(): Promise<string> {
    await expect(this.confirmationNumber).not.toBeEmpty({ timeout: 30_000 });
    return (await this.confirmationNumber.textContent()) ?? '';
  }

  async expectEmailMePreFilled(): Promise<void> {
    await expect(this.emailMeInput).not.toHaveValue('');
    await expect(this.emailMeInput).toHaveAttribute('readonly');
  }

  async expectDealerTypeDropdownHasOptions(): Promise<void> {
    await expect(this.dealerTypeDropdown.locator('option')).toHaveCount(
      await this.dealerTypeDropdown.locator('option').count(),
    );
    expect(await this.dealerTypeDropdown.locator('option').count()).toBeGreaterThan(0);
  }

  /** FU-047: Modern POST requires SelectedFiscalYear hidden field to be present and non-empty. */
  async expectSelectedFiscalYearPresent(): Promise<void> {
    await expect(this.hdnSelectedFiscalYear).toBeAttached();
    const val = await this.hdnSelectedFiscalYear.inputValue();
    expect(val.trim().length).toBeGreaterThan(0);
    expect(Number(val)).toBeGreaterThan(2000);
  }
}
