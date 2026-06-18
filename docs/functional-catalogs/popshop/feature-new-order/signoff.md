# PopShop New Order — Coverage Sign-off

**Module:** popshop  
**Feature:** new-order  
**Date:** 2026-06-17  
**Reviewer:** Migration QA Framework (automated)  

---

## Decision: 🚫 BLOCKED

The modern implementation of PopShop New Order is at an early migration stage. Three Critical security/business gaps, twenty High functional gaps, and overall functional coverage of 17.6% all trigger the BLOCKED condition independently.

---

## Coverage Scorecard

| Dimension | Coverage % | Threshold | Status |
|---|---|---|---|
| Functional | 17.6% | ≥ 90% | ❌ FAIL |
| Validation | ~25% | ≥ 85% | ❌ FAIL |
| Workflow | 20% | ≥ 95% | ❌ FAIL |
| Database | ~17% | ≥ 85% | ❌ FAIL |
| Security | 33% | = 100% | ❌ FAIL |

---

## Gap Summary

| Level | Count | Decision Impact |
|---|---|---|
| Critical | 3 | Blocks automation |
| High | 20 | Requires remediation |
| Medium | 9 | Warn in tests |
| Low | 2 | Document only |

---

## Blocking Items

### Critical Gaps — Must Resolve Before Any Automation

**POPSHOP-FU-019 — Dealer Role-Based Product Visibility**  
Risk: Critical  
Legacy: `GetCatalogProductSearch` + `FilterProductDataSet` gate BMDLR to approved-only, dealer-scoped products. BMADMIN sees all statuses.  
Modern status: Not confirmed — `CatalogProductSearchApiModel` exists but role and dealer_number_seq scoping unconfirmed.  
What must be fixed: Confirm modern product search API enforces same BMDLR/BMADMIN visibility rules. Document the API contract. If not implemented, implement before testing.

---

**POPSHOP-FU-032 — Authentication Gate**  
Risk: Critical  
Legacy: `PaginationModel` base class enforces auth on all pages. Unauthenticated requests redirect to login.  
Modern status: Partial — modern page model (`Product.cshtml.cs`) is a stub; base class and auth middleware not confirmed.  
What must be fixed: Confirm modern page base class or ASP.NET middleware applies `[Authorize]` equivalent to all PopShop pages. Without this, catalog and cart are publicly accessible.

---

**POPSHOP-FU-033 — Encrypted Parameter Passing**  
Risk: Critical  
Legacy: `IEncryptDecrypt` encrypts every sensitive identifier client-side (`catalog_product_seq`, price, category, status, search filter). Server decrypts before use.  
Modern status: Missing — no encryption pattern in modern models. `CatalogProductApiModel`, `CartProductValidationApiModel` pass raw values.  
What must be fixed: Define and implement the modern parameter security strategy (encrypted IDs, signed tokens, or JWT claims). Document which params require protection and confirm server-side validation.

---

### High Gaps — Blocking Core User Workflows

**Cart Lifecycle (FU-024, FU-026, FU-028, FU-029, FU-030):**  
The entire cart persistence chain is unconfirmed/missing in modern. Dealers cannot add items, remove items, or have their cart survive navigation. This is the most fundamental e-commerce functionality gap.

**Product Browsing (FU-002, FU-003, FU-006, FU-007):**  
Product listing, category tree navigation, bulk order modal, and solo parent product modal are all absent from the modern implementation. Dealers have no way to browse or select products.

**Checkout Flow (FU-027):**  
The `AddToCartAndProceed` handler and transition to Shipping are unconfirmed. `Shipping.cshtml` exists as a view but the handler is missing.

**Business Logic (FU-014, FU-015, FU-018, FU-020):**  
Product availability display, inventory calculation, discount tier pricing, and publish status gate are all Partial or Missing. Dealers could add out-of-stock, unapproved, or full-price items when discounts should apply.

**Dealer Security (FU-034):**  
Dealer data scoping in the search API is unconfirmed. This is a business-critical and security-critical gap — dealers must not see or order products outside their eligible set.

---

## Automation Scope

### What is INCLUDED (0 tests)

No automated tests can be generated at this time.  
The modern implementation does not have sufficient functional coverage to produce meaningful, non-trivial tests. Generating tests against a stub page model would create tests that pass for the wrong reasons.

### What is EXCLUDED (pending remediation)

All 34 FUs are excluded from automation:

| FU IDs | Reason |
|---|---|
| FU-019, FU-032, FU-033 | Critical gaps — automation blocked |
| FU-002, FU-003, FU-004, FU-006, FU-007, FU-008, FU-010, FU-011, FU-014, FU-015, FU-018, FU-020, FU-024, FU-026, FU-027, FU-028, FU-029, FU-030, FU-034 | High gaps — core flows broken |
| FU-001, FU-005 | Partial — page model is stub; tests would be vacuous |
| FU-009, FU-012, FU-013, FU-016, FU-017, FU-021, FU-023, FU-025 | Medium gaps — secondary flows unconfirmed |
| FU-022, FU-031 | Low gaps — non-blocking but unconfirmed |

---

## Next Steps

The modern PopShop New Order implementation requires the following work before any QA automation can proceed:

### Phase 1 — Security (Must be first)
1. **Confirm/implement authentication** — verify all PopShop pages enforce auth (FU-032)
2. **Define parameter security strategy** — decide: encrypted IDs (as in legacy) or JWT claims or signed tokens. Implement and document (FU-033)
3. **Confirm dealer data scoping** — verify BMDLR role gets dealer-scoped, approved-only products (FU-019, FU-034)

### Phase 2 — Cart Lifecycle
4. **Cart write API** — implement or confirm cart persistence endpoint replacing `UpdateCartItem` XML pattern (FU-030)
5. **Cart read on page load** — confirm cart is retrieved from API on every navigation (FU-028, FU-029)
6. **Add to cart endpoint** — confirm `CartProductValidationApiModel` flows through to cart write (FU-024)
7. **Remove from cart endpoint** — implement (FU-026)
8. **Checkout transition** — implement `AddToCartAndProceed` handler → Shipping (FU-027)

### Phase 3 — Product Browsing
9. **Product listing render** — confirm JS rendering of product cards in modern (FU-002)
10. **Category tree** — implement category data API + tree render (FU-003)
11. **Search type + keyword** — confirm `SearchItem.cshtml` handler and search API (FU-008, FU-009, FU-010)

### Phase 4 — Business Logic
12. **Availability states** — confirm 4-state logic (In Stock / Out of Stock / POD / Backorder) in modern API (FU-014)
13. **Inventory cost tiers** — confirm `CatalogProductInventoryByCostApiModel` wired to same SP (FU-015)
14. **Publish status gate** — implement server-side check before add-to-cart (FU-020)
15. **Discount tier pricing** — implement or confirm `ICatalogProductOfferService` equivalent (FU-018)

### Phase 5 — Advanced Features
16. Bulk order modal (FU-006)
17. Solo parent product modal (FU-007)
18. Cart flyout (FU-004)
19. Re-order flow (FU-023)
20. Favorites/wishlist (FU-022)

### After remediation:
Re-run `/gap-analysis` → re-run `/coverage-signoff` → proceed to `/playwright-test-generation`

---

## Approved Exceptions

None. No exceptions can be approved while Critical gaps exist.

---

🚫 GATE BLOCKED — 3 Critical gaps. Step 3 is not permitted.
