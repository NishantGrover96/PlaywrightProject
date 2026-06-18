# PopShop New Order — Migration Mapping

**Module:** popshop  
**Feature:** new-order  
**Date:** 2026-06-17  

---

## Summary

| Equivalence | Count |
|---|---|
| Equivalent | 0 |
| Partial | 11 |
| Different | 1 |
| Missing in Modern | 22 |
| New in Modern | 1 |

---

## Detailed Mapping

| FU ID | Title | Legacy Implementation | Modern Implementation | Equivalence | Notes |
|---|---|---|---|---|---|
| POPSHOP-FU-001 | Page Load & Init | `NewOrder.cshtml.cs:OnGet()` — cart retrieval, list binds, category tree | `Product.cshtml.cs:OnGet()` (stub) | Partial | Modern page init is client-side; server-side cart bootstrap not confirmed |
| POPSHOP-FU-002 | Product Listing Render | `NewOrder.cshtml` grid/list toggle, itemUL | Not found in modern Pages | Missing in Modern | Modern may render via JS after API call |
| POPSHOP-FU-003 | Category Tree Navigation | `GetCategoriesHtml()` server-side HTML, `treemenu` JS | Not found | Missing in Modern | Modern has no equivalent category tree page model |
| POPSHOP-FU-004 | Cart Flyout Display | `NewOrder.cshtml` cart mini-list, `OnGetCartDetail`/`OnGetAmountDetail` | Not found | Missing in Modern | Cart flyout UI pattern absent from modern pages |
| POPSHOP-FU-005 | Product Image Gallery | `OnGetProductImages` → `GetDocumentImages`; carousel modals | `Product.cshtml.cs` stub (client-side) | Partial | Image data may be served via API; modals not confirmed |
| POPSHOP-FU-006 | Bulk Order Modal | `NewOrder.cshtml` + `NewOrderBulk.js` — full modal UI | Not found in modern | Missing in Modern | High-risk gap — complex feature with tier pricing |
| POPSHOP-FU-007 | Solo Parent Product Modal | `NewOrder.cshtml` + `PopBox.js` — solo detail modal | Not found in modern | Missing in Modern | High-risk gap |
| POPSHOP-FU-008 | Keyword Search with Type Selector | `OnGetProductList(SearchType, SearchFilter)` | `SearchItem.cshtml` (view-only) | Partial | Modern view exists but no .cs handler; JS-driven presumed |
| POPSHOP-FU-009 | Price Range Filter | `OnGetProductList(fromPrice, toPrice)` decrypted | Not confirmed in modern | Missing in Modern | |
| POPSHOP-FU-010 | Status Filter | `OnGetProductList(status)` — BMDLR forced to "Y" | Not confirmed in modern | Missing in Modern | Role-based status override critical for dealer |
| POPSHOP-FU-011 | Per-Item Quantity Input | Product card qty input → `OnPostAddToCart` | Not confirmed | Missing in Modern | |
| POPSHOP-FU-012 | Bulk Quantity Entry | `NewOrderBulk.js` bulk modal qty stepper | Not found | Missing in Modern | |
| POPSHOP-FU-013 | Attribute Filter for Family Products | `OnGetProductAttributeLookupsAsync` → PPSP module lookups | Not found | Missing in Modern | |
| POPSHOP-FU-014 | Product Availability Display | `CheckQuantity()` + `HydrateQuantityAndPricingFromSearchRow()` — 4 states | `CatalogProductApiModel` has inventory fields | Partial | Computation logic for 4 states not confirmed in modern |
| POPSHOP-FU-015 | Inventory Quantity Calculation | `getCatalogProductInventoryByCost` → cost-tier-based | `CatalogProductInventoryByCostApiModel.cs` | Partial | API model exists; actual computation in API service (not read) |
| POPSHOP-FU-016 | Min/Max Order Qty Enforcement | `ProductDetail.max_order_qty` / `min_order_quantity` in cart | `CatalogProductApiModel` likely carries fields | Partial | Enforcement logic not confirmed in modern |
| POPSHOP-FU-017 | Price Display (Amount vs Points) | `_programConfig.PopShop.ItemAddedCostBy` branch logic | `CatalogProductApiModel.amount` | Partial | Config-driven branch; modern config equivalent not read |
| POPSHOP-FU-018 | Discount Tier Pricing | `OnPostGetCatalogProductOfferTiersAsync` → `ICatalogProductOfferService` | Not found in modern | Missing in Modern | `CatalogProductOffer` entity not found in modern CommonEntity |
| POPSHOP-FU-019 | Dealer Role-Based Visibility | `GetCatalogProductSearch` BMADMIN vs BMDLR + `FilterProductDataSet` | Not confirmed | Missing in Modern | Critical security+business rule |
| POPSHOP-FU-020 | Product Publish Status Gate | `HydrateQuantityAndPricingFromSearchRow`: Submitted→disabled, Denied→disabled | Not confirmed | Missing in Modern | |
| POPSHOP-FU-021 | Cart Total Calculation | `OnGetAmountDetail` SUM(qty_cost) from DataSet | Not found | Missing in Modern | |
| POPSHOP-FU-022 | Favorites / Wishlist Toggle | `OnGetProductWishlist` → `AssetBIZ` | Not found | Missing in Modern | `AssetBIZ` is a separate Adbuilder DLL — modern integration unclear |
| POPSHOP-FU-023 | Re-Order from Previous Order | `GetOrderDetail(?OrderNumber=...)` → validate + cart build → Shipping | Not found | Missing in Modern | |
| POPSHOP-FU-024 | Add Single Item to Cart | `OnPostAddToCart` — delete+add pattern, `ValidateCartOrderProducts`, `UpdateCartItem` | `CartProductValidationApiModel` (validation only) | Partial | Cart write mechanism missing in modern |
| POPSHOP-FU-025 | Add All Items to Cart | Same `OnPostAddToCart` with list | Not confirmed | Missing in Modern | |
| POPSHOP-FU-026 | Remove Item from Cart | `OnGetDeleteFromCart` → DataSet row delete + `UpdateCartItem` | Not found | Missing in Modern | |
| POPSHOP-FU-027 | Proceed to Checkout | `OnPostAddToCartAndProceed` → add + redirect to `/PopShop/Shipping` | `Shipping.cshtml` (view exists) | Partial | Handler / add-then-redirect flow not confirmed in modern |
| POPSHOP-FU-028 | Cart Session Continuity | `OnGet():RetrieveCartInfo()` on every load; new cart if empty | Not found | Missing in Modern | |
| POPSHOP-FU-029 | Cart Retrieval from DB | `RetrievePopShopCartInfo(userSeq, "Y")` → XML schema reconstitution | Not found | Missing in Modern | DataSet XML cart pattern likely replaced by API model |
| POPSHOP-FU-030 | Cart Persistence to DB | `UpdateCartItem(cartId, userSeq, dealerTypeSeq, xml, xmlSchema, "Y")` | Not found | Missing in Modern | XML serialization approach likely Different in modern |
| POPSHOP-FU-031 | Session Cache for Category Tree | `WebHelper` session read/write for category HTML | Not found | Missing in Modern | |
| POPSHOP-FU-032 | Authentication Gate | `PaginationModel` auth enforcement | Not confirmed | Partial | Modern page model inheritance not read |
| POPSHOP-FU-033 | Encrypted Parameter Passing | `IEncryptDecrypt` on all seq/price/category params | Not found in modern pattern | Missing in Modern | Modern API calls may use route params or JWT — pattern unknown |
| POPSHOP-FU-034 | Dealer Data Scoping | `dealer_number_seq` + `Role` passed to `GetCatalogProductSearch` + `ValidateCartOrderProducts` | `CatalogProductSearchApiModel` fields not confirmed | Partial | Critical — determines what products dealer can see and buy |

---

## New in Modern

| Item | Modern File | Notes |
|---|---|---|
| SaaS API Integration | `CatalogProductSaasApiModels.cs` | External SaaS catalog API not present in legacy; new capability or vendor integration |

---

## High-Risk Missing Items

The following FUs are `Missing in Modern` AND rated High or Critical risk:

| FU ID | Title | Risk | Impact |
|---|---|---|---|
| POPSHOP-FU-019 | Dealer Role-Based Product Visibility | Critical | Dealers could see or order products they should not |
| POPSHOP-FU-033 | Encrypted Parameter Passing | Critical | Parameters visible/tamperable without encryption |
| POPSHOP-FU-032 | Authentication Gate | Critical | Unauthenticated access possible |
| POPSHOP-FU-006 | Bulk Order Modal | High | Major ordering feature entirely absent |
| POPSHOP-FU-007 | Solo Parent Product Modal | High | Product detail + order flow absent |
| POPSHOP-FU-018 | Discount Tier Pricing | High | Pricing could be incorrect if tiers not implemented |
| POPSHOP-FU-020 | Product Publish Status Gate | High | Dealers could add unapproved/denied items |
| POPSHOP-FU-024 | Add Single Item to Cart | High | Core cart action — write path not confirmed |
| POPSHOP-FU-034 | Dealer Data Scoping | High | Dealer sees all products instead of their eligible set |
| POPSHOP-FU-027 | Proceed to Checkout | High | Core workflow transition — not confirmed in modern |
| POPSHOP-FU-029 | Cart Retrieval from DB | High | Cart never restored across sessions |
| POPSHOP-FU-030 | Cart Persistence to DB | High | Cart changes lost on navigation |
