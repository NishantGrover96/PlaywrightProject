# Coop — Submit Pre-Approval — Discovery Report

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-19 | Pipeline: Step 1 (Repository Discovery)
> Analyst: Migration QA Framework re-run

---

## Legacy Source Files

| File | Purpose |
|---|---|
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreApproval.cshtml` | Main page template — 4-step wizard (fiscal year, dealer, media type, form submission) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.cs` | Page model — all handlers, business logic, service calls (67,602 bytes) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.Email.cs` | Email sending partial class (12,122 bytes) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalMediaType.cshtml` | Step 2: Media type tile selection + dealer type dropdown |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalFormSubmission.cshtml` | Step 3: Full submission form — all branch-specific field blocks (36,187 bytes) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalProcess.cshtml` | Legacy process form partial (additional field layout) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalProcessHeader.cshtml` | Process header partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreapprovalFields1.cshtml` | Extended fields partial (program-specific) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_ExternalPreApprovalMedia.cshtml` | External media type UI partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_RecentDealerViewed.cshtml` | Recently viewed dealers panel |
| `Presentation\Web\wwwroot\WebScripts\CoopManagement\PreApproval\jsSubmitPreApproval.js` | Client-side: wizard navigation, form validation, AJAX handlers |
| `Libraries\BusinessLogic\Services\Preapproval\` | Legacy service implementations (IPreapprovalService, ICommentService) |
| `Libraries\CommonEntity\Preapproval\` | Legacy entity models (PreApprovalInformation, DealerShows) |
| `RAL\Resources\Coop\ViewResource.en-US.resx` | Validation message strings (en-US) |
| `RAL\Resources\Coop\ViewResource.en-CA.resx` | Validation message strings (en-CA) |
| `RAL\Resources\Coop\ViewResource.fr-CA.resx` | Validation message strings (fr-CA) |
| `tests\playwright\coop\tests\preapproval\pa-wizard.spec.ts` | Existing wizard navigation tests |
| `tests\playwright\coop\tests\preapproval\pa-form-media.spec.ts` | Existing form/media tests |
| `tests\playwright\coop\tests\preapproval\pa-smoke.spec.ts` | Existing smoke tests |
| `tests\playwright\coop\tests\preapproval\pa-submission.spec.ts` | Existing submission tests |
| `tests\playwright\coop\tests\preapproval\pa-e2e.spec.ts` | Existing E2E flow tests |

---

## Modern Source Files

| File | Purpose |
|---|---|
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreApproval.cshtml` | Same view template (identical .cshtml files) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.cs` | Modern page model — replaces direct DB services with API clients (71,715 bytes) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.Email.cs` | Email sending partial class (11,890 bytes) |
| `Presentation\Web\Infrastructure\ApiClients\Coop\` | Coop API client interfaces and implementations |
| `Presentation\Web\Models\PreApproval\` | Modern view models |
| `Presentation\Web\Models\PreapprovalModel\` | Additional preapproval models (SubmitPreapprovalApiModel) |
| `WebAPI\API\Models\Preapproval\` | API-side preapproval models |

---

## UI Components (Legacy)

### Wizard Steps
- **Step 0** (conditional): `#hdnShowFiscalYearSelection` — fiscal year radio buttons (`.fiscalYearRadio`); `#ContinueAfterZero` button
- **Step 1** (conditional): `_SearchDealer.cshtml` + `_DealerSearchList.cshtml` shared partials; shown when no dealer pre-selected
- **Step 2**: `_PreApprovalMediaType.cshtml` — `#PreapprovalMediaList` ul; `.clsSelectMediaType` tiles; `#programDealerTypeDropdown`; `#btnContinue`
- **Step 3**: `_PreApprovalFormSubmission.cshtml` — all form fields; `#btnSubmitPreApproval`

### Key Form Fields
| Field ID | Label | Type | Max | Required |
|---|---|---|---|---|
| `#txtCampaingTitle` | Campaign Title | text | 100 | Yes (campaign) |
| `#chkAdOfferCampaign` / `#chkAdOffer` | This Ad Includes an Offer | checkbox | — | No |
| `#hdtxtCalExpirationDateCampaign` | Earliest Expiration Date | date | — | When offer checked |
| `#txtAdLandingURL` | Ad Landing Page URL | text | 550 | Per media config |
| `#txtAdLandingURLMultiple` | Ad Landing Page URL (multiple) | textarea | 550 | Per media config |
| `#txtAdTitle` | Ad Title | text | 100 | Yes (mainbranch) |
| `#txtShowsAdTitle` | Show Name | text | 100 | Yes (indvshow/grpshow) |
| `#txtShowsLocationAddress` | Address | text | 100 | Yes (show) |
| `#txtShowsLocationCity` | City | text | 25 | Yes (show) |
| `#txtShowsLocationState` | State/Province | text | 25 | Yes (show) |
| `#txtShowsLocationZip` | Zip/Postal Code | text | 7 | Yes (show) |
| `#hdtxtCalShowsStartDate` | Start Date | date | — | Yes (show) |
| `#hdtxtCalShowsEndDate` | End Date | date | — | Yes (show) |
| `#txtShowsEligibleCost` | Expected Eligible Show Cost | text | 12 | Yes (show) |
| `#txtGroupDealerNumber` | Participating Dealer Number | text | 50 | Yes (grpshow) |
| `#txtEquipmentName` | Equipment to be Displayed | text | 50 | No |
| `#txtSponsorshipAdTitle` | Name of Sponsorship | text | 100 | Yes (sponsor) |
| `#hdtxtCalSponsorShipStartDate` | Sponsorship Start Date | date | — | Yes (sponsor) |
| `#hdtxtCalSponsorShipEndDate` | Sponsorship End Date | date | — | Yes (sponsor) |
| `#txtDealerIdText` | Dealer ID | text | 100 | Per media config |
| `#dropzone_fuBGImage` | File Upload (Dropzone) | file | — | Yes (per media config) |
| `#txtMainComment` | Submission Comment | textarea | 500 | No |
| `#txtEmailMe` | Me (email) | text (readonly) | — | Yes |
| `.clsDealerShipContact` | Dealership Contacts | checkbox | — | No |
| `#txtOtherMediaContact` | Other Contacts | text | — | No |

### Success Panel
- `#CompleteConfirmationModel` — confirmation number (`#spnPreApprovalConfirmationNumber`), email instructions, activity link, "Submit Another"/"Submit New" buttons

---

## Page Handlers (Both Legacy and Modern)

| Handler | Method | Purpose |
|---|---|---|
| `OnGet` | GET | Page initialization — fiscal year, media types, dealer setup |
| `OnGetDealerTypeList` | GET | AJAX — populate dealer type dropdown |
| `OnPostProcessPreApproval` | POST | Submit preapproval (main flow) |
| `OnPostUploadFile` | POST | Stage uploaded file |
| `OnPostRemoveFile` | POST | Remove staged file |
| `OnGetCheckDealer` | GET | Validate dealer number |
| `OnPostBindState` | POST | Load states for country |
| `OnPostBindCorpDealer` | POST | Auto-match corporate dealer |
| `OnPostSearchDealer` | POST | Dealer search |
| `OnPostSelectDealer` | POST | Select dealer by number |
| `OnPostGetDealerMediaContact` | POST | Get dealer's coop email contacts |
| `OnPostGetRecentDealerViewed` | POST | Get recently viewed dealers |
| `OnPostSelectPreApproval` | POST | Media type selection response |
| `OnGetVerifyDealer` | GET | Verify group show dealer contract |

---

## Services Comparison

| Service | Legacy | Modern Equivalent |
|---|---|---|
| Division loading | `IDivisionService.GetDivisionByProgramSeq` | `ICommonSupportService.GetDivisionListByProgramAsync` |
| Dealer name | `IDealerService.GetDealerName` | `IDealerApiService.GetDealerNameByProgramSeqAsync` |
| Dealer type | `IDealerService.GetDealerTypeByDealerNumberSeq` | `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` |
| Media types | `IMediaService.GetMediaTypesBranchWithProgramSeq` | `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` |
| Media requirements | `IMediaService.GetAllMediaTypesRequirementByProgramSeq` (batch) | `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` (N+1 per type) |
| Extended fields | `IProgramService.GetProgramData(seq, "PreapprovalFields")` | `IPreapprovalLetterApiService.GetProgramDataAsync(seq, "PreapprovalFields")` |
| Preapproval submit | `IPreapprovalService.ProcessPreApproval(12+ params)` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync(SubmitPreapprovalApiModel)` |
| Campaign children | Server-side foreach loop in handler | Nested in `ChildPreapprovals` property of API model |
| Link dealer | `IPreapprovalService.UpdatePreApprovalDealer` | `IPreapprovalSubmissionApiService.LinkDealerToPreapprovalAsync` |
| Product link | `IPreapprovalService.InsertPreapprovalProduct_SaaS` | `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync` |
| Shows & events | `IDealerService.UpdateDealerShows(DealerShows{all fields})` | `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync(6 of 12 fields)` |
| Save URL info | `IPreapprovalService.SaveAdditionalInfoToPreApproval` | `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync` |
| Get preapproval | `IPreapprovalService.GetPreApproval` | `IPreapprovalLetterApiService.GetPreApprovalAsync` |
| Comment save | `ICommentService.updateComment` | `IClaimActivityApiService.UpdateCommentAsync` |
| Email contacts | `IAddressService.UpdateContact` | `ICommonSupportService.UpdateContactAsync` |
| Dealer contacts | `IAddressService.GetContact(DealerNumber, "coop")` | `IClaimActivityApiService.GetContactAsync(DealerNumber, "coop")` |
| Document type seq | `IDocumentService.getDocumentType` | `IClaimActivityApiService.GetProgramDocumentTypeAsync` |
| Document image | `IDocumentService.UpdateDocumentImage` | `IClaimActivityApiService.UpdateDocumentImageAsync(UpdateDocumentImageApiModel)` |
| Dealer lookup | `IDealerService.GetProgramDealerByDealerNumber` | `IDealerInfoApiService.GetDealerByDealerNumberAsync` |
| Parent dealer | `IDealerService.GetDealerByDealerNumberSeq` | `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` |
| Branch dealers | `IDealerService.GetDealersbyBranchParentSeq` | `ICoopApiService.GetDealersByBranchParentSeqSaaSAsync` |
| Verify dealer contract | `IProgramService.GetProgramData(seq, mediaType)` | `IPreapprovalLetterApiService.GetProgramDataAsync(seq, mediaType)` |

---

## Key Architectural Differences (New Findings — 2026-06-19)

### 1. Media Type Re-load on POST (Modern Only)
**Legacy** `OnPostProcessPreApproval`: Processes submitted `PreApprovalInformation` directly — no media type reload.
**Modern** `OnPostProcessPreApproval`: Calls `GetMediaType(Convert.ToInt32(SelectedFiscalYear))` at the START of the handler to populate `MediaTypes` list, which is then used by `MapToSubmitPreapprovalApiModel`. This results in an additional API call during form submission.

This creates a new FU (COOP-PA-FU-047) and a test assertion: the submission must complete successfully even if media types must be re-fetched from the API during POST.

### 2. Shows & Events Gap (Confirmed — unchanged from prior analysis)
`LinkShowToPreapprovalAsync` signature accepts only 6 parameters: `(preApprovalSeqOut, dealerSeq, showDate, title, showLocation, showType)`.
Missing: `EquipmentList`, `Dealers` (group), `Cost`, `DlrRacf`, `Email`, `DlrFormStatus`.

### 3. N+1 API Calls for Media Requirements (Confirmed — unchanged)
Modern makes one HTTP call per media type for requirements vs. legacy single batch call.

---

## Data Models

| Entity | Legacy | Modern |
|---|---|---|
| Preapproval header | `preapproval` table via `IPreapprovalService` | API via `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` |
| Preapproval dealer | `preapproval_dealer` table via `UpdatePreApprovalDealer` | API via `LinkDealerToPreapprovalAsync` |
| Dealer shows | `dealer_shows` table via `IDealerService.UpdateDealerShows` | API via `LinkShowToPreapprovalAsync` (partial fields) |
| Document image | `document_image` table via `IDocumentService.UpdateDocumentImage` | API via `IClaimActivityApiService.UpdateDocumentImageAsync` |
| Comment | `comment` table via `ICommentService.updateComment` | API via `IClaimActivityApiService.UpdateCommentAsync` |
| Contact (email) | `contact` table via `IAddressService.UpdateContact` | API via `ICommonSupportService.UpdateContactAsync` |
| Additional info | `preapproval_additional_info` via `SaveAdditionalInfoToPreApproval` | API via `SaveAdditionalInfoAsync` |

---

## Known Gaps

| Gap | Severity | Description |
|---|---|---|
| Shows & Events fields missing | Medium | `LinkShowToPreapprovalAsync` does not pass EquipmentList, Dealers (group), Cost, DlrRacf, Email |
| N+1 media requirements | Low | Performance regression — modern makes N API calls vs. 1 batch |
| Media re-load on POST | Low | Modern re-fetches media types during POST — additional API call dependency |
