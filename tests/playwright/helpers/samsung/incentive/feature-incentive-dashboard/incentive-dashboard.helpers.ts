import { type Page, expect } from '@playwright/test';
import {
  IncentiveDashboardPage,
  LandingDashboardPage,
  DealerDashboardPage,
} from '../../../../pages/samsung/incentive/feature-incentive-dashboard/IncentiveDashboardPage';

// -----------------------------------------------------------------------------
// Admin / Corporate helpers
// -----------------------------------------------------------------------------

/**
 * Navigate to IncentiveDashboard and wait for KPI tiles to load.
 * Used by all admin-role tests that need a ready dashboard.
 */
export async function navigateToAdminDashboard(page: Page): Promise<IncentiveDashboardPage> {
  const featurePage = new IncentiveDashboardPage(page);
  await featurePage.navigate();
  await expect(featurePage.ddlFiscalYear).toBeVisible();
  return featurePage;
}

/**
 * Navigate and wait for KPI tiles to be populated.
 * Use when tests need to assert actual tile values.
 */
export async function navigateAndWaitForKpiData(page: Page): Promise<IncentiveDashboardPage> {
  const featurePage = new IncentiveDashboardPage(page);
  await featurePage.navigate();
  await featurePage.waitForReady();
  return featurePage;
}

/**
 * Change fiscal year and wait for the CorporateDashboardDataByType response.
 * Used by fiscal year change tests (INC-TC-011, INC-E2E-005).
 */
export async function changeFiscalYearAndWait(
  featurePage: IncentiveDashboardPage,
  year: string
): Promise<void> {
  const [response] = await Promise.all([
    featurePage.waitForCorporateDataResponse(),
    featurePage.selectFiscalYear(year),
  ]);
  if (!response) {
    throw new Error(
      `Expected CorporateDashboardDataByType response after changing fiscal year to ${year}, but none received.`
    );
  }
  await expect(featurePage.spnTotalTires).not.toBeEmpty();
}

/**
 * Change quarter and wait for the CorporateDashboardDataByType response.
 * Used by quarter change tests (INC-TC-012, INC-E2E-001).
 */
export async function changeQuarterAndWait(
  featurePage: IncentiveDashboardPage,
  quarter: string
): Promise<void> {
  const [response] = await Promise.all([
    featurePage.waitForCorporateDataResponse(),
    featurePage.selectQuarter(quarter),
  ]);
  if (!response) {
    throw new Error(
      `Expected CorporateDashboardDataByType response after changing quarter to ${quarter}, but none received.`
    );
  }
  await expect(featurePage.spnTotalTires).not.toBeEmpty();
}

/**
 * Perform the territory -> distributor -> dealer cascade and wait for tile data.
 * Used by BMMGT cascade tests (INC-TC-013-015, INC-E2E-004).
 */
export async function performTerritoryDistributorDealerCascade(
  featurePage: IncentiveDashboardPage
): Promise<void> {
  // Step 1: select first non-default territory (index 1)
  await featurePage.selectTerritory(1);
  await expect(featurePage.ddDistributor.locator('option').nth(1)).toBeAttached();

  // Step 2: select first distributor
  await featurePage.selectDistributor(1);
  await expect(featurePage.ddDealer.locator('option').nth(1)).toBeAttached();

  // Step 3: select first dealer
  const [response] = await Promise.all([
    featurePage.waitForCorporateDataResponse(),
    featurePage.selectDealer(1),
  ]);
  if (!response) {
    throw new Error(
      'Expected CorporateDashboardDataByType response after dealer selection, but none received.'
    );
  }
  await expect(featurePage.spnTotalTires).not.toBeEmpty();
}

// -----------------------------------------------------------------------------
// Dealer Landing helpers
// -----------------------------------------------------------------------------

/**
 * Navigate to LandingDashboard and wait for fiscal year filter.
 * Used by dealer-role smoke and regression tests.
 */
export async function navigateToLandingDashboard(page: Page): Promise<LandingDashboardPage> {
  const landingPage = new LandingDashboardPage(page);
  await landingPage.navigate();
  await landingPage.waitForReady();
  return landingPage;
}

/**
 * Navigate to LandingDashboard, click Redeem, and wait for confirmation.
 * Used by INC-TC-050 and INC-E2E-003.
 */
export async function redeemCashRewards(page: Page): Promise<LandingDashboardPage> {
  const landingPage = new LandingDashboardPage(page);
  await landingPage.navigate();
  await landingPage.waitForReady();
  await expect(landingPage.redeemButton).toBeEnabled();
  const [response] = await Promise.all([
    landingPage.waitForRedeemResponse(),
    landingPage.clickRedeem(),
  ]);
  if (!response || response.status() !== 200) {
    throw new Error(
      `Expected RedeemCashRewards to return 200, got ${response?.status() ?? 'no response'}.`
    );
  }
  return landingPage;
}

// -----------------------------------------------------------------------------
// Dealer Dashboard helpers
// -----------------------------------------------------------------------------

/**
 * Navigate to DealerDashboard and wait for dealer dropdown.
 * Used by INC-SMOKE-005 and dealer-dashboard regression tests.
 */
export async function navigateToDealerDashboard(page: Page): Promise<DealerDashboardPage> {
  const dealerPage = new DealerDashboardPage(page);
  await dealerPage.navigate();
  await dealerPage.waitForReady();
  return dealerPage;
}