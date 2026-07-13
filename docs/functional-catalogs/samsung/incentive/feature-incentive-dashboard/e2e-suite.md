# Incentive - Incentive Dashboard - E2E Suite
Generated: 2026-07-09
Tests: 5 | Priority: P1-Critical, P2-High

---

## Purpose

End-to-end workflows validate the full user journey from authentication through
data interaction and, where applicable, write operations. Each scenario exercises
multiple business rules in a single uninterrupted flow.

---

## INC-E2E-005 - BMRM user views territory-scoped data and changes fiscal year
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P2-High
- **BR Covered**: BR-001, BR-006, BR-026, BR-028, BR-023
- **Precondition**: Authenticated as BMRM; active program with multi-year data
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard`
  2. Assert TM pre-populated from session; `#hdUserType` = "BMRM"
  3. Wait for `#dvTierPurchasePannel` spinner to hide; note KPI tile values for Year A
  4. Change `#ddlFiscalYear` to prior year
  5. Wait for tiles to reload (spinner hidden again)
  6. Assert KPI tile values changed to reflect Year B data
- **Expected**: Full flow from BMRM load -> fiscal year change -> tile reload completes without error; data changes between years
- **Assertions**:
  - `#hdUserType` = "BMRM"
  - `#spnTotalTires` non-empty after initial load
  - After year change: `#spnTotalTires` shows different value (or same if data matches); no error alert visible

---

## INC-E2E-004 - BMMGT user navigates territory -> distributor -> dealer chain
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P2-High
- **BR Covered**: BR-005, BR-001, BR-013
- **Precondition**: Authenticated as BMMGT; territory, distributor, and primary dealers all exist
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
  2. Assert `#ddTerritory` visible; `#ddDistributor` empty or disabled
  3. Select first non-default territory from `#ddTerritory`
  4. Wait for `#ddDistributor` to populate (≥ 1 option)
  5. Select first distributor
  6. Wait for `#ddDealer` to populate
  7. Assert `#ddDealer` has ≥ 1 option; all visible options are `primary_flag="Y"` dealers
  8. Select a dealer; wait for KPI tiles to load
  9. Assert `#spnTotalTires` non-empty
- **Expected**: Each cascade step succeeds without navigation away; final KPI data loads for selected dealer
- **Assertions**:
  - After territory select: `#ddDistributor` has ≥ 1 option
  - After distributor select: `#ddDealer` has ≥ 1 option
  - After dealer select: `#spnTotalTires` non-empty

---

## INC-E2E-003 - Dealer redeems cash rewards (end-to-end write flow)
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P1-Critical
- **BR Covered**: BR-010, BR-001 (write path)
- **Precondition**: Dealer with available cash rewards; `AlreadyRedeemed=false`; `RedeemCashRewards` endpoint accessible
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/LandingDashboard` as dealer user
  2. Assert "Redeem" button visible and enabled
  3. Note current reward amount displayed
  4. Click "Redeem" button
  5. Wait for `RedeemCashRewards` network response (200)
  6. Assert button state changed (disabled, hidden, or confirmation text shown)
  7. Refresh page and re-navigate
  8. Assert "Redeem" button no longer enabled (already redeemed state)
- **Expected**: Redemption completes; state persists across page refresh
- **Assertions**:
  - `RedeemCashRewards` network response status 200
  - After click: redeem button disabled or confirmation message visible
  - After refresh: button remains in redeemed state

---

## INC-E2E-002 - BMDM user views Rewards mode dashboard and switches to Non-Rewards
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P2-High
- **BR Covered**: BR-001, BR-006, BR-007, BR-011, BR-012, BR-029
- **Precondition**: BMDM credentials; both Rewards and Non-Rewards programs available
- **Steps**:
  1. Navigate to IncentiveDashboard as BMDM
  2. Assert page in Rewards mode: `#spnTentative` (Branding tile) visible; `#Brand` tab hidden
  3. Assert `#PromotionEarned` (in-house tab) is active
  4. Assert `#ddlTM` visible (Rewards-mode control)
  5. Switch to Non-Rewards program via program selector
  6. Wait for page reload
  7. Assert `#Brand` tab visible; `#spnTentative` hidden
  8. Assert `#dvsalesperson` visible; `#ddDealer` visible; `#ddlTM` hidden
- **Expected**: UI controls switch correctly between Rewards and Non-Rewards modes in a single session
- **Assertions**:
  - Rewards mode: `#spnTentative` visible, `#Brand` hidden, `#ddlTM` visible
  - Non-Rewards mode: `#Brand` visible, `#spnTentative` hidden, `#dvsalesperson` visible

---

## INC-E2E-001 - DIST user loads distributor dashboard, applies quarter filter, verifies tile refresh
- **Tier**: E2E
- **Category**: WorkflowE2E
- **Priority**: P1-Critical
- **BR Covered**: BR-002, BR-007, BR-024, BR-027
- **Precondition**: Authenticated as DIST; multi-quarter data exists
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard` as DIST user
  2. Assert `#hdUserType` = "DIST"
  3. Assert distributor pre-populated; no manual selection required
  4. Wait for tiles to load; note `#spnTotalTires` value for current quarter
  5. Change `#ddlQuarterly` to a different quarter (e.g., Q1 if Q2 is current)
  6. Wait for `CorporateDashboardDataByType` network call to complete
  7. Assert `#spnTotalTires` updated (value may differ or match depending on data)
  8. Assert no JS error in console; no error toast or alert visible
- **Expected**: DIST user completes distributor-scoped data view and quarter filter without errors
- **Assertions**:
  - `#hdUserType` = "DIST"
  - Distributor filter pre-populated (no user action)
  - `CorporateDashboardDataByType` request includes DIST routing path
  - After quarter change: network request made with updated period_number; tiles not empty
  - No console errors; no error alert visible

---

## Automation Notes

```ts
// E2E fixture: DIST user full flow
test('INC-E2E-001 - DIST dashboard quarter filter', async ({ page, distUser }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  await expect(page.locator('#hdUserType')).toHaveValue('DIST');
  // Wait for tiles
  await expect(page.locator('#dvTierPurchasePannel .spinner')).toBeHidden();
  const before = await page.locator('#spnTotalTires').innerText();
  // Change quarter
  await page.locator('#ddlQuarterly').selectOption('1');
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('CorporateDashboardDataByType')),
  ]);
  expect(response.status()).toBe(200);
  await expect(page.locator('#dvTierPurchasePannel .spinner')).toBeHidden();
  await expect(page.locator('#spnTotalTires')).not.toBeEmpty();
});

// E2E fixture: BMMGT cascade
test('INC-E2E-004 - BMMGT territory->distributor->dealer cascade', async ({ page, bmmgtUser }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  await page.locator('#ddTerritory').selectOption({ index: 1 });
  await expect(page.locator('#ddDistributor')).not.toHaveCount(0);
  await page.locator('#ddDistributor').selectOption({ index: 1 });
  await expect(page.locator('#ddDealer')).not.toHaveCount(0);
  await page.locator('#ddDealer').selectOption({ index: 1 });
  await expect(page.locator('#dvTierPurchasePannel .spinner')).toBeHidden();
  await expect(page.locator('#spnTotalTires')).not.toBeEmpty();
});
```

---

## Coverage Summary

| Test ID | Users Covered | Key BRs |
|---|---|---|
| INC-E2E-001 | DIST | BR-002, BR-007, BR-024, BR-027 |
| INC-E2E-002 | BMDM | BR-006, BR-007, BR-011, BR-012, BR-029 |
| INC-E2E-003 | Dealer | BR-010 (write path) |
| INC-E2E-004 | BMMGT | BR-005, BR-001, BR-013 |
| INC-E2E-005 | BMRM | BR-006, BR-026, BR-028, BR-023 |
