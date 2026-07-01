# PopShop — New Order — E2E Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `popshop` | Feature: `new-order`  
Run: `playwright test tests/playwright/specs/popshop/feature-new-order/ --grep @e2e`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat only — mutating flows |
| CertainTeed | ✅ Yes | uat only — mutating flows |
| Samsung HVAC | ❌ No — `popshop: false` | — |

> **Do NOT run PopShop tests against Samsung HVAC.** The `popshop` feature flag is OFF for that client.

> ⚠️ **All E2E flows are currently `test.fixme`.**
> The core cart persistence (FU-028–030) and checkout handler (FU-027) are not implemented in the
> modern platform. No complete end-to-end flow can be exercised until these gaps are resolved.
> See `gap-analysis.md` for the full blocker list.

---

## Flows: 2 tests (both `test.fixme`)

### POPSHOP-E2E-001 — Browse → search → add to cart → proceed to checkout `@mutation @fixme`

**FUs exercised:** FU-001, FU-002, FU-008, FU-011, FU-014, FU-019, FU-020, FU-024, FU-027, FU-028, FU-030

**Blocker:** FU-024 (add to cart), FU-027 (proceed to checkout), FU-028 (cart session continuity), FU-030 (cart persistence to DB) — all missing in modern.

**Steps (for future implementation):**
1. Navigate to `/PopShop/NewOrder` as authenticated dealer
2. Assert product listing renders
3. Search for a keyword — assert filtered results returned
4. Verify dealer-eligible products only are shown (BMDLR role filter)
5. Set quantity to 2 on a product
6. Click "Add to Cart"
7. Assert cart flyout refreshes — shows item + correct count badge
8. Assert cart total updated
9. Click "Proceed to Checkout"
10. Assert navigation to `/PopShop/Shipping`

**Expected:** Complete browse-to-checkout flow succeeds. Cart persists. Only eligible products shown.  
**Environment:** dev, testing, or UAT only (`@mutation`).  
**Enable when:** FU-024, FU-027, FU-028, FU-030 implemented in modern platform.

---

### POPSHOP-E2E-002 — Re-order from previous order number `@mutation @fixme`

**FUs exercised:** FU-001, FU-024, FU-028, FU-029, FU-030, FU-033

**Blocker:** FU-029 (cart retrieval from DB), FU-030 (cart persistence), FU-033 (re-order from order number) — all missing in modern.

**Steps (for future implementation):**
1. Navigate to `/PopShop/NewOrder?OrderNumber={knownOrderNumber}` as authenticated dealer
2. Assert cart is cleared and items from the previous order are loaded
3. Assert only currently available products are re-added (unavailable products excluded with notification)
4. Confirm cart quantities match the original order
5. Proceed to checkout
6. Assert `/PopShop/Shipping` loads with pre-filled cart

**Expected:** Re-order pre-populates cart from historical order. Cart persists to DB. Navigation to Shipping succeeds.  
**Environment:** dev, testing, or UAT only (`@mutation`).  
**Enable when:** FU-029, FU-030, FU-033 implemented in modern platform.

---

## Active E2E Tests: 0

No PopShop E2E flows are currently runnable. Both are blocked by modern implementation gaps.  
These test definitions serve as the acceptance criteria for the development team implementing the missing FUs.

## Unblock Checklist

Before enabling E2E flows, confirm the following in the modern platform:

| FU | Description | Gap Level |
|---|---|---|
| FU-002 | Product Listing Render | High |
| FU-024 | Add Single Item to Cart | High |
| FU-026 | Remove Item from Cart | High |
| FU-027 | Proceed to Checkout | High |
| FU-028 | Cart Session Continuity | High |
| FU-029 | Cart Retrieval from DB | High |
| FU-030 | Cart Persistence to DB | High |
| FU-033 | Encrypted Parameter Passing | Critical |
| FU-034 | Dealer Data Scoping | High |

See [gap-analysis.md](gap-analysis.md) for the complete gap inventory.
