# PopShop New Order — Functional Unit Catalog

**Module:** popshop  
**Feature:** new-order  
**Total FUs:** 34  
**Date:** 2026-06-17  

---

## Summary

| Category | Count |
|---|---|
| UI | 7 |
| DataEntry | 6 |
| BusinessLogic | 10 |
| Workflow | 5 |
| DataPersistence | 3 |
| Security | 3 |
| **Total** | **34** |

| Risk | Count |
|---|---|
| Low | 8 |
| Medium | 14 |
| High | 9 |
| Critical | 3 |

---

## UI Behaviors

---

**POPSHOP-FU-001** — Page Load and Initialization  
Category: UI | Risk: High  
Legacy: `NewOrder.cshtml.cs:OnGet()` — retrieves cart from DB (`RetrievePopShopCartInfo`), builds product order DataSet, binds status/search-type/sort lists, builds category tree HTML  
Modern: `Product.cshtml.cs:OnGet()` (stub) — page initialization appears client-side driven  
Status: Partial  

---

**POPSHOP-FU-002** — Product Listing Render (Grid + List View)  
Category: UI | Risk: Medium  
Legacy: `NewOrder.cshtml` lines 479–573 — conditional render when `ProductDetailList?.Any()`, grid/list toggle buttons, `<ul class="itemUL">` with per-product cards  
Modern: Not directly found; client-side rendering via JS likely  
Status: Missing in Modern  

---

**POPSHOP-FU-003** — Category Tree Navigation  
Category: UI | Risk: Medium  
Legacy: `NewOrder.cshtml.cs:GetCategoriesHtml()` — 3-level category tree rendered as `<ul class='tree'>` from `getCatalogProductTypebyDivisionSeq`; sessions-cached; tree menu initialized via `$.fn.treemenu`  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-004** — Cart Flyout Display  
Category: UI | Risk: Medium  
Legacy: `NewOrder.cshtml` lines 18–58 — shows cart count badge, item list, cart total, checkout link to `/PopShop/Shipping`; refreshed via `OnGetCartDetail` + `OnGetAmountDetail`  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-005** — Product Image Zoom / Gallery Carousel  
Category: UI | Risk: Low  
Legacy: `NewOrder.cshtml` lines 91–107 (`#ImageViewModal`); `OnGetProductImages` returns up to 7 images via `GetDocumentImages`; carousel in bulk/solo modals  
Modern: `Product.cshtml.cs` stub — gallery rendering presumably client-side  
Status: Partial  

---

**POPSHOP-FU-006** — Bulk Order Modal  
Category: UI | Risk: High  
Legacy: `NewOrder.cshtml` lines 109–282; `NewOrderBulk.js` — tier pricing panel, attribute filter panel, family item rows, preview carousel, qty stepper, selection total, Add to Cart  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-007** — Solo Parent Product Modal  
Category: UI | Risk: High  
Legacy: `NewOrder.cshtml` lines 284–428; `PopBox.js` — discount tier display, attribute selector, main carousel + thumbnails, qty stepper, stock status, item total  
Modern: Not found  
Status: Missing in Modern  

---

## Data Entry

---

**POPSHOP-FU-008** — Keyword Search with Type Selector  
Category: DataEntry | Risk: Medium  
Legacy: `NewOrder.cshtml` lines 436–448 — `#ddRegion` dropdown (SearchType) + `SearchValue` text input; values: title, SKU, description (from `GetPopShopNewOrderSearchTypeList`); search on button click or Enter key  
Modern: `SearchItem.cshtml` (view-only); JS-driven  
Status: Partial  

---

**POPSHOP-FU-009** — Price Range Filter (From / To)  
Category: DataEntry | Risk: Low  
Legacy: `OnGetProductList` params `fromPrice` / `toPrice` — decrypted before use; `Search_From` and `Search_To` bound properties; JS validates From ≤ To  
Modern: Not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-010** — Status Filter  
Category: DataEntry | Risk: Low  
Legacy: `NewOrder.cshtml.cs:BindStatusList()` → `GetPopShopNewOrderStatusList()`; `OnGetProductList` accepts `status` param (encrypted); BMADMIN sees all statuses, BMDLR forced to "Y" (approved only)  
Modern: Not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-011** — Per-Item Quantity Input  
Category: DataEntry | Risk: Medium  
Legacy: Product card qty input (from `ProductDetail.qty`); bulk modal `#bulkPreviewQtyInput`; solo modal `#soloParentQtyInput` — min/max enforced client-side  
Modern: Not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-012** — Bulk Quantity Entry (Bulk Modal)  
Category: DataEntry | Risk: Medium  
Legacy: `NewOrderBulk.js` — qty stepper in bulk modal; supports attribute-filtered family items; qty validates against min/max per product  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-013** — Attribute Filter for Family Products  
Category: DataEntry | Risk: Medium  
Legacy: `OnGetProductAttributeLookupsAsync` → `GetProductAttributeLookupsByModuleAsync("PPSP")`; attribute filter panel in bulk modal; `OnGetFamilyProducts` called with `attributeSortLookupSeqs`  
Modern: Not found  
Status: Missing in Modern  

---

## Business Logic

---

**POPSHOP-FU-014** — Product Availability Display (In Stock / Out of Stock / POD / Backorder)  
Category: BusinessLogic | Risk: High  
Legacy: `NewOrder.cshtml.cs:CheckQuantity()` and `HydrateQuantityAndPricingFromSearchRow()` — checks `inventory_count`, `inventory_flag`, `publish_status`, `back_order_flag`; sets `avaiableText`, `showPOD`, `enableAddToCartAndQuantity`; text from resx (`_InStock`, `_OutOfStock`, `_BackorderAvailable`)  
Modern: `CatalogProductApiModel` has inventory fields — exact computation logic not confirmed  
Status: Partial  

---

**POPSHOP-FU-015** — Inventory Quantity Calculation (Cost-Based)  
Category: BusinessLogic | Risk: High  
Legacy: `NewOrder.cshtml.cs:CalculateCartPrice()` and `CheckQuantity()` — calls `getCatalogProductInventoryByCost`; cost determined per inventory cost tier; returns formatted currency or points string  
Modern: `CatalogProductInventoryByCostApiModel.cs` exists — API-based equivalent  
Status: Partial  

---

**POPSHOP-FU-016** — Min / Max Order Quantity Enforcement  
Category: BusinessLogic | Risk: Medium  
Legacy: `ProductDetail.max_order_qty`, `min_order_quantity`, `catalog_max_order_type_name`; enforced client-side in bulk/solo modals; cart row stores `max_order_qty`/`min_order_qty`  
Modern: `CatalogProductApiModel` likely carries these fields — enforcement not confirmed  
Status: Partial  

---

**POPSHOP-FU-017** — Price Display (Amount vs Points)  
Category: BusinessLogic | Risk: Medium  
Legacy: `_programConfig.PopShop.ItemAddedCostBy` → "amount" formats as currency (`GetCurrencyFormat`); otherwise displays as "X Points"; applied in `CalculateCartPrice`, `CheckQuantity`, `HydrateQuantityAndPricingFromSearchRow`  
Modern: `CatalogProductApiModel.amount` — display logic not confirmed  
Status: Partial  

---

**POPSHOP-FU-018** — Discount Tier Pricing  
Category: BusinessLogic | Risk: High  
Legacy: `OnPostGetCatalogProductOfferTiersAsync` → `GetCatalogProductOfferTiersByCatalogProductAsync`; tier panel shows in bulk and solo modals; `getAmountOffText`, `getSoloCurrencySymbol`, `getSoloDiscountedUnitPriceValue` in JS  
Modern: Not confirmed — `CatalogProductOffer` entity not found in modern  
Status: Missing in Modern  

---

**POPSHOP-FU-019** — Dealer Role-Based Product Visibility  
Category: BusinessLogic | Risk: Critical  
Legacy: `GetCatalogProductSearch` — BMADMIN passes `Status` as-is; BMDLR forced to `Status = "Y"` (approved only); `FilterProductDataSet` additionally filters `publish_status = 'Approved'`, `deleted_flag = 'N'`, and dealer_number restriction for BMDLR  
Modern: Logic not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-020** — Product Publish Status Gate (Submitted / Denied / Approved)  
Category: BusinessLogic | Risk: High  
Legacy: `HydrateQuantityAndPricingFromSearchRow` and `CheckQuantity` — `Submitted` → `enableAddToCartAndQuantity = false`, text = `_ItemNotApprovedYet`; `Denied` → `_ItemStatusIsDenied`; both prevent add-to-cart  
Modern: Not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-021** — Cart Total Calculation (Amount or Points)  
Category: BusinessLogic | Risk: Medium  
Legacy: `OnGetAmountDetail()` and `BindCartAmountSection()` — sums `qty_cost` from `CatalogProduct` DataSet; formats per `ItemAddedCostBy`; label from resx (`_CartTotalAmount` / `_CartTotalPoints`)  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-022** — Favorites / Wishlist Toggle  
Category: BusinessLogic | Risk: Low  
Legacy: `OnGetProductWishlist` → `AssetBIZ.UpdateAssetFavourite`; `GetFavouriteProductSeqSet()` preloads favorites; heart icon toggled client-side; `GetWishList()` used to show favorite products first in listing  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-023** — Re-Order from Previous Order  
Category: BusinessLogic | Risk: Medium  
Legacy: `GetOrderDetail()` triggered by `?OrderNumber=...` query param; clears existing cart, loads previous order items (validated per dealer rules), saves to cart, redirects to `/PopShop/Shipping`  
Modern: Not found  
Status: Missing in Modern  

---

## Workflow

---

**POPSHOP-FU-024** — Add Single Item to Cart  
Category: Workflow | Risk: High  
Legacy: `OnPostAddToCart` — dealer role validates via `ValidateCartOrderProducts`; deletes existing row for same product, adds new row with all cart schema fields; persists via `UpdateCartItem` (XML); returns "1" on success  
Modern: `CartProductValidationApiModel` suggests API-based validation — cart update mechanism not found  
Status: Partial  

---

**POPSHOP-FU-025** — Add All (Multiple) Items to Cart  
Category: Workflow | Risk: Medium  
Legacy: `#AddAllToCart` button → `OnPostAddToCart` with list of `CartItemsDetail`; same handler as single-add, iterates multiple items  
Modern: Not confirmed  
Status: Missing in Modern  

---

**POPSHOP-FU-026** — Remove Item from Cart (with Confirmation)  
Category: Workflow | Risk: Medium  
Legacy: `OnGetDeleteFromCart` — decrypts `catalog_product_seq`, removes row from DataSet, persists via `UpdateCartItem`; JS shows `#dvREModal` confirmation before calling  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-027** — Proceed to Checkout  
Category: Workflow | Risk: High  
Legacy: `OnPostAddToCartAndProceed` (view handler) — adds items to cart then redirects to `/PopShop/Shipping`; checkout link in cart flyout always goes to `/PopShop/Shipping`  
Modern: `Shipping.cshtml` exists (new page) — handler not found  
Status: Partial  

---

**POPSHOP-FU-028** — Cart Session Continuity  
Category: Workflow | Risk: Medium  
Legacy: `OnGet()` calls `RetrieveCartInfo()` on every page load; if `UserCartId == Guid.Empty`, a new cart is built via `UserCart.BuildUserCart`; cart always restored from DB  
Modern: Not confirmed  
Status: Missing in Modern  

---

## Data Persistence

---

**POPSHOP-FU-029** — Cart Retrieval from Database  
Category: DataPersistence | Risk: High  
Legacy: `RetrieveCartInfo()` → `ICatalogService.RetrievePopShopCartInfo(UserSession.CrcUserSeq, "Y")`; reads `crc_user_product_cart_id`, `dealer_type_seq`, `cart_schema` (XML schema), `cart_data` (XML data) — reconstitutes DataSet  
Modern: Not found  
Status: Missing in Modern  

---

**POPSHOP-FU-030** — Cart Persistence to Database (XML Schema)  
Category: DataPersistence | Risk: High  
Legacy: `ICatalogService.UpdateCartItem(cartId, userSeq, dealerTypeSeq, xml, xmlSchema, "Y")` — cart serialized as XML with schema; called on every add/remove  
Modern: Not found — `CartProductValidationApiModel` suggests API-based but persistence mechanism unknown  
Status: Missing in Modern  

---

**POPSHOP-FU-031** — Session Cache for Category Tree  
Category: DataPersistence | Risk: Low  
Legacy: `BindCategories()` checks `WebHelper.GetSessionvalue("SUBMenusLeft")`; if cached, uses it; otherwise calls `GetCategoriesHtml()` and can optionally cache (`_webHelper.SetSessionValue` commented out); `unload=y` clears session  
Modern: Not found  
Status: Missing in Modern  

---

## Security

---

**POPSHOP-FU-032** — Authentication Gate  
Category: Security | Risk: Critical  
Legacy: `NewOrderModel` inherits `PaginationModel` which enforces auth; unauthenticated requests redirect to login  
Modern: Not explicitly confirmed  
Status: Partial  

---

**POPSHOP-FU-033** — Encrypted Parameter Passing  
Category: Security | Risk: Critical  
Legacy: `IEncryptDecrypt._encryptDecrypt` used throughout — `catalog_product_seq`, `category`, `fromPrice`, `toPrice`, `status`, `SearchFilter` all encrypted on client, decrypted server-side; prevents parameter tampering  
Modern: Not confirmed — `CartProductValidationApiModel` structure doesn't show encrypted params  
Status: Missing in Modern  

---

**POPSHOP-FU-034** — Dealer Data Scoping  
Category: Security | Risk: High  
Legacy: `GetCatalogProductSearch` called with `UserSession.dealer_number_seq` and `UserSession.Role`; BMDLR sees only approved, non-admin-approval items matching their dealer number; `ValidateCartOrderProducts` also scoped by dealer  
Modern: `CatalogProductSearchApiModel` — scoping fields not confirmed  
Status: Partial  

---

## Quality Gate

- [x] Every page handler has ≥ 1 FU  
- [x] Every business rule has ≥ 1 FU  
- [x] Every security requirement has ≥ 1 FU  
- [x] Cart lifecycle fully covered (retrieve → add → remove → persist → checkout)  
- [x] Migration mapping covers every FU (see `mapping.md`)  
- [x] Total FU count documented with breakdown by category and risk  
