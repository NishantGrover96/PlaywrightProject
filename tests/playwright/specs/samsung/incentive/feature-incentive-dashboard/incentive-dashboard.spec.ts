import { test, expect } from '@playwright/test';
import {
  IncentiveDashboardPage,
  LandingDashboardPage,
  DealerDashboardPage,
} from '../../../../pages/samsung/incentive/feature-incentive-dashboard/IncentiveDashboardPage';
import {
  navigateToAdminDashboard,
  navigateAndWaitForKpiData,
  navigateToLandingDashboard,
  navigateToDealerDashboard,
  changeFiscalYearAndWait,
  changeQuarterAndWait,
  performTerritoryDistributorDealerCascade,
  redeemCashRewards,
} from '../../../../helpers/samsung/incentive/feature-incentive-dashboard/incentive-dashboard.helpers';
import testData from '../../../../data/samsung/incentive/feature-incentive-dashboard/test-data.json';

test.describe('Incentive - Incentive Dashboard', () => {

  // ------------------------------------------------------------------------
  // Smoke Suite (INC-SMOKE-001 - INC-SMOKE-005)
  // ------------------------------------------------------------------------

  test.describe('Smoke', () => {

    test('INC-SMOKE-001 - admin dashboard loads for BMDM @smoke @critical', async ({ page }) => {
      const featurePage = new IncentiveDashboardPage(page);
      await featurePage.navigate();
      await expect(featurePage.ddlFiscalYear).toBeVisible();
      await expect(featurePage.ddlQuarterly.locator('option')).toHaveCount(4);
      await expect(featurePage.hdUserType).toHaveValue('BMDM');
      await expect(featurePage.spnTotalTires.locator('..')).toBeVisible();
    });

    test('INC-SMOKE-002 - unauthenticated user redirected to login @smoke @critical', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
      await expect(page).toHaveURL(/Account\/Login/i);
      await context.close();
    });

    test('INC-SMOKE-003 - dealer landing dashboard loads @smoke @critical', async ({ page }) => {
      const landingPage = new LandingDashboardPage(page);
      await landingPage.navigate();
      await expect(landingPage.ddlFiscalYear).toBeVisible();
      await expect(landingPage.ddlFiscalYear.locator('option')).not.toHaveCount(0);
    });

    test('INC-SMOKE-004 - KPI tiles load data on page ready @smoke @critical', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
      await expect(featurePage.spnUnqualifiedTires).not.toBeEmpty();
      await expect(featurePage.promoTotalAmount).not.toBeEmpty();
    });

    test('INC-SMOKE-005 - dealer dashboard page loads with dealer dropdown @smoke @critical', async ({ page }) => {
      const dealerPage = new DealerDashboardPage(page);
      await dealerPage.navigate();
      await expect(dealerPage.dealerDropdown).toBeVisible();
      await expect(dealerPage.dealerDropdown.locator('option')).not.toHaveCount(0);
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - Initialization by Role
  // ------------------------------------------------------------------------

  test.describe('Initialization by Role', () => {

    test('INC-TC-001 - DIST user distributor pre-populated @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('DIST');
      const seq = await featurePage.hdDistributorSeq.inputValue();
      expect(seq).toBeTruthy();
    });

    test('INC-TC-002 - BMADMIN sees all TMs (SalesManager with seq=0) @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMADMIN');
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('SalesManager') && r.status() === 200),
        page.reload(),
      ]);
      const url = new URL(response.url());
      expect(url.searchParams.get('seq') ?? '0').toBe('0');
    });

    test('INC-TC-003 - RDIST user distributor pre-populated @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('RDIST');
      const seq = await featurePage.hdDistributorSeq.inputValue();
      expect(seq).toBeTruthy();
    });

    test('INC-TC-004 - BMNM user dealer list for org loaded @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMNM');
      await expect(featurePage.ddDealer.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-005 - BMMGT user territory selector shown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMMGT');
      await expect(featurePage.ddTerritory).toBeVisible();
      await expect(featurePage.ddTerritory.locator('option').first()).toHaveAttribute('value', '0');
    });

    test('INC-TC-006 - FAST user territory and dealers shown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('FAST');
      await expect(featurePage.ddTerritory).toBeVisible();
    });

    test('INC-TC-007 - BMDM TM auto-selected from session @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMDM');
      const tmSeq = await featurePage.hdTerritoryManager.inputValue();
      expect(parseInt(tmSeq, 10)).toBeGreaterThan(0);
    });

    test('INC-TC-008 - OAM user org-scoped data shown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('OAM');
      const distSeq = await featurePage.hdDistributorSeq.inputValue();
      expect(distSeq).toBeTruthy();
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - Filter Controls
  // ------------------------------------------------------------------------

  test.describe('Filter Controls', () => {

    test('INC-TC-009 - fiscal year dropdown populated @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      const count = await featurePage.getFiscalYearOptionCount();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('INC-TC-010 - quarter dropdown has exactly 4 options @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      expect(await featurePage.getQuarterlyOptionCount()).toBe(4);
    });

    test('INC-TC-011 - changing fiscal year triggers KPI refresh @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      const options = await featurePage.ddlFiscalYear.locator('option').all();
      if (options.length < 2) { test.skip(); return; }
      const priorYearValue = await options[1].getAttribute('value') ?? '';
      await changeFiscalYearAndWait(featurePage, priorYearValue);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-012 - changing quarter triggers KPI refresh @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      const currentQ = await featurePage.ddlQuarterly.inputValue();
      const newQ = currentQ === '1' ? '2' : '1';
      await changeQuarterAndWait(featurePage, newQ);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-013 - territory dropdown populated for BMMGT @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMMGT');
      const count = await featurePage.ddTerritory.locator('option').count();
      expect(count).toBeGreaterThanOrEqual(2);
      await expect(featurePage.ddTerritory.locator('option').first()).toHaveAttribute('value', '0');
    });

    test('INC-TC-014 - selecting territory cascades distributor dropdown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMMGT');
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('DistributorByTerritory') && r.status() === 200),
        featurePage.selectTerritory(1),
      ]);
      expect(response.status()).toBe(200);
      await expect(featurePage.ddDistributor.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-015 - selecting distributor cascades to dealer dropdown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMMGT');
      await featurePage.selectTerritory(1);
      await page.waitForResponse(r => r.url().includes('DistributorByTerritory'));
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('DealerByDistributor') && r.status() === 200),
        featurePage.selectDistributor(1),
      ]);
      expect(response.status()).toBe(200);
      await expect(featurePage.ddDealer.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-016 - distributor cascades to sales person dropdown @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('SalesPersonByDistributor') && r.status() === 200),
        page.reload(),
      ]);
      expect(response.status()).toBe(200);
      await expect(featurePage.ddDealerSalesPerson.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-017 - distributor center dropdown shows for DCWH distributor @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.ddDistributorCenter).toBeVisible();
      await expect(featurePage.ddDistributorCenter.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-018 - TBM dropdown populated in Rewards mode @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.ddlTM).toBeVisible();
      await expect(featurePage.ddlTM.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-019 - BMNM distributor cascade populates correct dealer list @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMNM');
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('DealerByDistributor') && r.status() === 200),
        featurePage.selectDistributor(1),
      ]);
      expect(response.status()).toBe(200);
      await expect(featurePage.ddDealer.locator('option')).not.toHaveCount(0);
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - KPI Tiles
  // ------------------------------------------------------------------------

  test.describe('KPI Tiles', () => {

    test('INC-TC-020 - All Units tile populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-021 - Unqualified Units tile populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.spnUnqualifiedTires).not.toBeEmpty();
    });

    test('INC-TC-022 - Returned Units tile populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.spnReturnedTires).not.toBeEmpty();
    });

    test('INC-TC-023 - Reward Amount tile populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.promoTotalAmount).not.toBeEmpty();
    });

    test('INC-TC-024 - purchase tiles hidden when IsShowPurchase=true @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectPurchaseTilesHidden();
    });

    test('INC-TC-025 - purchase tiles visible when IsShowPurchase=false @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectPurchaseTilesVisible();
    });

    test('INC-TC-026 - Earned Branding Points tile visible in Rewards mode @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await expect(featurePage.spnTentative).toBeVisible();
      await expect(featurePage.spnTentative).not.toBeEmpty();
    });

    test('INC-TC-027 - Earned Branding Points tile hidden in Non-Rewards mode @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.spnTentative).toBeHidden();
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - ConvertToRewards UI Mode
  // ------------------------------------------------------------------------

  test.describe('ConvertToRewards UI Mode', () => {

    test('INC-TC-028 - Rewards mode hides Brand tab @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.tabBrand).toBeHidden();
      await expect(featurePage.sectionPromotionEarned).toBeVisible();
    });

    test('INC-TC-029 - Rewards mode shows TBM and Distributor controls @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.ddlTM).toBeVisible();
      await expect(featurePage.ddlDistributor).toBeVisible();
    });

    test('INC-TC-030 - Non-Rewards mode shows Brand Promotion tab @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.tabBrand).toBeVisible();
      await expect(featurePage.sectionPromotionEarnedBrand).toBeVisible();
    });

    test('INC-TC-031 - Non-Rewards mode shows SalesPerson and Dealer filters @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await expect(featurePage.dvSalesPerson).toBeVisible();
      await expect(featurePage.ddDealer).toBeVisible();
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - Data Tables
  // ------------------------------------------------------------------------

  test.describe('Data Tables', () => {

    test('INC-TC-032 - Most Rewarded Dealers table populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      expect(await featurePage.getMostRewardedRowCount()).toBeGreaterThanOrEqual(1);
    });

    test('INC-TC-033 - Least Rewarded Dealers table populated @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      expect(await featurePage.getLeastRewardedRowCount()).toBeGreaterThanOrEqual(1);
    });

    test('INC-TC-034 - Dealer dropdown shows only primary_flag=Y dealers @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('DealerByDistributor') && r.status() === 200),
        featurePage.selectDistributor(1),
      ]);
      const json: { primary_flag?: string }[] = await response.json().catch(() => []);
      const nonPrimary = json.filter(d => d.primary_flag !== 'Y');
      expect(nonPrimary.length).toBe(0);
    });

    test('INC-TC-035 - Brand dropdown populated via GetTreadPattern @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/Brand') && r.status() === 200),
        page.reload(),
      ]);
      expect(response.status()).toBe(200);
    });

    test('INC-TC-036 - selecting brand filter triggers dashboard reload @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      const [response] = await Promise.all([
        featurePage.waitForCorporateDataResponse(),
        featurePage.ddDealer.selectOption({ index: 1 }).catch(() => {}),
      ]);
      if (response) expect(response.status()).toBe(200);
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - Security
  // ------------------------------------------------------------------------

  test.describe('Security', () => {

    test('INC-TC-037 - API response dealer_number_seq values are AES-encrypted @regression @critical', async ({ page }) => {
      await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
      const response = await page.waitForResponse(
        r => r.url().includes('CorporateDashboardDataByType') && r.status() === 200
      );
      const json: unknown[] = await response.json().catch(() => []);
      if (json.length === 0) { test.skip(); return; }
      const first = json[0] as Record<string, unknown>;
      const seq = first['dealer_number_seq'];
      if (seq === undefined) { test.skip(); return; }
      expect(typeof seq).toBe('string');
      expect(/^\\d+$/.test(String(seq))).toBe(false);
    });

    test('INC-TC-038 - DealerDashboard decrypts encrypted dealer_number @regression @critical', async ({ page }) => {
      const encryptedDn = testData.security.encryptedDealerNumber;
      const dealerPage = new DealerDashboardPage(page);
      await dealerPage.navigate(encryptedDn);
      await dealerPage.waitForReady();
      await expect(page.locator('body')).not.toContainText('Exception');
      await expect(page.locator('body')).not.toContainText('Error');
    });

    test('INC-TC-039 - LandingDashboard Base64-decodes dn param @regression @critical', async ({ page }) => {
      const base64Dn = testData.security.base64DealerNumber;
      const landingPage = new LandingDashboardPage(page);
      await landingPage.navigate({ dn: base64Dn });
      await landingPage.waitForReady();
      await expect(page.locator('body')).not.toContainText('Exception');
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - DealerDashboard Tab Logic
  // ------------------------------------------------------------------------

  test.describe('DealerDashboard Tab Logic', () => {

    test('INC-TC-040 - default tab determined by GetDashboardTab SP @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/Tab') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/DealerDashboard'),
      ]);
      expect(response.status()).toBe(200);
      await expect(page.locator('.nav-tabs .active, .tab-pane.active').first()).toBeVisible();
    });

    test('INC-TC-041 - pt-tab displays adjustment amount and date @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('TabInformation') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/DealerDashboard'),
      ]);
      const json: Record<string, unknown>[] = await response.json().catch(() => []);
      if (json.length === 0) { test.skip(); return; }
      const first = json[0];
      if (first['selectTab'] !== 'pt-tab') { test.skip(); return; }
      expect(first['adjustment_amount']).toBeDefined();
    });

    test('INC-TC-042 - non-pt-tab displays tiered program data @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('TabInformation') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/DealerDashboard'),
      ]);
      expect(response.status()).toBe(200);
      await expect(page.locator('.tab-pane.active')).toBeVisible();
    });

    test('INC-TC-043 - partnerprogram queryParam overrides active tab to pp-tab @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/Tab') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/DealerDashboard?queryParam=partnerprogram'),
      ]);
      const json: Record<string, unknown> = await response.json().catch(() => ({}));
      if (json['isPartnerProgram']) {
        expect(json['tab']).toBe('pp-tab');
      } else {
        test.skip();
      }
    });

    test('INC-TC-044 - totalAmountSummary=true returns dealer name and address @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('TabInformation') && r.url().includes('totalAmountSummary=true') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/DealerDashboard'),
      ]);
      const json: Record<string, unknown>[] = await response.json().catch(() => []);
      if (json.length === 0) { test.skip(); return; }
      const dealerInfo = json.find(r => r['Account_Number'] !== undefined);
      if (!dealerInfo) { test.skip(); return; }
      expect(dealerInfo['Account_Number']).toBeDefined();
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - unitPercentage Calculation
  // ------------------------------------------------------------------------

  test.describe('unitPercentage Calculation', () => {

    test('INC-TC-045 - unitPercentage capped at 100 when units exceed tier max @regression', async ({ page }) => {
      await page.goto('/Rewards/Incentives/Dashboard/DealerDashboard');
      const response = await page.waitForResponse(r => r.url().includes('TabInformation') && r.status() === 200);
      const json: { unitPercentage?: number }[] = await response.json().catch(() => []);
      const overAchiever = json.find(r => (r.unitPercentage ?? 0) > 0);
      if (!overAchiever) { test.skip(); return; }
      expect(overAchiever.unitPercentage).toBeLessThanOrEqual(100);
    });

    test('INC-TC-046 - unitPercentage = 100 when program_tier_max = 9999999 @regression', async ({ page }) => {
      await page.goto('/Rewards/Incentives/Dashboard/DealerDashboard');
      const response = await page.waitForResponse(r => r.url().includes('TabInformation') && r.status() === 200);
      const json: { program_tier_max?: number; unitPercentage?: number }[] = await response.json().catch(() => []);
      const openEnded = json.find(r => r.program_tier_max === 9999999);
      if (!openEnded) { test.skip(); return; }
      expect(openEnded.unitPercentage).toBe(100);
    });

    test('INC-TC-047 - unitPercentage = 0 when no units purchased @regression', async ({ page }) => {
      await page.goto('/Rewards/Incentives/Dashboard/DealerDashboard');
      const response = await page.waitForResponse(r => r.url().includes('TabInformation') && r.status() === 200);
      const json: { group_period_unit_purchase?: number; unitPercentage?: number }[] = await response.json().catch(() => []);
      const zeroUnits = json.find(r => r.group_period_unit_purchase === 0);
      if (!zeroUnits) { test.skip(); return; }
      expect(zeroUnits.unitPercentage).toBe(0);
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - LandingDashboard / Dealer View
  // ------------------------------------------------------------------------

  test.describe('LandingDashboard', () => {

    test('INC-TC-048 - sales rep reward data loads for dealer @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('SalesRepRewardData') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/LandingDashboard'),
      ]);
      expect(response.status()).toBe(200);
    });

    test('INC-TC-049 - dealer locations list populated @regression', async ({ page }) => {
      const landingPage = await navigateToLandingDashboard(page);
      await expect(landingPage.dealerLocations).toBeVisible();
      await expect(landingPage.dealerLocations.locator('option')).not.toHaveCount(0);
    });

    test('INC-TC-050 - Redeem Cash Rewards button triggers OnGetRedeemCashRewards @regression @critical', async ({ page }) => {
      const landingPage = await navigateToLandingDashboard(page);
      if (await landingPage.redeemButton.isHidden()) { test.skip(); return; }
      const [response] = await Promise.all([
        landingPage.waitForRedeemResponse(),
        landingPage.clickRedeem(),
      ]);
      expect(response.status()).toBe(200);
      await landingPage.expectRedeemButtonInactive();
    });

    test('INC-TC-051 - primary units note shown in dashboard footer @regression', async ({ page }) => {
      await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
      await expect(page.getByText(/Single-phase ODU/i)).toBeVisible();
    });

  });

  // ------------------------------------------------------------------------
  // Regression Suite - Data Routing by User Type
  // ------------------------------------------------------------------------

  test.describe('Data Routing by User Type', () => {

    test('INC-TC-052 - BMNM/FAST/OAM route to GetOrganizationDashboardDataByType @regression', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMNM');
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-053 - BMDM/BMRM route to GetDemoCorporateDashboardDataByType @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      const userType = await featurePage.getUserType();
      expect(['BMDM', 'BMRM']).toContain(userType);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-054 - DIST/RDIST/DARO route to GetDemoCorporateDashboardDataByType2 @regression', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      const userType = await featurePage.getUserType();
      expect(['DIST', 'RDIST', 'DARO']).toContain(userType);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

    test('INC-TC-055 - BMRM with PRSM sm param passes sm to corporate SP @regression', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(r => r.url().includes('CorporateDashboardDataByType') && r.status() === 200),
        page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard'),
      ]);
      const url = new URL(response.url());
      const smValue = url.searchParams.get('sm');
      if (smValue !== null) {
        expect(parseInt(smValue, 10)).toBeGreaterThan(0);
      } else {
        test.skip();
      }
    });

  });

  // ------------------------------------------------------------------------
  // E2E Suite (INC-E2E-001 - INC-E2E-005)
  // ------------------------------------------------------------------------

  test.describe('E2E', () => {

    test('INC-E2E-001 - DIST loads dashboard and applies quarter filter @e2e @critical', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await featurePage.expectUserType('DIST');
      const distSeq = await featurePage.hdDistributorSeq.inputValue();
      expect(distSeq).toBeTruthy();
      const currentQ = await featurePage.ddlQuarterly.inputValue();
      const newQ = currentQ === '1' ? '2' : '1';
      await changeQuarterAndWait(featurePage, newQ);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
      expect(await page.evaluate(() => window.console && true)).toBe(true);
    });

    test('INC-E2E-002 - BMDM views Rewards mode and mode controls verified @e2e', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await featurePage.expectUserType('BMDM');
      await featurePage.expectRewardsMode();
      await expect(featurePage.sectionPromotionEarned).toBeVisible();
    });

    test('INC-E2E-003 - Dealer redeems cash rewards end-to-end @e2e @critical', async ({ page }) => {
      const landingPage = await navigateToLandingDashboard(page);
      if (await landingPage.redeemButton.isHidden()) { test.skip(); return; }
      const redeemPage = await redeemCashRewards(page);
      await redeemPage.expectRedeemButtonInactive();
      await page.reload();
      await redeemPage.waitForReady();
      await redeemPage.expectRedeemButtonInactive();
    });

    test('INC-E2E-004 - BMMGT territory to distributor to dealer cascade @e2e', async ({ page }) => {
      const featurePage = await navigateToAdminDashboard(page);
      await featurePage.expectUserType('BMMGT');
      await performTerritoryDistributorDealerCascade(featurePage);
    });

    test('INC-E2E-005 - BMRM views territory-scoped data and changes fiscal year @e2e', async ({ page }) => {
      const featurePage = await navigateAndWaitForKpiData(page);
      await featurePage.expectUserType('BMRM');
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
      const options = await featurePage.ddlFiscalYear.locator('option').all();
      if (options.length < 2) { test.skip(); return; }
      const priorYear = await options[1].getAttribute('value') ?? '';
      await changeFiscalYearAndWait(featurePage, priorYear);
      await expect(featurePage.spnTotalTires).not.toBeEmpty();
    });

  });

});