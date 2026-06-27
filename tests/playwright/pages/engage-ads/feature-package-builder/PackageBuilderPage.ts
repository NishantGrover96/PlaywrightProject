import { expect, type Locator, type Page } from '@playwright/test';

export class PackageBuilderPage {
  readonly page: Page;
  readonly url = '/EngageAds/Admin/PackageBuilder';

  // ── Hidden state fields ──────────────────────────────────────────────────
  readonly hdnPackageSeq: Locator;
  readonly hdnProgramSeq: Locator;
  readonly hdnAntiforgery: Locator;

  // ── Identity strip (always visible) ────────────────────────────────────
  readonly stripName: Locator;
  readonly stripSub: Locator;
  readonly stripStatus: Locator;
  readonly stripBilling: Locator;
  readonly stripIconEl: Locator;

  // ── Save controls ───────────────────────────────────────────────────────
  readonly btnSavePackage: Locator;
  readonly saveStatusBanner: Locator;

  // ── Tab navigation ───────────────────────────────────────────────────────
  readonly tabOverview: Locator;
  readonly tabPricing: Locator;
  readonly tabChannels: Locator;
  readonly tabFeatures: Locator;
  readonly tabPaneOverview: Locator;
  readonly tabPanePricing: Locator;
  readonly tabPaneChannels: Locator;
  readonly tabPaneFeatures: Locator;

  // ── Overview tab fields ──────────────────────────────────────────────────
  readonly pkgName: Locator;
  readonly pkgSubtitle: Locator;
  readonly pkgBillingTerm: Locator;
  readonly pkgActiveFlag: Locator;
  readonly pkgIsInquiryOnly: Locator;
  readonly pkgIsCustom: Locator;
  readonly pkgNote: Locator;
  readonly pkgCampaignDuration: Locator;
  readonly pkgIconKey: Locator;
  readonly iconOptions: Locator;

  // ── Live preview ─────────────────────────────────────────────────────────
  readonly prevNameBadge: Locator;
  readonly prevSubtitle: Locator;
  readonly prevPrice: Locator;
  readonly prevBillingLabel: Locator;
  readonly prevIcon: Locator;
  readonly prevBtnsDefault: Locator;
  readonly prevBtnsInquiry: Locator;
  readonly prevFeaturesContainer: Locator;
  readonly prevChannels: Locator;

  // ── Pricing tab ──────────────────────────────────────────────────────────
  readonly pricingRecordCards: Locator;
  readonly btnAddPricingRecord: Locator;
  readonly prcAmountFirst: Locator;
  readonly prcBillingFirst: Locator;
  readonly costBreakdownRows: Locator;
  readonly btnAddBreakdownRow: Locator;

  // ── Channels tab ─────────────────────────────────────────────────────────
  readonly channelCheckItems: Locator;
  readonly channelCheckboxes: Locator;
  readonly creativeAssetsGrid: Locator;
  readonly caEmptyState: Locator;

  // ── Features tab ─────────────────────────────────────────────────────────
  readonly btnAddFeature: Locator;
  readonly descSections: Locator;

  constructor(page: Page) {
    this.page = page;

    this.hdnPackageSeq  = page.locator('#hdnPackageSeq');
    this.hdnProgramSeq  = page.locator('#hdnProgramSeq');
    this.hdnAntiforgery = page.locator('#hdnAntiforgery');

    this.stripName    = page.locator('#stripName');
    this.stripSub     = page.locator('#stripSub');
    this.stripStatus  = page.locator('#stripStatus');
    this.stripBilling = page.locator('#stripBilling');
    this.stripIconEl  = page.locator('#stripIconEl');

    this.btnSavePackage  = page.locator('#btnSavePackage');
    this.saveStatusBanner = page.locator('#saveStatusBanner');

    this.tabOverview  = page.locator('[data-tab="overview"]');
    this.tabPricing   = page.locator('[data-tab="pricing"]');
    this.tabChannels  = page.locator('[data-tab="channels"]');
    this.tabFeatures  = page.locator('[data-tab="features"]');
    this.tabPaneOverview  = page.locator('#tab-overview');
    this.tabPanePricing   = page.locator('#tab-pricing');
    this.tabPaneChannels  = page.locator('#tab-channels');
    this.tabPaneFeatures  = page.locator('#tab-features');

    this.pkgName            = page.locator('#pkgName');
    this.pkgSubtitle        = page.locator('#pkgSubtitle');
    this.pkgBillingTerm     = page.locator('#pkgBillingTerm');
    this.pkgActiveFlag      = page.locator('#pkgActiveFlag');
    this.pkgIsInquiryOnly   = page.locator('#pkgIsInquiryOnly');
    this.pkgIsCustom        = page.locator('#pkgIsCustom');
    this.pkgNote            = page.locator('#pkgNote');
    this.pkgCampaignDuration = page.locator('#pkgCampaignDuration');
    this.pkgIconKey         = page.locator('#pkgIconKey');
    this.iconOptions        = page.locator('.icon-opt');

    this.prevNameBadge       = page.locator('#prevNameBadge');
    this.prevSubtitle        = page.locator('#prevSubtitle');
    this.prevPrice           = page.locator('#prevPrice');
    this.prevBillingLabel    = page.locator('#prevBillingLabel');
    this.prevIcon            = page.locator('#prevIcon');
    this.prevBtnsDefault     = page.locator('#prevBtnsDefault');
    this.prevBtnsInquiry     = page.locator('#prevBtnsInquiry');
    this.prevFeaturesContainer = page.locator('#prevFeaturesContainer');
    this.prevChannels        = page.locator('#prevChannels');

    this.pricingRecordCards  = page.locator('.pricing-record-card');
    this.btnAddPricingRecord = page.locator('#btnAddPricingRecord');
    this.prcAmountFirst      = page.locator('.prc-amount').first();
    this.prcBillingFirst     = page.locator('.prc-billing').first();
    this.costBreakdownRows   = page.locator('.cost-breakdown-row');
    this.btnAddBreakdownRow  = page.locator('.btn-add-breakdown').first();

    this.channelCheckItems   = page.locator('.channel-check-item');
    this.channelCheckboxes   = page.locator('.channel-checkbox');
    this.creativeAssetsGrid  = page.locator('#creativeAssetsGrid');
    this.caEmptyState        = page.locator('#caEmptyState');

    this.btnAddFeature = page.locator('#btnAddFeature');
    this.descSections  = page.locator('.desc-section');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async navigateToPackage(packageSeq: number): Promise<void> {
    await this.page.goto(`${this.url}?id=${packageSeq}`);
  }

  async switchTab(tab: 'overview' | 'pricing' | 'channels' | 'features'): Promise<void> {
    await this.page.locator(`[data-tab="${tab}"]`).click();
    await this.page.locator(`#tab-${tab}`).waitFor({ state: 'visible' });
  }

  async getActiveTabKey(): Promise<string | null> {
    const active = this.page.locator('[data-tab][aria-selected="true"]');
    return await active.getAttribute('data-tab');
  }

  async fillOverview(data: { name: string; billingTerm?: string; subtitle?: string }): Promise<void> {
    await this.pkgName.fill(data.name);
    if (data.billingTerm) {
      await this.pkgBillingTerm.selectOption(data.billingTerm);
    }
    if (data.subtitle) {
      await this.pkgSubtitle.fill(data.subtitle);
    }
  }

  async clickSave(): Promise<void> {
    await this.btnSavePackage.click();
  }

  async waitForSaveSuccess(): Promise<void> {
    await this.saveStatusBanner.waitFor({ state: 'visible' });
    await expect(this.saveStatusBanner).toContainText('successfully');
  }

  async waitForSaveError(): Promise<void> {
    await this.saveStatusBanner.waitFor({ state: 'visible' });
    await expect(this.saveStatusBanner).not.toContainText('successfully');
  }

  async getSavedPackageSeq(): Promise<number | null> {
    const val = await this.hdnPackageSeq.inputValue();
    return val ? parseInt(val, 10) : null;
  }

  async getUrlPackageSeq(): Promise<number | null> {
    const url = this.page.url();
    const match = url.match(/[?&]id=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  async expectBannerVisible(text?: string): Promise<void> {
    await expect(this.saveStatusBanner).toBeVisible();
    if (text) {
      await expect(this.saveStatusBanner).toContainText(text);
    }
  }

  async expectSaveButtonRestored(): Promise<void> {
    await expect(this.btnSavePackage).toBeEnabled();
    await expect(this.btnSavePackage).toContainText('Save Package');
  }

  async selectChannel(index: number): Promise<void> {
    await this.channelCheckItems.nth(index).click();
  }

  async getCheckedChannelCount(): Promise<number> {
    return await this.channelCheckItems.filter({ hasClass: 'checked' }).count();
  }

  async addFeatureItem(sectionType: string, title: string): Promise<void> {
    await this.page.locator(`.btn-open-section-add[data-section="${sectionType}"]`).click();
    await this.page.locator('#featureTitle').fill(title);
    await this.page.locator('#btnSaveFeatureItem').click();
  }
}
