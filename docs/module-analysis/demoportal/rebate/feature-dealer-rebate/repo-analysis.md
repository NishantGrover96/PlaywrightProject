# Rebate Dealer Rebate — Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/DealerRebate/Index.cshtml` | UI | Dealer portal — view current/future promotions, submit claims |
| `Presentation/Web/Pages/Rebate/DealerRebate/Index.cshtml.cs` | Handler | GET (load promotions), POST (dealer lookup, claim submission) |
| `Presentation/Web/Pages/Rebate/DealerRebate/CreateClaim.cshtml` | UI | Claim submission form |
| `Presentation/Web/Pages/Rebate/DealerRebate/CreateClaim.cshtml.cs` | Handler | GET (load campaign config), POST (validate + submit claim) |
| `Presentation/Web/Pages/Rebate/DealerRebate/SubmitConfirmation.cshtml` | UI | Post-submission confirmation page |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | `GetCampaignConfigAsync`, `SubmitDealerClaimAsync`, `ValidateDealerClaimAsync` |
| `Presentation/Web/Infrastructure/ApiClients/Dealer/IDealerInfoApiService.cs` | Service Contract | Dealer lookup, territory validation |

---

## UI / Form Fields — Index (Dealer Gate)
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| SearchType | radio | Yes | Dealer Name / Dealer # | Non-dealer role only | `value="name"` or `value="number"` |
| OnBehalfOfDealerNumber | text | Yes | Dealer # / Name | Non-dealer gate only | Input for lookup |
| ActiveTab | hidden | — | — | — | `"current"` or `"future"` |
| DnSeq | hidden | — | — | — | Encrypted dealer number seq (set after selection) |
| SelectDealer | hidden | — | — | — | Boolean; triggers dealer gate display |

---

## UI / Form Fields — Index (Campaign Tabs)
| Field Name | Type | Required | Label | Notes |
|---|---|---|---|---|
| ActiveTab | tab selector | — | Current / Future | Drives campaign list shown |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGet` | `IsAllowedRole()` | Load promotions for current or future tab |
| POST | `?handler=LookupDealer` | `IsAllowedRole()` | Search dealers by name or number (non-dealer roles) |
| GET | `CreateClaim?campaignSeq=` | `IsAllowedRole()` | Load campaign config and claim form |
| POST | `CreateClaim?handler=ValidateClaim` | `IsAllowedRole()` | Validate claim lines before submit |
| POST | `CreateClaim?handler=Submit` | `IsAllowedRole()` | Submit dealer rebate claim |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-DR01 | Role gate | `IndexModel.OnGet` | `IsAllowedRole()` checked; `AccessDeniedView()` returned on failure |
| BR-DR02 | Non-dealer must select dealer | `IndexModel` | Non-dealer (TM/Admin) sees dealer gate; must select dealer before claim submission |
| BR-DR03 | Territory validation | `IsDealerInUserTerritory(seq)` | Non-dealer user can only submit for dealers in their territory |
| BR-DR04 | Dealer must have payment info | `DealerHasPaymentInfoAsync` | Bug 141323: dealers with no payment info excluded from search results; error shown |
| BR-DR05 | Multiple dealer name matches | `OnPostLookupDealerAsync` | If name search returns >1 result, selection table shown before proceeding |
| BR-DR06 | Single match by number | `OnPostLookupDealerAsync` | Exact match by dealer number → auto-select and redirect with `dnseq=` |
| BR-DR07 | Tab memory | `ActiveTab` bind | Default `"current"`; `"future"` tab shows upcoming campaigns |
| BR-DR08 | On-behalf banner | `hasDealerSelected` | When non-dealer has selected dealer, blue banner shows "Submitting on behalf of: [Dealer Name]" |
| BR-DR09 | Campaign claim validation | `ValidateDealerClaimAsync` | Line items validated via API before final submit |
| BR-DR10 | Select prompt for non-dealer without dealer | `showSelectPrompt` | Yellow banner prompts non-dealer to select a dealer |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| OnBehalfOfDealerNumber | Required | `_PleaseEnterDealerName` or `_PleaseEnterDealerNumber` | Server |
| Dealer lookup — no results by number | Not found | `_NoDealerFoundByNumber` (formatted with input) | Server |
| Dealer lookup — no results by name | Not found | `_NoDealerFoundByName` (formatted with input) | Server |
| Dealer — no payment info by number | No payment info | `_DealerNoPaymentInfoByNumber` | Server |
| Dealer — no payment info by name | No payment info | `_DealerNoPaymentInfoByName` | Server |
| DnSeq (territory) | Must be in user territory | Redirect to Index if not | Server redirect |

---

## Workflow / Status Transitions
| From Status | To Status | Trigger | Notification |
|---|---|---|---|
| — | Gate shown | Non-dealer loads page without dealer | Yellow `_SelectDealerToClaim` banner |
| Gate | Dealer selected | Dealer lookup + select | Blue `_SubmittingOnBehalfOf` banner |
| Dealer selected | Claim submitted | Submit via `CreateClaim` handler | Redirect to `SubmitConfirmation` |
| Claim | Received (system status) | API `SubmitDealerClaimAsync` | Email/notification per campaign config |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetCurrentCampaignsAsync` (BindCurrent) | GET tab=current | programSeq, dealerNumberSeq |
| SELECT | `GetFutureCampaignsAsync` (BindFuture) | GET tab=future | programSeq, dealerNumberSeq |
| SELECT | `GetDealerLookupResultsAsync` | POST lookup | dealerSearch, searchType |
| SELECT | `DealerHasPaymentInfoAsync` | POST lookup (per dealer) | dealerNumberSeq |
| SELECT | `GetCampaignConfigAsync` | GET CreateClaim | programSeq, campaignSeq |
| SELECT | `GetProductSeriesForClaimAsync` | GET CreateClaim (SKU dropdown) | campaignSeq, productSeq |
| SELECT | `ValidateDealerClaimAsync` | POST validate | claim lines |
| INSERT | `SubmitDealerClaimAsync` | POST submit | dealerNumberSeq, campaignSeq, claim lines, payment type |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth + role gate | `IsAllowedRole()` → dealer, distributor, TM, admin roles | `AccessDeniedView()` on failure |
| Non-dealer territory check | `IsDealerInUserTerritory(seq)` | TM/Admin can only submit for their territory dealers |
| Encrypted dealer seq | `DnSeq` in URL is encrypted; decrypted via `_encrypt` | Plain dealer IDs never in URL |
| Payment info gate | `DealerHasPaymentInfoAsync` | Prevents claims for dealers without payment setup |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateCampaignDetail` | `RebateCampaignSeq, Name, StartDate, EndDate, Amount, RebateCode, PublishStatus` | Campaign listing tile |
| `DealerOption` | `DealerNumber, DealerName, dealer_number_seq, EncryptedSeq` | Dealer search result row |
| `RebateCampaignConfigApiModel` | `CampaignSeq, Products, PaymentTypes, DocumentRequired, SmsEnabled` | Claim form configuration |
| `ValidateDealerClaimApiModel` | `DealerNumberSeq, CampaignSeq, Lines (productSeq, qty, amount)` | Claim validation request |
| `SubmitDealerClaimRequestApiModel` | `DealerNumberSeq, CampaignSeq, InvoiceNumber, PurchaseDate, Lines, PaymentTypeSeq, DocumentPaths` | Claim submission |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Tab switch current/future | Tab click | `POST` with `ActiveTab` value; reloads promotions list |
| Dealer row click | `<tr onclick>` in search results | Navigates to `Index?dnseq={encrypted}&ActiveTab={tab}` |
| Dealer search type toggle | Radio button change | Updates `#lblSearchInput` label text |
| Claim form validation | Pre-submit | `ValidateClaim` AJAX called before final submit |

---

## Quality Gate Summary
- **UI fields documented**: 5 (gate) + 1 (tab)
- **Business rules extracted**: 10
- **Validation rules documented**: 6
- **Handlers documented**: 5
- **DB operations documented**: 8
- **Workflow transitions documented**: 4
- **Security rules documented**: 4
