# Coop — Submit Pre-Approval — Functional Coverage Matrix

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-19 | Pipeline: Step 2.5 (Gap Analysis)
> Input: `docs/functional-catalogs/coop/feature-submit-preapproval/functional-units.md`

---

## Functional Coverage Matrix

| FU ID | Title | Category | Legacy Source | Modern Source | Status | Gap Level |
|---|---|---|---|---|---|---|
| COOP-PA-FU-001 | Page Load and Initialization | UI | `SubmitPreapproval.cshtml.cs#OnGet` | Same handler — API clients | Full | — |
| COOP-PA-FU-002 | Fiscal Year Selection Step | UI | `SubmitPreApproval.cshtml` + `OnGet` | Same .cshtml + same handler | Full | — |
| COOP-PA-FU-003 | Dealer Search Step | UI | `_SearchDealer.cshtml` partial | Same shared partial | Full | — |
| COOP-PA-FU-004 | Media Type Tile Selection | UI | `_PreApprovalMediaType.cshtml` | Same .cshtml | Full | — |
| COOP-PA-FU-005 | Form Submission Step Rendering | UI | `_PreApprovalFormSubmission.cshtml` | Same .cshtml | Full | — |
| COOP-PA-FU-006 | Success Confirmation Panel | UI | `SubmitPreApproval.cshtml#CompleteConfirmationModel` | Same .cshtml | Full | — |
| COOP-PA-FU-007 | Campaign Title Field | DataEntry | `_PreApprovalFormSubmission.cshtml` + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-008 | Ad Includes Offer + Expiration Date | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-009 | Ad Landing Page URL (Single) | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-010 | Ad Landing Page URL (Multiple) | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-011 | Ad Title Field | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-012 | Show Name Field | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-013 | Show Location Fields | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-014 | Show Start and End Dates | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-015 | Expected Eligible Show Cost | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-016 | Participating Dealers (Group Shows) | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-017 | Equipment to Be Displayed | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-018 | Sponsorship Name and Dates | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-019 | Dealer ID Field (Conditional) | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-020 | File Upload (Dropzone) | DataEntry | `OnPostUploadFile` + `UpdateDocumentFile` | Same handler + `UpdateDocumentImageAsync` | Full | — |
| COOP-PA-FU-021 | Submission Comment | DataEntry | `ICommentService.updateComment` | `IClaimActivityApiService.UpdateCommentAsync` | Full | — |
| COOP-PA-FU-022 | Email — Me (Readonly) | DataEntry | Same .cshtml | Same .cshtml | Full | — |
| COOP-PA-FU-023 | Dealership Contacts Checkboxes | DataEntry | `IAddressService.GetContact` | `IClaimActivityApiService.GetContactAsync` | Full | — |
| COOP-PA-FU-024 | Other Contacts (Add/Remove) | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-025 | Campaign Media Type Selection | DataEntry | Same .cshtml + JS | Same .cshtml + JS | Full | — |
| COOP-PA-FU-026 | Preapproval Status Routing by Branch | BusinessLogic | `GetPreApprovalStatusByBranch` (identical code) | Same method — identical code | Full | — |
| COOP-PA-FU-027 | Dealer Type List Retrieval | BusinessLogic | `IDealerService.GetDealerTypeByDealerNumberSeq` | `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | Full | — |
| COOP-PA-FU-028 | Media Types Filtered by Fiscal Year | BusinessLogic | `IMediaService.GetMediaTypesBranchWithProgramSeq` | `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` | Full | — |
| COOP-PA-FU-029 | Media Type Requirements Batch vs Per-Type | BusinessLogic | `IMediaService.GetAllMediaTypesRequirementByProgramSeq` (1 batch call) | `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` (N calls per type) | Different | Low |
| COOP-PA-FU-030 | Program Extended Fields Configuration | BusinessLogic | `IProgramService.GetProgramData` | `IPreapprovalLetterApiService.GetProgramDataAsync` | Full | — |
| COOP-PA-FU-031 | Fiscal Year Determination | BusinessLogic | `IFiscalService` (direct) | `IFiscalService` (unchanged — not yet API-migrated) | Full | — |
| COOP-PA-FU-032 | Single Preapproval Submit Flow | Workflow | `IPreapprovalService.ProcessPreApproval(12 params)` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync(model)` | Full | — |
| COOP-PA-FU-033 | Campaign Child Preapproval Processing | Workflow | Server-side foreach loop, each child processed separately | Nested `ChildPreapprovals` in single API call | Different | Low |
| COOP-PA-FU-034 | Dealer Linked to Preapproval | Workflow | `IPreapprovalService.UpdatePreApprovalDealer` | `IPreapprovalSubmissionApiService.LinkDealerToPreapprovalAsync` | Full | — |
| COOP-PA-FU-035 | Parent Dealer Linked (Conditional) | Workflow | `IDealerService.GetDealerByDealerNumberSeq` + `UpdatePreApprovalDealer` | `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` + `LinkDealerToPreapprovalAsync` | Full | — |
| COOP-PA-FU-036 | Shows & Events Record Created | Workflow | `IDealerService.UpdateDealerShows(DealerShows{all fields including EquipmentList, Dealers, Cost, DlrRacf, Email})` | `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync(6 of 12 params)` | Partial | Medium |
| COOP-PA-FU-037 | Additional Info Saved (URL) | Workflow | `IPreapprovalService.SaveAdditionalInfoToPreApproval` | `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync` | Full | — |
| COOP-PA-FU-038 | Comment Inserted on Submission | Workflow | `ICommentService.updateComment` | `IClaimActivityApiService.UpdateCommentAsync` | Full | — |
| COOP-PA-FU-039 | Preapproval Header Record Created | DataPersistence | `IPreapprovalService.ProcessPreApproval` — direct DB | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` — via API | Full | — |
| COOP-PA-FU-040 | Document File Saved and Linked | DataPersistence | `IDocumentService.UpdateDocumentImage` | `IClaimActivityApiService.UpdateDocumentImageAsync` | Full | — |
| COOP-PA-FU-041 | Product Linked to Preapproval | DataPersistence | `IPreapprovalService.InsertPreapprovalProduct_SaaS` | `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync` | Full | — |
| COOP-PA-FU-042 | Email Contacts Saved to Preapproval | DataPersistence | `IAddressService.UpdateContact` per contact | `ICommonSupportService.UpdateContactAsync` per contact | Full | — |
| COOP-PA-FU-043 | Unauthenticated Access Protection | Security | `BasePageModel` auth | Same `BasePageModel` | Full | — |
| COOP-PA-FU-044 | Dealer Role — Own Dealer Number Seq | Security | `IsDealer + UserSession.Dealer_number_seq` | Same | Full | — |
| COOP-PA-FU-045 | Corp/Admin Role — Dealer Selection | Security | `SearchCorporateDealer()` + dealer search step | Same | Full | — |
| COOP-PA-FU-046 | Encrypted Parameter Handling | Security | `IEncryptDecrypt.Encrypt/Decrypt` | Same | Full | — |
| COOP-PA-FU-047 | Media Types Re-loaded During POST | BusinessLogic | Not present (legacy processes POST without media reload) | `GetMediaType(SelectedFiscalYear)` called at start of `OnPostProcessPreApproval` | New in Modern | Low |

---

## Coverage Summary

| Category | Total FUs | Full | Partial | Different | New in Modern | Coverage % |
|---|---|---|---|---|---|---|
| UI | 6 | 6 | 0 | 0 | 0 | 100% |
| DataEntry | 19 | 19 | 0 | 0 | 0 | 100% |
| BusinessLogic | 7 | 5 | 0 | 1 (FU-029) | 1 (FU-047) | 100% |
| Workflow | 7 | 5 | 1 (FU-036) | 1 (FU-033) | 0 | 85.7% |
| DataPersistence | 4 | 4 | 0 | 0 | 0 | 100% |
| Security | 4 | 4 | 0 | 0 | 0 | 100% |
| **TOTAL** | **47** | **43** | **1** | **2** | **1** | **97.9%** |

> **Coverage Note**: "Different" FUs (FU-029, FU-033) are functionally equivalent — output is identical, only implementation differs.
> "New in Modern" (FU-047) represents additional behavior in modern with no legacy equivalent — counted as covered.
> Only FU-036 (Partial) represents a genuine data persistence gap affecting Shows & Events supplemental fields.
