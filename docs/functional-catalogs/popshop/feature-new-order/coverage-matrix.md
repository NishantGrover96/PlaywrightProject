# PopShop New Order — Functional Coverage Matrix

**Module:** popshop  
**Feature:** new-order  
**Date:** 2026-06-17  

---

## Functional Coverage Matrix

| FU ID | Title | Category | Legacy | Modern | Status | Gap Level |
|---|---|---|---|---|---|---|
| POPSHOP-FU-001 | Page Load & Initialization | UI | `NewOrder.cshtml.cs:OnGet()` | `Product.cshtml.cs:OnGet()` (stub) | Partial | High |
| POPSHOP-FU-002 | Product Listing Render (Grid/List) | UI | `NewOrder.cshtml` itemUL + grid/list toggle | Not found | Missing | High |
| POPSHOP-FU-003 | Category Tree Navigation | UI | `GetCategoriesHtml()` → treemenu | Not found | Missing | High |
| POPSHOP-FU-004 | Cart Flyout Display | UI | `NewOrder.cshtml` flyout + `OnGetCartDetail` | Not found | Missing | High |
| POPSHOP-FU-005 | Product Image Gallery Carousel | UI | `OnGetProductImages` + carousel modals | `Product.cshtml.cs` stub | Partial | Medium |
| POPSHOP-FU-006 | Bulk Order Modal | UI | `NewOrder.cshtml` + `NewOrderBulk.js` | Not found | Missing | High |
| POPSHOP-FU-007 | Solo Parent Product Modal | UI | `NewOrder.cshtml` + `PopBox.js` | Not found | Missing | High |
| POPSHOP-FU-008 | Keyword Search with Type Selector | DataEntry | `OnGetProductList(SearchType, SearchFilter)` | `SearchItem.cshtml` (view only) | Partial | High |
| POPSHOP-FU-009 | Price Range Filter | DataEntry | `OnGetProductList(fromPrice, toPrice)` | Not confirmed | Missing | Medium |
| POPSHOP-FU-010 | Status Filter | DataEntry | `OnGetProductList(status)` — role-gated | Not confirmed | Missing | High |
| POPSHOP-FU-011 | Per-Item Quantity Input | DataEntry | Product card qty → `OnPostAddToCart` | Not confirmed | Missing | High |
| POPSHOP-FU-012 | Bulk Quantity Entry | DataEntry | `NewOrderBulk.js` bulk modal qty stepper | Not found | Missing | Medium |
| POPSHOP-FU-013 | Attribute Filter for Family Products | DataEntry | `OnGetProductAttributeLookupsAsync` PPSP | Not found | Missing | Medium |
| POPSHOP-FU-014 | Product Availability Display | BusinessLogic | `CheckQuantity()` + `HydrateQuantityAndPricingFromSearchRow()` | `CatalogProductApiModel` fields | Partial | High |
| POPSHOP-FU-015 | Inventory Quantity Calculation | BusinessLogic | `getCatalogProductInventoryByCost` cost-tier | `CatalogProductInventoryByCostApiModel.cs` | Partial | High |
| POPSHOP-FU-016 | Min/Max Order Qty Enforcement | BusinessLogic | `ProductDetail.max_order_qty` / `min_order_quantity` | `CatalogProductApiModel` (fields only) | Partial | Medium |
| POPSHOP-FU-017 | Price Display (Amount vs Points) | BusinessLogic | `ItemAddedCostBy` config branch | `CatalogProductApiModel.amount` | Partial | Medium |
| POPSHOP-FU-018 | Discount Tier Pricing | BusinessLogic | `OnPostGetCatalogProductOfferTiersAsync` → `ICatalogProductOfferService` | Not found | Missing | High |
| POPSHOP-FU-019 | Dealer Role-Based Product Visibility | BusinessLogic | `GetCatalogProductSearch` + `FilterProductDataSet` role gates | Not confirmed | Missing | Critical |
| POPSHOP-FU-020 | Product Publish Status Gate | BusinessLogic | Submitted/Denied → `enableAddToCartAndQuantity = false` | Not confirmed | Missing | High |
| POPSHOP-FU-021 | Cart Total Calculation | BusinessLogic | `OnGetAmountDetail` SUM(qty_cost) | Not found | Missing | Medium |
| POPSHOP-FU-022 | Favorites / Wishlist Toggle | BusinessLogic | `OnGetProductWishlist` → `AssetBIZ` | Not found | Missing | Low |
| POPSHOP-FU-023 | Re-Order from Previous Order | BusinessLogic | `GetOrderDetail(?OrderNumber=...)` | Not found | Missing | Medium |
| POPSHOP-FU-024 | Add Single Item to Cart | Workflow | `OnPostAddToCart` — validate + delete+add + persist | `CartProductValidationApiModel` (validation only) | Partial | High |
| POPSHOP-FU-025 | Add All Items to Cart | Workflow | `OnPostAddToCart` (list variant) | Not confirmed | Missing | Medium |
| POPSHOP-FU-026 | Remove Item from Cart | Workflow | `OnGetDeleteFromCart` → DataSet delete + `UpdateCartItem` | Not found | Missing | High |
| POPSHOP-FU-027 | Proceed to Checkout | Workflow | `OnPostAddToCartAndProceed` → Shipping | `Shipping.cshtml` (view exists) | Partial | High |
| POPSHOP-FU-028 | Cart Session Continuity | Workflow | `OnGet():RetrieveCartInfo()` every load | Not found | Missing | High |
| POPSHOP-FU-029 | Cart Retrieval from DB | DataPersistence | `RetrievePopShopCartInfo` XML schema reconstitution | Not found | Missing | High |
| POPSHOP-FU-030 | Cart Persistence to DB | DataPersistence | `UpdateCartItem` XML schema+data | Not found — API approach | Different | High |
| POPSHOP-FU-031 | Session Cache for Category Tree | DataPersistence | `WebHelper` session read/write | Not found | Missing | Low |
| POPSHOP-FU-032 | Authentication Gate | Security | `PaginationModel` base class auth | Unconfirmed | Partial | Critical |
| POPSHOP-FU-033 | Encrypted Parameter Passing | Security | `IEncryptDecrypt` on all seq/price params | Not found — no encryption in modern API models | Missing | Critical |
| POPSHOP-FU-034 | Dealer Data Scoping | Security | `dealer_number_seq` + `Role` in search + validate | `CatalogProductSearchApiModel` (unconfirmed) | Partial | High |

---

## Coverage Summary

| Category | Total FUs | Full | Partial | Different | Missing | Coverage % |
|---|---|---|---|---|---|---|
| UI | 7 | 0 | 2 | 0 | 5 | 14.3% |
| DataEntry | 6 | 0 | 1 | 0 | 5 | 8.3% |
| BusinessLogic | 10 | 0 | 4 | 0 | 6 | 20.0% |
| Workflow | 5 | 0 | 2 | 0 | 3 | 20.0% |
| DataPersistence | 3 | 0 | 0 | 1 | 2 | 16.7% |
| Security | 3 | 0 | 2 | 0 | 1 | 33.3% |
| **TOTAL** | **34** | **0** | **11** | **1** | **22** | **17.6%** |

> Coverage % = (Full × 1.0 + Partial × 0.5 + Different × 0.5) / Total × 100

---

## Gap Summary by Level

| Level | Count | FU IDs |
|---|---|---|
| Critical | 3 | FU-019, FU-032, FU-033 |
| High | 19 | FU-001, FU-002, FU-003, FU-004, FU-006, FU-007, FU-008, FU-010, FU-011, FU-014, FU-015, FU-018, FU-020, FU-024, FU-026, FU-027, FU-028, FU-029, FU-030, FU-034 |
| Medium | 9 | FU-005, FU-009, FU-012, FU-013, FU-016, FU-017, FU-021, FU-023, FU-025 |
| Low | 2 | FU-022, FU-031 |
| None (Full) | 0 | — |
