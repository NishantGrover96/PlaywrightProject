import { Page, Locator } from '@playwright/test';

/**
 * Asset Upload Page Object
 * Represents the Asset Upload feature in DeerAd Builder
 * 
 * URL: /DAL/frmAssetUpload.aspx
 * Region-aware: Supports both Region 1 (NA) and Region 2 (AU)
 */
export class AssetUploadPage {
  readonly page: Page;
  readonly url = '/DAL/frmAssetUpload.aspx';

  // -----------------------------------------------------------------------------
  // LOCATORS - Upload Section
  // -----------------------------------------------------------------------------

  readonly uploadDropzone: Locator;
  readonly uploadProgressBar: Locator;
  readonly uploadedThumbnail: Locator;
  readonly fileInput: Locator;

  // -----------------------------------------------------------------------------
  // LOCATORS - Left Sidebar (Asset Tree)
  // -----------------------------------------------------------------------------

  readonly assetTreeContainer: Locator;
  readonly folderCheckboxes: Locator;
  readonly selectedFolderLabel: Locator;

  // -----------------------------------------------------------------------------
  // LOCATORS - Asset Metadata Form (Right Panel)
  // -----------------------------------------------------------------------------

  readonly displayNameInput: Locator;
  readonly assetTypeSelect: Locator;
  readonly localeCheckboxes: Locator;
  readonly divisionCheckboxes: Locator;
  readonly statusSelect: Locator;
  readonly colorSelect: Locator;                    // Region 1 only, images only
  readonly settingSelect: Locator;                  // Region 1 only, images only
  readonly trackingNumberInput: Locator;            // Region 1 only
  readonly customerSegmentSelect: Locator;          // Region 1 only, AI-populated
  readonly productSegmentSelect: Locator;           // Region 1 only
  readonly imageIdInputs: Locator;                  // Multiple fields (up to 5)
  readonly keywordsContentEditable: Locator;        // Keywords input (contenteditable div)
  readonly releaseDateInput: Locator;
  readonly endDateInput: Locator;
  readonly notifyGroupsCheckbox: Locator;
  readonly manualEmailsInput: Locator;
  readonly adminOnlyCheckbox: Locator;

  // -----------------------------------------------------------------------------
  // LOCATORS - Buttons
  // -----------------------------------------------------------------------------

  readonly saveButton: Locator;
  readonly updateButton: Locator;
  readonly saveAndNewButton: Locator;
  readonly saveDuplicateButton: Locator;
  readonly cancelButton: Locator;

  // -----------------------------------------------------------------------------
  // LOCATORS - Messages & Validation
  // -----------------------------------------------------------------------------

  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly validationErrorSummary: Locator;
  readonly fieldErrorMessages: Locator;

  constructor(page: Page) {
    this.page = page;

    // Upload section
    this.uploadDropzone = page.locator('#dZUploadImageFile');
    this.uploadProgressBar = page.locator('.dz-progress');
    this.uploadedThumbnail = page.locator('.uploadView img');
    this.fileInput = page.locator('input[type="file"]');

    // Left sidebar (asset tree)
    this.assetTreeContainer = page.locator('#dvAssetTree');
    this.folderCheckboxes = page.locator('#dvAssetTree input[type="checkbox"]');
    this.selectedFolderLabel = page.locator('#dvAssetTree .selected');

    // Asset metadata form
    this.displayNameInput = page.locator('#txtDisplayName, #DisplayName');
    this.assetTypeSelect = page.locator('#ddlAssetType, select[name="AssetType"]');
    this.localeCheckboxes = page.locator('input[name="Locale"]');
    this.divisionCheckboxes = page.locator('input[name="Division"]');
    this.statusSelect = page.locator('#ddlStatus, select[name="Status"]');
    this.colorSelect = page.locator('#ddlColor, select[name="Color"]');
    this.settingSelect = page.locator('#ddlSetting, select[name="Setting"]');
    this.trackingNumberInput = page.locator('#txtTrackingNo, #TrackingNumber');
    this.customerSegmentSelect = page.locator('#ddlCustomerSegment, select[name="CustomerSegment"]');
    this.productSegmentSelect = page.locator('#ddlProductSegment, select[name="ProductSegment"]');
    this.imageIdInputs = page.locator('input[name^="ImageID"]');
    this.keywordsContentEditable = page.locator('#dvTags, div[contenteditable="true"][data-field="keywords"]');
    this.releaseDateInput = page.locator('#txtReleaseDate, #ReleaseDate');
    this.endDateInput = page.locator('#txtEndDate, #EndDate');
    this.notifyGroupsCheckbox = page.locator('#chkNotifyGroups, input[name="NotifyGroups"]');
    this.manualEmailsInput = page.locator('#txtManualEmails, #ManualEmails');
    this.adminOnlyCheckbox = page.locator('#chkAdminOnly, input[name="AdminOnly"]');

    // Buttons
    this.saveButton = page.locator('button:has-text("Save"), button:has-text("Save Asset")');
    this.updateButton = page.locator('button:has-text("Update"), button:has-text("Update Asset")');
    this.saveAndNewButton = page.locator('button:has-text("Save & New")');
    this.saveDuplicateButton = page.locator('button:has-text("Save & Duplicate")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // Messages & validation
    this.successToast = page.locator('.toast-success, .alert-success, [role="alert"].success');
    this.errorToast = page.locator('.toast-error, .alert-danger, [role="alert"].error');
    this.validationErrorSummary = page.locator('.validation-summary, .alert-danger ul');
    this.fieldErrorMessages = page.locator('.field-validation-error, .text-danger');
  }

  // -----------------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------------

  async navigate(assetId?: string): Promise<void> {
    if (assetId) {
      await this.page.goto(`${this.url}?AssetId=${encodeURIComponent(assetId)}`);
    } else {
      await this.page.goto(this.url);
    }
    await this.page.waitForLoadState('networkidle');
  }

  // -----------------------------------------------------------------------------
  // Upload Actions
  // -----------------------------------------------------------------------------

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    // Wait for upload to complete (progress bar disappears)
    await this.page.waitForTimeout(500); // Brief pause for upload to start
    await this.uploadProgressBar.first().waitFor({ state: 'hidden', timeout: 30000 });
  }

  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    await this.fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(500);
    const progressBars = this.page.locator('.dz-progress');
    const count = await progressBars.count();
    for (let i = 0; i < count; i++) {
      await progressBars.nth(i).waitFor({ state: 'hidden', timeout: 30000 });
    }
  }

  async getThumbnailImageUrl(): Promise<string | null> {
    return this.uploadedThumbnail.getAttribute('src');
  }

  // -----------------------------------------------------------------------------
  // Form Filling Actions
  // -----------------------------------------------------------------------------

  async fillDisplayName(name: string): Promise<void> {
    await this.displayNameInput.fill(name);
  }

  async selectAssetType(assetType: string): Promise<void> {
    await this.assetTypeSelect.selectOption(assetType);
  }

  async getAssetType(): Promise<string | null> {
    return this.assetTypeSelect.inputValue();
  }

  async selectLocales(localeValues: string[]): Promise<void> {
    // Uncheck all first
    const checkboxes = await this.localeCheckboxes.all();
    for (const checkbox of checkboxes) {
      await checkbox.uncheck();
    }
    // Check selected locales
    for (const locale of localeValues) {
      await this.page.locator(`input[name="Locale"][value="${locale}"]`).check();
    }
  }

  async selectDivisions(divisionValues: string[]): Promise<void> {
    const checkboxes = await this.divisionCheckboxes.all();
    for (const checkbox of checkboxes) {
      await checkbox.uncheck();
    }
    for (const div of divisionValues) {
      await this.page.locator(`input[name="Division"][value="${div}"]`).check();
    }
  }

  async selectStatus(statusValue: string): Promise<void> {
    await this.statusSelect.selectOption(statusValue);
  }

  async selectColor(colorValue: string): Promise<void> {
    await this.colorSelect.selectOption(colorValue);
  }

  async selectSetting(settingValue: string): Promise<void> {
    await this.settingSelect.selectOption(settingValue);
  }

  async fillTrackingNumber(trackingNo: string): Promise<void> {
    await this.trackingNumberInput.fill(trackingNo);
  }

  async selectCustomerSegment(segmentValue: string): Promise<void> {
    await this.customerSegmentSelect.selectOption(segmentValue);
  }

  async selectProductSegment(segmentValue: string): Promise<void> {
    await this.productSegmentSelect.selectOption(segmentValue);
  }

  async fillImageIds(imageIds: string[]): Promise<void> {
    const inputs = await this.imageIdInputs.all();
    for (let i = 0; i < imageIds.length && i < inputs.length; i++) {
      await inputs[i].fill(imageIds[i]);
    }
  }

  async addKeywordTag(keyword: string): Promise<void> {
    await this.keywordsContentEditable.click();
    await this.page.keyboard.type(keyword);
    await this.page.keyboard.press('Enter');
  }

  async fillReleaseDate(date: string): Promise<void> {
    await this.releaseDateInput.fill(date);
  }

  async fillEndDate(date: string): Promise<void> {
    await this.endDateInput.fill(date);
  }

  async selectFolder(folderName: string): Promise<void> {
    const folderCheckbox = this.page.locator(`label:has-text("${folderName}") input[type="checkbox"]`);
    await folderCheckbox.check();
  }

  async fillManualEmails(emails: string): Promise<void> {
    await this.manualEmailsInput.fill(emails);
  }

  async checkNotifyGroups(): Promise<void> {
    await this.notifyGroupsCheckbox.check();
  }

  async checkAdminOnly(): Promise<void> {
    await this.adminOnlyCheckbox.check();
  }

  // -----------------------------------------------------------------------------
  // Form Submission
  // -----------------------------------------------------------------------------

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async update(): Promise<void> {
    await this.updateButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async saveAndNew(): Promise<void> {
    await this.saveAndNewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async saveDuplicate(): Promise<void> {
    await this.saveDuplicateButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // -----------------------------------------------------------------------------
  // Validation & Assertions
  // -----------------------------------------------------------------------------

  async getValidationErrors(): Promise<string[]> {
    const errorMessages = await this.fieldErrorMessages.allTextContents();
    return errorMessages.filter((msg) => msg.trim().length > 0);
  }

  async getErrorMessage(fieldLabel: string): Promise<string | null> {
    const field = this.page.locator(`label:has-text("${fieldLabel}") ~ .field-validation-error`);
    return field.textContent();
  }

  async getSuccessMessage(): Promise<string | null> {
    return this.successToast.textContent();
  }

  async expectSuccessMessage(expectedText?: string): Promise<void> {
    await this.successToast.waitFor({ state: 'visible', timeout: 5000 });
    if (expectedText) {
      const text = await this.successToast.textContent();
      if (!text?.includes(expectedText)) {
        throw new Error(`Expected success message to include "${expectedText}", but got "${text}"`);
      }
    }
  }

  async expectErrorMessage(expectedText: string): Promise<void> {
    const error = this.page.locator(`text="${expectedText}"`);
    await error.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isUploadSectionVisible(): Promise<boolean> {
    return this.uploadDropzone.isVisible();
  }

  async isEditMode(): Promise<boolean> {
    return this.updateButton.isVisible();
  }

  async isFormValid(): Promise<boolean> {
    const errors = await this.getValidationErrors();
    return errors.length === 0;
  }

  async isColorFieldVisible(): Promise<boolean> {
    return this.colorSelect.isVisible();
  }

  async isTrackingNumberFieldVisible(): Promise<boolean> {
    return this.trackingNumberInput.isVisible();
  }

  async isAIIconVisible(): Promise<boolean> {
    const aiIcon = this.page.locator('.ai-icon, [data-ai="true"], .icon-ai');
    return aiIcon.isVisible();
  }

  // -----------------------------------------------------------------------------
  // Data Retrieval
  // -----------------------------------------------------------------------------

  async getDisplayName(): Promise<string> {
    return this.displayNameInput.inputValue();
  }

  async getSelectedLocales(): Promise<string[]> {
    const checked = this.page.locator('input[name="Locale"]:checked');
    return checked.allTextContents().then((values) => values.map((v) => v.trim()));
  }

  async getSelectedDivisions(): Promise<string[]> {
    const checked = this.page.locator('input[name="Division"]:checked');
    return checked.allTextContents().then((values) => values.map((v) => v.trim()));
  }

  async getStatus(): Promise<string | null> {
    return this.statusSelect.inputValue();
  }

  async getImageIds(): Promise<string[]> {
    const inputs = await this.imageIdInputs.all();
    const values: string[] = [];
    for (const input of inputs) {
      const value = await input.inputValue();
      if (value) values.push(value);
    }
    return values;
  }

  async getAllKeywordTags(): Promise<string[]> {
    const tags = this.page.locator('[data-field="keywords"] .tag, #dvTags .tag');
    return tags.allTextContents();
  }
}
