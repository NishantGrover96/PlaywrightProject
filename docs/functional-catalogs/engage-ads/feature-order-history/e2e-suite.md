# EngageAds — Order History — E2E Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `order-history`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-order-history/ --grep @e2e`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.

E2E flows are all read-only (non-mutating) and safe to run on production.
Mutating flows (OH-E2E-001, OH-E2E-002) require dev/testing/UAT — marked `@mutation`.

---

## Flows: 3 tests

### OH-E2E-001 — Full flow: submit campaign → confirm → view in history `@mutation`

**FUs exercised:** FU-OH-001, FU-OH-002, FU-OH-004, FU-OH-005

**Steps:**
1. Navigate to `/EngageAds/BundledAdPackages` as authenticated dealer
2. Select a package and proceed to Campaign Setup
3. Complete all 4 steps of Campaign Setup and submit
4. Assert Order Confirmation page loads with order details
5. Navigate to `/EngageAds/OrderHistory`
6. Assert the newly submitted order appears in the list
7. Assert status badge reflects the correct initial state
8. Assert Edit link is visible (within edit window)

**Expected:** Order appears in history immediately after submission. Status badge and edit link are correct.  
**Environment:** dev, testing, or UAT only (`@mutation`). Skip on production.

---

### OH-E2E-002 — Full flow: submit → edit within window → verify updated history `@mutation`

**FUs exercised:** FU-OH-001, FU-OH-002, FU-OH-010, FU-OH-012

**Steps:**
1. Navigate to `/EngageAds/OrderHistory` as authenticated dealer
2. Locate an order with an active Edit link (within edit window)
3. Click the Edit link — assert navigation to Campaign Setup in edit mode
4. Modify a field (e.g., contact phone number)
5. Click Update
6. Assert Order Confirmation page shows updated details
7. Navigate back to Order History
8. Assert the order row reflects the updated data

**Expected:** Edit flow completes successfully. History reflects the update without creating a duplicate entry.  
**Environment:** dev, testing, or UAT only (`@mutation`). Skip on production.

---

### OH-E2E-003 — Role access: admin views order history across multiple dealers

**FUs exercised:** FU-OH-003, FU-OH-008, FU-OH-009

**Steps:**
1. Navigate to `/EngageAds/OrderHistory` as authenticated admin
2. Assert admin can view order history (not restricted to own dealer)
3. Navigate directly to a dealer's order detail URL
4. Assert access is granted as admin
5. Attempt to access a different dealer's order as a dealer role user (URL manipulation)
6. Assert dealer role is blocked or redirected

**Expected:** Admin sees cross-dealer orders. Dealer role is scoped to own orders only. Security isolation enforced.  
**Environment:** All environments (non-mutating).

---

## Prerequisites

| Requirement | Details |
|---|---|
| EngageAds orders | At least 1 submitted order in the target dealer account |
| Edit window order | At least 1 order submitted within the edit window for OH-E2E-002 |
| Environments | OH-E2E-001, OH-E2E-002 — dev/testing/UAT only; OH-E2E-003 — all environments |
| Clients | DemoPortal and CertainTeed only — Samsung excluded |
