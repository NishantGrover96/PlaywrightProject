# Coop - Submit Pre-Approval - Migration Mapping

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-19 | Pipeline: Step 2 (Functional Unit Discovery - Re-run)

---

| FU ID | Title | Legacy Implementation | Modern Implementation | Equivalence | Notes |
|---|---|---|---|---|---|
| COOP-PA-FU-001 | Page Load and Initialization | `SubmitPreapproval.cshtml.cs#OnGet` - `IMediaService`, `IFiscalService`, `IProgramService` | `SubmitPreapproval.cshtml.cs#OnGet` - `IClaimActivityApiService`, `IFiscalService`, `IPreapprovalLetterApiService` | Equivalent | Same page, API clients replace direct services |
| COOP-PA-FU-002 | Fiscal Year Selection Step | `OnGet` - `IFiscalService`, cutoff logic; `.cshtml` radio buttons | Same `OnGet` - `IFiscalService` unchanged; same .cshtml | Equivalent | IFiscalService not yet migrated to API - same behavior |
| COOP-PA-FU-003 | Dealer Search Step | `SubmitPreApproval.cshtml` - shared `_SearchDealer.cshtml` | Same .cshtml | Equivalent | UI identical |
| COOP-PA-FU-004 | Media Type Tile Selection | `GetMediaType` - `IMediaService.GetMediaTypesBranchWithProgramSeq` | `GetMediaType` - `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` | Equivalent | Same filtering logic, API replaces direct DB |
| COOP-PA-FU-005 | Form Submission Step Rendering | `_PreApprovalFormSubmission.cshtml` | Same .cshtml | Equivalent | UI identical |
| COOP-PA-FU-006 | Success Confirmation Panel | `SubmitPreApproval.cshtml` - `#CompleteConfirmationModel` | Same .cshtml | Equivalent | UI identical |
| COOP-PA-FU-007 | Campaign Title Field | `_PreApprovalFormSubmission.cshtml` + `jsSubmitPreApproval.js` | Same .cshtml + same .js | Equivalent | Same validation |
| COOP-PA-FU-008 | Ad Includes Offer + Expiration Date | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-009 | Ad Landing Page URL (Single) | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-010 | Ad Landing Page URL (Multiple) | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-011 | Ad Title Field | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-012 | Show Name Field | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-013 | Show Location Fields | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-014 | Show Start and End Dates | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-015 | Expected Eligible Show Cost | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-016 | Participating Dealers (Group Shows) | Same .cshtml + JS | Same .cshtml + JS | Equivalent | Client-side collection; gap is in persistence (FU-036) |
| COOP-PA-FU-017 | Equipment to Be Displayed | Same .cshtml + JS | Same .cshtml + JS | Equivalent | Client-side collection; gap is in persistence (FU-036) |
| COOP-PA-FU-018 | Sponsorship Name and Dates | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-019 | Dealer ID Field | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-020 | File Upload (Dropzone) | Same .cshtml; `OnPostUploadFile` + `UpdateDocumentFile` via `IDocumentService` | Same .cshtml; `UpdateDocumentFile` via `IClaimActivityApiService.UpdateDocumentImageAsync` | Equivalent | Upload handler same; document link via API |
| COOP-PA-FU-021 | Submission Comment | Same .cshtml; `ICommentService.updateComment` | Same .cshtml; `IClaimActivityApiService.UpdateCommentAsync` | Equivalent | - |
| COOP-PA-FU-022 | Email - Me | Same .cshtml | Same .cshtml | Equivalent | - |
| COOP-PA-FU-023 | Dealership Contacts | `IAddressService.GetContact(DealerNumber, "coop")` | `IClaimActivityApiService.GetContactAsync(DealerNumber, "coop")` | Equivalent | - |
| COOP-PA-FU-024 | Other Contacts | Same .cshtml + JS | Same .cshtml + JS | Equivalent | - |
| COOP-PA-FU-025 | Campaign Media Type Selection | Same .cshtml + JS; child preapprovals JS-collected | Same .cshtml + JS | Equivalent | Client-side identical |
| COOP-PA-FU-026 | Preapproval Status Routing | `GetPreApprovalStatusByBranch` - same logic | `GetPreApprovalStatusByBranch` - identical code | Equivalent | Code copy identical |
| COOP-PA-FU-027 | Dealer Type List | `IDealerService.GetDealerTypeByDealerNumberSeq` | `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | Equivalent | Same encrypted seq response |
| COOP-PA-FU-028 | Media Types by Fiscal Year | `IMediaService.GetMediaTypesBranchWithProgramSeq(programSeq, 0, fiscalYear, localeSeq)` | `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync(programSeq, 0, fiscalYear, localeSeq)` | Equivalent | Same parameters |
| COOP-PA-FU-029 | Media Type Requirements | `IMediaService.GetAllMediaTypesRequirementByProgramSeq` (batch, all types) | `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` (per type, N+1) | Different | Modern makes N API calls instead of 1 batch. Functionally equivalent output. Performance regression for programs with many media types. |
| COOP-PA-FU-030 | Program Extended Fields | `IProgramService.GetProgramData(programSeq, "PreapprovalFields")` | `IPreapprovalLetterApiService.GetProgramDataAsync(programSeq, "PreapprovalFields")` | Equivalent | - |
| COOP-PA-FU-031 | Fiscal Year Determination | `_webHelper.GetCurrentAndPreviousFiscalYearDates` + `IFiscalService` | Same (IFiscalService not migrated) | Equivalent | - |
| COOP-PA-FU-032 | Single Preapproval Submit | `IPreapprovalService.ProcessPreApproval(12 params)` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync(SubmitPreapprovalApiModel)` | Equivalent | All params mapped in `MapToSubmitPreapprovalApiModel` |
| COOP-PA-FU-033 | Campaign Child Preapprovals | `OnPostProcessPreApproval` loops `ChildPreapprovalList`, calls `ProcessPreApproval(child, parentSeq)` for each | `MapToSubmitPreapprovalApiModel` maps `ChildPreapprovalList -> ChildPreapprovals` in single API call | Different | Modern sends parent+children in one API request. Legacy processes each separately with explicit parent link. Functionally equivalent. |
| COOP-PA-FU-034 | Dealer Linked to Preapproval | `IPreapprovalService.UpdatePreApprovalDealer(0, seq, dealerSeq, ref out)` | `IPreapprovalSubmissionApiService.LinkDealerToPreapprovalAsync(0, seq, dealerSeq)` | Equivalent | - |
| COOP-PA-FU-035 | Parent Dealer Linked | `IDealerService.GetDealerByDealerNumberSeq(parentSeq)` -> `UpdatePreApprovalDealer` | `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync(parentSeq)` -> `LinkDealerToPreapprovalAsync` | Equivalent | - |
| COOP-PA-FU-036 | Shows & Events Record | `IDealerService.UpdateDealerShows(DealerShows{EquipmentList, Dealers, Cost, Email, DlrRacf, DlrFormStatus, ShowType, ...})` | `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync(seq, dealerSeq, showDate, showName, location, showType)` | **Partial** | **Gap**: EquipmentList, Dealers (group), ShowCost, DlrRacf, and Email NOT passed to modern API. These fields may not be persisted in modern. |
| COOP-PA-FU-037 | Additional Info Saved (URL) | `IPreapprovalService.SaveAdditionalInfoToPreApproval(seq, URL, "URL")` | `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync(seq, "URL", URL)` | Equivalent | Parameter order differs; semantics same |
| COOP-PA-FU-038 | Comment Inserted | `ICommentService.updateComment(UpdateComment{Preapproval, EXTERNAL, ...})` | `IClaimActivityApiService.UpdateCommentAsync(UpdateCommentApiModel{...})` | Equivalent | Same fields mapped |
| COOP-PA-FU-039 | Preapproval Header Record | `IPreapprovalService.ProcessPreApproval(programSeq, 0, activityCodeSeq, mediaTypeSeq, title, receivedDate, firstOpenDate, startDate, endDate, status, ref seqOut, source, userName, roleShortName, parentSeq, crcUserSeq, mediaUserCompanySeq, amount, advertisedAmt, percent)` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync(SubmitPreapprovalApiModel)` | Equivalent | All fields mapped |
| COOP-PA-FU-040 | Document File Saved and Linked | `IDocumentService.UpdateDocumentImage(0, docTypeSeq, table, seq, fileName, ref outSeq)` | `IClaimActivityApiService.UpdateDocumentImageAsync(UpdateDocumentImageApiModel)` | Equivalent | - |
| COOP-PA-FU-041 | Product Linked to Preapproval | `IPreapprovalService.InsertPreapprovalProduct_SaaS(programSeq, divisionSeq, preapprovalSeq, fiscalYear)` | `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync(preapprovalSeq, fiscalYear, divisionSeq)` | Equivalent | - |
| COOP-PA-FU-042 | Email Contacts Saved | `IAddressService.UpdateContact(0, Preapproval, seq, name, ..., email, position)` per contact | `ICommonSupportService.UpdateContactAsync(0, Preapproval, seq, name, ..., email, position)` per contact | Equivalent | - |
| COOP-PA-FU-043 | Unauthenticated Access Protection | `BasePageModel` auth | Same | Equivalent | - |
| COOP-PA-FU-044 | Dealer Role - Own Dealer Number | `_webHelper.IsDealer(UserSession.Role)` + `UserSession.Dealer_number_seq` | Same | Equivalent | - |
| COOP-PA-FU-045 | Corp/Admin Dealer Selection | `_dealerSearch.SearchCorporateDealer()` | Same | Equivalent | - |
| COOP-PA-FU-046 | Encrypted Parameter Handling | `IEncryptDecrypt.Encrypt/Decrypt` | Same | Equivalent | - |
| COOP-PA-FU-047 | Media Types Re-loaded During POST | Not present - POST handler processes submitted data directly without media reload | `OnPostProcessPreApproval` calls `GetMediaType(SelectedFiscalYear)` at start; required by `MapToSubmitPreapprovalApiModel` to look up media metadata | New in Modern | Additional API dependency during POST. If `SelectedFiscalYear` binding fails or API call fails, submission mapping breaks. |

---

## Summary

| Equivalence | Count |
|---|---|
| Equivalent | 43 |
| Different (but functionally equivalent) | 2 (FU-029, FU-033) |
| Partial (gap exists) | 1 (FU-036) |
| New in Modern | 1 (FU-047) |
| Missing in Modern | 0 |
| **Total** | **47** |
