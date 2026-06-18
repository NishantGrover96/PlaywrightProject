# Coop — Submit Pre-Approval — Functional Unit Catalog

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-17 | Pipeline: Step 2 (Functional Unit Discovery)
> Source: `docs/module-analysis/coop/feature-submit-preapproval/discovery.md`

Total FUs: **46** | UI: 6 | DataEntry: 19 | BusinessLogic: 6 | Workflow: 7 | DataPersistence: 4 | Security: 4

---

## UI Behaviors

---

**COOP-PA-FU-001** — Page Load and Initialization
Category: UI | Risk: High | Status: Implemented
Legacy: `SubmitPreApproval.cshtml` + `SubmitPreapproval.cshtml.cs#OnGet`
Modern: `SubmitPreApproval.cshtml` + `SubmitPreapproval.cshtml.cs#OnGet` (API client version)
Behavior: Authenticated user navigates to `/CoopManagement/PreApproval/Submit/SubmitPreapproval`. Page renders wizard container (`.commonWizard`). `OnGet` populates media types, email, dealer info, fiscal year, and extended fields.

---

**COOP-PA-FU-002** — Fiscal Year Selection Step (Conditional)
Category: UI | Risk: Medium | Status: Implemented
Legacy: `SubmitPreApproval.cshtml` — `@if (Model.ShowFiscalYearSelection)` → Step 0 section; `SubmitPreapproval.cshtml.cs#OnGet` — `ShowFiscalYearSelection` set when prev FY end < now AND prev FY cutoff ≥ now
Modern: Same .cshtml + same `OnGet` logic
Behavior: When fiscal year selection window is open, Step 0 appears with radio buttons for current and previous fiscal year. Changing selection reloads page via query string `?SelectedFiscalYear=YYYY`. Media types are then loaded for selected fiscal year.

---

**COOP-PA-FU-003** — Dealer Search Step (Conditional)
Category: UI | Risk: High | Status: Implemented
Legacy: `SubmitPreApproval.cshtml` — `@if (!Model.SubmitAnotherProapprovalForSameDealer)` → Step 1 section; `_SearchDealer.cshtml` + `_DealerSearchList.cshtml` shared partials
Modern: Same .cshtml
Behavior: Step 1 (Dealer search) is shown only when not continuing for same dealer (`dealer_number` absent in query). Corporate/CSR users must search and select a dealer. Dealer users skip this step automatically.

---

**COOP-PA-FU-004** — Media Type Tile Selection Step
Category: UI | Risk: High | Status: Implemented
Legacy: `_PreApprovalMediaType.cshtml` — `#PreapprovalMediaList` ul with `.clsSelectMediaType` tiles; `#programDealerTypeDropdown` select; `#btnContinue` disabled until tile selected
Modern: Same .cshtml
Behavior: Step 2 renders media tiles filtered by `preapproval_required_flag != "N"`. Dealer type dropdown filters visible tiles client-side. User selects one tile to enable Continue button.

---

**COOP-PA-FU-005** — Form Submission Step Rendering
Category: UI | Risk: High | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — branch-specific blocks rendered/hidden client-side; dealer info header at top
Modern: Same .cshtml
Behavior: Step 3 renders the preapproval submission form. Branch-specific sections (campaign, screen/mainbranch, indvshow, grpshow, sponsor) are shown/hidden by JS based on media type's `BranchName`. Email section is always shown.

---

**COOP-PA-FU-006** — Success Confirmation Panel
Category: UI | Risk: High | Status: Implemented
Legacy: `SubmitPreApproval.cshtml` — `#CompleteConfirmationModel` div shown after submit; `#spnPreApprovalConfirmationNumber` populated; "Submit Another" and "Submit New" buttons; activity check link
Modern: Same .cshtml
Behavior: After successful submission, success panel displays preapproval number, email instructions, and links to activity list and re-submission.

---

## Data Entry

---

**COOP-PA-FU-007** — Campaign Title Field
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtCampaingTitle` maxlength=100; JS validation: `#spnErrorCampaingTitle` shown when empty; branch=campaign
Modern: Same .cshtml
Behavior: When media branch is campaign, Campaign Title is required. JS shows `#spnErrorCampaingTitle` with `RequiredField` message on empty submit.

---

**COOP-PA-FU-008** — Ad Includes Offer + Expiration Date (Campaign)
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#chkAdOfferCampaign` checkbox; `#dvAdOfferCalCampaign` date picker shown when checked; `#spnAdExpDateCampaign` validation
Modern: Same .cshtml
Behavior: When campaign branch, offer checkbox toggles expiration date picker visibility. Date must be populated if offer is checked.

---

**COOP-PA-FU-009** — Ad Landing Page URL (Single)
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtAdLandingURL` maxlength=550; shown when `data-ad-url != "N"` and not multiple; `#spnAdlandingPageURL` validation
Modern: Same .cshtml
Behavior: URL field shown based on media type's `MediaURLFlag`. Required based on `MediaURLRequiredFlag`. JS validates on submit.

---

**COOP-PA-FU-010** — Ad Landing Page URL (Multiple)
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtAdLandingURLMultiple` with `https://` prefix and `#AddMoreUrl` button; `#AddedUrl` container; `#spnAdlandingPageURLMultiple`
Modern: Same .cshtml
Behavior: When `MultipleURLFlag` is set, multiple URL inputs shown with "Add More" functionality. Each entry stored in array on submit.

---

**COOP-PA-FU-011** — Ad Title Field
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtAdTitle` maxlength=100; `#spnErrorAdTitle`; mainbranch
Modern: Same .cshtml
Behavior: Required field for non-campaign non-show non-sponsor media types. JS validates on submit.

---

**COOP-PA-FU-012** — Show Name Field (indvshow/grpshow)
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtShowsAdTitle` maxlength=100; `.clsgrpshowcommon`; `#spnErrorShowsAdTitle`
Modern: Same .cshtml
Behavior: Required for individual and group show branches. JS validates on submit.

---

**COOP-PA-FU-013** — Show Location Fields
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtShowsLocationAddress` (max 100), `#txtShowsLocationCity` (max 25), `#txtShowsLocationState` (max 25), `#txtShowsLocationZip` (max 7)
Modern: Same .cshtml
Behavior: Address, city, state, zip required for show branches. Individual field validation with `#spnErrorShows*` spans.

---

**COOP-PA-FU-014** — Show Start and End Dates
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#hdtxtCalShowsStartDate` and `#hdtxtCalShowsEndDate` date pickers; `.datepicker-input`
Modern: Same .cshtml
Behavior: Start and end dates required for show branches. Culture-aware date picker (`ViewData["EnableCultureDatePicker"] = true`).

---

**COOP-PA-FU-015** — Expected Eligible Show Cost
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtShowsEligibleCost` maxlength=12; `#spnErrorShowsEquipmentCost`
Modern: Same .cshtml
Behavior: Required numeric cost field for show branches.

---

**COOP-PA-FU-016** — Participating Dealers (Group Shows)
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#dvGroupShows` (hidden for indvshow); `#txtGroupDealerNumber` maxlength=50; `#btnAddShowsGroupDealer`; `#dvDealerNumberContainer`
Modern: Same .cshtml
Behavior: For group shows, users add participating dealer numbers one at a time. List stored client-side and sent in `Dealers` field.

---

**COOP-PA-FU-017** — Equipment to Be Displayed
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtEquipmentName` maxlength=50; `#btnAddEquipmentContact`; `#dvEquipmentContainer`
Modern: Same .cshtml
Behavior: Optional multi-entry equipment list for show branches. Add/remove items stored in `EquipmentList` field.

---

**COOP-PA-FU-018** — Sponsorship Name and Dates
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#dvSponsor` block; `#txtSponsorshipAdTitle`, `#hdtxtCalSponsorShipStartDate`, `#hdtxtCalSponsorShipEndDate`; `.clssponsorshipcommon`
Modern: Same .cshtml
Behavior: Sponsorship branch shows name + start/end date fields, all required.

---

**COOP-PA-FU-019** — Dealer ID Field (Conditional)
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#dvDealerID`; `#txtDealerIdText` maxlength=100; shown per media `dealeridtext` config; `#requireddealerIDtext` asterisk when required
Modern: Same .cshtml
Behavior: Optional or required (per media config `dealeridtextrequiredflag`) dealer ID field. JS validates when flag is "Y".

---

**COOP-PA-FU-020** — File Upload (Dropzone)
Category: DataEntry | Risk: High | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#dropzone_fuBGImage` dropzone; `#documentList` hidden input; `#spnErrorFile`; file type accepted per media config
Modern: Same .cshtml
Behavior: File upload required for all preapprovals. Dropzone accepts file types per `MediaFilesAccepted` config. Files temporarily staged then renamed on submit.

---

**COOP-PA-FU-021** — Submission Comment (Optional)
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtMainComment` textarea maxlength=500; `.submissionComment`
Modern: Same .cshtml
Behavior: Optional comment textarea (500 chars). Saved as external comment via comment service after preapproval creation.

---

**COOP-PA-FU-022** — Email — Me (Readonly Pre-Filled)
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtEmailMe` readonly asp-for Email; `#spnEmailToMe`
Modern: Same .cshtml
Behavior: Submitter email pre-filled (read-only) from session. Always sent confirmation email. Error shown if blank.

---

**COOP-PA-FU-023** — Dealership Contacts Checkboxes
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#dvDealerShipContactInfo` with `.clsDealerShipContact` checkboxes; N/A text when no contacts
Modern: Same .cshtml
Behavior: Dealer's coop contacts (from `IAddressService.GetContact`) shown as checkboxes for CC email. Checked contacts added to `DealerContacts` array on submit.

---

**COOP-PA-FU-024** — Other Contacts (Add/Remove)
Category: DataEntry | Risk: Low | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#txtOtherMediaContact`; `#btnAddOtherContact`; `#dvOtherMediaContacts`
Modern: Same .cshtml
Behavior: Free-form email address entry with Add button. Multiple other contacts stored client-side and included in submission.

---

**COOP-PA-FU-025** — Campaign Media Type Selection Within Campaign Block
Category: DataEntry | Risk: Medium | Status: Implemented
Legacy: `_PreApprovalFormSubmission.cshtml` — `#campaignList` ul; tiles filtered by `MediaCampaignFlag=="Y"`; `#btnAddCampaign` adds to `#tblMediaCampaign`; `#btnAddAdditionalMedia`
Modern: Same .cshtml
Behavior: Campaign branch shows nested media type tiles. Each selected media type added as child preapproval. Multiple campaign media types can be added to one campaign. Campaign title applies to parent.

---

## Business Logic

---

**COOP-PA-FU-026** — Preapproval Status Routing by Branch
Category: BusinessLogic | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#GetPreApprovalStatusByBranch` — branch=indvshow/sponsor → `AwaitingCSR`; branch=mainbranch AND media="websites & seo" → `AwaitingCSR`; all others → `Submitted`
Modern: `SubmitPreapproval.cshtml.cs#GetPreApprovalStatusByBranch` — identical logic
Behavior: Status assigned at submission determines CSR review requirement. Shows, Sponsorships, and Websites & SEO require CSR approval; all other media types go directly to Submitted.

---

**COOP-PA-FU-027** — Dealer Type List Retrieval
Category: BusinessLogic | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnGetDealerTypeList` — `IDealerService.GetDealerTypeByDealerNumberSeq`; encrypted seq returned
Modern: `SubmitPreapproval.cshtml.cs#OnGetDealerTypeList` — `ICoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync`
Behavior: AJAX call from media type step populates dealer type dropdown. Encrypted seq values used for security.

---

**COOP-PA-FU-028** — Media Types Filtered by Fiscal Year and Dealer Type
Category: BusinessLogic | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#GetMediaType` — `IMediaService.GetMediaTypesBranchWithProgramSeq(programSeq, 0, fiscal_year, locale_seq)` ; only tiles with `preapproval_required_flag != "N"` shown; sorted by `SortOrder`
Modern: `SubmitPreapproval.cshtml.cs#GetMediaType` — `IClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync`
Behavior: Media tiles loaded for the selected fiscal year. Dealer type dropdown further filters client-side by `program_dealer_type_seq`.

---

**COOP-PA-FU-029** — Media Type Requirements Loaded Per Type
Category: BusinessLogic | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#GetMediaTypeRequirement` — `IMediaService.GetAllMediaTypesRequirementByProgramSeq` (batch call); maps 16 requirement types
Modern: `SubmitPreapproval.cshtml.cs#GetMediaTypeRequirement` — `IClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` per media type (N+1 calls); same 16 requirement types
Behavior: Requirements (upload desc, URL flags, short/long names, accepted files, preapproval text, etc.) configured per media type. Client uses these to drive form field visibility and validation.

---

**COOP-PA-FU-030** — Program Extended Fields Configuration
Category: BusinessLogic | Risk: Low | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnGet` — `IProgramService.GetProgramData(programSeq, "PreapprovalFields")`; if found, renders `@Model.PreapprovalExtendedFields` partial
Modern: `SubmitPreapproval.cshtml.cs#OnGet` — `IPreapprovalLetterApiService.GetProgramDataAsync(programSeq, "PreapprovalFields")`
Behavior: Program-level configuration may specify an extended fields partial (e.g., `_PreapprovalFields1.cshtml`) to render additional form fields specific to the program.

---

**COOP-PA-FU-031** — Fiscal Year Determination
Category: BusinessLogic | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnGet` — `_webHelper.GetCurrentAndPreviousFiscalYearDates`; `ShowFiscalYearSelection = prevEndDate < now && prevCutoffDate >= now`; `AvailableFiscalYears = [prev, current]` when window open
Modern: Same logic (unchanged — still uses `IFiscalService` directly)
Behavior: Fiscal year selector appears during the overlap period when previous FY has ended but its cutoff hasn't passed. SelectedFiscalYear persists via query string on page reload.

---

## Workflow

---

**COOP-PA-FU-032** — Single Preapproval Submit Flow
Category: Workflow | Risk: Critical | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnPostProcessPreApproval` → `ProcessPreApproval` → `IPreapprovalService.ProcessPreApproval` → returns `lngPreapprovalSeqOut` → get `preapproval_number` → `UpdateDocumentFile` → `SavePreApprovalAdditionalInfo` → `SaveEmailsToPreapproval` → `SendPreApprovalEmail`
Modern: Same handler → `ProcessPreApproval` → `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync` → get number via `IPreapprovalLetterApiService.GetPreApprovalAsync` → `UpdateDocumentFile` → `SavePreApprovalAdditionalInfo` → `SaveEmailsToPreapproval` → `SendPreApprovalEmail`
Behavior: Complete end-to-end preapproval submission. Returns preapproval number in JSON 200 response. Client-side renders success panel.

---

**COOP-PA-FU-033** — Campaign Preapproval Submit with Child Preapprovals
Category: Workflow | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnPostProcessPreApproval` — iterates `preApprovalInformation.ChildPreapprovalList`, calls `ProcessPreApproval(child, parentSeq)` for each
Modern: `MapToSubmitPreapprovalApiModel` — maps `ChildPreapprovalList` to `submitModel.ChildPreapprovals`; sent as nested object to API in single `SubmitPreapprovalAsync` call
Behavior: Campaign media type allows multiple child media preapprovals under one campaign parent. Legacy processes each separately; modern sends as nested structure to API (functionally equivalent).

---

**COOP-PA-FU-034** — Dealer Linked to Preapproval
Category: Workflow | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#ProcessPreApproval` — `IPreapprovalService.UpdatePreApprovalDealer(0, lngPreapprovalSeqOut, GetDealerNumberSeq(), ref out)`
Modern: `_preapprovalSubmissionApiService.LinkDealerToPreapprovalAsync(0, lngPreapprovalSeqOut, GetDealerNumberSeq())`
Behavior: After preapproval created, submitting dealer is linked via dealer_number_seq.

---

**COOP-PA-FU-035** — Parent Dealer Linked (Conditional)
Category: Workflow | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#ProcessPreApproval` — `GetDealerParentSeq()` check → `IDealerService.GetDealerByDealerNumberSeq(parentSeq)` → `UpdatePreApprovalDealer(0, seq, parentNumberSeq, ref out)`
Modern: Same check → `IDealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync(parentSeq)` → `LinkDealerToPreapprovalAsync(0, seq, parentNumberSeq)`
Behavior: If dealer has a parent dealer in the hierarchy, parent dealer is also linked to the preapproval.

---

**COOP-PA-FU-036** — Shows & Events Record Created
Category: Workflow | Risk: Medium | Status: Partial
Legacy: `SubmitPreapproval.cshtml.cs#UpdateShowsAndEvent` — `IDealerService.UpdateDealerShows(DealerShows{ShowName, ShowLocation, Cost, StartDate, EndDate, EquipmentList, Dealers, ShowType, PreApprovalSeq, DlrRacf, Email, DlrFormStatus="SUBMITTED"})`
Modern: `_preapprovalSubmissionApiService.LinkShowToPreapprovalAsync(preApprovalSeqOut, dealerSeq, showDate, showName, showLocation, showType)` — **does NOT pass EquipmentList, Dealers (group), Cost, DlrRacf, Email**
Behavior: For individual and group shows, a dealer show record is created. Gap: modern API call is missing EquipmentList, participating Dealers list, ShowCost, submitter RACF, and email fields.

---

**COOP-PA-FU-037** — Additional Info Saved (URL)
Category: Workflow | Risk: Low | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#SavePreApprovalAdditionalInfo` — `IPreapprovalService.SaveAdditionalInfoToPreApproval(seq, URL, "URL")`
Modern: `_preapprovalSubmissionApiService.SaveAdditionalInfoAsync(seq, "URL", URL)`
Behavior: When URL is provided, saved as additional info associated with preapproval.

---

**COOP-PA-FU-038** — Comment Inserted on Submission
Category: Workflow | Risk: Low | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnPostProcessPreApproval` — `ICommentService.updateComment(UpdateComment{Preapproval, EXTERNAL, Submitter, comment})`
Modern: `_claimActivityApiService.UpdateCommentAsync(UpdateCommentApiModel{...})`
Behavior: Submission comment (if non-empty) saved as external comment with source=Submitter.

---

## Data Persistence

---

**COOP-PA-FU-039** — Preapproval Header Record Created
Category: DataPersistence | Risk: Critical | Status: Implemented
Legacy: `IPreapprovalService.ProcessPreApproval(programSeq, 0, activityCodeSeq, mediaTypeSeq, title, receivedDate, firstOpenDate, startDate, endDate, status, ref seqOut, OnlineSubmissionSource.ONLINE, userName, roleShortName, parentSeq, crcUserSeq, mediaUserCompanySeq, amount, advertisedAmt, percent)`
Modern: `IPreapprovalSubmissionApiService.SubmitPreapprovalAsync(SubmitPreapprovalApiModel{...})`
Behavior: Core preapproval record created with all header fields. `preapproval_number` assigned and returned.

---

**COOP-PA-FU-040** — Document File Saved and Linked
Category: DataPersistence | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#UpdateDocumentFile` — file renamed with preapproval number + dealer number + unique ID → `IDocumentService.UpdateDocumentImage(0, docTypeSeq, Preapproval table, preapprovalSeq, fileName, ref outSeq)`
Modern: Same rename logic → `IClaimActivityApiService.UpdateDocumentImageAsync(UpdateDocumentImageApiModel{...})`
Behavior: Uploaded file renamed and linked in document_image table with owner = preapproval record.

---

**COOP-PA-FU-041** — Product Linked to Preapproval (Conditional)
Category: DataPersistence | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#ProcessPreApproval` — `IPreapprovalService.InsertPreapprovalProduct_SaaS(programSeq, divisionSeq, preapprovalSeq, fiscalYear)` — only when `DisplayProductBlock != "Y"`
Modern: `IPreapprovalSubmissionApiService.LinkProductToPreapprovalAsync(preapprovalSeq, fiscalYear, divisionSeq)` — same condition
Behavior: Default product entry created for preapproval when program not configured for explicit product selection.

---

**COOP-PA-FU-042** — Email Contacts Saved to Preapproval
Category: DataPersistence | Risk: Medium | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.Email.cs#SaveEmailsToPreapproval` — `IAddressService.UpdateContact(0, Preapproval table, preapprovalSeq, name, email, position)` per contact
Modern: `SubmitPreapproval.cshtml.Email.cs#SaveEmailsToPreapproval` — `ICommonSupportService.UpdateContactAsync(0, Preapproval table, preapprovalSeq, name, ..., email, position)` per contact
Behavior: TO and CC email addresses from submission form persisted in contact table linked to preapproval.

---

## Security

---

**COOP-PA-FU-043** — Unauthenticated Access Protection
Category: Security | Risk: Critical | Status: Implemented
Legacy: `BasePageModel` — `[Authorize]` attribute or equivalent session check; unauthenticated → redirect to login
Modern: Same `BasePageModel`
Behavior: Page requires active session. Unauthenticated access results in login redirect.

---

**COOP-PA-FU-044** — Dealer Role — Own Dealer Number Seq
Category: Security | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnGet` — `_webHelper.IsDealer(UserSession.Role)` → uses `UserSession.Dealer_number_seq`; encrypted when passed in URLs
Modern: Same logic
Behavior: Dealer users can only submit for their own dealer. Dealer number seq encrypted in query strings and form posts.

---

**COOP-PA-FU-045** — Corp/Admin Role — Dealer Selection Required
Category: Security | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs#OnGet` — non-dealer users: if `!IncCorpClaim` → `SearchCorporateDealer()`; otherwise dealer search step shown
Modern: Same logic
Behavior: Non-dealer roles must select a dealer through the search step. Corp users may be auto-matched via `SearchCorporateDealer()`. CSR/Admin users always shown dealer search.

---

**COOP-PA-FU-046** — Encrypted Parameter Handling
Category: Security | Risk: High | Status: Implemented
Legacy: `SubmitPreapproval.cshtml.cs` — `_encryptDecrypt.Encrypt/Decrypt` used for dealer_number_seq, program_dealer_type_seq in query strings, hidden fields, JSON payloads
Modern: Same pattern
Behavior: All dealer and type sequence IDs are encrypted before being placed in URLs, hidden fields, or sent client-side. Decrypted server-side before use.

---

## FU Count Summary

| Category | Count | Risk Breakdown |
|---|---|---|
| UI | 6 | 1 High, 4 High, 1 High |
| DataEntry | 19 | 1 High, 1 High, 3 Medium, 1 Medium, 4 Medium, 1 Medium, 1 Medium, 1 Medium, 1 High, 2 Low, 1 Medium, 1 Low, 1 Low |
| BusinessLogic | 6 | 1 High, 1 Medium, 1 High, 1 Medium, 1 Low, 1 Medium |
| Workflow | 7 | 1 Critical, 1 High, 1 High, 1 Medium, 1 Medium, 1 Low, 1 Low |
| DataPersistence | 4 | 1 Critical, 1 High, 1 Medium, 1 Medium |
| Security | 4 | 1 Critical, 2 High, 1 High |
| **TOTAL** | **46** | Critical: 3, High: 20, Medium: 17, Low: 6 |
