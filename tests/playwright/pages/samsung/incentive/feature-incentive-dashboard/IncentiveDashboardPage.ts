import { type Page, type Locator, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Page routes
// -----------------------------------------------------------------------------

export const INCENTIVE_URLS = {
  admin:           '/Rewards/Incentives/Dashboard/IncentiveDashboard',
  landingDealer:   '/Rewards/Incentives/Dashboard/LandingDashboard',
  dealerDashboard: '/Rewards/Incentives/Dashboard/DealerDashboard',
} as const;

// -----------------------------------------------------------------------------
// IncentiveDashboardPage - Admin / Corporate view
// -----------------------------------------------------------------------------

export class IncentiveDashboardPage {
  readonly page: Page;
  readonly url = INCENTIVE_URLS.admin;

  // Hidden fields (server-side state values)
  readonly hdUserType:             Locator;
  readonly hdTerritoryManager:     Locator;
  readonly hdDistributorSeq:       Locator;
  readonly hdCurrentQuarter:       Locator;
  readonly hdCurrentYear:          Locator;
  readonly hdnProgramValue:        Locator;
  readonly hdnShowPurchase:        Locator;

  // Filter controls
  readonly ddlFiscalYear:          Locator;
  readonly ddlQuarterly:           Locator;
  readonly ddTerritory:            Locator;
  readonly ddlTM:                  Locator;
  readonly ddlDistributor:         Locator;
  readonly ddDealer:               Locator;
  readonly ddDealer2:              Locator;
  readonly ddDistributor:          Locator;
  readonly dvSalesPerson:          Locator;
  readonly ddDealerSalesPerson:    Locator;
  readonly ddDistributorCenter:    Locator;

  // KPI Summary Tiles
  readonly spnTotalTires:          Locator;
  readonly spnUnqualifiedTires:    Locator;
  readonly spnReturnedTires:       Locator;
  readonly spnTotalPurchase:       Locator;
  readonly spnUnqualifiedPurchase: Locator;
  readonly spnReturnPurchase:      Locator;
  readonly promoTotalAmount:       Locator;
  readonly spnTentative:           Locator;

  // Loading indicator
  readonly dvTierPurchasePannel:   Locator;

  // Promotion tabs
  readonly tabBrand:                    Locator;
  readonly tabInhouse:                  Locator;
  readonly sectionPromotionEarned:      Locator;
  readonly sectionPromotionEarnedBrand: Locator;

  // Data tables
  readonly tblMostRewarded:     Locator;
  readonly tblLeastRewarded:    Locator;
  readonly tblMostRewardedRows: Locator;
  readonly tblLeastRewardedRows:Locator;

  constructor(page: Page) {
    this.page = page;

    // Hidden fields
    this.hdUserType             = page.locator('#hdUserType');
    this.hdTerritoryManager     = page.locator('#hdTerritoryManager');
    this.hdDistributorSeq       = page.locator('#hdDistributor_dealer_number_seq');
    this.hdCurrentQuarter       = page.locator('#hdCurrentQuarter');
    this.hdCurrentYear          = page.locator('#hdCurrentYear');
    this.hdnProgramValue        = page.locator('#hdnProgramValue');
    this.hdnShowPurchase        = page.locator('#hdnShowPurchase');

    // Filter controls
    this.ddlFiscalYear          = page.locator('#ddlFiscalYear');
    this.ddlQuarterly           = page.locator('#ddlQuarterly');
    this.ddTerritory            = page.locator('#ddTerritory');
    this.ddlTM                  = page.locator('#ddlTM');
    this.ddlDistributor         = page.locator('#ddlDistributor');
    this.ddDealer               = page.locator('#ddDealer');
    this.ddDealer2              = page.locator('#ddDealer2');
    this.ddDistributor          = page.locator('#ddDistributor');
    this.dvSalesPerson          = page.locator('#dvsalesperson');
    this.ddDealerSalesPerson    = page.locator('#ddDealerSalesPerson');
    this.ddDistributorCenter    = page.locator('#ddDistributorCenter');

    // KPI tiles
    this.spnTotalTires          = page.locator('#spnTotalTires');
    this.spnUnqualifiedTires    = page.locator('#spnUnqualifiedTires');
    this.spnReturnedTires       = page.locator('#spnReturnedTires');
    this.spnTotalPurchase       = page.locator('#spnTotalpurchase');
    this.spnUnqualifiedPurchase = page.locator('#spnUnqualifiedpurchase');
    this.spnReturnPurchase      = page.locator('#spnReturnpurchase');
    this.promoTotalAmount       = page.locator('#promoTotalAmount');
    this.spnTentative           = page.locator('#spnTentative');

    // Loading
    this.dvTierPurchasePannel   = page.locator('#dvTierPurchasePannel');

    // Tabs
    this.tabBrand                    = page.locator('#Brand');
    this.tabInhouse                  = page.locator('#Inhouse');
    this.sectionPromotionEarned      = page.locator('#PromotionEarned');
    this.sectionPromotionEarnedBrand = page.locator('#PromotionEarned_Brand');

    // Tables
    this.tblMostRewarded        = page.locator('#tblTrueFanticDealer');
    this.tblLeastRewarded       = page.locator('#tblLeastFanticDealer');
    this.tblMostRewardedRows    = page.locator('#tblTrueFanticDealer tbody tr');
    this.tblLeastRewardedRows   = page.locator('#tblLeastFanticDealer tbody tr');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async waitForReady(): Promise<void> {
    await expect(this.ddlFiscalYear).toBeVisible();
    await expect(this.spnTotalTires).not.toBeEmpty();
  }

  async waitForCorporateDataResponse(): Promise<import('@playwright/test').Response> {
    return this.page.waitForResponse(
      r => r.url().includes('CorporateDashboardDataByType') && r.status() === 200
    );
  }

  async selectFiscalYear(year: string): Promise<void> {
    await this.ddlFiscalYear.selectOption(year);
  }

  async selectQuarter(quarter: string): Promise<void> {
    await this.ddlQuarterly.selectOption(quarter);
  }

  async selectTerritory(index: number): Promise<void> {
    await this.ddTerritory.selectOption({ index });
  }

  async selectDistributor(index: number): Promise<void> {
    await this.ddDistributor.selectOption({ index });
  }

  async selectDealer(index: number): Promise<void> {
    await this.ddDealer.selectOption({ index });
  }

  async getUserType(): Promise<string> {
    return this.hdUserType.inputValue();
  }

  async getQuarterlyOptionCount(): Promise<number> {
    return this.ddlQuarterly.locator('option').count();
  }

  async getFiscalYearOptionCount(): Promise<number> {
    return this.ddlFiscalYear.locator('option').count();
  }

  async getMostRewardedRowCount(): Promise<number> {
    return this.tblMostRewardedRows.count();
  }

  async getLeastRewardedRowCount(): Promise<number> {
    return this.tblLeastRewardedRows.count();
  }

  async expectUserType(expectedType: string): Promise<void> {
    await expect(this.hdUserType).toHaveValue(expectedType);
  }

  async expectKpiTilesPopulated(): Promise<void> {
    await expect(this.spnTotalTires).not.toBeEmpty();
    await expect(this.spnUnqualifiedTires).not.toBeEmpty();
    await expect(this.promoTotalAmount).not.toBeEmpty();
  }

  async expectRewardsMode(): Promise<void> {
    await expect(this.spnTentative).toBeVisible();
    await expect(this.tabBrand).toBeHidden();
    await expect(this.ddlTM).toBeVisible();
  }

  async expectNonRewardsMode(): Promise<void> {
    await expect(this.spnTentative).toBeHidden();
    await expect(this.tabBrand).toBeVisible();
    await expect(this.dvSalesPerson).toBeVisible();
  }

  async expectPurchaseTilesHidden(): Promise<void> {
    await expect(this.spnTotalPurchase).toBeHidden();
    await expect(this.spnUnqualifiedPurchase).toBeHidden();
    await expect(this.spnReturnPurchase).toBeHidden();
  }

  async expectPurchaseTilesVisible(): Promise<void> {
    await expect(this.spnTotalPurchase).toBeVisible();
  }
}

// -----------------------------------------------------------------------------
// LandingDashboardPage - Dealer landing view
// -----------------------------------------------------------------------------

export class LandingDashboardPage {
  readonly page: Page;
  readonly url = INCENTIVE_URLS.landingDealer;

  readonly ddlFiscalYear:   Locator;
  readonly dealerLocations: Locator;
  readonly redeemButton:    Locator;
  readonly salesRepSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ddlFiscalYear   = page.locator('#ddlFiscalYear');
    this.dealerLocations = page.locator('#DealerLocationsList, select[id*="DealerLocation"]').first();
    this.redeemButton    = page.getByRole('button', { name: /redeem/i });
    this.salesRepSection = page.locator('[id*="SalesRep"],[id*="salesrep"],.sales-rep-section').first();
  }

  async navigate(params?: Record<string, string>): Promise<void> {
    const qs = params
      ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';
    await this.page.goto(`${this.url}${qs}`);
  }

  async waitForReady(): Promise<void> {
    await expect(this.ddlFiscalYear).toBeVisible();
  }

  async clickRedeem(): Promise<void> {
    await this.redeemButton.click();
  }

  async waitForRedeemResponse(): Promise<import('@playwright/test').Response> {
    return this.page.waitForResponse(
      r => r.url().includes('RedeemCashRewards') && r.status() === 200
    );
  }

  async expectRedeemButtonInactive(): Promise<void> {
    const disabled = await this.redeemButton.isDisabled().catch(() => false);
    const hidden   = await this.redeemButton.isHidden().catch(() => false);
    if (!disabled && !hidden) {
      throw new Error(
        'Expected redeem button to be disabled or hidden after redemption, but it was still active.'
      );
    }
  }
}

// -----------------------------------------------------------------------------
// DealerDashboardPage - Dealer-specific dashboard
// -----------------------------------------------------------------------------

export class DealerDashboardPage {
  readonly page: Page;
  readonly url = INCENTIVE_URLS.dealerDashboard;

  readonly dealerDropdown: Locator;
  readonly activeTab:      Locator;

  constructor(page: Page) {
    this.page = page;
    this.dealerDropdown = page.locator('select[id*="dealer"], select[id*="Dealer"]').first();
    this.activeTab      = page.locator('.nav-tabs .active, .tab-pane.active').first();
  }

  async navigate(encryptedDealerNumber?: string): Promise<void> {
    const url = encryptedDealerNumber
      ? `${this.url}?dealer_number=${encodeURIComponent(encryptedDealerNumber)}`
      : this.url;
    await this.page.goto(url);
  }

  async waitForReady(): Promise<void> {
    await expect(this.dealerDropdown).toBeVisible();
  }
}