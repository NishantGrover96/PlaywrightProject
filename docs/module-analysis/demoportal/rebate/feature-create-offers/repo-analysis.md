# Rebate Create Offers - Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/CreateOffers.cshtml` | UI | Create / edit rebate offer form |
| `Presentation/Web/Pages/Rebate/CreateOffers.cshtml.cs` | Handler | GET (load form data), POST (save offer + language variants) |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | Product upsert, product language, brands |
| `Presentation/Web/Models/RebateModel/RebateManageApiModels.cs` | DTOs | `RebateProductDetailApiModel`, `RebateProductLanguageDetailApiModel`, `RebateMasterProductApiModel` |
| `Libraries/CommonEntity/Rebate/Rebate_Campaign_Modal.cs` | Entity | Campaign and product relationship |

---

## UI / Form Fields
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| LanguageSeq (`zrebateProductLanguage_language_seq`) | select | Yes | Language | Hidden when `rebate_product_seq > 0` (lang variants mode) | Populated from `LanguageList` |
| ProductCode (`zrebateProductLanguage_product_code`) | text | Yes | Offer Code | - | `maxlength=50` |
| ddproduct | select | No | Offers | `hideimp` (existing offers list) | Load existing product for language variant |
| Description (`zrebateProductLanguage_description`) | text | Yes | Offer Name | `hide` (shown via JS) | `maxlength=200` |
| Description2 (`zrebateProductLanguage_description2`) | textarea | Yes | Product Description | `hide` (shown via JS) | `maxlength=200` |
| DivisionBrandSeq (`zrebateProductLanguage_division_brand_seq`) | select | No | Brands | Shown only when `BrandList.Count > 1` | Defaults hidden if single brand |
| ProductType (`zrebateProductLanguage_product_type`) | select | No | Offer Type | `hidden="hidden"` | Default value: `"Offer"` |
| ImagePath (Bannerfile1) | file (Dropzone) | No | Upload Offer Image | - | Stored path returned in `result.ImagePath` |
| hdnRebateProductSeq | hidden | - | - | - | `rebate_product_seq` for edit mode |
| hdnSubDivisionSeq | hidden | - | - | - | `subdivisionDel` |
| rebate_prod_seq / rebate_prod_lang_seq | hidden | - | - | - | Tracks product / language seq |
| division_brand_seq | hidden | - | - | - | Brand assignment |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGetAsync` | Authenticated | Load product type list, languages, brands, sub-divisions |
| GET | `?handler=RebateProductLanguage&rebate_product_seq=&language_seq=` | Authenticated | Load existing offer language variant for edit |
| POST | `?handler=SaveProductLang` | Authenticated | Save/update offer with one or more language variants |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-CO01 | Duplicate offer code detection | `OnPostSaveProductLangAsync` | `UpsertProductAsync` returns `-2` on duplicate; response flags `TempData["Duplicate"] = "Yes"` |
| BR-CO02 | Multi-language support | `OnPostSaveProductLangAsync` | Iterates `RebateProductLanguageModel` list; first record creates product, subsequent records add language variants |
| BR-CO03 | Image path normalization | `OnGetRebateProductLanguageAsync` | `result.ImagePath == "output"` is treated as empty; paths resolved via `GetRelativeFilePathWithDomain` |
| BR-CO04 | Sub-division scoping | `OnGetAsync` | `sub_division_seq` stored in session; `UpsertProduct` includes `SubDivisionSeq` |
| BR-CO05 | Product type default | `OnGetAsync` | `_rebateProductLanguage.ProductType = "Offer"` set on GET |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| LanguageSeq | Required | `_PleaseSelectLanguage` | Client (JS, id `spnProductSelectLanguage`) |
| ProductCode | Required | `_OfferCode` (id `spnProdCode`) | Client |
| ProductCode | MaxLength 50 | (truncated at input) | Client |
| Description (Offer Name) | Required | `_EnterItem` (id `spnItem`) | Client |
| Description | MaxLength 200 | (truncated at input) | Client |
| Description2 | MaxLength 200 | `_PleaeEnterDescription` | Client |
| ProductType | Required | "Please select Offer Type" (id `spnProdType`) | Client |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| - | Created | Save button -> `OnPostSaveProductLang` | `TempData["Message"]` success |
| - | Duplicate | Save (duplicate code) | `TempData["Duplicate"] = "Yes"` -> UI message |
| Existing | Updated | Save with `rebate_product_seq > 0` | Language variant updated |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetMasterProductsAsync` | GET (ddproduct dropdown) | programSeq, isRebate, divisionSeq |
| SELECT | `GetProductLanguageAsync` | GET edit mode | rebateProductSeq, languageSeq |
| SELECT | `GetSubDivisionsListAsync` | GET | divisionSeq |
| UPSERT | `UpsertProductAsync` | POST save (first language variant) | SubDivisionSeq, ProductCode, Description, Description2, ImagePath, RebateProductSeq |
| UPSERT | `UpsertProductLanguageAsync` | POST save (all language variants) | RebateProductSeq, LanguageSeq, SubDivisionSeq, IsRebate |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session | Authenticated users only |
| Encrypted product seq | `_encryptDecrypt.Encrypt` / `.Decrypt` | IDs never exposed as plain integers in URLs |
| Admin roles | `IsAuthorize()` base model | Admin, RebateAdmin, ChannelFusionAdmin |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateProductDetailApiModel` | `RebateProductSeq, SubDivisionSeq, ProductCode, Description, Description2, ProductType, ImagePath, DivisionBrandSeq, IsRebate` | Product master record |
| `RebateProductLanguageDetailApiModel` | `RebateProductSeq, RebateProductLanguageSeq, LanguageSeq, ProductCode, Description, Description2, ImagePath, DivisionBrandSeq` | Language-specific offer variant |
| `RebateMasterProductApiModel` | `RebateProductSeq, ProductCode, Description` | Existing offers dropdown |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Show/hide language dropdown | `rebate_product_seq` check | `#dvLanguage` hidden when editing existing product's language |
| Show/hide ddproduct | `rebate_product_seq == 0` | `#dvLangProducts` visible only for new variant on existing product |
| Show Description / Description2 fields | JS on product type select | `#dvItem`, `#dvDescription` toggled via `hide` class |
| Image upload (Dropzone) | File drop / click | Uploads to server; sets `#Bannerfile1` hidden input value |
| Preview uploaded image | Upload success | Sets `#imglogos1` `src` attribute |
| Duplicate code alert | POST response `RebateProductSeq == -2` | Displays inline error via `dvmessage1` |

---

## Quality Gate Summary
- **UI fields documented**: 11 (including hidden)
- **Business rules extracted**: 5
- **Validation rules documented**: 7
- **Handlers documented**: 3
- **DB operations documented**: 5
- **Security rules documented**: 3
