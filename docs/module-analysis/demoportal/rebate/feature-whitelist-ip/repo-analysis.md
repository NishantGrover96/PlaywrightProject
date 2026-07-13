# Rebate Whitelist / Blacklist IP Management - Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/WhiteList.cshtml` | UI | Search/filter IP list with export |
| `Presentation/Web/Pages/Rebate/WhiteList.cshtml.cs` | Handler | GET/POST (search), POST export, redirect |
| `Presentation/Web/Pages/Rebate/CreateWhiteList.cshtml` | UI | Create or edit single IP entry form |
| `Presentation/Web/Pages/Rebate/CreateWhiteList.cshtml.cs` | Handler | GET (load / decrypt entry), POST Save, POST duplicate check |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | `GetIPWhiteListAsync`, `SaveIPWhiteListAsync` |
| `Presentation/Web/Models/RebateModel/WhiteListModel.cs` | DTO | `WhiteListEntry` model |
| `Presentation/Web/wwwroot/WebScripts/Rebate/WhiteList.js` | Client | IP format validation, duplicate check, edit-mode readonly |

---

## UI / Form Fields - WhiteList (Search Page)
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| IPAddress | text | No | IP Address | - | Filter by IP (partial or exact) |
| SecurityListType | select | No | Security List Type | - | Options: All, `Y`=Whitelist, `N`=Blacklist |
| Status | select | No | Status | - | Options: All, `Y`=Active, `N`=Inactive |
| hdn_size (S) | hidden | - | - | - | Page size for pagination |

---

## UI / Form Fields - CreateWhiteList (Create / Edit Form)
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| WhiteList.ip_whiteList_seq | hidden | - | - | - | `0` for create, existing seq for edit |
| WhiteList.IPAddress | text | Yes | IP Address | Readonly in Edit mode (JS) | IPv4 or IPv6; `placeholder=_EnterIPAddress`; note text `_IPAddressNote` |
| WhiteList.SecurityListType | select | Yes | Security List Type | - | Options: `Y`=Whitelist, `N`=Blacklist |
| WhiteList.Status | select | Yes | Status | - | Options: `Y`=Active, `N`=Inactive |
| WhiteList.Comment | textarea | Yes | Comment | - | `maxlength=500`; `placeholder=_EnterCommentForThisIPAddress` |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `WhiteList.OnGet` | Authenticated | Load list with default filters |
| POST | `WhiteList.OnPost` | Authenticated | Redirect with search filters in query string |
| POST | `WhiteList.OnPostExportXlsx` | Authenticated | Export filtered list to `.xlsx` |
| GET | `CreateWhiteList.OnGet?WishlistSeq=` | Authenticated | Load create form OR decrypt + load entry for edit |
| POST | `CreateWhiteList.OnPostSave` | Authenticated | Create or update IP entry; `ModelState.IsValid` required |
| POST | `CreateWhiteList.OnPostCheckIPDuplicate?ipAddress=` | Authenticated | Check if IP already exists in program (Create mode only) |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-WL01 | Whitelist vs Blacklist | Data model | `SecurityListType = "Y"` -> Whitelist; `"N"` -> Blacklist; displayed accordingly |
| BR-WL02 | IP readonly on edit | `WhiteList.js` | `pageMode === 'Edit'` sets `#WhiteList_IPAddress` to `readonly`; background `#f8f9fa` |
| BR-WL03 | Duplicate IP check (create only) | `OnPostCheckIPDuplicate` | API lookup by IP in same program; blocks save if match found |
| BR-WL04 | IPv4 and IPv6 supported | `WhiteList.js` `isValidIPv4` / `isValidIPv6` | Both formats accepted; custom JS regex validation |
| BR-WL05 | Program-scoped entries | `CreateWhiteListModel.OnPostSave` | `ProgramSeq` from `_programConfig.ProgramSeq` always set on save |
| BR-WL06 | Export filename format | `WhiteList.OnPostExportXlsx` | `WhiteList_{yyyyMMddhhmm}.xlsx` |
| BR-WL07 | Encrypted edit link | `WhiteList.cshtml` | `WishlistSeq` URL param is `_encrpt.Encrypt(IpWhiteListSeq)` |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| IPAddress | Required | `[LocalizedRequired("_dataAnnotionRequired")]` | Server (ModelState) |
| IPAddress | IPv4 format | `_PleaseEnterValidIPAddress` (id `ipValidationMessage`) | Client (JS) |
| IPAddress | IPv6 format | `_PleaseEnterValidIPAddress` (id `ipValidationMessage`) | Client (JS) |
| IPAddress | Duplicate (create) | (id `ipDuplicateMessage` shown) | Client (AJAX) |
| SecurityListType | Required | `[LocalizedRequired("_dataAnnotionRequired")]` | Server (ModelState) |
| Status | Required | `[LocalizedRequired("_dataAnnotionRequired")]` | Server (ModelState) |
| Comment | Required | `[LocalizedRequired("_dataAnnotionRequired")]` | Server (ModelState) |
| Comment | MaxLength 500 | (truncated at input) | Client |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| - | Created (Active/Inactive) | `OnPostSave` (create) | `_WhiteListEntrySavedSuccessfully` |
| Existing | Updated | `OnPostSave` (edit, `ip_whiteList_seq != 0`) | `_WhiteListEntryUpdatedSuccessfully` |
| Any | Save failed | API returns `false` | `_FailedToSaveWhiteListEntry` or `_FailedToUpdateWhiteListEntry` |
| Any | Save exception | Exception caught | `_ErrorOccurredWhileSavingWhiteListEntry` |
| Export | Excel file | `OnPostExportXlsx` | Binary file download |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetIPWhiteListAsync` | GET (list) | programSeq, IPAddress, SecurityListType, Status, pageSize, pageNo, sortOrder |
| SELECT | `GetIPWhiteListAsync` | GET (edit load) | programSeq, ipAddress, ipWhiteListSeq |
| SELECT | `GetIPWhiteListAsync` | POST CheckIPDuplicate | programSeq, ipAddress |
| INSERT | `SaveIPWhiteListAsync` | POST Save (create) | ProgramSeq, IpAddress, Comment, SecurityListType, Status, IpWhiteListSeq=0 |
| UPDATE | `SaveIPWhiteListAsync` | POST Save (edit) | ProgramSeq, IpAddress, Comment, SecurityListType, Status, IpWhiteListSeq |
| SELECT | `GetIPWhiteListAsync` | POST ExportXlsx | All matching records (no pagination) |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session | Authenticated users only |
| Encrypted edit ID | `_encrpt.Encrypt(IpWhiteListSeq)` / `_encryptDecrypt.Decrypt` | IP entry IDs never plain in URL |
| ModelState validation | `OnPostSave`: `if (!ModelState.IsValid) return Page()` | Prevents save with invalid data |
| IP readonly in edit | JS `pageMode === 'Edit'` | Prevents IP change post-creation |
| Admin roles | `IsAuthorize()` base model | Admin, RebateAdmin roles |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `WhiteListEntry` | `ip_whiteList_seq, program_seq, IPAddress [Required], SecurityListType [Required], Comment [Required], Status [Required]` | Create/Edit form model |
| `RebateIPWhiteListApiModel` | `IpWhiteListSeq, IpAddress, Comment, SecurityListType, Status, TotalCount` | List row model |
| `SaveRebateIPWhiteListApiModel` | `ProgramSeq, IpAddress, Comment, SecurityListType, Status, IpWhiteListSeq` | API save request |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Real-time IP format validation | `#WhiteList_IPAddress` input event | `validateIPAddress(value)` - shows/hides `#ipValidationMessage` |
| Block non-IP keystrokes | `keydown` on IP field | Allows only: digits, dots, colons, backspace, Ctrl+A/C/V/X, arrows |
| Readonly IP on edit | Page load (`pageMode === 'Edit'`) | Sets field `readonly`, grey background |
| Duplicate check on submit | Form submit (Create mode) | AJAX POST `?handler=CheckIPDuplicate`; blocks submit if duplicate found (`#ipDuplicateMessage` shown) |
| Form submit guard | Form `submit` event | Validates: non-empty, valid IPv4/IPv6, no visible duplicate message |
| Cancel button | Click | Navigates back to `/Rebate/WhiteList` |

---

## Quality Gate Summary
- **UI fields documented**: 4 (search) + 5 (create/edit form)
- **Business rules extracted**: 7
- **Validation rules documented**: 8
- **Handlers documented**: 6
- **DB operations documented**: 6
- **Workflow transitions documented**: 5
- **Security rules documented**: 5
