import { type Page, type Locator, type Response, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Page routes
// -----------------------------------------------------------------------------
// Internal code/routes always use "SPIFF" / "Spiff" even though the UI brands
// the feature as "Flip" / "Flip to Samsung" (see docs/modules/SPIFF.instructions.md
// and docs/scenarios/spiff-scenarios.md "Notes"). Route names below are the
// server-side page paths, confirmed against the .cshtml @page directives.
export const SPIFF_URLS = {
  currentSpiff:   '/Rewards/SPIFF/CurrentSPIFF',
  addClaim:       '/Rewards/SPIFF/AddClaim',
  searchClaim:    '/Rewards/SPIFF/SearchClaim',
  processClaims:  '/Rewards/SPIFF/ProcessClaims',
  registration:   '/Rewards/SPIFF/Registration',
  activateAccount:'/Rewards/SPIFF/ActivateAccount',
  saveW9Tax:      '/Rewards/SPIFF/SaveW9TaxInformation',
  dashboard:      '/Rewards/SPIFF/Dashboard/SpiffDashboard',
} as const;

// Rebate/claim line status sequences confirmed from flip-program-test-suite.spec.js
// (select.selectStatus option values) and docs/modules/SPIFF.instructions.md's
// "Config Values" table.
export const SPIFF_STATUS = {
  approve: '4',
  deny:    '5',
} as const;

export interface ClaimHeaderInput {
  quoteNumber:        string;
  dateOfSale:          string; // MM/DD/YYYY - bootstrap-datepicker format
  projectName:         string;
  projectCity:         string;
  projectState:        string;
  originalBOD:         string;
  engineeringFirm:     string;
  engineeringContact:  string;
  engineeringPhone:    string;
  engineeringEmail:    string;
  submissionComments?: string;
}

// -----------------------------------------------------------------------------
// SpiffClaimPage - Sales Associate claim submission (AddClaim.cshtml)
// -----------------------------------------------------------------------------
// NOTE: AddClaim.cshtml requires encrypted `RebateId` and `seq` (campaign seq)
// query params (see AddClaimModel.OnGet) - a client cannot construct a valid
// encrypted URL directly. The real navigation path is CurrentSPIFF -> pick a
// flip program -> "Submit a Claim" (mirrored below by
// openClaimFormForProgram()), matching flip-claim-submission.spec.js /
// flip-program-test-suite.spec.js's own navigation flow.
export class SpiffClaimPage {
  readonly page: Page;
  readonly url = SPIFF_URLS.addClaim;

  // Hidden state fields
  readonly hdnUserContactSeq:     Locator;
  readonly hdnRebateCampaignSeq:  Locator;
  readonly hdnUserType:           Locator;
  readonly hdnProgramSeq:         Locator;
  readonly hdnRebateSeqId:        Locator;
  readonly hdnRebateStatusSeq:    Locator;
  readonly hdnDealerNumberSeq:    Locator;

  // Form heading
  readonly formTitle: Locator;

  // Header fields
  readonly quoteNumberInput:         Locator;
  readonly dateOfSaleInput:          Locator;
  readonly projectNameInput:         Locator;
  readonly projectCityInput:         Locator;
  readonly projectStateInput:        Locator;
  readonly originalBODInput:         Locator;
  readonly engineeringFirmNameInput: Locator;
  readonly engineeringContactInput:  Locator;
  readonly engineeringPhoneInput:    Locator;
  readonly engineeringPhoneError:    Locator;
  readonly engineeringEmailInput:    Locator;
  readonly engineeringEmailError:    Locator;
  readonly submissionCommentsInput:  Locator;
  readonly submissionCommentsError:  Locator;

  // Tonnage (line item) fields
  readonly tonnageR410AInput:      Locator;
  readonly tonnageR410AError:      Locator;
  readonly tonnageOtherInput:      Locator;
  readonly tonnageOtherError:      Locator;
  readonly atLeastOneTonnageError: Locator;

  // Document upload (Dropzone.js) - container id, hidden input, and error
  // span confirmed against the live UAT DOM. #lblUploadedFileName is a
  // single-file legacy link that stays empty in the current multi-document
  // Dropzone flow; the three per-file preview rows (filename link + Remove
  // link) that actually render on upload use Dropzone-generated markup whose
  // class names were not confirmed live - do not rely on uploadedFileNameLink
  // to assert "N documents uploaded" until that markup is captured.
  readonly dropzoneUpload:       Locator;
  readonly dropzoneFileInput:    Locator;
  readonly uploadedFileNameLink: Locator;
  readonly documentError:        Locator;

  // Line item grid + actions
  readonly addLineItemButton:  Locator;
  readonly editLineItemButton: Locator;
  readonly cancelAddButton:    Locator;
  readonly claimLinesTable:    Locator;
  readonly claimLinesRows:     Locator;

  // Terms & submission
  readonly acceptTermsCheckbox: Locator;
  readonly acceptTermsError:    Locator;
  readonly submitClaimButton:   Locator;
  readonly cancelClaimButton:   Locator;

  // Success panel
  readonly claimSubmittedPanel: Locator;
  readonly claimNumberSpan:     Locator;

  constructor(page: Page) {
    this.page = page;

    this.hdnUserContactSeq    = page.locator('#hdnUserContactSeq');
    this.hdnRebateCampaignSeq = page.locator('#hdnRebateCampaignSeq');
    this.hdnUserType          = page.locator('#hdnUserType');
    this.hdnProgramSeq        = page.locator('#hdnProgramSeq');
    this.hdnRebateSeqId       = page.locator('#hdnRebateSeqId');
    this.hdnRebateStatusSeq   = page.locator('#hdnRebateStatusSeq');
    this.hdnDealerNumberSeq   = page.locator('#hdnDealerNumberSeq');

    this.formTitle = page.locator('#programTitle');

    this.quoteNumberInput         = page.locator('#txtInvoiceNo');
    this.dateOfSaleInput          = page.locator('#txtDateOfSale');
    this.projectNameInput         = page.locator('#txtProjectName');
    this.projectCityInput         = page.locator('#txtProjectCity');
    this.projectStateInput        = page.locator('#txtProjectState');
    this.originalBODInput         = page.locator('#txtOriginalBOD');
    this.engineeringFirmNameInput = page.locator('#txtEngineeringFirmName');
    this.engineeringContactInput  = page.locator('#txtEngineeringContact');
    this.engineeringPhoneInput    = page.locator('#txtEngineeringPhone');
    this.engineeringPhoneError    = page.locator('#spnPhoneError');
    this.engineeringEmailInput    = page.locator('#txtEngineeringEmail');
    this.engineeringEmailError    = page.locator('#spnEmailError');
    this.submissionCommentsInput  = page.locator('#txtSubmissionComments');
    this.submissionCommentsError  = page.locator('#spnCommentsError');

    this.tonnageR410AInput      = page.locator('#txtQuantityR410A');
    this.tonnageR410AError      = page.locator('#spnQuantityR410AError');
    this.tonnageOtherInput      = page.locator('#txtQuantityOther');
    this.tonnageOtherError      = page.locator('#spnQuantityOtherError');
    this.atLeastOneTonnageError = page.locator('#spnAtLeastOneError');

    // Confirmed live: Dropzone's click-to-upload handler is bound to the
    // outer .uploadBlock wrapper, not #dropzone_fuBGImage itself (despite
    // the latter carrying the dz-clickable CSS class) - clicking
    // #dropzone_fuBGImage directly never opens the file chooser.
    this.dropzoneUpload       = page.locator('.uploadBlock');
    this.dropzoneFileInput    = page.locator('#dropzone_fuBGImage input[type="file"]');
    this.uploadedFileNameLink = page.locator('#lblUploadedFileName');
    this.documentError        = page.locator('#BG_Error');

    this.addLineItemButton  = page.locator('#btnAddItem');
    this.editLineItemButton = page.locator('.EditClaimLine');
    this.cancelAddButton    = page.locator('#btnAddCancel');
    this.claimLinesTable    = page.locator('#tblClaimLines');
    this.claimLinesRows     = page.locator('#tblClaimLines tbody tr');

    this.acceptTermsCheckbox = page.locator('#chkAccept');
    this.acceptTermsError    = page.locator('#acceptreq');
    this.submitClaimButton   = page.locator('#btnAddClaim');
    this.cancelClaimButton   = page.locator('#btnCancel');

    this.claimSubmittedPanel = page.locator('#dvClaimSubmit');
    this.claimNumberSpan     = page.locator('.spnClaimNumber');
  }

  async navigateToCurrentSpiff(): Promise<void> {
    await this.page.goto(SPIFF_URLS.currentSpiff);
  }

  /**
   * Real-world claim-form entry path (no direct deep link - see class note):
   * CurrentSPIFF -> row containing `programName` -> its "Submit a Claim" action.
   * Mirrors flip-program-test-suite.spec.js TC-03/TC-04. Scoped to
   * #tblReport (confirmed id, CurrentSPIFF.cshtml:97) rather than a broad
   * tag/class union - an earlier, unscoped version of this locator matched
   * an unrelated page element and caused SPIFF-SMOKE-003 to time out.
   */
  async openClaimFormForProgram(programName: string): Promise<void> {
    await this.navigateToCurrentSpiff();
    const programRow = this.page
      .locator('#tblReport tbody tr')
      .filter({ hasText: programName });
    const rowCount = await programRow.count();
    if (rowCount === 0) {
      throw new Error(
        `Expected SPIFF program "${programName}" to appear on CurrentSPIFF, but no matching row was found.`
      );
    }
    await programRow
      .first()
      .locator('button, a')
      .filter({ hasText: /submit a claim/i })
      .first()
      .click();
    await this.quoteNumberInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async waitForReady(): Promise<void> {
    await expect(this.quoteNumberInput).toBeVisible();
  }

  async fillHeaderFields(claim: ClaimHeaderInput): Promise<void> {
    await this.quoteNumberInput.fill(claim.quoteNumber);
    await this.setDateOfSale(claim.dateOfSale);
    await this.projectNameInput.fill(claim.projectName);
    await this.projectCityInput.fill(claim.projectCity);
    await this.projectStateInput.fill(claim.projectState);
    await this.originalBODInput.fill(claim.originalBOD);
    await this.engineeringFirmNameInput.fill(claim.engineeringFirm);
    await this.engineeringContactInput.fill(claim.engineeringContact);
    await this.engineeringPhoneInput.fill(claim.engineeringPhone);
    await this.engineeringEmailInput.fill(claim.engineeringEmail);
    if (claim.submissionComments) {
      await this.submissionCommentsInput.fill(claim.submissionComments);
    }
  }

  /**
   * #txtDateOfSale is a readonly bootstrap-datepicker input - fill() cannot
   * set it; the field must be driven through the datepicker's own jQuery API,
   * matching the Samsung source spec's own approach.
   */
  async setDateOfSale(dateStr: string): Promise<void> {
    await this.dateOfSaleInput.waitFor({ state: 'visible' });
    await this.page.evaluate((d) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $ = (window as any).$;
      $('#txtDateOfSale').datepicker('setDate', d);
      $('#txtDateOfSale').trigger('change');
    }, dateStr);
  }

  async fillTonnage(r410a: string, other: string): Promise<void> {
    await this.tonnageR410AInput.waitFor({ state: 'visible' });
    await this.tonnageR410AInput.fill(r410a);
    await this.tonnageOtherInput.fill(other);
  }

  /**
   * Uploads via Dropzone's native flow: click the dropzone to open the file
   * chooser, then set the file(s) on it. Confirmed live this session that
   * setting files directly on the hidden input (bypassing the click) does
   * NOT reliably trigger Dropzone's upload - the click-triggered path is the
   * only one confirmed to actually fire the upload request.
   *
   * Then waits for Dropzone's async upload POST to finish - without this,
   * "Add line item" can be clicked before the file has actually finished
   * uploading server-side, silently blocking the line from being added
   * (confirmed live: the same single-file upload succeeds when there's
   * natural delay before "Add line item" is clicked, but fails when the two
   * actions fire back-to-back with no wait). Endpoint confirmed live via
   * network capture: POST .../Rewards/SPIFF/AddClaim/UploadDoc - note this
   * does NOT match test-data.json's expectedEndpoints.uploadDoc
   * ("OnPostUploadDoc"), which appears to be a systematic naming mismatch
   * across that whole block (real URLs use the bare handler name, not the
   * "OnPost"-prefixed C# method name) - not fixed here, out of scope for
   * this change, flagged for a follow-up pass.
   */
  async uploadInvoiceDocument(filePath: string | string[]): Promise<void> {
    // AddClaim fires several background AJAX calls on load (RebateCampaign
    // lookup, UserStore, invoice-file list); clicking the dropzone before
    // these settle intermittently misses Dropzone's click handler entirely
    // (confirmed live: repeated runs sometimes never opened a file chooser
    // at all). Wait for the page to go quiet first.
    await this.page.waitForLoadState('networkidle');
    await this.dropzoneUpload.waitFor({ state: 'visible', timeout: 15_000 });

    const uploadResponse = this.page.waitForResponse(
      (r) => r.url().includes('/UploadDoc') && r.request().method() === 'POST',
      { timeout: 30_000 }
    );
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.dropzoneUpload.click(),
    ]);
    await fileChooser.setFiles(filePath);
    await uploadResponse;
  }

  /**
   * Clicking "Add line item" triggers an async validation/save round-trip
   * (a loading spinner briefly appears) before #tblClaimLines actually
   * updates - confirmed live: checking the row count immediately after the
   * click can read a stale (zero-row) state, and this isn't reliably tied
   * to network idle. Wait directly for the expected outcome: the first
   * claim-line row actually appearing.
   */
  async addLineItem(): Promise<void> {
    await this.addLineItemButton.waitFor({ state: 'visible', timeout: 15_000 });
    await this.addLineItemButton.click();
    await this.claimLinesRows.first().waitFor({ state: 'attached', timeout: 20_000 });
  }

  async getClaimLineCount(): Promise<number> {
    return this.claimLinesRows.count();
  }

  /** Confirmed live: #chkAccept renders as a normal, visible checkbox (class "require-one"). */
  async acceptTerms(): Promise<void> {
    await this.acceptTermsCheckbox.waitFor({ state: 'visible' });
    await this.acceptTermsCheckbox.check();
    await expect(this.acceptTermsCheckbox).toBeChecked();
  }

  async submitClaim(): Promise<void> {
    await this.submitClaimButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.submitClaimButton.click();
  }

  async waitForClaimSubmitted(): Promise<void> {
    await this.page
      .locator('#dvClaimSubmit, .spnClaimNumber')
      .first()
      .waitFor({ state: 'visible', timeout: 60_000 });
  }

  async getClaimNumber(): Promise<string> {
    await this.claimNumberSpan.waitFor({ state: 'visible', timeout: 15_000 });
    const raw = await this.claimNumberSpan.textContent();
    const claimNumber = raw ? raw.trim() : '';
    if (!claimNumber) {
      throw new Error(
        'Expected a claim number in .spnClaimNumber after submission, but the element was empty.'
      );
    }
    return claimNumber;
  }

  async expectPhoneValidationError(): Promise<void> {
    await expect(this.engineeringPhoneError).toBeVisible();
  }

  async expectNoPhoneValidationError(): Promise<void> {
    await expect(this.engineeringPhoneError).toBeHidden();
  }

  async expectEmailValidationError(): Promise<void> {
    await expect(this.engineeringEmailError).toBeVisible();
  }

  async expectAtLeastOneTonnageError(): Promise<void> {
    await expect(this.atLeastOneTonnageError).toBeVisible();
  }

  async expectNoClaimLines(): Promise<void> {
    await expect(this.claimLinesRows).toHaveCount(0);
  }
}

// -----------------------------------------------------------------------------
// SpiffAdminProcessPage - Admin claim approve/deny (ProcessClaims.cshtml)
// -----------------------------------------------------------------------------
// NOTE: ProcessClaims requires an encrypted `RebateId` query param, produced
// server-side by SearchClaimModel.OnPostProcessClick and rendered as the
// Action column's "Process" link (`a[href*="ProcessClaims"]`) on
// SpiffClaimHistoryPage. There is no way to construct this URL directly -
// navigate() below is only usable with a RebateId captured from that link;
// prefer SpiffClaimHistoryPage.clickProcessIconForClaim() in tests.
export class SpiffAdminProcessPage {
  readonly page: Page;
  readonly url = SPIFF_URLS.processClaims;

  readonly hdnRebateSeqId: Locator;

  readonly approveAllButton: Locator;
  readonly denyAllButton:    Locator;
  readonly holdAllButton:    Locator;

  readonly claimLinesTable: Locator;
  readonly claimLineRows:   Locator;
  readonly selectAllCheckbox: Locator;

  readonly processButton:       Locator;
  readonly processCancelButton: Locator;
  readonly successMessage:      Locator;

  constructor(page: Page) {
    this.page = page;

    this.hdnRebateSeqId = page.locator('#hdnRebateSeqId');

    this.approveAllButton = page.locator('#btnApprove');
    this.denyAllButton    = page.locator('#btnDeny');
    this.holdAllButton    = page.locator('#btnhold');

    this.claimLinesTable   = page.locator('#tblClaimLines');
    this.claimLineRows     = page.locator('#tblClaimLines tbody tr');
    this.selectAllCheckbox = page.locator('.headerChkRebate');

    this.processButton       = page.locator('#btnProcess');
    this.processCancelButton = page.locator('#btnProcessCancel');
    this.successMessage      = page.locator('.divSuccessMsg');
  }

  /** `encryptedRebateId` must come from a "Process" action link already rendered by the app (see class note). */
  async navigate(encryptedRebateId: string): Promise<void> {
    await this.page.goto(`${this.url}?RebateId=${encodeURIComponent(encryptedRebateId)}`);
  }

  async waitForReady(): Promise<void> {
    await this.approveAllButton.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async getLineItemCount(): Promise<number> {
    return this.claimLineRows.count();
  }

  async checkLineItem(rowIndex: number): Promise<void> {
    await this.claimLineRows.nth(rowIndex).locator('input.chkRebate').check({ force: true });
  }

  async checkAllLineItems(): Promise<void> {
    const count = await this.getLineItemCount();
    for (let i = 0; i < count; i++) {
      await this.checkLineItem(i);
    }
  }

  async setLineStatus(rowIndex: number, status: 'approve' | 'deny'): Promise<void> {
    const value = status === 'approve' ? SPIFF_STATUS.approve : SPIFF_STATUS.deny;
    await this.claimLineRows.nth(rowIndex).locator('select.selectStatus').selectOption(value);
  }

  /** `.dvDenyReason` is a Chosen-enhanced multi-select - interact via its rendered widget, not the hidden <select>. */
  async selectDenialReason(rowIndex: number): Promise<void> {
    const reasonWidget = this.claimLineRows.nth(rowIndex).locator('.dvDenyReason .chosen-container');
    await reasonWidget.waitFor({ state: 'visible', timeout: 10_000 });
    await reasonWidget.click();
    const reasonOption = reasonWidget.locator('.chosen-results li.active-result').first();
    await reasonOption.waitFor({ state: 'visible', timeout: 10_000 });
    await reasonOption.click();
  }

  async fillComments(rowIndex: number, comment: string): Promise<void> {
    await this.claimLineRows.nth(rowIndex).locator('textarea.txtComments').fill(comment);
  }

  async clickProcess(): Promise<void> {
    await this.processButton.click();
  }

  async waitForProcessed(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 20_000 });
  }
}

// -----------------------------------------------------------------------------
// SpiffClaimHistoryPage - Claim search / history (SearchClaim.cshtml)
// Serves two roles from the same page: SA "View Claim History" (own claims)
// and Admin "Process Claim" search (?action=process). Fields marked
// "asp-for-derived id" below are inferred from ASP.NET Core's default
// TagHelper id-generation (id = property name) - not a literal id= attribute
// seen in the raw HTML; verify against the rendered DOM before relying on
// them for anything beyond what this feature already exercises.
// -----------------------------------------------------------------------------
export class SpiffClaimHistoryPage {
  readonly page: Page;
  readonly url = SPIFF_URLS.searchClaim;

  readonly claimIdInput:        Locator;
  readonly quoteNumberInput:    Locator;
  readonly businessNumberInput: Locator; // admin/SCF only

  // asp-for-derived ids (Model.Spiff -> #Spiff, Model.ClaimStatus -> #ClaimStatus,
  // Model.StartDate -> #StartDate, Model.EndDate -> #EndDate) - needs verification.
  readonly spiffFilterSelect:  Locator;
  readonly claimStatusSelect:  Locator;
  readonly startDateInput:     Locator;
  readonly endDateInput:       Locator;

  readonly storeNameSelect:        Locator; // #dropdownStoreOwner
  readonly storeLocationSelect:    Locator; // #dropdownStoreName
  readonly salesAssociateSelect:   Locator; // #dropdownSalesAssociate
  readonly payTypeSelect:          Locator; // #lstPMtype

  readonly searchButtonHistory:     Locator; // #btnSearch (default history mode)
  readonly searchButtonProcessMode: Locator; // #btnProcess (PageAction == "process")
  readonly resetButtonHistory:      Locator; // #resetFilerts
  readonly resetButtonProcessMode:  Locator; // #resetprocessFilerts

  readonly resultsTable: Locator;
  readonly resultsRows:  Locator;

  readonly exportButton: Locator;
  readonly exportModal:  Locator;

  readonly deleteConfirmModal:  Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.claimIdInput        = page.locator('input[name="ClaimID"]');
    this.quoteNumberInput    = page.locator('input[name="InvoiceNo"]');
    this.businessNumberInput = page.locator('input[name="StoreNo"]');

    this.spiffFilterSelect = page.locator('#Spiff');
    this.claimStatusSelect = page.locator('#ClaimStatus');
    this.startDateInput    = page.locator('#StartDate');
    this.endDateInput      = page.locator('#EndDate');

    this.storeNameSelect      = page.locator('#dropdownStoreOwner');
    this.storeLocationSelect  = page.locator('#dropdownStoreName');
    this.salesAssociateSelect = page.locator('#dropdownSalesAssociate');
    this.payTypeSelect        = page.locator('#lstPMtype');

    this.searchButtonHistory     = page.locator('#btnSearch');
    this.searchButtonProcessMode = page.locator('#btnProcess');
    this.resetButtonHistory      = page.locator('#resetFilerts');
    this.resetButtonProcessMode  = page.locator('#resetprocessFilerts');

    this.resultsTable = page.locator('#tblReport');
    this.resultsRows  = page.locator('#tblReport tbody tr');

    this.exportButton = page.locator('.btnExportTable');
    this.exportModal  = page.locator('#exportFormatModal');

    this.deleteConfirmModal  = page.locator('#modelDeleteClaim');
    this.confirmDeleteButton = page.locator('#confirmDelete');
  }

  async navigate(mode: 'history' | 'process' = 'history'): Promise<void> {
    const qs = mode === 'process' ? '?action=process' : '';
    await this.page.goto(`${this.url}${qs}`);
  }

  async waitForReady(): Promise<void> {
    await expect(this.claimIdInput).toBeVisible({ timeout: 20_000 });
  }

  async searchByClaimId(claimId: string): Promise<void> {
    await this.claimIdInput.fill(claimId);
  }

  async searchByQuoteNumber(quoteNumber: string): Promise<void> {
    await this.quoteNumberInput.fill(quoteNumber);
  }

  async searchByBusinessNumber(businessNumber: string): Promise<void> {
    await this.businessNumberInput.fill(businessNumber);
  }

  async clickSearch(mode: 'history' | 'process' = 'history'): Promise<void> {
    const button = mode === 'process' ? this.searchButtonProcessMode : this.searchButtonHistory;
    await button.click();
  }

  async waitForResultsResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (r) => r.url().includes('SearchClaim') && r.request().method() === 'POST' && r.status() === 200
    );
  }

  async getResultRowCount(): Promise<number> {
    return this.resultsRows.count();
  }

  getResultRowByText(text: string): Locator {
    return this.resultsRows.filter({ hasText: text }).first();
  }

  async clickProcessIconForClaim(claimId: string): Promise<void> {
    const row = this.getResultRowByText(claimId);
    const processIcon = row.locator('a[href*="ProcessClaims"]').first();
    await processIcon.waitFor({ state: 'visible', timeout: 10_000 });
    await processIcon.click();
  }

  async clickEditIconForClaim(claimId: string): Promise<void> {
    const row = this.getResultRowByText(claimId);
    const editIcon = row.locator('a[href*="AddClaim"]').first();
    await editIcon.waitFor({ state: 'visible', timeout: 10_000 });
    await editIcon.click();
  }

  /**
   * DataTables "no results" state: either #tblReport is absent (server-side
   * partial renders `_NoReportDataFound` instead - markup not confirmed, see
   * report) or its tbody shows a single dataTables_empty row.
   */
  async expectNoResults(): Promise<void> {
    const tableVisible = await this.resultsTable.isVisible();
    if (!tableVisible) return;
    const isEmptyVisible = await this.resultsTable.locator('td.dataTables_empty').isVisible();
    if (isEmptyVisible) return;
    await expect(this.resultsRows).toHaveCount(0);
  }
}
