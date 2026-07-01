# PopShop — New Order — Regression Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `popshop` | Feature: `new-order`  
Run: `playwright test tests/playwright/specs/popshop/feature-new-order/ --grep @regression`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `popshop: false` | — |

> **Do NOT run PopShop tests against Samsung HVAC.** The `popshop` feature flag is OFF for that client.

> ⚠️ **Modern Implementation Status:** 22 of 34 FUs are **missing or partial** in the modern platform
> (see `gap-analysis.md`). Tests for unimplemented FUs are `test.fixme` and will be enabled
> as modern gaps are resolved. Do not remove them — they serve as a pending test backlog.

---

## UI / Page Init (7 tests)

| Test ID | Test Name | FU | Tags | Status |
|---|---|---|---|---|
| POPSHOP-REG-001 | New Order page loads and initializes correctly (cart retrieved, search/sort lists bound) | FU-001 | @regression | Active (Partial) |
| POPSHOP-REG-002 | Product listing renders in grid view | FU-002 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-003 | Category tree navigation renders with 3 levels | FU-003 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-004 | Cart flyout displays cart count badge, item list, and checkout link | FU-004 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-005 | Product image zoom / gallery carousel opens in modal | FU-005 | @regression | Active (Partial) |
| POPSHOP-REG-006 | Bulk order modal renders with tier pricing and family items | FU-006 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-007 | Solo parent product modal renders with product details and add-to-cart | FU-007 | @regression | `test.fixme` — Missing |

---

## DataEntry (6 tests)

| Test ID | Test Name | FU | Tags | Status |
|---|---|---|---|---|
| POPSHOP-REG-008 | Keyword search with type selector returns filtered results | FU-008 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-009 | Status filter shows role-appropriate statuses (BMDLR → Approved only) | FU-010 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-010 | Per-item quantity input accepts valid integer; rejects 0 or negative | FU-011 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-011 | Price From ≤ To validation enforced on search | FU-016 | @regression | `test.fixme` — Not confirmed |
| POPSHOP-REG-012 | Minimum order quantity enforced in bulk/solo modals | FU-013 | @regression | `test.fixme` — Not confirmed |
| POPSHOP-REG-013 | Maximum order quantity enforced; blocked if exceeded | FU-013 | @regression | `test.fixme` — Not confirmed |

---

## BusinessLogic (10 tests)

| Test ID | Test Name | FU | Tags | Status |
|---|---|---|---|---|
| POPSHOP-REG-014 | Products display correct availability state (In Stock / Out of Stock / POD / Backorder) | FU-014 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-015 | Inventory quantity calculation applied to cart row | FU-015 | @regression | `test.fixme` — Not confirmed |
| POPSHOP-REG-016 | Discount tier pricing applied to eligible dealer | FU-018 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-017 | Dealer role only sees products eligible for their dealer type | FU-019 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-018 | Published-status gate blocks adding Submitted/Denied items to cart | FU-020 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-019 | Add single item to cart updates cart count and flyout | FU-024 | @regression @mutation | `test.fixme` — Missing |
| POPSHOP-REG-020 | Remove item from cart removes it and updates cart total | FU-026 | @regression @mutation | `test.fixme` — Missing |
| POPSHOP-REG-021 | Proceed to Checkout navigates to Shipping page | FU-027 | @regression | `test.fixme` — Not confirmed |
| POPSHOP-REG-022 | Cart persists across page navigation (session continuity) | FU-028 | @regression | `test.fixme` — Missing |
| POPSHOP-REG-023 | Quantity > inventory shows "Quantity limit exceeded" error | FU-015 | @regression | `test.fixme` — Not confirmed |

---

## Workflow (5 tests)

| Test ID | Test Name | FU | Tags | Status |
|---|---|---|---|---|
| POPSHOP-REG-024 | Browse → search → add to cart → cart updated workflow | FU-024, FU-028, FU-030 | @regression @mutation | `test.fixme` — Missing |
| POPSHOP-REG-025 | Cart empty validation blocks navigation to Shipping page | FU-027 | @regression | `test.fixme` — Not confirmed |
| POPSHOP-REG-026 | Favorite toggle updates product wishlist state | FU-031 | @regression @mutation | `test.fixme` — Not confirmed |
| POPSHOP-REG-027 | Re-order from previous order number clears cart and reloads items | FU-033 | @regression @mutation | `test.fixme` — Missing |
| POPSHOP-REG-028 | Cart retrieval from DB restores cart on page load | FU-029 | @regression | `test.fixme` — Missing |

---

## Security (6 tests)

| Test ID | Test Name | FU | Tags | Status |
|---|---|---|---|---|
| POPSHOP-REG-029 | Unauthenticated access redirects to login | FU-032 | @regression @security | Active |
| POPSHOP-REG-030 | Dealer role cannot see products outside their eligible set | FU-019, FU-034 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-031 | Encrypted product/cart identifiers in URLs (no plain integer seq) | FU-033 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-032 | Cart write validates dealer product eligibility before persisting | FU-034 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-033 | Dealer data is scoped to their `dealer_number_seq` — no cross-dealer data | FU-034 | @regression @security | `test.fixme` — Missing |
| POPSHOP-REG-034 | Anti-forgery token present on all POST actions | FU-032 | @regression @security | Active (Partial) |

---

## Summary

| Status | Count |
|---|---|
| Active (pass now) | 4 |
| `test.fixme` — blocked pending modern implementation | 30 |
| **Total** | **34** |

## Accepted Fixme Blockers (from gap-analysis.md)

See [gap-analysis.md](gap-analysis.md) for the full list of 22 critical/high gaps that block these tests. Key blocked areas:
- Cart read/write/persistence (FU-028–030)
- Product listing render (FU-002)
- Category tree (FU-003)
- Bulk/solo modals (FU-006, FU-007)
- Discount tier pricing (FU-018)
- Add/remove cart actions (FU-024, FU-026)
