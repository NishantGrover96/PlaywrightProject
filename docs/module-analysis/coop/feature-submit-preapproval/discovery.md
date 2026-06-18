# Coop — Submit Pre-Approval — Discovery Report

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-17 | Pipeline: Step 2 (Functional Unit Discovery)

---

## Legacy Source Files

| File | Purpose |
|---|---|
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreApproval.cshtml` | Main page: 4-step wizard (fiscal year, dealer search, media type, form submission) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.cs` | Page model: handlers OnGet, OnPostProcessPreApproval, OnGetDealerTypeList, OnPostUploadFile |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.Email.cs` | Partial class: SendPreApprovalEmail, SaveEmailsToPreapproval |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalMediaType.cshtml` | Step 2 partial: dealer type dropdown + media tile list |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalFormSubmission.cshtml` | Step 3 partial: all form fields (campaign, screen, show, sponsor branches), email section |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalProcess.cshtml` | Wizard progress bar partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalProcessHeader.cshtml` | Wizard header partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreapprovalFields1.cshtml` | Extended fields partial (program-configured) |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_PreApprovalFormSubmission.cshtml` | Screen/Show/Sponsor branch fields partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_ExternalPreApprovalMedia.cshtml` | External media sub-partial |
| `Presentation\Web\Pages\CoopManagement\PreApproval\Submit\_RecentDealerViewed.cshtml` | Recently viewed dealers panel |
| `Presentation\Web\wwwroot\WebScripts\CoopManagement\PreApproval\jsSubmitPreApproval.js` | Client-side: wizard navigation, field validation, AJAX submit, campaign logic |
| `Presentation\Web\wwwroot\WebScripts\CoopManagement\DealerSearch\DealerSearch.js` | Dealer search autocomplete logic |

## Modern Source Files

| File | Purpose |
|---|---|
| `DemoPortalV2\Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreApproval.cshtml` | Identical to legacy — same wizard markup |
| `DemoPortalV2\Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.cs` | Page model: same handlers but uses API clients instead of direct services |
| `DemoPortalV2\Presentation\Web\Pages\CoopManagement\PreApproval\Submit\SubmitPreapproval.cshtml.Email.cs` | Partial class: email sending — same structure |
| `Infrastructure\ApiClients\Coop\IPreapprovalSubmissionApiService.cs` | SubmitPreapprovalAsync, ProcessPreApprovalAsync, LinkDealerToPreapprovalAsync, LinkProductToPreapprovalAsync, SaveAdditionalInfoAsync, LinkShowToPreapprovalAsync |
| `Infrastructure\ApiClients\Coop\PreapprovalSubmissionApiService.cs` | HTTP client implementation |
| `Infrastructure\ApiClients\Coop\IPreapprovalLetterApiService.cs` | GetPreApprovalAsync, GetProgramDataAsync, GetPreapprovalBySearchAsync |
| `Infrastructure\ApiClients\Coop\PreapprovalLetterApiService.cs` | HTTP client implementation |
| `Infrastructure\ApiClients\Common\IClaimActivityApiService.cs` | GetMediaTypesBranchWithProgramSeqAsync, GetMediaTypesRequirementByProgramSeqAsync, UpdateCommentAsync, UpdateDocumentImageAsync, GetContactAsync |
| `Infrastructure\ApiClients\Dealer\IDealerApiService.cs` | GetDealerNameByProgramSeqAsync |
| `Infrastructure\ApiClients\Dealer\IDealerInfoApiService.cs` | GetDealerSummaryByDealerNumberSeqAsync |
| `Infrastructure\ApiClients\Coop\ICoopApiService.cs` | GetDealerTypeByDealerNumberSeqSaaSAsync |

---

## UI Components (Legacy)

### Wizard Steps
| Step | Condition | Content |
|---|---|---|
| Step 0 — Fiscal Year | `ShowFiscalYearSelection = true` (prev FY end < now AND prev FY cutoff ≥ now) | Radio buttons per available fiscal year |
| Step 1 — Dealer Search | `!SubmitAnotherProapprovalForSameDealer` | `_SearchDealer.cshtml` + `_DealerSearchList.cshtml` shared partials |
| Step 2 — Media Type | Always shown | Dealer type dropdown, media tile list (`#PreapprovalMediaList`), Continue button |
| Step 3 — Form Submission | Always shown | Branch-specific form + email section + Submit/Reset buttons |

### Step 3 Form Fields
| Field | ID | Branch | Required |
|---|---|---|---|
| Campaign Title | `#txtCampaingTitle` | campaign | Y |
| Ad Includes Offer checkbox | `#chkAdOfferCampaign` | campaign | N |
| Earliest Expiration Date (campaign) | `#hdtxtCalExpirationDateCampaign` | campaign + offer checked | conditional |
| Select Campaign Media Type list | `#campaignList` | campaign | Y |
| Ad Includes Offer (screen) | `#chkAdOffer` | mainbranch | N |
| Expiration Date (screen) | `#hdtxtCalExpirationDate` | mainbranch + offer | conditional |
| Ad Landing Page URL (single) | `#txtAdLandingURL` | per media config `MediaURLFlag=Y` | per config |
| Ad Landing Page URL (multiple) | `#txtAdLandingURLMultiple` | per media config `MultipleURLFlag=Y` | per config |
| Ad Title | `#txtAdTitle` | mainbranch | Y |
| Show Name | `#txtShowsAdTitle` | indvshow/grpshow | Y |
| Show Location — Address | `#txtShowsLocationAddress` | indvshow/grpshow | Y |
| Show Location — City | `#txtShowsLocationCity` | indvshow/grpshow | Y |
| Show Location — State/Province | `#txtShowsLocationState` | indvshow/grpshow | Y |
| Show Location — Zip/Postal | `#txtShowsLocationZip` | indvshow/grpshow | Y |
| Show Start Date | `#hdtxtCalShowsStartDate` | indvshow/grpshow | Y |
| Show End Date | `#hdtxtCalShowsEndDate` | indvshow/grpshow | Y |
| Expected Eligible Show Cost | `#txtShowsEligibleCost` | indvshow/grpshow | Y |
| Participating Dealers | `#txtGroupDealerNumber` + `#btnAddShowsGroupDealer` | grpshow | Y |
| Equipment to be Displayed | `#txtEquipmentName` + `#btnAddEquipmentContact` | indvshow/grpshow | N |
| Sponsorship Name | `#txtSponsorshipAdTitle` | sponsor | Y |
| Sponsorship Start Date | `#hdtxtCalSponsorShipStartDate` | sponsor | Y |
| Sponsorship End Date | `#hdtxtCalSponsorShipEndDate` | sponsor | Y |
| Dealer ID | `#txtDealerIdText` | per `dealeridtextrequiredflag` config | conditional |
| File Upload (dropzone) | `#dropzone_fuBGImage` | all | Y |
| Estimated Cost | `#txtEstimatedCost` | conditional per program config | conditional |
| Submission Comment | `#txtMainComment` | all | N |
| Email — Me | `#txtEmailMe` | all | Y (readonly) |
| Dealership Contacts | `.clsDealerShipContact` checkboxes | all | N |
| Other Contacts | `#txtOtherMediaContact` + `#btnAddOtherContact` | all | N |
| Campaign Media table | `#tblMediaCampaign` | campaign | auto-populated |

### Action Buttons
| Button | ID | Purpose |
|---|---|---|
| Continue (Fiscal Year step) | `#ContinueAfterZero` | Advance past FY selection |
| Continue (Media step) | `#btnContinue` | Advance to form |
| Back (Media step) | `.clsBackClaimWizardMedia` | Return to dealer search |
| Add to Campaign | `#btnAddCampaign` | Add media to campaign table |
| Add Additional Media | `#btnAddAdditionalMedia` | Add another campaign media type |
| Submit | `#btnSubmitPreApproval` | POST to OnPostProcessPreApproval |
| Reset | `#ResetPreApprovalForm` | Clear form fields |
| Back (Form step) | `#FormSubmissionBackBtn` | Return to media type step |

### Success Panel
- `#CompleteConfirmationModel` — displayed after successful submission
- `#spnPreApprovalConfirmationNumber` — shows preapproval number
- "Submit Another Pre-Approval" button (`#SubmitAnotherPreApproval`)
- "Submit New Pre-Approval" link (when not same-dealer mode)
- "Check Activity" link to dealer activity list

---

## API Endpoints (Modern)

All backend API endpoints are routed via HTTP clients. The exact backend routes are in `BackendAPI\src\modules\coop\Coop.API\Controllers` — no PreApproval-specific controllers found at discovery time, suggesting these are handled by the existing Coop API module.

| Client | Method | Purpose |
|---|---|---|
| `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` | POST | Submit preapproval + child preapprovals |
| `IPreapprovalSubmissionApiService.LinkDealerToPreapprovalAsync` | POST | Associate dealer with preapproval |
| `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync` | POST | Link product to preapproval |
| `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync` | POST | Save URL and other additional info |
| `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync` | POST | Create dealer show for Shows & Events |
| `IPreapprovalLetterApiService.GetPreApprovalAsync` | GET | Retrieve preapproval by seq (to get preapproval_number) |
| `IPreapprovalLetterApiService.GetProgramDataAsync` | GET | Retrieve extended preapproval fields config |
| `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` | GET | Media types for program + fiscal year |
| `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` | GET | Per-type media requirements |
| `IClaimActivityApiService.UpdateCommentAsync` | POST | Insert/update comment |
| `IClaimActivityApiService.UpdateDocumentImageAsync` | POST | Link document file to preapproval |
| `IClaimActivityApiService.GetContactAsync` | GET | Get dealer coop contacts for email field |
| `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` | GET | Dealer type for program dealer type |
| `IDealerApiService.GetDealerNameByProgramSeqAsync` | GET | Dealer name lookup |
| `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` | GET | Parent dealer lookup |
| `ICommonSupportService.UpdateContactAsync` | POST | Save email contacts to preapproval |

---

## Services

| Layer | Legacy | Modern Equivalent |
|---|---|---|
| Preapproval CRUD | `IPreapprovalService.ProcessPreApproval` | `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` |
| Preapproval dealer | `IPreapprovalService.UpdatePreApprovalDealer` | `IPreapprovalSubmissionApiService.LinkDealerToPreapprovalAsync` |
| Preapproval product | `IPreapprovalService.InsertPreapprovalProduct_SaaS` | `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync` |
| Additional info | `IPreapprovalService.SaveAdditionalInfoToPreApproval` | `IPreapprovalSubmissionApiService.SaveAdditionalInfoAsync` |
| Get preapproval | `IPreapprovalService.GetPreApproval` | `IPreapprovalLetterApiService.GetPreApprovalAsync` |
| Media types | `IMediaService.GetMediaTypesBranchWithProgramSeq` | `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` |
| Media requirements (batch) | `IMediaService.GetAllMediaTypesRequirementByProgramSeq` | `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` (per type) |
| Dealer type | `IDealerService.GetDealerTypeByDealerNumberSeq` | `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` |
| Dealer name | `IDealerService.GetDealerName` | `IDealerApiService.GetDealerNameByProgramSeqAsync` |
| Parent dealer | `IDealerService.GetDealerByDealerNumberSeq` | `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` |
| Shows & Events | `IDealerService.UpdateDealerShows` | `IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync` |
| Document | `IDocumentService.UpdateDocumentImage` | `IClaimActivityApiService.UpdateDocumentImageAsync` |
| Comment | `ICommentService.updateComment` | `IClaimActivityApiService.UpdateCommentAsync` |
| Email contacts | `IAddressService.UpdateContact` | `ICommonSupportService.UpdateContactAsync` |
| Dealer contacts | `IAddressService.GetContact` | `IClaimActivityApiService.GetContactAsync` |
| Email send | `IEmailService` | `IEmailService` (unchanged) |
| Fiscal year | `IFiscalService` | `IFiscalService` (unchanged — not yet migrated) |
| Division | `IDivisionService` | `ICommonSupportService.GetDivisionListByProgramAsync` |
| Program data | `IProgramService.GetProgramData` | `IPreapprovalLetterApiService.GetProgramDataAsync` |
| Enrollment | `IEnrollmentService` | `IEnrollmentService` (unchanged) |

---

## Known Gaps (Preliminary)

| Gap | Legacy | Modern | Notes |
|---|---|---|---|
| Shows & Events full data | `UpdateDealerShows` passes EquipmentList, Dealers, Cost, DlrFormStatus, Email | `LinkShowToPreapprovalAsync` only passes seq, dealerSeq, showDate, showName, location, showType | Equipment list + group dealers may not be persisted in modern |
| Media type requirements | Batch call `GetAllMediaTypesRequirementByProgramSeq` | Per-type loop `GetMediaTypesRequirementByProgramSeqAsync` | Functionally equivalent but N+1 API calls in modern |
