# Coop — Submit Claim : Functional Coverage Matrix

> Generated: 2026-06-17
> Pipeline step: Step 2.5 — Gap Analysis
> Module: `coop` | Feature: `submit-claim`

---

## Functional Coverage Matrix

| FU ID | Title | Category | Legacy | Modern | Status | Gap Level |
|---|---|---|---|---|---|---|
| COOP-FU-001 | Page Load & Auth Redirect | UI | `OnGet` direct services | `OnGet` async API calls | Full | — |
| COOP-FU-002 | Fiscal Year Selection Display | UI | `_fiscalService` + date math | Same (unchanged) | Full | — |
| COOP-FU-003 | Claim Type Radio | UI | CSHTML + JS | Identical CSHTML + JS | Full | — |
| COOP-FU-004 | Dealer Search Step | UI | `_dealerSearch.SearchCorporateDealer` | Same (DealerSearch not API-migrated) | Full | — |
| COOP-FU-005 | Media Type Grid Rendering | UI | `IMediaService` direct | `ClaimActivityApiService` API | Full | — |
| COOP-FU-006 | Budget Available Display | UI | `BudgetAvaiable = "$0.00"` on load | Same | Full | — |
| COOP-FU-007 | Contact Name Required | DataEntry | JS client validation | Identical JS | Full | — |
| COOP-FU-008 | Contact Email Required | DataEntry | JS: required + email regex | Identical JS | Full | — |
| COOP-FU-009 | Contact Phone Required | DataEntry | JS: phone format if provided | Identical JS | Full | — |
| COOP-FU-010 | Contact Auto-Population | DataEntry | `_userService` + `_addressService` | `_claimActivityApiService` API | Full | — |
| COOP-FU-011 | Pre-Approval Number Entry | DataEntry | `txtAdCode` → AJAX validate | Identical | Full | — |
| COOP-FU-012 | Pre-Approval Lookup Modal | DataEntry | Modal CSHTML + AJAX | Identical CSHTML | Full | — |
| COOP-FU-013 | Pre-Approval Validation | DataEntry | `_preapprovalService` direct | `_claimActivityApiService` API | Full | — |
| COOP-FU-014 | Invoice File Upload | DataEntry | `OnPostUploadInvoiceFile` → disk | Same handler; doc save via API | Full | — |
| COOP-FU-015 | Supporting Documents Upload | DataEntry | `OnPostUploadFile` → disk | Same handler; doc save via API | Full | — |
| COOP-FU-016 | Invoice Amount Required | DataEntry | JS: required + currency format | Identical JS | Full | — |
| COOP-FU-017 | Invoice Number Required | DataEntry | JS: required; maxlength=20 | Identical JS | Full | — |
| COOP-FU-018 | Activity Date Validation | DataEntry | JS: dup/future client; **Server: HTTP 400 future + dup** | JS identical; **Server: silent skip, no 400** | **Partial** | **High** |
| COOP-FU-019 | Media Name Entry | DataEntry | `txtMediaName`; JS required | Identical | Full | — |
| COOP-FU-020 | Dealer ID Field | DataEntry | `OnGetVerifyDealerID` via legacy services | Via `_coopApiService` API | Full | — |
| COOP-FU-021 | Activity Creative Type | DataEntry | `InsertActivityMediaTypeRequirement` | `_coopApiService` API | Full | — |
| COOP-FU-022 | Invoice Currency Selection | DataEntry | `_programService` direct | `_coopApiService` API | Full | — |
| COOP-FU-023 | Product Line Sum = 100% | DataEntry | Server: HTTP 400 if total ≠ 100 | Same validation; HTTP 400 | Full | — |
| COOP-FU-024 | Vendor Information Form | DataEntry | `OnGetVendorList/Info` → `_addressService` | **READ still `_addressService` direct; WRITE migrated to API** | **Partial** | **High** |
| COOP-FU-025 | Submitter Email Read-Only | DataEntry | Bound to `Model.Email` | Same | Full | — |
| COOP-FU-026 | Dealer Contacts Selection | DataEntry | `_addressService.GetContact` direct | `_dealerInfoApiService` API | Full | — |
| COOP-FU-027 | Other Contacts Freeform | DataEntry | JS only | Identical JS | Full | — |
| COOP-FU-028 | Submission Comment | DataEntry | `_commentService` direct | `_claimActivityApiService` API | Full | — |
| COOP-FU-029 | Dealer Type List | BusinessLogic | `_dealerService` direct | `_coopApiService` API | Full | — |
| COOP-FU-030 | Budget Info & Currency Rates | BusinessLogic | `_budgetService` + `_addressService` + `_programService` | `_coopApiService` API | Full | — |
| COOP-FU-031 | Product Line List | BusinessLogic | `_budgetService` direct | `_coopApiService` API | Full | — |
| COOP-FU-032 | OCR Invoice Scanning | BusinessLogic | `_oCRService` + `_programService` config | OCR service unchanged; config from `_coopApiService` | Full | — |
| COOP-FU-033 | Campaign Pre-Approval | BusinessLogic | `_preapprovalService` + session | `_claimActivityApiService` API + session | Full | — |
| COOP-FU-034 | Dealer ID Verification | BusinessLogic | `_dealerService` + `_programService` | `_coopApiService` API | Full | — |
| COOP-FU-035 | Corporate Dealer Auto-Bind | BusinessLogic | `_dealerSearch.SearchCorporateDealer` | Same (unchanged) | Full | — |
| COOP-FU-036 | Multi-Currency Conversion | BusinessLogic | `_programService` direct | `_coopApiService` API | Full | — |
| COOP-FU-037 | Draft Save | Workflow | `OnPostSaveClaim(false)` → `_onlineClaimService` | Same flow → `_coopApiService` | Full | — |
| COOP-FU-038 | Final Submit | Workflow | `_onlineClaimService.CreateClaimAndActivityRecords` | `_coopApiService.CreateClaimAndActivityRecordsAsync` | Full | — |
| COOP-FU-039 | Resume Incomplete Claim | Workflow | `_claimService` + `_onlineClaimService` direct | `_coopApiService` API | Full | — |
| COOP-FU-040 | Submit Another Claim | Workflow | CSHTML buttons | Identical CSHTML | Full | — |
| COOP-FU-041 | Post-Submit Confirmation Email | Workflow | `_emailService.SendEmailAsync` (legacy) | **Same `_emailService` — NOT API migrated; functional** | **Partial** | **Medium** |
| COOP-FU-042 | Temp Claim Header Record | DataPersistence | `USP_ONLINE_CLAIM_TEMP_U01` via legacy | Same SP via `_coopApiService` API | Full | — |
| COOP-FU-043 | Temp Activity Records | DataPersistence | `USP_ONLINE_ACTIVITY_TEMP_U01` via legacy | Same SP via `_coopApiService` API | Full | — |
| COOP-FU-044 | Document Image Records | DataPersistence | `_documentService.UpdateDocumentImage` | `_claimActivityApiService.UpdateDocumentImageAsync` | Full | — |
| COOP-FU-045 | Activity Product Line Records | DataPersistence | Delete + Insert via `_activityService` | **Delete via `_activityService` (legacy); Insert via `_coopApiService` API** | **Partial** | **High** |
| COOP-FU-046 | Activity Date Records | DataPersistence | `DeleteOnlineActivityDate` + `UpdateOnlineActivityDate` | **Not implemented — no date persistence code in modern** | **Missing** | **Critical** |
| COOP-FU-047 | Vendor Contact & Address | DataPersistence | `_addressService.UpdateContact` + `updateAddress` | `_commonAPIService.UpdateContactU01Async` + `UpdateAddressWithSeqAsync` | Full | — |
| COOP-FU-048 | Final Claim & Activity Promotion | DataPersistence | `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` via legacy | Same SP via `_coopApiService` API | Full | — |
| COOP-FU-049 | Email Contact Records | DataPersistence | `_addressService.UpdateContact` direct | `_commonAPIService.UpdateContactU01Async` | Full | — |
| COOP-FU-050 | Unauthenticated Access Redirect | Security | `BasePageModel` + session check | Same | Full | — |
| COOP-FU-051 | Dealer Data Scoping | Security | `DealerNumberSeq` session-locked | Same | Full | — |
| COOP-FU-052 | Pre-Approval Dealer Ownership | Security | Org structure dealer list check | `_coopApiService.GetDealersListAsync` | Full | — |
| COOP-FU-053 | Encrypted Parameters | Security | `_encryptDecrypt` on all IDs | Same | Full | — |

---

## Coverage Summary

| Category | Total FUs | Full | Partial | Missing | Coverage % |
|---|---|---|---|---|---|
| UI | 6 | 6 | 0 | 0 | **100.0%** |
| DataEntry | 22 | 20 | 2 | 0 | **95.5%** |
| BusinessLogic | 8 | 8 | 0 | 0 | **100.0%** |
| Workflow | 5 | 4 | 1 | 0 | **90.0%** |
| DataPersistence | 8 | 6 | 1 | 1 | **81.25%** |
| Security | 4 | 4 | 0 | 0 | **100.0%** |
| **TOTAL** | **53** | **48** | **4** | **1** | **94.3%** |

> Coverage formula: (Full + Partial × 0.5) / Total

---

## Gap Level Summary

| Level | Count | FU IDs |
|---|---|---|
| Critical | 1 | FU-046 |
| High | 3 | FU-018, FU-024, FU-045 |
| Medium | 1 | FU-041 |
| Low | 0 | — |
| **Total gaps** | **5** | |
