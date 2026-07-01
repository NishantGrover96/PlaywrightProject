# EngageAds — Order History — Regression Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `order-history`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-order-history/ --grep @regression`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.

Total: 12 regression tests (includes smoke)

---

## Navigation & Display (5 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| OH-REG-001 | Order rows link to Campaign Setup in edit mode when within window | FU-OH-001 | @regression @edit-window |
| OH-REG-002 | Edit window countdown timer displays and decrements | FU-OH-002 | @regression @edit-window |
| OH-REG-003 | Expired edit window shows correct expired message | FU-OH-003 | @regression @edit-window |
| OH-REG-004 | Order confirmation page accessible from order row | FU-OH-004 | @regression @navigation |
| OH-REG-005 | Empty state message shown when dealer has no orders | FU-OH-005 | @regression @empty-state |

---

## Data Integrity (2 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| OH-REG-006 | Date formatting is consistent across all order rows | FU-OH-006 | @regression @display |
| OH-REG-007 | PAID badge only visible on fully paid orders | FU-OH-007 | @regression @display @payment |

---

## Security (2 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| OH-REG-008 | Dealer cannot view another dealer's order history via URL manipulation | FU-OH-008 | @regression @security |
| OH-REG-009 | Unauthenticated access redirects to login page | FU-OH-009 | @regression @security |

---

## Edit Window Logic (3 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| OH-REG-010 | Campaign within edit window shows active Edit link | FU-OH-010 | @regression @edit-window |
| OH-REG-011 | Campaign past edit window shows no Edit link | FU-OH-011 | @regression @edit-window |
| OH-REG-012 | Not-yet-submitted campaign is always editable regardless of window | FU-OH-012 | @regression @edit-window |

---

## Total: 12 active regression tests

## FUs covered
FU-OH-001 through FU-OH-012 — all Order History functional units
