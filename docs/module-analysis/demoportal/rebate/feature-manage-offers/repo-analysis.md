# Rebate Manage Offers - Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/ManageOffers.cshtml` | UI | Paginated card grid of rebate offers with edit/delete actions |
| `Presentation/Web/Pages/Rebate/ManageOffers.cshtml.cs` | Handler | GET (load offers list), AJAX product list, delete handler |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | `GetSaasProductsAsync`, `DeleteProductAsync` |
| `Presentation/Web/wwwroot/WebScripts/Rebate/ManageOffer.js` | Client | AJAX refresh, delete confirmation modal |

---

## UI / Form Fields
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| btnCreateNewOffer | button | - | Create Offer | - | Navigates to `CreateOffers` page |
| Page size nav | paging component | - | - | - | `S=12` default; `TotalRecords` from API |

---

## Table / Card Layout
| Column | Source Field | Notes |
|---|---|---|
| Offer image | `item.ImagePath` resolved via `GetRelativeFilePathWithDomain` | Falls back to `_NoPreview` image if file missing |
| Offer code + name | `item.ProductCode` + `item.Description` | Displayed as `ProductCode - Description` |
| Edit button (clsEditLang) | `data-rebate_product_seq` (encrypted) | Shown when `LanguageList.Count > 0` |
| Delete button (clsDelete) | `data-rebate_product_seq` + `data-sub_division_seq` (both encrypted) | Shown when `LanguageList.Count > 0` |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGetAsync` | Authenticated | Load paginated offers list |
| GET | `?handler=ProductList&P=&S=` | Authenticated | AJAX pagination refresh |
| POST | `?handler=DeleteProduct` | Authenticated | Delete offer by encrypted product seq |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-MO01 | Rebate-only offers | `OnGetAsync` | `isRebate = true` filters only rebate products (not general SAAS products) |
| BR-MO02 | Locale-driven filtering | `OnGetAsync` | `localeSeq` from session `locale_seq`; if `NotDrivenByCountryDropdown` flag set, `localeSeq = 0` |
| BR-MO03 | Sub-division scoping | `GetSubDivisionsListAsync` | First sub-division from list used as default; stored in session `sub_division_seq` |
| BR-MO04 | Missing image fallback | `ManageOffers.cshtml` | `File.Exists` check on physical path; shows `_NoPreview` image when missing |
| BR-MO05 | Pagination | `PaginationModel` base | Page-size nav shows `S` (default 12), `P` page number |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| Delete confirmation | Modal confirm before submit | `_SureToDeleteThisOffer` | Client modal |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| Existing | Deleted | Delete confirm -> POST handler | Success/error via `_notificationService` |
| - | Created | `btnCreateNewOffer` click | Navigates to `CreateOffers` |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetSaasProductsAsync` | GET & AJAX | programSeq, isRebate, subDivisionSeq, pageNo, pageSize, languageSeq |
| SELECT | `GetSubDivisionsListAsync` | GET | divisionSeq |
| SELECT | `GetLanguagesByDivisionAsync` | GET | divisionSeq |
| DELETE | `DeleteProductAsync` | POST (delete) | rebateProductSeq, language |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session | Authenticated users only |
| Encrypted IDs | `_encrpt.Encrypt(item.RebateProductSeq)`, `Encrypt(item.SubDivisionSeq)` | IDs encrypted in all data attributes |
| Admin roles | `IsAuthorize()` base model | Admin, RebateAdmin |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateSaasProductApiModel` | `RebateProductSeq, SubDivisionSeq, ProductCode, Description, ImagePath, TotalCount` | Paginated offer card data |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Open delete confirmation modal | `.clsDelete` click | Shows `#CampaginDeleteModal` with `rebate_product_seq` and `sub_division_seq` |
| Confirm delete | `#btndelete` click | AJAX POST `?handler=DeleteProduct` with encrypted seq |
| Edit redirect | `.clsEditLang` click | AJAX GET `?handler=RebateProductLanguage` to load languages for multi-lang edit |
| Pagination | Page size change / nav click | AJAX GET `?handler=ProductList` refreshes card grid |

---

## Quality Gate Summary
- **UI fields documented**: 2 controls, card grid fully mapped
- **Business rules extracted**: 5
- **Validation rules documented**: 1
- **Handlers documented**: 3
- **DB operations documented**: 4
- **Security rules documented**: 3
