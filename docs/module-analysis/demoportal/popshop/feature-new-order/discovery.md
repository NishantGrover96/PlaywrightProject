# PopShop New Order - Discovery Report

**Module:** popshop  
**Feature:** new-order  
**URL:** `/PopShop/NewOrder`  
**Date:** 2026-06-17  

---

## Path Note

The feature files live directly in `Pages\PopShop\`, NOT in a `Pages\PopShop\NewOrder\` subfolder.  
Primary files: `NewOrder.cshtml` + `NewOrder.cshtml.cs`

---

## Legacy Source Files

| File | Purpose |
|---|---|
| `Pages\PopShop\NewOrder.cshtml` | Product catalog browse UI - search bar, cart flyout, bulk/solo product modals, category tree, product listing with sort + pagination |
| `Pages\PopShop\NewOrder.cshtml.cs` | Page model: 2 831 lines, 10+ handlers - page init, product search, cart management, favorites, family products, offer tiers, image gallery, re-order |
| `wwwroot\WebScripts\Popshop\NewOrder.js` | Client-side: search, filters, cart AJAX, category navigation, delete confirmation, product favoriting |
| `wwwroot\WebScripts\Popshop\NewOrderBulk.js` | Bulk-order modal logic - tier pricing, attribute filtering, preview carousel, qty controls |
| `wwwroot\WebScripts\Popshop\PopBox.js` | Product detail pop-up (image zoom, solo parent modal) |
| `RAL\Resources\PopShop\ViewResource.en-US.resx` | 800+ localized strings - UI labels, error messages, status text |
| `Libraries\CommonEntity\PopShop\ProductDetail.cs` | Product DTO - catalog_product_seq, name, code, inventory, price, family/solo flags, BackOrder |
| `Libraries\CommonEntity\PopShop\CartItemsDetail.cs` | Cart row DTO - seq, name, qty, amount, SKU, flags, ad/logo seqs |
| `Libraries\CommonEntity\PopShop\UserCart.cs` | Cart aggregate - UserCartId (GUID), DealerTypeSeq, ProductCart (DataSet XML) |
| `Libraries\CommonEntity\PopShop\CatalogProductOffer.cs` | Discount tier offer entity |
| `Libraries\CommonEntity\PopShop\ProductAttributeLookup.cs` | Attribute lookup entity (family filtering) |

---

## Modern Source Files

| File | Purpose |
|---|---|
| `Pages\PopShop\Product.cshtml.cs` | Stub - empty `OnGet()`. Product logic moved to client-side JS / API calls |
| `Pages\PopShop\SearchItem.cshtml` | View-only (no .cs) - product search entry point |
| `Pages\PopShop\PurchaseOrder.cshtml` | View-only (no .cs) - purchase order review/submission |
| `Pages\PopShop\Shipping.cshtml` | **NEW** - replaces `ShippingDetails.cshtml`; view-only |
| `Libraries\CommonEntity\PopShop\CatalogProductApiModel.cs` | API response model for product catalog |
| `Libraries\CommonEntity\PopShop\CatalogProductSearchApiModel.cs` | API request/response model for product search |
| `Libraries\CommonEntity\PopShop\CartProductValidationApiModel.cs` | Cart validation API model |
| `Libraries\CommonEntity\PopShop\CatalogProductInventoryByCostApiModel.cs` | Inventory-by-cost API model |
| `Libraries\CommonEntity\PopShop\CatalogProductModels.cs` | Aggregated modern product models |
| `CommonEntity\PopShop\CatalogProductSaasApiModels.cs` | SaaS API integration models |

---

## UI Components (Legacy)

### Page Banner
- Cart counter badge (live, from `CartItemCount`)
- Cart total display (`CartAmountSection` - amount or points depending on `ItemAddedCostBy` config)
- Favorites toggle button (`#btnFavorite` / `#btnAll`)
- Cart flyout (mini list of items with image, name, qty; checkout link -> `/PopShop/Shipping`)

### Top Search Bar
- Search type dropdown (`#ddRegion` -> bound to `SearchType`, values from `GetPopShopNewOrderSearchTypeList()`)
- Keyword text input (`SearchValue`)
- Search button

### Top Action Bar
- "Add All to Cart" button (`asp-page-handler="AddToCart"`) - hidden by default
- "Proceed to Checkout" button (`asp-page-handler="AddToCartAndProceed"`)

### Left Panel
- Category tree (partial `_NewOrderSearchPanel` - rendered via `GetCategoriesHtml()`, 3-level hierarchy from `getCatalogProductTypebyDivisionSeq`)
- "What's New" link at top of tree

### Product Listing Area
- Sort-by dropdown (`SortOrder` -> `GetPopShopNewOrderSortByList()`)
- Grid view / List view toggle
- Per-page size navigator (`paging-navigation` tag helper)
- Pagination (bottom)
- Per-product card: image, name, availability badge, price/points, favorite icon, quantity input, "Add to Cart"

### Modals
- **Remove-from-cart confirmation** (`#dvREModal`) - "Are you sure...?" with Yes/No
- **Image zoom viewer** (`#ImageViewModal`) - full-size image display
- **Bulk order modal** (`#bulkOrderModal`):
  - Left pane: tier pricing panel, attribute filter panel, family item rows
  - Right pane: preview carousel (7-image max), item meta (Unit Price, Min/Max Qty, SKU), qty stepper, description, unit total + selection total
  - Footer: Cancel / Add to Cart
- **Solo parent product modal** (`#soloParentModal`):
  - Discount tier display, attribute selector
  - Main carousel with zoom, side thumbnail strip
  - Price, Min/Max Qty, SKU, qty stepper, stock status, description
  - Item total, discount note, Cancel / Add to Cart

---

## API Endpoints / AJAX Calls (Legacy - handled as Razor Page handlers)

| Handler | HTTP | URL Pattern | Purpose |
|---|---|---|---|
| `OnGet` | GET | `/PopShop/NewOrder` | Page init, cart load, bind lists |
| `OnGetProductList` | GET | `?handler=ProductList` | Filtered product search (category, price, status, keyword, favorites) |
| `OnGetProductAttributeLookupsAsync` | GET | `?handler=ProductAttributeLookups` | Attribute lookup values for module PPSP |
| `OnGetCatalogProductAttributeLevelOffersAsync` | GET | `?handler=CatalogProductAttributeLevelOffers` | Attribute-level offer data per product |
| `OnGetFamilyProducts` | GET | `?handler=FamilyProducts` | Child/variant products for a family parent |
| `OnGetProductImages` | GET | `?handler=ProductImages` | Image gallery for a product (max 7) |
| `OnPostGetCatalogProductOfferTiersAsync` | POST | `?handler=GetCatalogProductOfferTiers` | Discount tier data for bulk ordering |
| `OnGetAmountDetail` | GET | `?handler=AmountDetail` | Current cart total (amount or points) |
| `OnGetCartDetail` | GET | `?handler=CartDetail` | Current cart items list |
| `OnPostAddToCart` | POST | `?handler=AddToCart` | Add/update items in cart; dealer validates via `ValidateCartOrderProducts` |
| `OnGetDeleteFromCart` | GET | `?handler=DeleteFromCart` | Remove item from cart by encrypted seq |
| `OnGetProductWishlist` | GET | `?handler=ProductWishlist` | Toggle product favorite (via AssetBIZ) |
| `OnPostAddToCartAndProceed` | POST | `?handler=AddToCartAndProceed` | Add items then redirect to `/PopShop/Shipping` |
| `GetOrderDetail()` | GET | `?OrderNumber=...` | Re-order: load previous order into cart, redirect to Shipping |

---

## Services

| Service (Legacy) | Methods Used | Modern Equivalent |
|---|---|---|
| `ICatalogService` | `RetrievePopShopCartInfo`, `UpdateCartItem`, `ClearCart`, `ValidateCartOrderProducts`, `GetCatalogProductSearch`, `getCatalogProductInventoryByCost`, `getAllCatalogProduct`, `getCatalogProductTypebyDivisionSeq` | `CatalogProductApiModel` / SaaS API calls |
| `ICatalogProductOfferService` | `GetProductAttributeLookupsByModuleAsync`, `GetCatalogProductAttributeLevelOffersByCatalogProductAsync`, `GetCatalogProductOfferTiersByCatalogProductAsync`, `GetCatalogProductOfferBySeqAsync` | Modern API equivalent (TBD) |
| `IDocumentService` | `GetDocumentImages` | Modern API equivalent (TBD) |
| `IOrganizationService` | `getCorporateByCorporateSeq` | Modern API equivalent (TBD) |
| `IReportingService` | `getCatalogOrderDetail` | Modern API equivalent (TBD) |
| `INotificationService` | `ErrorNotification` | Modern notification service (TBD) |
| `AssetBIZ` (Adbuilder) | `GetAssetFavourite`, `UpdateAssetFavourite` | Modern favorites API (TBD) |
| `WebHelper` | `GetPopShopNewOrderStatusList`, `GetPopShopNewOrderSearchTypeList`, `GetPopShopNewOrderSortByList`, `GetActiveDivision`, `GetCurrencyFormat`, session ops | Modern helper/config (TBD) |

---

## Data Models

| Entity | Legacy | Modern |
|---|---|---|
| Product | `ProductDetail.cs` | `CatalogProductApiModel.cs` / `CatalogProductModels.cs` |
| Cart Row | `CartItemsDetail.cs` | `CartProductValidationApiModel.cs` (partial) |
| Cart Aggregate | `UserCart.cs` (DataSet XML schema) | No direct equivalent found - likely API-managed |
| Inventory | DataSet from `getCatalogProductInventoryByCost` | `CatalogProductInventoryByCostApiModel.cs` |
| Category | DataSet from `getCatalogProductTypebyDivisionSeq` | `CategoryManagement.cs` / `CategoryManagementModels.cs` |
| Offer Tier | `CatalogProductOffer.cs` | TBD |
| Attribute Lookup | `ProductAttributeLookup.cs` | TBD |

---

## Known Gaps (Preliminary)

1. **NewOrder.cshtml absent in modern** - the product catalog browse page is structurally missing. The modern `Product.cshtml.cs` is a stub; logic is presumably delegated to API calls + JS but the page model is not visible.
2. **Cart persistence model changed** - Legacy uses XML DataSet serialized to DB (`UpdateCartItem` with XML schema). Modern has `CartProductValidationApiModel` but no cart aggregate or XML pattern found yet.
3. **SaaS API models** - `CatalogProductSaasApiModels.cs` in modern suggests external SaaS catalog integration not present in legacy.
4. **`AddToCartAndProceed` handler not confirmed in modern** - no equivalent found.
5. **AssetBIZ wishlist** - not found in modern; favorites mechanism unclear.
6. **Category tree** - Legacy builds tree server-side from DataSet. Modern equivalent not located.
7. **Shipping page rename** - Legacy has `ShippingDetails.cshtml`; modern has both `ShippingDetails.cshtml` and new `Shipping.cshtml`.
