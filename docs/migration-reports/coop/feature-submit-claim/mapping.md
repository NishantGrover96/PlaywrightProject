# Coop — Submit Claim : Migration Mapping

> Generated: 2026-06-17
> Pipeline step: Step 2 — Migration Mapping
> Module: `coop` | Feature: `submit-claim`

---

## Summary

| Equivalence | Count |
|---|---|
| Equivalent | 38 |
| Partial | 10 |
| Missing in Modern | 3 |
| New in Modern | 2 |
| **Total FUs** | **53** |

---

## Mapping Table

| FU ID | Title | Legacy Implementation | Modern Implementation | Equivalence | Notes |
|---|---|---|---|---|---|
| COOP-FU-001 | Page Load & Auth Redirect | `OnGet` — direct service calls | `OnGet` async — API client calls | **Equivalent** | Async, same logic |
| COOP-FU-002 | Fiscal Year Selection Display | `OnGet` — `_fiscalService` + date math | Same — `_fiscalService` unchanged | **Equivalent** | |
| COOP-FU-003 | Claim Type Radio | CSHTML + JS | Identical CSHTML + JS | **Equivalent** | |
| COOP-FU-004 | Dealer Search Step | `_dealerSearch.SearchCorporateDealer()` | Same — `DealerSearch` not yet API | **Equivalent** | `DealerSearch` helper unchanged |
| COOP-FU-005 | Media Type Grid Rendering | `IMediaService.GetMediaTypesBranchWithProgramSeq` | `ClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` | **Equivalent** | |
| COOP-FU-006 | Budget Available Display | `BudgetAvaiable = "$0.00"` on `OnGet` | Same | **Equivalent** | Actual value loaded later via AJAX |
| COOP-FU-007 | Contact Name Required | JS client validation | Same JS | **Equivalent** | |
| COOP-FU-008 | Contact Email Required | JS client validation | Same JS | **Equivalent** | |
| COOP-FU-009 | Contact Phone Required | JS client + phone mask | Same | **Equivalent** | |
| COOP-FU-010 | Contact Auto-Population | `_userService.GetCRCUser` + `_addressService.GetContact` | `_claimActivityApiService.GetCRCUserAsync` + `GetContactAsync` | **Equivalent** | |
| COOP-FU-011 | Pre-Approval Number Entry | `txtAdCode` → blur → AJAX | Same | **Equivalent** | |
| COOP-FU-012 | Pre-Approval Lookup Modal | Modal with dealer select + table | Identical CSHTML | **Equivalent** | |
| COOP-FU-013 | Pre-Approval Validation | `_preapprovalService.GetPreapprovalBySearch`; status = APPROVED | `_claimActivityApiService.GetPreapprovalBySearchAsync` | **Equivalent** | Org structure check also migrated |
| COOP-FU-014 | Invoice File Upload | `OnPostUploadInvoiceFile` → disk | Same handler; verify path | **Partial** | File storage path not confirmed as API-backed |
| COOP-FU-015 | Supporting Documents Upload | `OnPostUploadFile` → disk | Same handler; verify path | **Partial** | Same concern as FU-014 |
| COOP-FU-016 | Invoice Amount Required | JS validation | Same | **Equivalent** | |
| COOP-FU-017 | Invoice Number Required | JS validation; maxlength=20 | Same | **Equivalent** | |
| COOP-FU-018 | Activity Date Validation | Server: future date error 400 + duplicate error 400 | Server: silently skips future/duplicate; **no 400 returned** | **Partial** | Missing server-side error responses (G-02, G-03) |
| COOP-FU-019 | Media Name Entry | `txtMediaName` client validation | Same | **Equivalent** | |
| COOP-FU-020 | Dealer ID Field | `OnGetVerifyDealerID` via `_dealerService` + `_programService` | `_coopApiService.GetDealersByBranchParentSeqSaaSAsync` + `GetProgramDataAsync` | **Equivalent** | |
| COOP-FU-021 | Activity Creative Type | `InsertActivityMediaTypeRequirement` via `_onlineClaimService` | `_coopApiService.InsertActivityMediaTypeRequirementAsync` | **Equivalent** | |
| COOP-FU-022 | Invoice Currency Selection | `_programService.getProgramCurrency` | `_coopApiService.GetProgramCurrencyAsync` | **Equivalent** | |
| COOP-FU-023 | Product Line Sum = 100% | Server: `total != 100 → 400 BadRequest` | Same validation in `OnPostSaveClaim` | **Equivalent** | |
| COOP-FU-024 | Vendor Information Form | `OnGetVendorList` + `OnGetVendorInformation` → `_addressService` direct | **Still calls `_addressService` directly** | **Partial** | G-01 — not migrated to API |
| COOP-FU-025 | Submitter Email Read-Only | Bound to `Model.Email` | Same | **Equivalent** | |
| COOP-FU-026 | Dealer Contacts Selection | `_addressService.GetContact(code=="coop")` | `_dealerInfoApiService.GetContactAsync` + filter | **Equivalent** | |
| COOP-FU-027 | Other Contacts Freeform | JS only | Same | **Equivalent** | |
| COOP-FU-028 | Submission Comment | `_commentService.updateComment` / `deleteComment` | `_claimActivityApiService.UpdateCommentAsync` / `_commonAPIService.DeleteCommentAsync` | **Equivalent** | |
| COOP-FU-029 | Dealer Type List | `_dealerService.GetDealerTypeByDealerNumberSeq` | `_coopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | **Equivalent** | |
| COOP-FU-030 | Budget Info & Currency Rates | `_budgetService` + `_addressService` + `_programService` | `_coopApiService` equivalents | **Equivalent** | |
| COOP-FU-031 | Product Line List | `_budgetService.GetProductLineByDealerNumberSeq` | `_coopApiService.GetProductLineByDealerNumberSeqAsync` | **Equivalent** | |
| COOP-FU-032 | OCR Invoice Scanning | `_oCRService` (Azure Form Recognizer); config from `_programService` | OCR config from `_coopApiService.GetProgramDataAsync`; OCR service unchanged; `UpdateOCRHit` via API | **Equivalent** | |
| COOP-FU-033 | Campaign Pre-Approval | Child media types in session from PA search | Same; `_claimActivityApiService.GetPreapprovalBySearchAsync` | **Equivalent** | |
| COOP-FU-034 | Dealer ID Verification | `_dealerService` + `_programService` | `_coopApiService` equivalents | **Equivalent** | |
| COOP-FU-035 | Corporate Dealer Auto-Bind | `_dealerSearch.SearchCorporateDealer()` | Same — `DealerSearch` not migrated | **Equivalent** | |
| COOP-FU-036 | Multi-Currency Conversion | `_programService.GetCurrencyConversionByDate` + `InsertCurrencyConversionLog` | `_coopApiService.GetCurrencyConversionByDateAsync` + `InsertCurrencyConversionLogAsync` | **Equivalent** | |
| COOP-FU-037 | Draft Save | `OnPostSaveClaim(SubmitFlag=false)` → `_onlineClaimService` | Same flow → `_coopApiService` | **Equivalent** | |
| COOP-FU-038 | Final Submit | `OnPostSaveClaim(SubmitFlag=true)` → `_onlineClaimService.CreateClaimAndActivityRecords` | `_coopApiService.CreateClaimAndActivityRecordsAsync` | **Equivalent** | |
| COOP-FU-039 | Resume Incomplete Claim | `_claimService.GetTempClaimByTempSeq` + `_onlineClaimService` | `_coopApiService.GetTempClaimByTempClaimSeqAsync` + `GetOnlineActivityTempByTempSeqAsync` | **Equivalent** | |
| COOP-FU-040 | Submit Another Claim | CSHTML buttons | Identical CSHTML | **Equivalent** | |
| COOP-FU-041 | Post-Submit Confirmation Email | `SendClaimEmailToUser` in `SubmitClaim.cshtml.cs` (Email partial) | `SubmitClaim.cshtml.Email.cs` — verify `IEmailService` dependency | **Partial** | G-04 — need to confirm email send path |
| COOP-FU-042 | Temp Claim Header Record | `USP_ONLINE_CLAIM_TEMP_U01` via `_onlineClaimService` | Same SP via `_coopApiService` | **Equivalent** | |
| COOP-FU-043 | Temp Activity Records | `USP_ONLINE_ACTIVITY_TEMP_U01` via `_onlineClaimService` | Same SP via `_coopApiService` | **Equivalent** | |
| COOP-FU-044 | Document Image Records | `_documentService.UpdateDocumentImage`; file on disk | Same handler; verify path | **Partial** | G-05 |
| COOP-FU-045 | Activity Product Line Records | `_activityService.UpdateOnlineActivityProduct` | `_coopApiService.UpdateOnlineActivityProductAsync` | **Equivalent** | Delete-then-reinsert both |
| COOP-FU-046 | Activity Date Records | `_activityService.UpdateOnlineActivityDate` | API equivalent; silently skip future | **Partial** | Silent skip vs. legacy error response (G-02) |
| COOP-FU-047 | Vendor Contact & Address | `_addressService.UpdateContact` + `updateAddress` | **Still `_addressService` direct — NOT migrated** | **Missing in Modern** | G-01 |
| COOP-FU-048 | Final Claim & Activity Promotion | `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` via `_onlineClaimService` | Same SP via `_coopApiService.CreateClaimAndActivityRecordsAsync` | **Equivalent** | |
| COOP-FU-049 | Email Contact Records | `SaveEmailsToClaim` → `_addressService.UpdateContact` | `SaveEmailsToClaim` — verify API migration | **Partial** | Need to confirm |
| COOP-FU-050 | Unauthenticated Access Redirect | `BasePageModel` + session check in `OnGet` | Same | **Equivalent** | |
| COOP-FU-051 | Dealer Data Scoping | `DealerNumberSeq` resolved in `OnGet`; session-locked | Same | **Equivalent** | |
| COOP-FU-052 | Pre-Approval Dealer Ownership | Org structure dealer list check | `_coopApiService.GetDealersListAsync` | **Equivalent** | |
| COOP-FU-053 | Encrypted Parameters | `_encryptDecrypt` on all IDs client-facing | Same `_encryptDecrypt` | **Equivalent** | |

---

## Gap Summary

| Gap ID | FU(s) | Description | Severity |
|---|---|---|---|
| G-01 | FU-024, FU-047 | `OnGetVendorInformation`, `OnGetVendorList`, `SaveVendorContact` still call `_addressService` directly (not via BackendAPI) | **High** |
| G-02 | FU-018, FU-046 | Modern `OnPostSaveClaim` removed the `400 BadRequest` response for future activity dates; modern silently skips | **Medium** |
| G-03 | FU-018 | Modern `OnPostSaveClaim` removed the `400 BadRequest` response for duplicate activity dates | **Medium** |
| G-04 | FU-041 | `SubmitClaim.cshtml.Email.cs` email send path not confirmed as API-migrated | **Medium** |
| G-05 | FU-014, FU-015, FU-044 | File upload storage path (physical disk) needs confirmation it works correctly in modern deployment | **Medium** |

---

## New in Modern

| FU | Description |
|---|---|
| `SubmitClaim.cshtml.Email.cs` | Email logic extracted to partial class (cleaner separation) |
| `IDealerBudgetApiService` injection | Separate budget API service alongside `ICoopApiService` for budget reads |
