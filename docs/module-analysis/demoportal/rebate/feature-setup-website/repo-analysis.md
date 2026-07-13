# Rebate Setup Website - Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/SetupRebateWebsite.cshtml` | UI | Consumer-facing rebate website content configuration |
| `Presentation/Web/Pages/Rebate/SetupRebateWebsite.cshtml.cs` | Handler | GET (load website details per language), POST (save content) |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | `GetCampaignMasterDataAsync`, `SaveWebsiteDetailsAsync` |
| `Presentation/Web/wwwroot/WebScripts/Rebate/SetupRebateWebsite.js` | Client | Content editor, dropzone uploads, WYSIWYG |
| `Presentation/Web/Models/RebateModel/RebateManageApiModels.cs` | DTOs | `SaveRebateWebsiteDetailsRequestApiModel` |

---

## UI / Form Fields
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| ddllanguage (`_rebateWebsiteDetailsonEdit.encryptalanguageSeq`) | select | Yes | Select Language | `#divlanguage` | Encrypted language seq; `data-actual-id` tracks plain seq |
| headline | text/editor | No | Headline | `editors` section | Consumer-facing headline |
| subheadline | text/editor | No | Sub-headline | `editors` section | Consumer-facing sub-headline |
| congratulation_text | textarea/editor | No | Congratulation Text | `editors` section | Shown post-submission |
| logo_file_path (Logofile) | file (Dropzone) | No | Upload Logo | `hide` (hidden section) | Stored via file path |
| banner_file_path (Bannerfile) | file (Dropzone) | No | Upload Banner Image | `hide` (hidden section) | Stored via file path |
| congratulations_image_path | file (Dropzone) | No | Congratulations Image | `editors` section | Post-submit image |
| address | textarea | No | Address | `editors` section | Business address display |
| country_seq | hidden | - | - | - | Pre-set via `_rebateWebsiteDetailsonEdit.country_seq` |
| state_seq | hidden | - | - | `state_seq` hidden input | Pre-set |
| phone_number | text | No | Phone Number | `editors` section | Contact number displayed on site |
| privacy_statement | textarea/editor | No | Privacy Statement | `editors` section | Legal text (inline or PDF path) |
| privacy_statement_path | file | No | Privacy Statement PDF | `editors` section | PDF upload |
| terms_conditions | textarea/editor | No | Terms & Conditions | `editors` section | Legal text (inline or PDF path) |
| terms_conditions_path | file | No | T&C PDF | `editors` section | PDF upload |
| refund_status | select/checkbox | No | Refund Status | - | |
| Theme selection | visual tabs (.clsLayout) | No | Choose your theme | `row hide` (hidden in current UI) | Mapped to `theme_name` in master data type "T" |
| Version selection | visual tabs (.clsVersion) | No | Choose your Version | `row hide` (hidden in current UI) | Mapped to `version` in master data type "CO" |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGetAsync` | Authenticated | Load country list, languages, master data (themes/versions), existing website content |
| GET | `?handler=GetWebsiteContent&language_seq=&rebate_campaign_seq=` | Authenticated | AJAX load content for selected language |
| POST | `?handler=SaveWebsite` | Authenticated | Save website content for selected language |
| POST | `?handler=UploadFile` | Authenticated | Upload logo/banner/PDF files via Dropzone |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-SW01 | Language-scoped content | `OnGetAsync` | Website content stored per language; each language variant saved independently |
| BR-SW02 | Default language seq | `OnGetAsync` | If `language_seq` not in query string, defaults to `2` (primary language) |
| BR-SW03 | Encrypted language seq | `encryptalanguageSeq` field | Language seq is encrypted in URL/dropdown value; decrypted on GET |
| BR-SW04 | Master data typed | `_rebateWebsiteDetails.masterData` | `type = "T"` -> themes; `type = "CO"` -> versions; currently hidden in UI |
| BR-SW05 | Content pre-populated | `GetHomeContentAsync` | If `websiteContent != null`, all fields pre-populated for editing |
| BR-SW06 | Country/region driven | `GetCountryByProgramSeqAsync` | Countries loaded from Coop API; region defaults to `UserSession.DefaultRegion` |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| Language | Required | `_PleaseSelectLanguage` (id `spnRebateSelectLanguage`) | Client |
| Theme | Required (when shown) | "Please select Theme!" (id `spnThemeError`) | Client |
| Version | Required (when shown) | "Please select Version!" (id `spnVersionError`) | Client |
| Logo | Required (when shown) | "Please upload Logo!" (id `spnLogoFileName`) | Client |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| Not configured | Configured | Save website content | Success notification |
| Existing | Updated | Save with existing `rebate_campaign_website_details_seq` | Success notification |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetCountryByProgramSeqAsync` | GET (all countries) | programSeq |
| SELECT | `GetLanguagesByDivisionAsync` | GET | divisionSeq |
| SELECT | `GetCampaignMasterDataAsync` | GET (themes/versions) | programSeq |
| SELECT | `GetHomeContentAsync` | GET & AJAX language change | divisionSeq, languageSeq |
| INSERT/UPDATE | `SaveWebsiteDetailsAsync` | POST save | rebate_campaign_website_details_seq, division_seq, language_seq, theme_name, logo_file_path, banner_file_path, headline, subheadline, congratulation_text, address, country_seq, state_seq, phone_number, privacy_statement, terms_conditions, refund_status |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session | Authenticated users only |
| Encrypted language seq | `_encrypt.Decrypt(encryptedLanguageSeq)` | Language IDs not exposed as plain integers |
| Admin roles | `IsAuthorize()` base model | Admin, RebateAdmin, ChannelFusionAdmin |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateCampaignWebsiteDetails` | `rebate_campaign_website_details_seq, rebate_campaign_seq, theme_name, version, logo_file_path, banner_file_path, headline, subheadline, congratulation_text, address, country_seq, state_seq, phone_number, privacy_statement, privacy_statement_path, terms_conditions, terms_conditions_path, refund_status, language_seq, encryptalanguageSeq` | Consumer website content entity |
| `Master_Data_Modal` | `rebate_campaign_master_seq, name, description, key, type, thumbnail_file_path` | Theme/version configuration |
| `SaveRebateWebsiteDetailsRequestApiModel` | (mirrors `RebateCampaignWebsiteDetails`) | API save request |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Language change -> reload content | `#ddllanguage` change | AJAX GET `?handler=GetWebsiteContent` with encrypted language seq |
| Logo upload | Dropzone on `#UploadLogo` | Uploads file; sets `#Logofile` hidden input; shows `#dvuploadLogoPath` preview |
| Banner upload | Dropzone on `#UploadBanner` | Uploads file; sets `#Bannerfile` hidden input; shows preview |
| Theme selection | `.clsLayout` click | Adds `active` class; sets `theme_name` hidden field |
| Version selection | `.clsVersion` click | Adds `active` class; sets `version` hidden field |
| WYSIWYG editor | TinyMCE or similar on text fields | Rich text editing for headline, subheadline, congratulation text |
| Quick Help modal | `.btn-help` click | Opens `#preview-screen` modal |

---

## Quality Gate Summary
- **UI fields documented**: 16 (content + upload fields)
- **Business rules extracted**: 6
- **Validation rules documented**: 4
- **Handlers documented**: 4
- **DB operations documented**: 5
- **Security rules documented**: 3
