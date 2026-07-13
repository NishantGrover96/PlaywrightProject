# Rebate Manage Offers - Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-MO-01 | Authenticated access required | Security | `BasePageModel` session auth | Redirect to `/Account/Login` | Critical |
| BR-MO-02 | Admin / RebateAdmin role required | Security | `IsAuthorize()` role switch | Dealer role cannot access `/Rebate/ManageOffers` | Critical |
| BR-MO-03 | Only rebate products shown (`isRebate=true`) | Business Logic | `GetSaasProductsAsync(isRebate: true)` | Non-rebate SAAS products excluded from list | High |
| BR-MO-04 | Locale-driven filtering | Business Logic | `localeSeq` from session; `NotDrivenByCountryDropdown` flag -> `localeSeq=0` | Locale flag controls whether locale filters offers | High |
| BR-MO-05 | Sub-division scoping (first sub-div default) | Business Logic | `GetSubDivisionsListAsync` -> first sub-division stored in session | Offers shown only for active sub-division | High |
| BR-MO-06 | Pagination: default 12 per page | Business Logic | `S = 12` in `OnGetAsync` | Initial load shows max 12 offer cards | Medium |
| BR-MO-07 | Missing image shows fallback (`_NoPreview`) | UI | `System.IO.File.Exists` check + `_NoPreview` image | Broken image path -> placeholder image rendered | Medium |
| BR-MO-08 | Edit button opens language variant picker | UI | `.clsEditLang` -> AJAX GET `GetProductLanguage` | Edit navigates to CreateOffers with language context | High |
| BR-MO-09 | Delete requires confirmation modal | UI/Workflow | `#CampaginDeleteModal` shown before delete | No delete occurs without confirmation | High |
| BR-MO-10 | Delete uses encrypted product + sub-division seq | Security | `data-rebate_product_seq` + `data-sub_division_seq` both encrypted | Plain IDs not in DOM data attributes | High |
| BR-MO-11 | Empty list shows no cards (graceful empty state) | UI | `@if (Model.lstrebate_product?.Any() ?? false)` | Empty grid when no offers exist; no errors | Medium |
| BR-MO-12 | TotalRecords drives pagination | Business Logic | `TotalRecords = lstrebate_product[0].TotalCount` | Pagination shows correct total across all pages | Medium |
| BR-MO-13 | Page-size navigation updates card count | UI | Page-size nav component `show-page-size-nav="true"` | Changing page size reloads with new count | Low |
