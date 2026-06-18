# PopShop New Order — Gap Analysis

**Module:** popshop  
**Feature:** new-order  
**Date:** 2026-06-17  
**Analyst:** Migration QA Framework (automated)  

---

## Missing Functional Units

| FU ID | Title | Risk | Impact | Recommendation |
|---|---|---|---|---|
| POPSHOP-FU-019 | Dealer Role-Based Product Visibility | Critical | Dealers (BMDLR) could see products belonging to other dealers or admin-only items | Confirm modern API applies `dealer_number_seq` + role filter equivalent to `FilterProductDataSet`; add integration test for BMDLR vs BMADMIN product sets |
| POPSHOP-FU-033 | Encrypted Parameter Passing | Critical | `catalog_product_seq`, price, category passed in plaintext — parameter tampering possible | Confirm modern uses signed/encrypted params or JWT claims for all product/cart identifiers; document the security approach |
| POPSHOP-FU-032 | Authentication Gate | Critical | Unauthenticated access to product catalog and cart operations if modern page model does not inherit auth | Confirm modern page base class or middleware enforces auth before proceeding |
| POPSHOP-FU-002 | Product Listing Render (Grid/List) | High | Dealers cannot browse the catalog | Implement or confirm client-side rendering is functional in modern |
| POPSHOP-FU-003 | Category Tree Navigation | High | No way to filter by product category | Implement category tree data API + client render in modern |
| POPSHOP-FU-004 | Cart Flyout Display | High | Users cannot see cart status without navigating away | Implement cart flyout or confirm equivalent UX in modern |
| POPSHOP-FU-006 | Bulk Order Modal | High | Dealers cannot place bulk/family orders — major ordering path lost | Implement bulk order modal and tier pricing in modern |
| POPSHOP-FU-007 | Solo Parent Product Modal | High | Dealers cannot view product details or add solo-parent items | Implement solo product detail flow in modern |
| POPSHOP-FU-010 | Status Filter | High | All users see all statuses; role-gated filtering not present | Implement role-based status filtering (BMDLR → Approved only) |
| POPSHOP-FU-011 | Per-Item Quantity Input | High | Dealers cannot set quantities before adding to cart | Implement qty input on product card |
| POPSHOP-FU-014 | Product Availability Display | High | Dealers see incorrect availability state (In Stock / Out of Stock / POD / Backorder) | Confirm modern API returns and applies all 4 availability states correctly |
| POPSHOP-FU-015 | Inventory Quantity Calculation | High | Cart price may be calculated incorrectly if cost-tier logic missing | Confirm `CatalogProductInventoryByCostApiModel` is wired to same SP/logic as legacy |
| POPSHOP-FU-018 | Discount Tier Pricing | High | Dealers always pay full price — no bulk discount tiers | Implement `ICatalogProductOfferService` equivalent or confirm in modern API |
| POPSHOP-FU-020 | Product Publish Status Gate | High | Submitted/Denied items can be added to cart | Implement publish status check server-side before allowing add-to-cart |
| POPSHOP-FU-024 | Add Single Item to Cart | High | Core cart action broken — cart never populated | Confirm modern cart write API exists and is called correctly |
| POPSHOP-FU-026 | Remove Item from Cart | High | Users cannot remove items — cart becomes permanently wrong | Implement delete-from-cart endpoint in modern |
| POPSHOP-FU-027 | Proceed to Checkout | High | Order flow cannot complete — shipping page not reachable via add+redirect | Confirm `AddToCartAndProceed` handler or equivalent in modern |
| POPSHOP-FU-028 | Cart Session Continuity | High | Cart lost on every page navigation | Implement cart retrieval on page load in modern |
| POPSHOP-FU-029 | Cart Retrieval from DB | High | Cart never restored — dealer must start over on every visit | Implement cart persistence retrieval in modern API |
| POPSHOP-FU-030 | Cart Persistence to DB | High | Cart changes not saved — all work lost on navigation | Implement or confirm cart write API (different from legacy XML but must persist) |
| POPSHOP-FU-034 | Dealer Data Scoping | High | Dealer can potentially add or view products outside their eligible set | Confirm modern search API filters by `dealer_number_seq` |
| POPSHOP-FU-008 | Keyword Search with Type Selector | High | Dealers cannot search catalog efficiently | Confirm search type selector + keyword route params in modern `SearchItem` |

---

## Missing Validations

| Validation | Legacy Rule | Modern Status | Gap Level |
|---|---|---|---|
| Cart empty before checkout | `validateCartBeforeCheckout = true` — JS blocks navigation to Shipping if cart empty | Not confirmed in modern | High |
| Quantity > 0 | Client-side: blocks "Add to Cart" if qty = 0; server message `_enterorderquantitygreaterthan0orcancel` | Not confirmed | High |
| Min order quantity | `min_order_quantity` enforced in bulk/solo modals; cart row stores `min_order_qty` | Not confirmed in modern | Medium |
| Max order quantity | `max_order_qty` enforced; `catalog_max_order_type_name` determines enforcement type | Not confirmed in modern | Medium |
| Inventory vs requested qty | `GetOrderDetail`: if `qty > Inventory_Count` AND `PO_NUMBER != "POD"` → error "Quantity limit exceeded" | Not confirmed | High |
| Price From ≤ To | JS `#Search_From`, `#Search_To` focusout validation | Not confirmed | Low |
| Valid decimal price input | `TryParseFlexibleDecimal` — handles currency symbols, locale differences | Not confirmed | Medium |
| Dealer product eligibility | `ValidateCartOrderProducts` — SP validates product allowed for dealer | Not confirmed in modern | Critical |

---

## Missing Workflow Steps

| Step | Legacy Trigger | Modern Status | Gap Level |
|---|---|---|---|
| Browse → Add to Cart | Product qty + "Add to Cart" → `OnPostAddToCart` | Partial (`CartProductValidationApiModel` only) | High |
| Add to Cart → Cart Updated | `UpdateCartItem` XML persist + cart flyout refresh | Not confirmed | High |
| Cart → Checkout | "Proceed to Checkout" / cart flyout checkout link → `/PopShop/Shipping` | Shipping.cshtml exists; handler not confirmed | High |
| Cart item → Remove from cart | Delete icon → confirmation modal → `OnGetDeleteFromCart` | Not found | High |
| Previous order → Re-order | `?OrderNumber=` param → `GetOrderDetail()` → clear cart + reload + redirect | Not found | Medium |
| Favorite toggle | Heart icon → `OnGetProductWishlist` → `AssetBIZ.UpdateAssetFavourite` | Not found | Low |

---

## Missing Database Operations

| Operation | Legacy Table/SP | Modern Status | Gap Level |
|---|---|---|---|
| Cart read | SP: `RetrievePopShopCartInfo(userSeq, "Y")` → table `crc_user_product_cart` (GUID + XML schema + XML data) | Not found | High |
| Cart write | SP: `UpdateCartItem(cartId, userSeq, dealerTypeSeq, xml, xmlSchema, "Y")` | Not found — API approach only | High |
| Cart clear | SP: `ClearCart(cartId)` — used during re-order | Not found | Medium |
| Product search | SP: `USP_CATALOG_PRODUCT_S29` (referenced in code comment) via `GetCatalogProductSearch` | `CatalogProductSearchApiModel` exists — SP not confirmed | High |
| Inventory by cost | SP via `getCatalogProductInventoryByCost` → multi-row cost tiers | `CatalogProductInventoryByCostApiModel` — SP not confirmed | High |
| Product validation | SP via `ValidateCartOrderProducts(programSeq, divisionSeq, productSeq, qty, amount, ..., dealerSeq)` | Not confirmed | Critical |
| Catalog type (categories) | SP via `getCatalogProductTypebyDivisionSeq(programSeq, divisionSeq, corporateSeq)` | Not confirmed | High |
| Wishlist | `AssetBIZ.GetAssetFavourite` / `UpdateAssetFavourite` (Adbuilder DLL) | Not confirmed | Low |

---

## Missing Security Rules

| Rule | Legacy Enforcement | Modern Status | Gap Level |
|---|---|---|---|
| Authentication gate | `PaginationModel` base class — all pages require auth | Not confirmed in modern page inheritance | Critical |
| Encrypted product seq | `IEncryptDecrypt.Encrypt/Decrypt` on `catalog_product_seq` in every request | No encryption pattern found in modern models | Critical |
| Role-based product visibility | `UserSession.Role` → BMDLR forced to approved-only, dealer-scoped products | Not confirmed | Critical |
| Encrypted price params | `fromPrice`, `toPrice`, `status`, `SearchFilter`, `CategoryID` all encrypted | No encryption in modern | High |
| Dealer data isolation | `dealer_number_seq` + `admin_approval_flag = 'N'` filter on BMDLR | `CatalogProductSearchApiModel` — scoping fields unconfirmed | High |
| Parameter tampering prevention | All seq params encrypted before client-side use, decrypted server-side | No equivalent found | High |

---

## Dimension Analysis Summary

### UI Elements
**Coverage:** 14.3% (2/7 Partial, 5 Missing)  
The product catalog browse UI is almost entirely missing from the modern codebase at the page model level. `SearchItem.cshtml` exists as a view but has no code-behind. The complex modals (bulk order, solo parent) are not present. The category tree, cart flyout, and product listing render are all absent.

### Validation Rules  
**Coverage:** ~25% (2/8 confirmed, 6 unconfirmed)  
Cart empty check and min/max qty are the most critical unconfirmed validations. Server-side `ValidateCartOrderProducts` is the most critical gap — this is the dealer-specific eligibility check.

### Business Rules  
**Coverage:** 20% (4 Partial, 6 Missing)  
Discount tier pricing and dealer role-based visibility are the most significant missing business rules. The 4-state availability logic (In Stock / Out of Stock / POD / Backorder) exists in API models but computation is unconfirmed.

### Workflow Transitions  
**Coverage:** 20% (2 Partial, 3 Missing)  
The core cart lifecycle (add → persist → retrieve → checkout) is broken. Cart persistence and retrieval are both missing. The checkout transition exists at the view level only.

### Database Operations  
**Coverage:** ~17% (0 Full, 1 Different, 2 Missing)  
Cart persistence (read and write) is the highest-risk DB gap. The modern XML-based cart approach may be replaced by an API-managed cart — this needs explicit confirmation.

### Stored Procedures  
**Coverage:** 0% (none confirmed in modern)  
Legacy relies on at least 8 SPs. None have been confirmed in modern. `CatalogProductInventoryByCostApiModel` suggests one SP may be wrapped in an API, but the actual call chain is unknown.

### Security Rules  
**Coverage:** 33% (2 Partial, 1 Missing)  
3 Critical security gaps: authentication not confirmed, parameter encryption not present in modern models, and dealer role enforcement not confirmed. These must be resolved before any testing.

---

## Metrics

- **Functional Coverage:** 17.6% (6/34 FU-equivalents at full weight)
- **Validation Coverage:** ~25%
- **Workflow Coverage:** 20%
- **Database Coverage:** ~17%
- **Security Coverage:** 33%

| Level | Count |
|---|---|
| **Critical gaps** | **3** |
| **High gaps** | **20** |
| **Medium gaps** | **9** |
| **Low gaps** | **2** |
| **Total gaps** | **34** |
