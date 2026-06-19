import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Feature List (Admin)
 *
 * URL: /Admin/Feature/FeatureList
 *
 * Responsibilities:
 * - Module tab navigation
 * - Feature search and status filtering
 * - Edit mode (AutoPlay) toggle with PIN gate
 * - Feature flag toggle (On/Off)
 * - User Group / Role assignment modal
 * - Division/Country Scope modal
 * - Description edit modal
 * - Add Feature modal
 * - Excel export and import
 *
 * User Roles: Admin (PIN required for edit operations)
 */
export class FeatureListPage {
    readonly page: Page;

    // Header controls
    readonly editModeToggle: Locator;
    readonly editModeCheckbox: Locator;
    readonly searchInput: Locator;
    readonly statusFilter: Locator;
    readonly downloadButton: Locator;
    readonly uploadButton: Locator;
    readonly addFeatureButton: Locator;
    readonly fileImportInput: Locator;

    // Module tabs
    readonly moduleTabs: Locator;
    readonly activeModuleTab: Locator;

    // Feature table
    readonly featureTable: Locator;
    readonly featureTableRows: Locator;

    // Security PIN modal
    readonly pinModal: Locator;
    readonly pinInput: Locator;
    readonly pinSubmitButton: Locator;
    readonly pinCancelButton: Locator;
    readonly pinRequiredError: Locator;
    readonly pinInvalidError: Locator;

    // User Group / Role modal
    readonly userGroupModal: Locator;
    readonly allRoleCheckbox: Locator;
    readonly userGroupSubmitButton: Locator;
    readonly userGroupCancelButton: Locator;

    // Scope modal
    readonly scopeModal: Locator;
    readonly scopeDivisionContainer: Locator;
    readonly scopeCountryContainer: Locator;
    readonly scopeSaveButton: Locator;
    readonly scopeCancelButton: Locator;

    // Description modal
    readonly descriptionModal: Locator;
    readonly descriptionTextarea: Locator;
    readonly descriptionSubmitButton: Locator;
    readonly descriptionError: Locator;

    // Add Feature modal
    readonly addFeatureModal: Locator;
    readonly afModuleSelect: Locator;
    readonly afFeatureInput: Locator;
    readonly afFeatureKeyInput: Locator;
    readonly afPropertyNameInput: Locator;
    readonly afDescriptionTextarea: Locator;
    readonly afActiveFlagSelect: Locator;
    readonly afSubmitButton: Locator;
    readonly afModuleError: Locator;
    readonly afFeatureError: Locator;
    readonly afFeatureKeyError: Locator;
    readonly afPropertyNameError: Locator;
    readonly afDescriptionError: Locator;

    constructor(page: Page) {
        this.page = page;

        this.editModeToggle = page.locator('label.switch.autoplayHide');
        this.editModeCheckbox = page.locator('#IsAutoPlay');
        this.searchInput = page.locator('#SearchFeature');
        this.statusFilter = page.locator('#StatusFilter');
        this.downloadButton = page.locator('#btnDownloadFeatureFlags');
        this.uploadButton = page.locator('#btnUploadFeatureFlags');
        this.addFeatureButton = page.locator('#btnAddFeature');
        this.fileImportInput = page.locator('#FeatureFlagImportFile');

        this.moduleTabs = page.locator('.tabModule.nav-link');
        this.activeModuleTab = page.locator('.tabModule.nav-link.active');

        this.featureTable = page.locator('#_AllProgramFeature');
        this.featureTableRows = page.locator('#_AllProgramFeature tbody tr');

        this.pinModal = page.locator('#CommentModal');
        this.pinInput = page.locator('#_commenttextbox');
        this.pinSubmitButton = page.locator('#commentBtnSubmit');
        this.pinCancelButton = page.locator('#CancelModal');
        this.pinRequiredError = page.locator('#_commenttextboxerror');
        this.pinInvalidError = page.locator('#InValidPin');

        this.userGroupModal = page.locator('#exampleModal');
        this.allRoleCheckbox = page.locator('#userGroupContainer #All');
        this.userGroupSubmitButton = page.locator('#exampleModal #btnSubmit');
        this.userGroupCancelButton = page.locator('#exampleModal #btnCancel');

        this.scopeModal = page.locator('#scopeModal');
        this.scopeDivisionContainer = page.locator('#scopeDivisionContainer');
        this.scopeCountryContainer = page.locator('#scopeCountryContainer');
        this.scopeSaveButton = page.locator('#scopeModal .btnFill');
        this.scopeCancelButton = page.locator('#scopeModal .btnBordered');

        this.descriptionModal = page.locator('#DescriptionModal');
        this.descriptionTextarea = page.locator('#_Descriptiontextbox');
        this.descriptionSubmitButton = page.locator('#DescriptionBtnSubmit');
        this.descriptionError = page.locator('#DecriptionError');

        this.addFeatureModal = page.locator('#AddFeatureModal');
        this.afModuleSelect = page.locator('#afModule');
        this.afFeatureInput = page.locator('#afFeature');
        this.afFeatureKeyInput = page.locator('#afFeatureKey');
        this.afPropertyNameInput = page.locator('#afPropertyName');
        this.afDescriptionTextarea = page.locator('#afDescription');
        this.afActiveFlagSelect = page.locator('#afActiveFlag');
        this.afSubmitButton = page.locator('#afSubmitBtn');
        this.afModuleError = page.locator('#afModuleError');
        this.afFeatureError = page.locator('#afFeatureError');
        this.afFeatureKeyError = page.locator('#afFeatureKeyError');
        this.afPropertyNameError = page.locator('#afPropertyNameError');
        this.afDescriptionError = page.locator('#afDescriptionError');
    }

    async navigate(): Promise<void> {
        await this.page.goto('/Admin/Feature/FeatureList');
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        await this.moduleTabs.first().waitFor({ state: 'visible', timeout: 60000 });
        // Brief grace period for Bootstrap/jQuery handlers to bind after DOM is ready
        await this.page.waitForTimeout(500);
    }

    async clickModuleTab(moduleName: string): Promise<void> {
        await this.page.locator(`.tabModule.nav-link[value="${moduleName}"]`).click();
        await this.page.waitForResponse(resp =>
            resp.url().includes('FeatureProgram') && resp.status() === 200
        );
    }

    async searchFeatures(searchText: string): Promise<void> {
        await this.searchInput.fill(searchText);
        await this.page.waitForTimeout(500); // debounce
    }

    async setStatusFilter(value: '' | 'Y' | 'N'): Promise<void> {
        await this.statusFilter.selectOption(value);
        await this.page.waitForTimeout(300);
    }

    async enableEditMode(pin: string): Promise<void> {
        await this.editModeToggle.click();
        await this.pinModal.waitFor({ state: 'visible' });
        await this.pinInput.fill(pin);
        await this.pinSubmitButton.click();
        await this.pinModal.waitFor({ state: 'hidden' });
    }

    async disableEditMode(): Promise<void> {
        await this.editModeToggle.click();
    }

    async getTabText(moduleName: string): Promise<string> {
        return this.page.locator(`.tabModule[value="${moduleName}"]`).innerText();
    }

    async getFeatureRowCount(): Promise<number> {
        return this.featureTableRows.count();
    }

    async isEditModeActive(): Promise<boolean> {
        return this.editModeCheckbox.isChecked();
    }

    async isActionColumnVisible(): Promise<boolean> {
        return this.page.locator('#actionColumn').isVisible();
    }

    async isStatusColumnVisible(): Promise<boolean> {
        return this.page.locator('#statusColumn').isVisible();
    }

    async openAddFeatureModal(): Promise<void> {
        await this.addFeatureButton.click();
        await this.addFeatureModal.waitFor({ state: 'visible' });
    }

    async submitAddFeature(data: {
        module: string;
        feature: string;
        featureKey: string;
        propertyName: string;
        description: string;
    }): Promise<void> {
        await this.afModuleSelect.selectOption({ label: data.module });
        await this.afFeatureInput.fill(data.feature);
        await this.afFeatureKeyInput.fill(data.featureKey);
        await this.afPropertyNameInput.fill(data.propertyName);
        await this.afDescriptionTextarea.fill(data.description);
        await this.afSubmitButton.click();
    }
}
