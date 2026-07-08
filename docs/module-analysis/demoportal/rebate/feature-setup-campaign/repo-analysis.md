# Rebate Setup Campaign (Create Rebate) — Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/CreateRebate.cshtml` | UI | Multi-step wizard container (3 sections) |
| `Presentation/Web/Pages/Rebate/CreateRebate.cshtml.cs` | Handler | GET (load/edit campaign), POST (save, publish, delete) |
| `Presentation/Web/Pages/Rebate/_RebateSetUp.cshtml` | UI Partial | Step 1 — Campaign config: group, type, offers, dates, amounts |
| `Presentation/Web/Pages/Rebate/_AddPaymentRule.cshtml` | UI Partial | Step 2 — Payment rule: By Product or By Series |
| `Presentation/Web/Pages/Rebate/_RebateWebsiteLanguage.cshtml` | UI Partial | Step 3 — Language-specific content |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | SaveCampaignAsync, GetCampaignAsync, GetGroupCampaignsAsync, etc. |
| `Libraries/CommonEntity/Rebate/Rebate_Campaign_Modal.cs` | Entity | Full campaign model |

---

## UI / Form Fields — Step 1 (_RebateSetUp)
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| rebate_group_campaign_seq | select | Yes | Campaign Selection | — | Must select group; no groups = redirect to `/Admin/CMS/Campaign/list` |
| rebate_type_seq (Type) | select | Yes (if >1 type) | Type | Hidden when only 1 type (auto-selected) | Populated from `RebateTypeList` |
| ddproduct (Products) | multi-select | Yes | Rebate Offer | — | SmartSearch multi-select; links offers to campaign |
| rebate_code | text | No | Rebate Code | `#DivRebateCode` | `maxlength=200` |
| start_date | date picker | Yes | Start Date | — | `MM/DD/YYYY` format, hidden input `txtStartDate` |
| end_date | date picker | Yes | End Date | — | Must be after start date |
| cut_off_date | date picker | No | Cut Off Date | Conditional per config | Submission deadline |
| Currency | select | Yes | Currency | Disabled on Edit | Locked after creation |
| amount | number | Depends on type | Amount | Conditional | Currency-masked via `jquery.maskMoney` / `autonumeric` |
| duplicate_address_count | number | No | Duplicate Address Count | — | Range 0 to MaxInt |
| documentation_flag | checkbox | No | Require Documentation | — | |
| is_varying_payout | checkbox | No | Varying Payout | — | |
| is_GasCard_Rebate | checkbox | No | Gas Card Rebate | — | |
| enable_sms | checkbox | No | Enable SMS | — | |
| publish_status (hdnPublish) | hidden | — | — | — | Current publish state |
| isEdit (hdnEdit) | hidden | — | — | — | `"edit"` when editing |

---

## UI / Form Fields — Step 2 (_AddPaymentRule)
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| rebate (radio) | radio | Yes | By Product / By Series | — | Drives which payment table is shown |
| Amount (per product) | currency input | Yes | Amount | By Product mode | Amount per linked offer |
| Series grid | table | Yes | By Series | By Series mode | Upload-driven series quantity/amount |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGetAsync` | Authenticated | Load create or edit form; redirect if no group campaigns |
| GET | `?handler=GetCampaign&RebateCampaignSeq=` | Authenticated | Load existing campaign data for edit |
| POST | `?handler=SaveCampaign` | Authenticated | Create or update campaign |
| POST | `?handler=SavePaymentRule` | Authenticated | Save payment rule detail |
| POST | `?handler=DeleteCampaign&campaignSeq=` | Authenticated | Delete campaign |
| POST | `?handler=PublishCampaign&campaignSeq=` | Authenticated | Publish campaign (sets `publish_status = "Published"`) |
| GET | `?handler=ValidateRebateCode&code=&excludeSeq=` | Authenticated | Check if rebate code is already taken |
| GET | `?handler=GetSeriesDetail&ruleSeq=&amount=&productId=&campaignSeq=` | Authenticated | Load series for By Series payment rule |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-SC01 | Group campaign required | `OnGetAsync` | Redirects to `/Admin/CMS/Campaign/list` if `Rebate_Group_Campaign.Count == 0` |
| BR-SC02 | Currency locked on edit | `CreateRebate.cshtml` JS | `Currency` select disabled when `RebateCampaignSeq` present in query string |
| BR-SC03 | Rebate code uniqueness | `IsRebateCodeTakenAsync` | API checks code against division; excludes current campaign seq on edit |
| BR-SC04 | By Series vs By Product | `_AddPaymentRule.cshtml` | Radio selection drives payment rule type; `_PaymentRuleModal.BySeries.Count > 0` pre-selects By Series |
| BR-SC05 | Publish gate | Publish modal | User must confirm before publish; campaign name and start date shown in confirmation modal |
| BR-SC06 | EnsureGroupCampaignOption | `CreateRebateModel.EnsureGroupCampaignOptionAsync` | On edit, if linked group campaign is expired/inactive, it is added to dropdown to avoid broken reference |
| BR-SC07 | Duplicate address count | `RebateCampaignModal` | `[Range(0, int.MaxValue)]` — must be non-negative integer |
| BR-SC08 | Series upload | `OnPostSavePaymentRule` | Excel file parsed via `ExcelDataReader`; series deserialized into `_PaymentRuleModal.BySeriesJson` |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| rebate_group_campaign_seq | Required | (redirect if none exist) | Server redirect |
| rebate_type_seq | Required | (id `rebate_type_seq_error`) | Client |
| Products | Required (at least one) | (id `products_error`) | Client |
| start_date | Required, date format | (id `start_date_error`) | Both |
| end_date | Required, must be ≥ start date | (id `end_date_error`) | Both |
| rebate_code | Uniqueness (async) | "Rebate code already taken" | Server |
| duplicate_address_count | Range ≥ 0 | "Only positive numbers or zero are allowed." | Server (`[Range]`) |
| Amount (payment rule) | Required, > 0 | (per-row validation) | Client |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| — | Draft | Create (default) | None |
| Draft | Published | Publish modal confirm → `UpdatePublishStatusAsync` | Success notification |
| Published | (locked) | — | Currency field disabled; group campaign locked |
| Any | Deleted | Delete handler | Redirect to ManageRebate |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetGroupCampaignsAsync` | GET (group dropdown) | programSeq, divisionSeq, campaignType |
| SELECT | `GetCampaignAsync` | GET edit | programSeq, campaignSeq |
| SELECT | `GetPaymentRuleDetailAsync` | GET edit | campaignSeq, divisionSeq |
| SELECT | `GetPaymentTypesAsync` | GET | programSeq, module="RBT" |
| SELECT | `GetRebateTypesAsync` | GET | divisionSeq, module="RBT" |
| SELECT | `GetAdminProductsAsync` | GET | programSeq, divisionSeq |
| SELECT | `GetCampaignLanguageAsync` | GET language step | campaignSeq |
| INSERT/UPDATE | `SaveCampaignAsync` | POST save | Full `RebateCampaignModal` object |
| INSERT/UPDATE | `SaveCampaignRuleAsync` | POST payment rule | Payment rule detail |
| INSERT/UPDATE | `SaveCampaignLanguageAsync` | POST language | Campaign language details |
| UPDATE | `UpdatePublishStatusAsync` | POST publish | campaignSeq, status="Published" |
| DELETE | `DeleteCampaignAsync` | POST delete | campaignSeq |
| DELETE | `DeleteCampaignRuleAsync` | POST delete rule | ruleSeq |
| DELETE | `DeleteCampaignLanguageAsync` | POST delete language | languageDetailsSeq |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session | Authenticated users only |
| Encrypted campaign seqs | `re_campaign_seq`, `re_rule_campaign_seq`, `re_group_seq` use `Encrypt` | Plain IDs never in form/URL |
| Admin roles | `IsAuthorize()` → Admin, AdminLevel1/2, RebateAdmin | Manage-level access required |
| Anti-CSRF | Razor Pages built-in `__RequestVerificationToken` | All POST handlers |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateCampaignModal` | `rebate_campaign_seq, rebate_group_campaign_seq, rebate_code, name, start_date, end_date, cut_off_date, amount, reward_mode, rebate_type_seq, Products, duplicate_address_count, publish_status, documentation_flag, is_varying_payout, enable_sms, RuleDetail` | Campaign master record |
| `PaymentRuleModal` | `rebate_product (list), BySeries (list), BySeriesJson` | Payment rule configuration |
| `RebateCampaignEditApiModel` | `RebateCampaignSeq, StartDate, EndDate, Amount, PublishStatus, ProductSeqs, DocumentationFlag, EnableSms` | API response for edit load |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Multi-step wizard navigation | jQuery steps plugin | Steps: Setup Rebate, Payment Rule, Setup Rebate Language |
| Currency mask | Amount field | `jquery.maskMoney` with `CurrencySymbol`, `GroupSeparator`, `DecimalSeparator` from culture config |
| Rebate code uniqueness check | `rebate_code` blur | AJAX GET `?handler=ValidateRebateCode` |
| Publish confirmation modal | `btnConfirmPublishCampaign` click | `#publishRebateModal` shows campaign name + start date; confirm calls `UpdatePublishStatusAsync` |
| Series upload | File input change | Calls AJAX, populates `#dvSeriesQuantityGrid` table |
| View full description | `.clsViewAll` click | Injects HTML into `#GridCompleteDescriptionModal` |
| Validate dates | Start/End date change | Client-side check: end ≥ start, cut-off ≥ start |

---

## Quality Gate Summary
- **UI fields documented**: 14 (step 1) + 3 (step 2)
- **Business rules extracted**: 8
- **Validation rules documented**: 8
- **Handlers documented**: 8
- **DB operations documented**: 14
- **Workflow transitions documented**: 4
- **Security rules documented**: 4
