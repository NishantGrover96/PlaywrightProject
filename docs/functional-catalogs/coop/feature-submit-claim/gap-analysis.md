# Coop — Submit Claim : Gap Analysis Report

> Generated: 2026-06-17
> Pipeline step: Step 2.5 — Gap Analysis
> Module: `coop` | Feature: `submit-claim`

---

## Dimension 1 — Functional Units

**Overall coverage: 94.3% (50/53 weighted)**

| Status | Count | FU IDs |
|---|---|---|
| Full (Equivalent) | 48 | All others |
| Partial | 4 | FU-018, FU-024, FU-041, FU-045 |
| Missing | 1 | FU-046 |
| New in Modern | 2 | `Email.cs` partial class, `IDealerBudgetApiService` |

---

## Dimension 2 — UI Elements

All 6 UI FUs are **Full** (100%).

The CSHTML files are identical between legacy and modern — both repos share the same wizard structure, hidden fields, partial views, and CSS classes. No UI regressions identified.

One observation: modern `.cshtml` drops `ViewData["EnableCultureDatePicker"] = true` — this key is in legacy (line 7, legacy CSHTML) but absent in modern. This may affect the date picker locale initialization depending on how the layout consumes it.

| Item | Legacy | Modern | Status |
|---|---|---|---|
| 4-step wizard structure | ✅ | ✅ | Equivalent |
| All hidden fields | ✅ | ✅ | Equivalent |
| Step 1 radio + contact fields | ✅ | ✅ | Equivalent |
| Step 2 dealer search partial | ✅ | ✅ | Equivalent |
| Step 3 media type grid + dealer type filter | ✅ | ✅ | Equivalent |
| Step 4 claim process + contact detail | ✅ | ✅ | Equivalent |
| Step 5 success screen (Submit / Submit Later) | ✅ | ✅ | Equivalent |
| `ViewData["EnableCultureDatePicker"]` | ✅ | ❌ absent | Low |

---

## Dimension 3 — Validation Rules

### Client-Side Validation (JS)
The `jsSubmitClaim.js` file in the modern repo is functionally identical to legacy. All client validations are equivalent.

| Validation | Rule | JS (Legacy) | JS (Modern) | Status |
|---|---|---|---|---|
| Contact email | Required + regex email format | ✅ | ✅ | Equivalent |
| Contact phone | Format check if provided (not mandatory) | ✅ | ✅ | Equivalent |
| Invoice amount | Required | ✅ | ✅ | Equivalent |
| Invoice number | Required; maxlength=20 | ✅ | ✅ | Equivalent |
| Invoice file (Dropzone) | Required — must upload | ✅ | ✅ | Equivalent |
| Activity date | Client: duplicate check + invalid date message | ✅ | ✅ | Equivalent |
| Activity creative type | Required if dropdown visible | ✅ | ✅ | Equivalent |
| Media name | Required | ✅ | ✅ | Equivalent |
| Dealer ID | Required if `dealeridtextrequiredflag == "Y"` and no pre-approval | ✅ | ✅ | Equivalent |
| Vendor name | Required if vendor mode | ✅ | ✅ | Equivalent |
| Vendor address, city, state, zip | Required if vendor mode | ✅ | ✅ | Equivalent |
| Vendor email | Format check if provided | ✅ | ✅ | Equivalent |
| Product lines sum | Client-side also checks | ✅ | ✅ | Equivalent |

### Server-Side Validation

| Validation | Legacy (Server) | Modern (Server) | Gap Level |
|---|---|---|---|
| Product line sum ≠ 100 | HTTP 400 + error JSON | HTTP 400 + error JSON | **None** |
| Future activity date | **HTTP 400** returned from `OnPostSaveClaim` | **Silent skip** in `UpdateTempActivities`; no 400 | **High** |
| Duplicate activity date | **HTTP 400** returned from `OnPostSaveClaim` | **Removed entirely** from `OnPostSaveClaim` | **High** |

> **Gap Detail (G-02/G-03):** In legacy, `OnPostSaveClaim` validates each activity's dates before proceeding and returns HTTP 400 with a descriptive error if a future date or duplicate date is found. In modern, the `OnPostSaveClaim` date validation block was removed; `UpdateTempActivities` silently skips future dates but writes no error to the client. The JS client validates duplicates, but server-side defense is removed.

---

## Dimension 4 — Business Rules

**Coverage: 100% (8/8 FUs Full)**

All business rule logic has been migrated to equivalent BackendAPI calls. No behavioral differences identified in the following areas:

| Business Rule | Legacy | Modern | Status |
|---|---|---|---|
| Budget availability calculation | `IBudgetService.GetDealerBudgetType` | `CoopApiService.GetDealerBudgetTypeAsync` | Equivalent |
| Dealer type resolution | `IDealerService.GetDealerTypeByDealerNumberSeq` | `CoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | Equivalent |
| Pre-approval status = APPROVED check | `_preapprovalService.GetPreapprovalBySearch` | `_claimActivityApiService.GetPreapprovalBySearchAsync` | Equivalent |
| Campaign pre-approval (child media types) | Session key per `media_type_seq` | Same session pattern | Equivalent |
| Dealer ID contract validation | `_dealerService` + `_programService` | `_coopApiService` equivalents | Equivalent |
| OCR usage classification (OCR/OCR+Manual/Manual) | `_oCRService` + tracking logic in page model | Identical logic; OCR service unchanged | Equivalent |
| Multi-currency conversion rate lookup | `_programService` | `_coopApiService` API | Equivalent |
| Corporate dealer auto-bind | `_dealerSearch.SearchCorporateDealer()` | Same helper (not yet API-migrated, consistent) | Equivalent |

---

## Dimension 5 — Workflow Transitions

| Step / Transition | Legacy | Modern | Gap Level |
|---|---|---|---|
| New claim → fill form (Step 1–4) | Wizard JS progression | Identical | None |
| Pre-approval path → pre-fills contact + filters media | `OnGetCheckAdCodeNumber` | Same via API | None |
| Draft Save → TempClaimSeq returned | `OnPostSaveClaim(false)` | Same | None |
| Draft Save → show "Saved" confirmation with temp number | CSHTML `dvClaimSubmitLater` | Identical CSHTML | None |
| Final Submit → ClaimProcessNumber | `CreateClaim` → SP → get process_number | Same via API | None |
| Final Submit → show confirmation screen | CSHTML `dvClaimSubmit` | Identical CSHTML | None |
| Post-submit email → submitter + dealer contacts | `_emailService.SendEmailAsync` | **Same `_emailService` — legacy service not yet on API** | Medium |
| Post-submit email PDF generation | `SelectPdf.HtmlToPdf` | Same library | None |
| Resume incomplete claim (`?temp_seq=`) | Full draft restoration | Same via API | None |
| Submit New Claim / Submit Another Claim buttons | CSHTML buttons | Identical | None |

> **Gap Detail (G-04):** `SendClaimEmailToUser` in modern's `SubmitClaim.cshtml.Email.cs` uses `_emailService.SendEmailAsync` (legacy `IEmailService`). While functional, it means email sending still depends on the legacy service layer rather than an API endpoint. The risk is low if both apps share the same `IEmailService` implementation, but in a fully decoupled modern deployment this would break.

---

## Dimension 6 — Database Operations

| Operation | Table / SP | Legacy | Modern | Gap Level |
|---|---|---|---|---|
| Create / update temp claim | `ONLINE_CLAIM_TEMP` | `UpdateOnlineClaimTemp` | `CoopApiService.UpdateOnlineClaimTempAsync` | None |
| Create / update temp activity | `ONLINE_ACTIVITY_TEMP` | `UpdateOnlineActivityTemp` | `CoopApiService.UpdateOnlineActivityTempAsync` | None |
| Delete + insert product lines | `ONLINE_ACTIVITY_PRODUCT` | Delete via `_activityService` (legacy), Insert via `_activityService` | **Delete via `_activityService` (legacy); Insert via `_coopApiService` API** | **High** |
| **Save activity dates** | `ONLINE_ACTIVITY_DATE` | `DeleteOnlineActivityDate` + `UpdateOnlineActivityDate` | **Completely absent from modern** | **Critical** |
| Save document image record | `DOCUMENT_IMAGE` | `_documentService.UpdateDocumentImage` | `_claimActivityApiService.UpdateDocumentImageAsync` | None |
| Save vendor contact | `CONTACT` (ONLINE_ACTIVITY_TEMP owner) | `_addressService.UpdateContact` | `_commonAPIService.UpdateContactU01Async` | None |
| Save vendor address | `ADDRESS` | `_addressService.updateAddress` | `_commonAPIService.UpdateAddressWithSeqAsync` | None |
| Finalize: temp → CLAIM + ACTIVITY | `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` | `_onlineClaimService` | `_coopApiService.CreateClaimAndActivityRecordsAsync` | None |
| Budget deduction after finalize | `USP_INSERT_ACTIVITY_PRODUCT_SAAS` | `_onlineClaimService.InsertActivityProduct_SaaS` | `_coopApiService.InsertActivityProductSaaSAsync` | None |
| Save claim dealer number (split) | `CLAIM_DEALER_NUMBER` | `_onlineClaimService.UpdateClaimDealerNumber` | `_coopApiService.UpdateClaimDealerNumberAsync` | None |
| Save email contacts on claim | `CONTACT` (CLAIM owner) | `_addressService.UpdateContact` | `_commonAPIService.UpdateContactU01Async` | None |

> **Critical Gap — Activity Dates (FU-046):** Legacy `UpdateTempActivities` deletes all existing dates for an activity (`DeleteOnlineActivityDate`) then inserts each new date (`UpdateOnlineActivityDate`). The modern `UpdateTempActivities` has **zero activity date code** — the `activityDates` array is sent from the client in the JSON payload, but it is read back from the DB when resuming a draft, yet never written. Claims submitted via modern will have no `ONLINE_ACTIVITY_DATE` records, which may impact downstream processing, reporting, and activity approval workflows.

> **High Gap — Product Line Delete Inconsistency (FU-045):** `_activityService.DeleteOnlineActivityProduct` (legacy `IActivityService`) is called before `_coopApiService.UpdateOnlineActivityProductAsync` (API). If the legacy service is unavailable or behaves differently in the modern deployment, old product lines may not be deleted before the new ones are inserted, resulting in duplicate product line records.

---

## Dimension 7 — Stored Procedures

| SP | Legacy Caller | Modern Caller | Status |
|---|---|---|---|
| `USP_ONLINE_CLAIM_TEMP_U01` | `_onlineClaimService` | `CoopApiService` | Equivalent |
| `USP_ONLINE_ACTIVITY_TEMP_U01` | `_onlineClaimService` | `CoopApiService` | Equivalent |
| `USP_ONLINE_ACTIVITY_PRODUCT_U01` | `_activityService` (delete + insert) | Delete: `_activityService` / Insert: `CoopApiService` | **Partial** |
| `USP_ONLINE_ACTIVITY_DATE_U01` | `_activityService` | **Not called** | **Missing** |
| `USP_DOCUMENT_IMAGE_U01` | `_documentService` | `ClaimActivityApiService` | Equivalent |
| `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` | `_onlineClaimService` | `CoopApiService` | Equivalent |
| `USP_INSERT_ACTIVITY_PRODUCT_SAAS` | `_onlineClaimService` | `CoopApiService` | Equivalent |
| `USP_CLAIM_DEALER_NUMBER_U01` | `_onlineClaimService` | `CoopApiService` | Equivalent |
| `USP_TEMP_CLAIM_DEALER_NUMBER_U01` | `_onlineClaimService` | `CoopApiService` | Equivalent |

---

## Dimension 8 — Security Rules

**Coverage: 100% (4/4 FUs Full)**

| Rule | Legacy Enforcement | Modern Enforcement | Status |
|---|---|---|---|
| Unauthenticated redirect | `BasePageModel` + session | Same | Equivalent |
| Dealer data scoping | `DealerNumberSeq` from session, forced for dealer users | Same | Equivalent |
| Cross-dealer pre-approval block | Org structure list check in `OnGetCheckAdCodeNumber` | Same via `_coopApiService.GetDealersListAsync` | Equivalent |
| Parameter encryption | `_encryptDecrypt` on all DB IDs exposed to client | Same `_encryptDecrypt` | Equivalent |
| Role-based "Submit New Claim" visibility | `UserRole.BMDLR / DIST / BMDIST` checks in CSHTML | Identical CSHTML | Equivalent |

---

## Missing Functional Units

| FU ID | Title | Risk | Root Cause | Recommendation |
|---|---|---|---|---|
| COOP-FU-046 | Activity Date Records | **Critical** | `DeleteOnlineActivityDate` + `UpdateOnlineActivityDate` not ported to modern `UpdateTempActivities` | Add `_coopApiService.UpdateOnlineActivityDateAsync` calls after product lines block; port the same delete-then-insert pattern |

---

## Missing Validations

| Field | Legacy Rule | Modern Status | Gap Level |
|---|---|---|---|
| Activity dates | Server returns HTTP 400 if future date in `OnPostSaveClaim` | Silent skip; no error response | **High** |
| Activity dates | Server returns HTTP 400 if duplicate date in `OnPostSaveClaim` | Removed from `OnPostSaveClaim`; only JS-side | **High** |
| `ViewData["EnableCultureDatePicker"]` | `= true` set in legacy CSHTML | Absent in modern CSHTML | **Low** |

---

## Missing Workflow Steps

No workflow transitions are missing. All status paths (draft, submit, resume) are implemented.

---

## Missing Database Operations

| Operation | Legacy Table | Modern Status | Gap Level |
|---|---|---|---|
| Write activity dates | `ONLINE_ACTIVITY_DATE` via `USP_ONLINE_ACTIVITY_DATE_U01` | **Not implemented in modern** | **Critical** |

---

## Missing Security Rules

No security gaps identified.

---

## Metrics

| Metric | Value |
|---|---|
| Functional Coverage | **94.3%** (50 / 53 weighted) |
| Validation Coverage | **87.5%** (14 / 16 rules — 2 server-side missing) |
| Workflow Coverage | **100%** (all transitions present) |
| Database Coverage | **88.9%** (8 / 9 operations — activity dates missing) |
| Security Coverage | **100%** |
| | |
| Critical gaps | **1** (FU-046 — activity dates not persisted) |
| High gaps | **3** (FU-018 server validation, FU-024 vendor read, FU-045 product delete) |
| Medium gaps | **1** (FU-041 email service) |
| Low gaps | **1** (`EnableCultureDatePicker`) |
| **Total gaps** | **6** |
