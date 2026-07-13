# Incentive - Incentive Dashboard - Smoke Suite
Generated: 2026-07-09
Tests: 5 | Priority: P1-Critical only

---

## Purpose

Smoke tests validate the minimum viable state of the Incentive Dashboard feature.
If any smoke test fails, automation is blocked.

---

## INC-SMOKE-005 - Dealer dashboard page loads with dealer dropdown
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-001
- **Precondition**: User authenticated as Dealer role
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/DealerDashboard`
- **Expected**: Page renders; dealer dropdown populated; default tab active
- **Assertions**:
  - Dealer select element visible and has ≥ 1 option
  - Active tab content area visible
- **Test Data**: Dealer credentials; at least one enrolled dealer

---

## INC-SMOKE-004 - KPI tiles load data on page ready
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-007, BR-011
- **Precondition**: User authenticated as BMDM; active program with data
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard`
  2. Wait for `#dvTierPurchasePannel` spinner to hide
- **Expected**: All Units, Unqualified Units, Returned Units, and Reward Amount tiles display numeric values
- **Assertions**:
  - `#spnTotalTires` content is not empty
  - `#spnUnqualifiedTires` content is not empty
  - `#promoTotalAmount` content is not empty
- **Test Data**: BMDM credentials; active program with unit and reward data for current fiscal year/quarter

---

## INC-SMOKE-003 - Dealer landing dashboard loads for authenticated dealer
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-010
- **Precondition**: User authenticated as Dealer
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/LandingDashboard`
- **Expected**: Page renders with dealer name; program tiles visible; `#ddlFiscalYear` present with ≥ 1 option
- **Assertions**:
  - Page heading or dealer name element visible
  - `#ddlFiscalYear` visible with at least 1 option
  - No error or exception rendered
- **Test Data**: Dealer credentials; dealer enrolled in at least one program

---

## INC-SMOKE-002 - Unauthenticated user redirected to login
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-021
- **Precondition**: No active session cookie
- **Steps**:
  1. Clear all cookies / start fresh browser context
  2. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard` directly
- **Expected**: HTTP 302 redirect to `/Account/Login`; dashboard content not rendered
- **Assertions**:
  - Final URL contains `/Account/Login`
  - Dashboard heading and KPI tiles not present in DOM
- **Test Data**: None - unauthenticated context

---

## INC-SMOKE-001 - Admin dashboard page loads for authenticated admin (BMDM)
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-001, BR-006
- **Precondition**: User authenticated as BMDM role
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard`
- **Expected**: Page renders with status 200; `#ddlFiscalYear` visible; `#ddlQuarterly` has 4 options; `#hdUserType` value = "BMDM"; TM control pre-populated from session
- **Assertions**:
  - `#ddlFiscalYear` visible
  - `#ddlQuarterly` has exactly 4 options (Q1-Q4)
  - `#hdUserType` value equals "BMDM"
  - KPI tiles container visible
- **Test Data**: BMDM credentials; active program assigned to BMDM's territory

---

## Automation Notes

```ts
// Playwright fixture - BMDM smoke
test('INC-SMOKE-001 - admin dashboard loads', async ({ page, bmdmUser }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  await expect(page.locator('#ddlFiscalYear')).toBeVisible();
  await expect(page.locator('#ddlQuarterly')).toHaveCount(4); // options
  await expect(page.locator('#hdUserType')).toHaveValue('BMDM');
});

// Playwright fixture - unauthenticated redirect
test('INC-SMOKE-002 - unauthenticated redirected', async ({ page }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  await expect(page).toHaveURL(/Account\/Login/);
});
```
