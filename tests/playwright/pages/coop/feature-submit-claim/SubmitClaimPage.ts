import { Page, Locator, expect } from '@playwright/test';

/**
 * SubmitClaimPage — Page Object Model
 * URL: /CoopManagement/Claims/Submit/SubmitClaim
 *
 * Selectors sourced from:
 *   SubmitClaim.cshtml (legacy + modern — identical files, 2026-06-17)
 *   Live audit: PlatformToAPIWorkspace ClaimPage.ts (2026-06-09/15)
 *
 * Wizard steps for dealer role (no dealer-search step shown):
 *   Step 1 — Pre-approval type + contact info
 *   Step 3 — Media type tile selection
 *   Step 4 — Activity form + confirmation emails
 *   Step 5 — Success / Draft-saved panel
 */
export class SubmitClaimPage {
  readonly page: Page;
  readonly url = '/CoopManagement/Claims/Submit/SubmitClaim';

  // ── Wizard container ─────────────────────────────────────────────────────────
  readonly wizardContainer: Locator;

  // ── Step 1 — Claim type ──────────────────────────────────────────────────────
  // Radios are CSS-hidden; click adjacent div.selectBlock, not the input itself.
  readonly radioNoPreapproval:        Locator;
  readonly radioNoPreapprovalTrigger: Locator;
  readonly radioPreapproval:          Locator;
  readonly radioPreapprovalTrigger:   Locator;
  readonly preApprovalInput:          Locator;  // #txtAdCode maxlength=25
  readonly preApprovalHelpLink:       Locator;
  readonly preApprovalModal:          Locator;  // #preapprovallist
  readonly btnStep1Continue:          Locator;  // #btnClaimStep1
  readonly btnStep1Clear:             Locator;  // #btnclearpreapproval

  // ── Step 1 — Contact detail ──────────────────────────────────────────────────
  readonly contactNameInput:  Locator;
  readonly contactEmailInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly errContactName:    Locator;
  readonly errContactEmail:   Locator;
  readonly errContactPhone:   Locator;
  readonly btnStep1bContinue: Locator;  // #btnClaimStep2 (no-PA step 1b)

  // ── Step 3 — Media type ──────────────────────────────────────────────────────
  readonly mediaTiles:         Locator;  // ul.IconListRow li
  readonly dealerTypeDropdown: Locator;  // #programDealerTypeDropdown
  readonly btnMediaContinue:   Locator;  // #btnmediaselect

  // ── Step 4 — Activity form ───────────────────────────────────────────────────
  readonly invoiceAmountInput:   Locator;  // #txtInvoiceAmt maxlength=15
  readonly invoiceNumberInput:   Locator;  // #txtInvoiceNumber maxlength=20
  readonly mediaNameInput:       Locator;  // #txtMediaName maxlength=100
  readonly activityDateInput:    Locator;  // #hdtxtActivityDate (display picker)
  readonly btnAddActivityDate:   Locator;  // #btnAddActivityDate
  readonly activityDatesBody:    Locator;  // #tblActivityDateBody
  readonly dealerIdInput:        Locator;  // #txtDealerIdText (conditional)
  readonly activityCreativeType: Locator;  // #activityCreativeType (conditional)

  // ── Product lines (conditional on DisplayProductBlock config) ────────────────
  readonly productCodeDropdown: Locator;  // #drpProductCodes
  readonly productMeasurement:  Locator;  // #txtProductMeasurement
  readonly btnAddProduct:       Locator;  // #btnAddProduct
  readonly productLinesBody:    Locator;  // #tblProductLineBody
  readonly errProductLine:      Locator;  // #spnProductLineError

  // ── File uploads ─────────────────────────────────────────────────────────────
  readonly invoiceFileInput:    Locator;  // first input[type=file]
  readonly supportingFileInput: Locator;  // second input[type=file]
  readonly errInvoiceFile:      Locator;  // #spnInvoiceErrorFile

  // ── Activity table + controls ────────────────────────────────────────────────
  readonly btnAddToClaim:     Locator;  // #btnAddActivity — live text "Add to Claim"
  readonly btnCancelActivity: Locator;  // #btnCancelActivity
  readonly activityTableBody: Locator;  // #tblAdMediaBody

  // ── Step 4 — Confirmation emails ─────────────────────────────────────────────
  readonly emailMeInput:       Locator;  // #txtEmailMe (readonly, pre-filled)
  readonly otherContactInput:  Locator;  // #txtOtherMediaContact
  readonly btnAddOtherContact: Locator;  // #btnAddOtherContact
  readonly commentTextarea:    Locator;  // #txtMainComment maxlength=500

  // ── Submit / Save ─────────────────────────────────────────────────────────────
  readonly btnSaveForLater: Locator;  // #btnSubmitLater
  readonly btnSubmit:       Locator;  // #btnSubmit
  readonly btnBack:         Locator;  // #btnClaimWizardBack

  // ── Step 5 — Success panels ───────────────────────────────────────────────────
  readonly panelSubmitSuccess: Locator;  // #dvClaimSubmit
  readonly panelDraftSaved:    Locator;  // #dvClaimSubmitLater
  readonly claimConfirmNumber: Locator;  // #spnClaimConfirmationNumber
  readonly tempClaimNumber:    Locator;  // #spnTempClaimConfirmationNumber
  readonly btnSubmitNewClaim:  Locator;  // .clsSubmitNewClaim (hidden for BMDLR/DIST/BMDIST)
  readonly btnSubmitAnother:   Locator;  // .clsSubmitNewClaimSame

  // ── Budget display ────────────────────────────────────────────────────────────
  readonly budgetDisplay: Locator;  // #spnDealerBudget

  constructor(page: Page) {
    this.page = page;

    this.wizardContainer = page.locator('div.commonWizard');

    this.radioNoPreapproval        = page.locator("input[value='NoPreapproval']");
    this.radioNoPreapprovalTrigger = page.locator("input[value='NoPreapproval'] + div.selectBlock");
    this.radioPreapproval          = page.locator("input[value='Preapproval']");
    this.radioPreapprovalTrigger   = page.locator("input[value='Preapproval'] + div.selectBlock");
    this.preApprovalInput          = page.locator('#txtAdCode');
    this.preApprovalHelpLink       = page.locator('#lnkpreapprovallist');
    this.preApprovalModal          = page.locator('#preapprovallist');
    this.btnStep1Continue          = page.locator('#btnClaimStep1');
    this.btnStep1Clear             = page.locator('#btnclearpreapproval');

    this.contactNameInput  = page.locator('input[id*="ContactName"]').first();
    this.contactEmailInput = page.locator('input[id*="ContactEmail"]').first();
    this.contactPhoneInput = page.locator('input[id*="ContactPhone"]').first();
    this.errContactName    = page.locator('#spnErrContactName, #spnErrContactName1').first();
    this.errContactEmail   = page.locator('#spnErrContactEmail, #spnErrContactEmail1').first();
    this.errContactPhone   = page.locator('#spnErrContactPhone, #spnErrContactPhone1').first();
    this.btnStep1bContinue = page.locator('#btnClaimStep2');

    this.mediaTiles         = page.locator('ul.IconListRow li');
    this.dealerTypeDropdown = page.locator('#programDealerTypeDropdown');
    this.btnMediaContinue   = page.locator('#btnmediaselect');

    this.invoiceAmountInput   = page.locator('#txtInvoiceAmt');
    this.invoiceNumberInput   = page.locator('#txtInvoiceNumber');
    this.mediaNameInput       = page.locator('#txtMediaName');
    this.activityDateInput    = page.locator('#hdtxtActivityDate');
    this.btnAddActivityDate   = page.locator('#btnAddActivityDate');
    this.activityDatesBody    = page.locator('#tblActivityDateBody');
    this.dealerIdInput        = page.locator('#txtDealerIdText');
    this.activityCreativeType = page.locator('#activityCreativeType');

    this.productCodeDropdown = page.locator('#drpProductCodes');
    this.productMeasurement  = page.locator('#txtProductMeasurement');
    this.btnAddProduct       = page.locator('#btnAddProduct');
    this.productLinesBody    = page.locator('#tblProductLineBody');
    this.errProductLine      = page.locator('#spnProductLineError');

    this.invoiceFileInput    = page.locator('input[type=file]').first();
    this.supportingFileInput = page.locator('input[type=file]').nth(1);
    this.errInvoiceFile      = page.locator('#spnInvoiceErrorFile');

    this.btnAddToClaim     = page.locator('#btnAddActivity');
    this.btnCancelActivity = page.locator('#btnCancelActivity');
    this.activityTableBody = page.locator('#tblAdMediaBody');

    this.emailMeInput       = page.locator('#txtEmailMe');
    this.otherContactInput  = page.locator('#txtOtherMediaContact');
    this.btnAddOtherContact = page.locator('#btnAddOtherContact');
    this.commentTextarea    = page.locator('#txtMainComment');

    this.btnSaveForLater = page.locator('#btnSubmitLater');
    this.btnSubmit       = page.locator('#btnSubmit');
    this.btnBack         = page.locator('#btnClaimWizardBack');

    this.panelSubmitSuccess = page.locator('#dvClaimSubmit');
    this.panelDraftSaved    = page.locator('#dvClaimSubmitLater');
    this.claimConfirmNumber = page.locator('#spnClaimConfirmationNumber');
    this.tempClaimNumber    = page.locator('#spnTempClaimConfirmationNumber');
    this.btnSubmitNewClaim  = page.locator('.clsSubmitNewClaim');
    this.btnSubmitAnother   = page.locator('.clsSubmitNewClaimSame');

    this.budgetDisplay = page.locator('#spnDealerBudget');
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
  }

  async navigateWithTempSeq(encryptedSeq: string): Promise<void> {
    await this.page.goto(`${this.url}?temp_seq=${encryptedSeq}`, { waitUntil: 'domcontentloaded' });
    await expect(this.wizardContainer).toBeVisible({ timeout: 20_000 });
  }

  // ── Step 1 ───────────────────────────────────────────────────────────────────

  async selectNoPreapproval(): Promise<void> {
    await this.radioNoPreapprovalTrigger.click();
  }

  async selectYesPreapproval(preApprovalNum?: string): Promise<void> {
    await this.radioPreapprovalTrigger.click();
    if (preApprovalNum) {
      await this.preApprovalInput.fill(preApprovalNum);
      await this.preApprovalInput.blur();
    }
  }

  async advanceFromStep1(): Promise<void> {
    for (const id of ['#btnClaimStep1', '#btnPreapprovalClaimStep1', '#btnClaimStep2']) {
      const btn = this.page.locator(id);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        return;
      }
    }
  }

  // ── Step 3 ───────────────────────────────────────────────────────────────────

  async selectMediaTile(tileName: string): Promise<void> {
    const tile = this.mediaTiles.filter({ hasText: tileName }).first();
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
  }

  async advanceFromMediaStep(): Promise<void> {
    await this.btnMediaContinue.click();
    await expect(this.btnAddToClaim).toBeVisible({ timeout: 20_000 });
  }

  // ── Step 4 ───────────────────────────────────────────────────────────────────

  async fillActivity(opts: {
    mediaName:     string;
    invoiceNumber: string;
    invoiceAmount: string;
  }): Promise<void> {
    await this.mediaNameInput.fill(opts.mediaName);
    await this.invoiceNumberInput.fill(opts.invoiceNumber);
    await this.invoiceAmountInput.fill(opts.invoiceAmount);
  }

  async uploadInvoice(filePath: string): Promise<void> {
    await this.invoiceFileInput.setInputFiles(filePath);
  }

  async clickAddToClaim(): Promise<void> {
    await this.btnAddToClaim.click();
  }

  async saveForLater(): Promise<void> {
    await this.btnSaveForLater.click();
  }

  async submitClaim(): Promise<void> {
    await this.btnSubmit.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectWizardVisible(): Promise<void> {
    await expect(this.wizardContainer).toBeVisible();
  }

  async expectDefaultRadioIsNo(): Promise<void> {
    await expect(this.radioNoPreapproval).toBeChecked();
  }

  async expectMediaTileCount(count: number): Promise<void> {
    await expect(this.mediaTiles).toHaveCount(count, { timeout: 20_000 });
  }

  async expectCampaignAbsent(): Promise<void> {
    await expect(this.mediaTiles.filter({ hasText: 'Campaign' })).toHaveCount(0);
  }

  async expectActivityFormVisible(): Promise<void> {
    await expect(this.btnAddToClaim).toBeVisible({ timeout: 20_000 });
  }

  async expectDraftSuccess(): Promise<void> {
    await expect(this.panelDraftSaved).toBeVisible({ timeout: 45_000 });
  }

  async getTempClaimNumber(): Promise<string> {
    return (await this.tempClaimNumber.textContent()) ?? '';
  }

  async expectSubmitSuccess(): Promise<void> {
    await expect(this.panelSubmitSuccess).toBeVisible({ timeout: 45_000 });
  }

  async getFinalClaimNumber(): Promise<string> {
    return (await this.claimConfirmNumber.textContent()) ?? '';
  }

  async expectFieldMaxLength(field: Locator, maxLength: number): Promise<void> {
    await expect(field).toHaveAttribute('maxlength', String(maxLength));
  }

  async expectEmailMeReadonly(): Promise<void> {
    await expect(this.emailMeInput).toHaveAttribute('readonly', /.*/);
  }
}
