# Rebate Create Offers - Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-CO-01 | Authenticated access required | Security | `BasePageModel` session auth | Redirect to `/Account/Login` | Critical |
| BR-CO-02 | Admin / RebateAdmin role required | Security | `IsAuthorize()` role switch | Dealer role cannot access `/Rebate/CreateOffers` | Critical |
| BR-CO-03 | Offer Code is required | Validation | `id="spnProdCode"` client check | "Offer Code required" shown on save attempt with empty code | High |
| BR-CO-04 | Offer Code max 50 characters | Validation | `maxlength="50"` on input | Input truncated at 50 chars | High |
| BR-CO-05 | Language selection required | Validation | `id="spnProductSelectLanguage"` client check | Language error shown on save with no language | High |
| BR-CO-06 | Offer Name required | Validation | `id="spnItem"` client check | "Enter Item" error shown | High |
| BR-CO-07 | Offer Name max 200 characters | Validation | `maxlength="200"` | Input truncated at 200 chars | Medium |
| BR-CO-08 | Product Description max 200 characters | Validation | `maxlength="200"` on textarea | Textarea truncated at 200 chars | Medium |
| BR-CO-09 | Duplicate offer code detection | Business Logic | `UpsertProductAsync` returns `-2` on duplicate | `TempData["Duplicate"] = "Yes"` triggers client error message | Critical |
| BR-CO-10 | Multi-language variant support | Business Logic | `OnPostSaveProductLang` iterates `RebateProductLanguageModel` list | Multiple language variants saved per offer; each independently editable | High |
| BR-CO-11 | First variant creates product; subsequent add languages | Business Logic | `i == 0 && RebateProductSeq == 0` -> `UpsertProductAsync` first | Second+ language records reuse `_rebateProdSeq` | High |
| BR-CO-12 | Sub-division scoping on save | Business Logic | `_rebate_product.SubDivisionSeq = HttpContext.Session.GetInt32("sub_division_seq")` | Offer associated to active sub-division | High |
| BR-CO-13 | Product type defaults to "Offer" | Business Logic | `_rebateProductLanguage.ProductType = "Offer"` in `OnGetAsync` | ProductType field hidden; defaults set server-side | Medium |
| BR-CO-14 | Image path normalization ("output" -> empty) | Business Logic | `if (result.ImagePath == "output") result.ImagePath = ""` | Legacy "output" placeholder treated as no image | Medium |
| BR-CO-15 | Brands dropdown conditional (shown only if >1 brand) | UI | `if (Model.BrandList.Count() > 1)` in cshtml | Brand dropdown hidden for single-brand programs | Medium |
| BR-CO-16 | Encrypted product seq in URLs | Security | `_encryptDecrypt.Encrypt` on all ID params | Product seq never exposed as plain integer in URL/attributes | High |
| BR-CO-17 | Image upload via Dropzone (optional) | UI | `Dropzone` on `#UploadBanner1` | Image optional; form submits without image | Low |
| BR-CO-18 | Edit mode loads existing language variant | Business Logic | `GetProductLanguageAsync(productSeq, languageSeq)` called on edit | All fields pre-populated when editing existing offer variant | High |
