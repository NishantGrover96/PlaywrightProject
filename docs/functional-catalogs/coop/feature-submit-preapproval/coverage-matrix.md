# Coop — Submit Pre-Approval — Functional Coverage Matrix

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-17 | Pipeline: Step 2.5 (Gap Analysis)

---

## Functional Coverage Matrix

| FU ID | Title | Category | Legacy | Modern | Status | Gap Level |
|---|---|---|---|---|---|---|
| COOP-PA-FU-001 | Page Load and Initialization | UI | `SubmitPreapproval.cshtml.cs#OnGet` | `SubmitPreapproval.cshtml.cs#OnGet` (API) | Full | — |
| COOP-PA-FU-002 | Fiscal Year Selection Step | UI | `OnGet` + `SubmitPreApproval.cshtml` | Same | Full | — |
| COOP-PA-FU-003 | Dealer Search Step | UI | `SubmitPreApproval.cshtml` shared partials | Same .cshtml | Full | — |
| COOP-PA-FU-004 | Media Type Tile Selection | UI | `_PreApprovalMediaType.cshtml` + `IMediaService` | Same .cshtml + `IClaimActivityApiService` | Full | — |
| COOP-PA-FU-005 | Form Submission Step Rendering | UI | `_PreApprovalFormSubmission.cshtml` | Same .cshtml | Full | — |
| COOP-PA-FU-006 | Success Confirmation Panel | UI | `SubmitPreApproval.cshtml` success block | Same .cshtml | Full | — |
| COOP-PA-FU-007 | Campaign Title Field | DataEntry | `_PreApprovalFormSubmission.cshtml` + JS | Same | Full | — |
| COOP-PA-FU-008 | Ad Includes Offer + Expiration Date | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-009 | Ad Landing Page URL (Single) | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-010 | Ad Landing Page URL (Multiple) | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-011 | Ad Title Field | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-012 | Show Name Field | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-013 | Show Location Fields | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-014 | Show Start and End Dates | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-015 | Expected Eligible Show Cost | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-016 | Participating Dealers (Group Shows) | DataEntry | Same .cshtml + JS (client-side collect) | Same | Full | — |
| COOP-PA-FU-017 | Equipment to Be Displayed | DataEntry | Same .cshtml + JS (client-side collect) | Same | Full | — |
| COOP-PA-FU-018 | Sponsorship Name and Dates | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-019 | Dealer ID Field | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-020 | File Upload (Dropzone) | DataEntry | `_PreApprovalFormSubmission.cshtml` + `IDocumentService` | Same .cshtml + `IClaimActivityApiService` | Full | — |
| COOP-PA-FU-021 | Submission Comment | DataEntry | Same .cshtml + `ICommentService` | Same + `IClaimActivityApiService` | Full | — |
| COOP-PA-FU-022 | Email — Me | DataEntry | Same .cshtml | Same | Full | — |
| COOP-PA-FU-023 | Dealership Contacts | DataEntry | `IAddressService.GetContact` | `IClaimActivityApiService.GetContactAsync` | Full | — |
| COOP-PA-FU-024 | Other Contacts | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-025 | Campaign Media Type Selection | DataEntry | Same .cshtml + JS | Same | Full | — |
| COOP-PA-FU-026 | Preapproval Status Routing | BusinessLogic | `GetPreApprovalStatusByBranch` | Identical code | Full | — |
| COOP-PA-FU-027 | Dealer Type List | BusinessLogic | `IDealerService.GetDealerTypeByDealerNumberSeq` | `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | Full | — |
| COOP-PA-FU-028 | Media Types by Fiscal Year | BusinessLogic | `IMediaService.GetMediaTypesBranchWithProgramSeq` | `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` | Full | — |
| COOP-PA-FU-029 | Media Type Requirements | BusinessLogic | `IMediaService.GetAllMediaTypesRequirementByProgramSeq` (batch) | `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` (per-type) | Different | Low |
| COOP-PA-FU-030 | Program Extended Fields | BusinessLogic | `IProgramService.GetProgramData` | `IPreapprovalLetterApiService.GetProgramDataAsync` | Full | — |
| COOP-PA-FU-031 | Fiscal Year Determination | BusinessLogic | `IFiscalService` (unchanged) | Same | Full | — |
| COOP-PA-FU-032 | Single Preapproval Submit | Workflow | `IPreapprovalService.ProcessPreApproval` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` | Full | — |
| COOP-PA-FU-033 | Campaign Child Preapprovals | Workflow | Loop `ProcessPreApproval` per child | `ChildPreapprovals` nested in single API call | Different | Low |
| COOP-PA-FU-034 | Dealer Linked to Preapproval | Workflow | `IPreapprovalService.UpdatePreApprovalDealer` | `LinkDealerToPreapprovalAsync` | Full | — |
| COOP-PA-FU-035 | Parent Dealer Linked | Workflow | `IDealerService.GetDealerByDealerNumberSeq` + `UpdatePreApprovalDealer` | `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` + `LinkDealerToPreapprovalAsync` | Full | — |
| COOP-PA-FU-036 | Shows & Events Record | Workflow | `IDealerService.UpdateDealerShows` (full fields) | `LinkShowToPreapprovalAsync` (6 fields only) | **Partial** | **Medium** |
| COOP-PA-FU-037 | Additional Info Saved (URL) | Workflow | `IPreapprovalService.SaveAdditionalInfoToPreApproval` | `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync` | Full | — |
| COOP-PA-FU-038 | Comment Inserted | Workflow | `ICommentService.updateComment` | `IClaimActivityApiService.UpdateCommentAsync` | Full | — |
| COOP-PA-FU-039 | Preapproval Header Record | DataPersistence | `IPreapprovalService.ProcessPreApproval` (SP call) | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` (API) | Full | — |
| COOP-PA-FU-040 | Document File Saved | DataPersistence | `IDocumentService.UpdateDocumentImage` | `IClaimActivityApiService.UpdateDocumentImageAsync` | Full | — |
| COOP-PA-FU-041 | Product Linked | DataPersistence | `IPreapprovalService.InsertPreapprovalProduct_SaaS` | `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync` | Full | — |
| COOP-PA-FU-042 | Email Contacts Saved | DataPersistence | `IAddressService.UpdateContact` | `ICommonSupportService.UpdateContactAsync` | Full | — |
| COOP-PA-FU-043 | Unauthenticated Access | Security | `BasePageModel` | Same | Full | — |
| COOP-PA-FU-044 | Dealer Role — Own Data | Security | `UserSession.Dealer_number_seq` | Same | Full | — |
| COOP-PA-FU-045 | Corp/Admin Dealer Selection | Security | `SearchCorporateDealer()` | Same | Full | — |
| COOP-PA-FU-046 | Encrypted Parameters | Security | `IEncryptDecrypt` | Same | Full | — |

---

## Coverage Summary

| Category | Total FUs | Full | Partial | Missing | Coverage % |
|---|---|---|---|---|---|
| UI | 6 | 6 | 0 | 0 | 100.0% |
| DataEntry | 19 | 19 | 0 | 0 | 100.0% |
| BusinessLogic | 6 | 6 | 0 | 0 | 100.0% |
| Workflow | 7 | 6 | 1 | 0 | 85.7% |
| DataPersistence | 4 | 4 | 0 | 0 | 100.0% |
| Security | 4 | 4 | 0 | 0 | 100.0% |
| **TOTAL** | **46** | **45** | **1** | **0** | **97.8%** |

---

## Gap Levels Summary

| Level | Count | FU IDs |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | COOP-PA-FU-036 |
| Low | 1 | COOP-PA-FU-029, COOP-PA-FU-033 (different but functionally equivalent) |
