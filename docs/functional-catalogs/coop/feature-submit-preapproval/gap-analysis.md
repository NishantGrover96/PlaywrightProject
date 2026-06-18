# Coop — Submit Pre-Approval — Gap Analysis

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-17 | Pipeline: Step 2.5 (Gap Analysis)
> Input: `docs/functional-catalogs/coop/feature-submit-preapproval/functional-units.md`
>         `docs/migration-reports/coop/feature-submit-preapproval/mapping.md`

---

## Missing Functional Units

_None. All 46 FUs are implemented in modern (43 equivalent, 2 different-but-equivalent, 1 partial)._

---

## Missing Validations

_None. Validation is entirely client-side in `jsSubmitPreApproval.js` and UI is identical between legacy and modern. All validation logic is shared (same .cshtml + same .js loaded by both)._

| Field | Legacy Rule | Modern Status | Gap Level |
|---|---|---|---|
| Campaign Title | Required when branch=campaign; `RequiredField` message | Full — same JS | — |
| Ad Landing URL | Required per `MediaURLRequiredFlag`; `RequiredField` message | Full — same JS | — |
| Multiple URLs | Required per `MediaURLRequiredFlag`; `RequiredField` message | Full — same JS | — |
| Ad Title | Required for mainbranch; `RequiredField` message | Full — same JS | — |
| Show Name | Required for indvshow/grpshow; `RequiredField` | Full — same JS | — |
| Show Address | Required for indvshow/grpshow; `RequiredField` | Full — same JS | — |
| Show City | Required; `RequiredField` | Full — same JS | — |
| Show State | Required; `RequiredField` | Full — same JS | — |
| Show Zip | Required; `RequiredField` | Full — same JS | — |
| Show Start Date | Required for show branches | Full — same JS | — |
| Show End Date | Required for show branches | Full — same JS | — |
| Show Cost | Required for show branches | Full — same JS | — |
| Dealer ID | Required when `dealeridtextrequiredflag="Y"` | Full — same JS | — |
| File Upload | Required for all preapprovals; `RequiredField` | Full — same JS | — |
| Email — Me | Required (readonly, pre-filled from session) | Full — same .cshtml | — |
| Sponsorship Name | Required for sponsor branch | Full — same JS | — |
| Sponsorship Dates | Required for sponsor branch | Full — same JS | — |

---

## Missing Workflow Steps

| Step | Legacy Trigger | Modern Status | Gap Level |
|---|---|---|---|
| Preapproval record created | `IPreapprovalService.ProcessPreApproval` | Full — via `SubmitPreapprovalAsync` | — |
| Dealer linked | `UpdatePreApprovalDealer` | Full — via `LinkDealerToPreapprovalAsync` | — |
| Parent dealer linked | `UpdatePreApprovalDealer(parentSeq)` | Full — via `LinkDealerToPreapprovalAsync` | — |
| Product linked | `InsertPreapprovalProduct_SaaS` | Full — via `LinkProductToPreapprovalAsync` | — |
| Document linked | `IDocumentService.UpdateDocumentImage` | Full — via `UpdateDocumentImageAsync` | — |
| URL additional info saved | `SaveAdditionalInfoToPreApproval` | Full — via `SaveAdditionalInfoAsync` | — |
| Email contacts persisted | `IAddressService.UpdateContact` per contact | Full — via `UpdateContactAsync` per contact | — |
| Confirmation email sent | `IEmailService` + email template | Full — same `IEmailService` | — |
| Comment saved | `ICommentService.updateComment` | Full — via `UpdateCommentAsync` | — |
| Campaign child preapprovals | Loop `ProcessPreApproval(child, parentSeq)` | Different — mapped as nested `ChildPreapprovals` in single API call. Functionally equivalent. | Low |
| Shows & Events record — full fields | `UpdateDealerShows` with EquipmentList, Dealers, Cost, DlrRacf, Email | **Partial** — `LinkShowToPreapprovalAsync` only passes seq, dealerSeq, showDate, showName, location, showType | **Medium** |

---

## Missing Database Operations

| Operation | Legacy Table/SP | Modern Status | Gap Level |
|---|---|---|---|
| Preapproval header insert | SP via `IPreapprovalService.ProcessPreApproval` | Full — API handles | — |
| Preapproval dealer link | `preapproval_dealer` table | Full — API handles | — |
| Preapproval product link | `preapproval_product` table | Full — API handles | — |
| Document image record | `document_image` table | Full — API handles | — |
| Additional info record | `preapproval_additional_info` or equivalent | Full — API handles | — |
| Contact records | `contact` table per email | Full — API handles | — |
| Comment record | `comment` table | Full — API handles | — |
| Dealer shows record (Shows & Events) | `dealer_shows` table — EquipmentList, Dealers, Cost, Email, DlrRacf | **Partial** — modern API `LinkShowToPreapprovalAsync` does not accept EquipmentList, Dealers, Cost, DlrRacf, Email parameters | **Medium** |

---

## Missing Security Rules

_None. Security layer is identical between legacy and modern._

| Rule | Legacy Enforcement | Modern Status | Gap Level |
|---|---|---|---|
| Auth required | `BasePageModel` + session middleware | Full — same `BasePageModel` | — |
| Dealer sees own data only | `UserSession.Dealer_number_seq` used server-side | Full — same | — |
| Corp/Admin must select dealer | `SearchCorporateDealer()` + dealer search step | Full — same | — |
| Encrypted params | `IEncryptDecrypt` throughout | Full — same | — |

---

## Metrics

- **Functional Coverage: 97.8%** (45 of 46 FUs fully covered; 1 partial)
- **Validation Coverage: 100%** (all client-side validations identical — same .cshtml + same JS)
- **Workflow Coverage: 90.9%** (10 of 11 workflow steps fully covered; 1 partial gap)
- **Database Coverage: 87.5%** (7 of 8 DB operations fully covered; 1 partial gap)
- **Security Coverage: 100%** (all 4 security FUs fully covered)

### Gap Summary

| Level | Count | Items |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | COOP-PA-FU-036: Shows & Events record missing EquipmentList, Dealers, Cost, DlrRacf, Email in `LinkShowToPreapprovalAsync` |
| Low | 1 | FU-033: Campaign child preapprovals processing (different implementation, functionally equivalent) |
| **Total** | **2** | — |

---

## Gap Detail: COOP-PA-FU-036 (Medium)

**Title:** Shows & Events Record — Missing Fields

**Legacy:** `IDealerService.UpdateDealerShows(DealerShows)` passes all fields:
- `EquipmentList` — comma-separated equipment names
- `Dealers` — comma-separated participating dealer numbers (group shows)
- `Cost` — expected eligible show cost
- `DlrRacf` — submitter user ID
- `Email` — TO email address from dealer contacts
- `DlrFormStatus = "SUBMITTED"`

**Modern:** `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync(preapprovalSeq, dealerSeq, showDate, showName, location, showType)` — interface signature does NOT include: EquipmentList, Dealers, Cost, DlrRacf, Email.

**Impact:** For Individual Shows and Group Shows branch preapprovals:
- Equipment list entered on form is collected client-side but NOT persisted server-side in modern
- Group dealer participants NOT persisted server-side in modern
- Show cost NOT persisted in dealer_shows record in modern
- CSR viewing the dealer show record may see incomplete information

**Recommendation:** Verify via database test after submission. If confirmed missing, backend API `LinkShowToPreapprovalAsync` must be extended to accept and persist these fields. Log as `test.fixme` for affected test cases until backend fix is confirmed.
