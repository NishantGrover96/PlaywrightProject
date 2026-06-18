# Coop — Submit Claim : Functional Unit Catalog

> Generated: 2026-06-17
> Pipeline step: Step 2 — Functional Unit Discovery
> Module: `coop` | Feature: `submit-claim`
> Total FUs: 53 | Breakdown: UI×6, DataEntry×22, BusinessLogic×8, Workflow×5, DataPersistence×8, Security×4

---

## UI Behaviors

### COOP-FU-001  Page Load & Auth Redirect
- **Category**: UI
- **Risk**: High
- **Legacy**: `SubmitClaim.cshtml.cs:OnGet` — resolves dealer, checks session, sets flags
- **Modern**: `SubmitClaim.cshtml.cs:OnGet` (async) — same logic via API calls
- **Description**: Unauthenticated or dealer-missing requests redirect. Page initialises fiscal year, OCR config, media types, budget in one GET.

### COOP-FU-002  Fiscal Year Selection Display
- **Category**: UI
- **Risk**: Medium
- **Legacy**: `OnGet` — `ShowFiscalYearSelection = prevEndDate < now && prevCutoffDate >= now`
- **Modern**: Same logic
- **Description**: Radio buttons for current and previous fiscal year appear only within the prior-year cut-off window. Selecting a year reloads the page with `?SelectedFiscalYear=`.

### COOP-FU-003  Claim Type Radio (Pre-approval Yes / No)
- **Category**: UI
- **Risk**: Medium
- **Legacy**: `SubmitClaim.cshtml` — radio `ClaimType`; JS shows/hides `dvPreApprovalAdCodeNo`
- **Modern**: Identical CSHTML
- **Description**: "Yes" reveals the pre-approval number input; "No" hides it. Default is `NoPreapproval`.

### COOP-FU-004  Dealer Search Step (Conditional)
- **Category**: UI
- **Risk**: Medium
- **Legacy**: `OnGet` sets `showDealerSearch`; partial `_SearchDealer` / `_DealerSearchList`
- **Modern**: Same
- **Description**: Step 2 (dealer search) is injected into the wizard only when `showDealerSearch == true`. Dealer users skip this step entirely.

### COOP-FU-005  Media Type Grid Rendering
- **Category**: UI
- **Risk**: Medium
- **Legacy**: `_ClaimMediaType.cshtml` iterates `Model.MediaTypes`; `campaign` and `grpshow` branches excluded
- **Modern**: Identical CSHTML; data sourced via `ClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync`
- **Description**: Media type icons rendered with embedded JSON data attributes (requirements, creative types, claim forms). Grid filtered by selected `programDealerTypeDropdown`.

### COOP-FU-006  Budget Available Display
- **Category**: UI
- **Risk**: Low
- **Legacy**: `OnGet` sets `BudgetAvaiable`; shown in Step 4 header when `DisplayProductBlock != "Y"`
- **Modern**: Same
- **Description**: Displays formatted budget amount in the form header. Hidden when product block mode is enabled.

---

## Data Entry

### COOP-FU-007  Contact Name — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtContactName` / `txtContactName1`; `spnErrContactName` error span
- **Modern**: Same field; JS validation
- **Description**: Submitter contact name is required before proceeding past Step 1.

### COOP-FU-008  Contact Email — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtContactEmail`; JS validation
- **Modern**: Same
- **Description**: Submitter email is required. Used as the primary confirmation email recipient.

### COOP-FU-009  Contact Phone — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtContactPhone`; `clsPhoneMask` applied
- **Modern**: Same
- **Description**: Phone number is required and formatted via phone mask (locale-aware).

### COOP-FU-010  Contact Auto-Population from User Profile
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `GetUserProfileInfo()` — `_userService.GetCRCUser` → `_addressService.GetContact`
- **Modern**: `GetUserProfileInfo()` — `_claimActivityApiService.GetCRCUserAsync` → `GetContactAsync`
- **Description**: On page load, name/phone/email pre-filled from the logged-in user's CRC profile. Can be overridden.

### COOP-FU-011  Pre-Approval Number Entry
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtAdCode` (maxlength=25); triggers `OnGetCheckAdCodeNumber`
- **Modern**: Same
- **Description**: Numeric pre-approval number entered by user. Validated on blur via AJAX.

### COOP-FU-012  Pre-Approval Lookup Modal
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `#preapprovallist` modal; `ddldealership` select; `tblPreapprovals` table
- **Modern**: Identical CSHTML
- **Description**: "Click here" opens a modal listing the dealer's pre-approvals. User clicks to populate `txtAdCode`.

### COOP-FU-013  Pre-Approval Validation
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `OnGetCheckAdCodeNumber` — `_preapprovalService.GetPreapprovalBySearch`; status must be `"APPROVED"`
- **Modern**: `_claimActivityApiService.GetPreapprovalBySearchAsync`; same status check
- **Description**: Pre-approval must exist and be APPROVED. Response pre-fills dealer info and contact details. Campaign pre-approvals resolve child media types.

### COOP-FU-014  Invoice File Upload — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `dropzone_fuBGImageInvoice`; `OnPostUploadInvoiceFile`; stored to `DocumentPhysicalFilePath.Claim`
- **Modern**: Same handlers; verify storage path
- **Description**: Invoice document (PDF, image) is required per activity. Uploaded via Dropzone; file renamed with dealer number + activity seq.

### COOP-FU-015  Supporting Documents Upload — Optional
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `dropzone_fuBGImage`; `OnPostUploadFile`; document type = "Other Proof of Performance"
- **Modern**: Same
- **Description**: Additional supporting documents are optional. Uploaded separately from invoice.

### COOP-FU-016  Invoice Amount — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtInvoiceAmt`; currency format; maxlength=15; `spnInvoiceAmt` error
- **Modern**: Same
- **Description**: Invoice amount is required and must be a valid currency value.

### COOP-FU-017  Invoice Number — Required
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtInvoiceNumber`; maxlength=20; `spnInvoiceNumber` error
- **Modern**: Same
- **Description**: Invoice number is required; max 20 characters.

### COOP-FU-018  Activity Date — No Future Dates, No Duplicates
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: Date picker `hdtxtActivityDate`; server-side: `parsedDate.Date > DateTime.Today` → reject; duplicate key check
- **Modern**: Date picker identical; **server-side future-date and duplicate-date checks removed** in `OnPostSaveClaim`; only silently skipped in `UpdateTempActivities`
- **Description**: One or more activity dates added to a table. Legacy validates no future dates and no duplicates at submission. Modern partially validates only in UpdateTempActivities (silently skips), not returns error.
- **Gap**: G-02, G-03 — missing server-side error responses in modern

### COOP-FU-019  Media Name Entry
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `txtMediaName`; maxlength=100; shown when `getVendorInformation=false`
- **Modern**: Same
- **Description**: Free-text media/publication name, required per activity when vendor form is disabled.

### COOP-FU-020  Dealer ID Field (Conditional)
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `txtDealerIdText`; shown per media type `dealeridtextrequiredflag`; validated via `OnGetVerifyDealerID`
- **Modern**: `_coopApiService.GetDealersByBranchParentSeqSaaSAsync` + `GetProgramDataAsync` for contract check
- **Description**: Some media types require a dealer ID that is validated against the program's allowed contracts.

### COOP-FU-021  Activity Creative Type Selection (Conditional)
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `activityCreativeType` select; populated from media type requirements `activitycreativetype`
- **Modern**: Same; data from `ClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync`
- **Description**: Some media types require selecting a creative type. Saved to `ONLINE_ACTIVITY_TEMP` via `InsertActivityMediaTypeRequirement`.

### COOP-FU-022  Invoice Currency Selection (Conditional)
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `ddlInvoiceCurrency`; shown when `MultiCurrencyInvoice && CurrencyLists.Count > 1`
- **Modern**: Same; currencies from `CoopApiService.GetProgramCurrencyAsync`
- **Description**: When multi-currency is enabled, user selects the currency of the invoice amount. Conversion rate applied at save time.

### COOP-FU-023  Product Line Allocation (Conditional — Must Sum to 100%)
- **Category**: DataEntry
- **Risk**: High
- **Legacy**: `drpProductCodes` + `txtProductMeasurement`; server-side: `total != 100 → 400`
- **Modern**: Same validation in `OnPostSaveClaim`; product list from `CoopApiService.GetProductLineByDealerNumberSeqAsync`
- **Description**: When `DisplayProductBlock != "N"`, each activity must have product line allocations summing to exactly 100%. Enforced server-side in both legacy and modern.

### COOP-FU-024  Vendor Information Form (Conditional)
- **Category**: DataEntry
- **Risk**: Medium
- **Legacy**: `_VendorInformation.cshtml`; `OnGetVendorList` + `OnGetVendorInformation` → `_addressService`
- **Modern**: Same page model handlers; **both `OnGetVendorList` and `OnGetVendorInformation` still call `_addressService` directly** (NOT via API)
- **Description**: When vendor mode is enabled, user selects or enters a vendor with full contact/address fields. Saved to `CONTACT` + `ADDRESS` tables.
- **Gap**: G-01 — vendor lookup endpoints not yet migrated to API

### COOP-FU-025  Submitter Email (Read-Only, Auto-Populated)
- **Category**: DataEntry
- **Risk**: Low
- **Legacy**: `txtEmailMe` readonly; bound to `Model.Email` from user profile
- **Modern**: Same
- **Description**: The logged-in user's email is pre-filled and read-only. Always included in confirmation recipients.

### COOP-FU-026  Dealer Contacts Selection
- **Category**: DataEntry
- **Risk**: Low
- **Legacy**: `GetDealerMediaContact()` — `_addressService.GetContact(code=="coop")`; checkboxes in `_DealerShipContactDetail`
- **Modern**: `DealerInfoApiService.GetContactAsync`; same filter
- **Description**: Coop-tagged dealer contact emails displayed as opt-in checkboxes. Selected contacts copied to claim on submit.

### COOP-FU-027  Other Contacts (Freeform)
- **Category**: DataEntry
- **Risk**: Low
- **Legacy**: `txtOtherMediaContact` + `btnAddOtherContact`; JS adds to list
- **Modern**: Identical
- **Description**: User can type additional email addresses to receive confirmation. Added client-side to submission data.

### COOP-FU-028  Submission Comment (Optional)
- **Category**: DataEntry
- **Risk**: Low
- **Legacy**: `txtMainComment`; maxlength=500; saved to `COMMENT` (owner = TempClaim or Claim)
- **Modern**: `_claimActivityApiService.UpdateCommentAsync` / `_commonAPIService.DeleteCommentAsync`
- **Description**: Optional free-text comment attached to the claim. Saved at draft and moved to final claim on submit.

---

## Business Logic

### COOP-FU-029  Dealer Type List Population
- **Category**: BusinessLogic
- **Risk**: Medium
- **Legacy**: `OnGetDealerTypeList` — `_dealerService.GetDealerTypeByDealerNumberSeq`
- **Modern**: `_coopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync`
- **Description**: Populates the dealer type dropdown in Step 3. Each type has a `program_dealer_type_seq` used to filter eligible media types.

### COOP-FU-030  Dealer Budget Info & Currency Conversion Rates
- **Category**: BusinessLogic
- **Risk**: High
- **Legacy**: `OnGetDealerBudgetInfo` — `_budgetService.GetDealerBudgetType` + `_addressService.GetDealerLanguageCurrency` + `_programService.GetCurrencyConversionLogbyDate`
- **Modern**: `_coopApiService.GetDealerBudgetTypeAsync` + `GetDealerLanguageCurrencyAsync` + `GetCurrencyConversionLogByDateAsync`
- **Description**: Returns available budget (formatted), program budget seq, dealer currency, and conversion rates. Powers the budget display and multi-currency invoice workflow.

### COOP-FU-031  Product Line List by Dealer
- **Category**: BusinessLogic
- **Risk**: Medium
- **Legacy**: `OnGetProductList` — `_budgetService.GetProductLineByDealerNumberSeq`
- **Modern**: `_coopApiService.GetProductLineByDealerNumberSeqAsync`
- **Description**: Returns product lines (code, name, available budget) for the dealer. Populates the product allocation dropdown.

### COOP-FU-032  OCR Invoice Scanning
- **Category**: BusinessLogic
- **Risk**: High
- **Legacy**: `_oCRService` (Azure Form Recognizer); `isOCREnabled` from `_programService.GetProgramData(OCRConfig.CoopOCRConfig)`; OCR usage tracked per activity (`"OCR"` / `"OCR + Manual"` / `"Manual"`)
- **Modern**: OCR config from `_coopApiService.GetProgramDataAsync`; OCR usage tracking same logic; `UpdateOCRHit` called per invoice
- **Description**: When enabled, invoices are scanned via Azure Form Recognizer. Pre-fills media name, invoice number, and amount. Tracks whether user used/modified OCR-extracted values.

### COOP-FU-033  Campaign Pre-Approval (Multi-Media-Type)
- **Category**: BusinessLogic
- **Risk**: High
- **Legacy**: `OnGetCheckAdCodeNumber` — when media_type == "campaign", loads child media type seqs into session
- **Modern**: Same logic; `_claimActivityApiService.GetPreapprovalBySearchAsync`
- **Description**: Campaign pre-approvals contain child media types. Each child's `preapproval_seq` is stored in session keyed by `media_type_seq` and used when saving activities.

### COOP-FU-034  Dealer ID Verification Against Program Contracts
- **Category**: BusinessLogic
- **Risk**: Medium
- **Legacy**: `OnGetVerifyDealerID` — `_dealerService.GetDealersbyBranchParentSeq` + `_programService.GetProgramData(mediaType)` for contract list
- **Modern**: `_coopApiService.GetDealersByBranchParentSeqSaaSAsync` + `GetProgramDataAsync`
- **Description**: Validates entered dealer ID against the program's allowed contract types for the selected media. Returns true/false to JS.

### COOP-FU-035  Corporate Dealer Auto-Bind
- **Category**: BusinessLogic
- **Risk**: Medium
- **Legacy**: `OnGet` — `_dealerSearch.SearchCorporateDealer()` for non-dealer users when `IncCorpClaim = false`
- **Modern**: Same
- **Description**: When a corporate user has a single associated dealer, the dealer is resolved automatically without showing the search step.

### COOP-FU-036  Multi-Currency Invoice Conversion
- **Category**: BusinessLogic
- **Risk**: Medium
- **Legacy**: `UpdateTempActivities` — `_programService.GetCurrencyConversionByDate` + `InsertCurrencyConversionLog`
- **Modern**: `CoopApiService.GetCurrencyConversionByDateAsync` + `InsertCurrencyConversionLogAsync`
- **Description**: When invoice currency differs from dealer currency, the conversion rate is looked up and logged at save time. The seq is stored on the activity.

---

## Workflow

### COOP-FU-037  Draft Save ("Save and Submit Later")
- **Category**: Workflow
- **Risk**: High
- **Legacy**: `OnPostSaveClaim(SubmitFlag=false)` — `CreateTempClaim` + `UpdateTempActivities`; returns `TempClaimSeq`
- **Modern**: Same structure; all writes via API
- **Description**: Saves the claim as a draft. Returns a `TempClaimSeq` (temporary claim number). User can resume from the Activity page. Draft comment preserved.

### COOP-FU-038  Final Submit
- **Category**: Workflow
- **Risk**: Critical
- **Legacy**: `OnPostSaveClaim(SubmitFlag=true)` → `CreateTempClaim` + `UpdateTempActivities` + `CreateClaim` → returns `ClaimProcessNumber`
- **Modern**: Same; `CreateClaim` calls `CoopApiService.CreateClaimAndActivityRecordsAsync` + `InsertActivityProductSaaSAsync`
- **Description**: Promotes temp records to final claim. Assigns process number, sends confirmation email, deletes temp comment. On success shows confirmation screen with process number.

### COOP-FU-039  Resume Incomplete Claim
- **Category**: Workflow
- **Risk**: High
- **Legacy**: `OnGet(?temp_seq=enc)` — `GetTemporaryClaimInfo` + `GetTempComment`; pre-fills all wizard fields
- **Modern**: `GetTemporaryClaimInfo` via `_coopApiService.GetTempClaimByTempClaimSeqAsync` + `GetOnlineActivityTempByTempSeqAsync`
- **Description**: When `?temp_seq` is present, the full draft claim is loaded including all activities, documents, vendor info, and comment.

### COOP-FU-040  Submit Another Claim (Reset)
- **Category**: Workflow
- **Risk**: Low
- **Legacy**: `btnSubmitNewClaim` / `btnSubmitNewClaimSame` on success screen
- **Modern**: Identical CSHTML
- **Description**: After successful submit, buttons allow submitting a new claim or another claim for the same dealer. Hidden for BMDLR/DIST/BMDIST roles.

### COOP-FU-041  Post-Submit Confirmation Email
- **Category**: Workflow
- **Risk**: High
- **Legacy**: `CreateClaim` → `SendClaimEmailToUser(objClaim, TotalClaimAmount, false, false)` (Email.cs partial class)
- **Modern**: `SubmitClaim.cshtml.Email.cs` partial class — verify email service dependency
- **Description**: Confirmation email sent to submitter + selected dealer contacts after successful submit. Includes process number and total amount.
- **Gap**: G-04 — need to verify Email.cs uses API vs legacy `IEmailService`

---

## Data Persistence

### COOP-FU-042  Temp Claim Header Record
- **Category**: DataPersistence
- **Risk**: High
- **Legacy**: `CreateTempClaim` → `_onlineClaimService.UpdateOnlineClaimTemp` → `USP_ONLINE_CLAIM_TEMP_U01`
- **Modern**: `_coopApiService.UpdateOnlineClaimTempAsync` → API → same SP
- **Description**: Creates or updates `ONLINE_CLAIM_TEMP`. Fields: dealer_number_seq, contact_seq, fiscal_year, claim_type, crc_user_seq, media_user_company_seq.

### COOP-FU-043  Temp Activity Records
- **Category**: DataPersistence
- **Risk**: High
- **Legacy**: `UpdateTempActivities` → `_onlineClaimService.UpdateOnlineActivityTemp` per activity
- **Modern**: `_coopApiService.UpdateOnlineActivityTempAsync`
- **Description**: Creates or updates `ONLINE_ACTIVITY_TEMP`. Fields: media_type_seq, preapproval_seq, media_name, invoice_number, invoice_amount, invoice_date, ocr_usage, currency_conversion_seq.

### COOP-FU-044  Document Image Records (Invoice + Supporting)
- **Category**: DataPersistence
- **Risk**: High
- **Legacy**: `UpdateTempActivities` → `_documentService.UpdateDocumentImage`; file physically renamed `{dealerNumber}_{activitySeq}_{index}`
- **Modern**: Same handler logic; verify file storage path consistency
- **Description**: Two document types per activity: "invoice" and "other proof of performance". Files stored on disk; `DOCUMENT_IMAGE` record links file name to activity seq.
- **Gap**: G-05 — verify storage path in modern

### COOP-FU-045  Activity Product Line Records
- **Category**: DataPersistence
- **Risk**: High
- **Legacy**: `_activityService.DeleteOnlineActivityProduct` then insert via `UpdateOnlineActivityProduct`
- **Modern**: `_coopApiService.UpdateOnlineActivityProductAsync`; delete then re-insert pattern identical
- **Description**: Product lines stored in `ONLINE_ACTIVITY_PRODUCT`. Pattern: delete existing then insert fresh on every save.

### COOP-FU-046  Activity Date Records
- **Category**: DataPersistence
- **Risk**: Medium
- **Legacy**: `_activityService.DeleteOnlineActivityDate` then `UpdateOnlineActivityDate` per date
- **Modern**: API equivalents; delete-and-reinsert pattern
- **Description**: Activity dates stored in `ONLINE_ACTIVITY_DATE`. Future dates silently skipped.

### COOP-FU-047  Vendor Contact & Address Records (Conditional)
- **Category**: DataPersistence
- **Risk**: Medium
- **Legacy**: `_addressService.UpdateContact` + `updateAddress` for `ONLINE_ACTIVITY_TEMP` owner
- **Modern**: **NOT migrated** — same `_addressService` direct calls in modern
- **Description**: Vendor name, address, phone, email stored in `CONTACT` + `ADDRESS` tables linked to the activity.
- **Gap**: G-01

### COOP-FU-048  Final Claim & Activity Promotion
- **Category**: DataPersistence
- **Risk**: Critical
- **Legacy**: `_onlineClaimService.CreateClaimAndActivityRecords` → `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS`; then `InsertActivityProduct_SaaS`
- **Modern**: `_coopApiService.CreateClaimAndActivityRecordsAsync` + `InsertActivityProductSaaSAsync`
- **Description**: Single SP call promotes all temp records to permanent `CLAIM` + `ACTIVITY` tables. Budget consumed. Returns `ClaimSeq`; subsequent read gets `process_number`.

### COOP-FU-049  Email Contact Records on Claim
- **Category**: DataPersistence
- **Risk**: Medium
- **Legacy**: `SaveEmailsToClaim` → `_addressService.UpdateContact` for each selected email (To/CC)
- **Modern**: Needs verification — `SaveEmailsToClaim` not yet confirmed as API-migrated
- **Description**: Each selected confirmation email saved as a `CONTACT` record linked to the `CLAIM`, enabling audit trail of who was notified.

---

## Security

### COOP-FU-050  Unauthenticated Access Redirect
- **Category**: Security
- **Risk**: Critical
- **Legacy**: `BasePageModel` auth check; dealer without `dealer_number_seq` → redirect to `/CoopManagement/dealer/AdminIndex`
- **Modern**: Same
- **Description**: Unauthenticated users redirected to login. Dealer users without an established dealer context redirected to admin index with `PageReturnURL` set.

### COOP-FU-051  Dealer Data Scoping
- **Category**: Security
- **Risk**: Critical
- **Legacy**: All service calls scoped to `DealerNumberSeq` resolved at `OnGet`; dealer users forced to their own seq
- **Modern**: Same
- **Description**: Dealer users can only submit claims for their own dealer. Admin users must select a dealer first. `dealer_number_seq` resolved and stored in session; all subsequent calls use it.

### COOP-FU-052  Pre-Approval Dealer Ownership Check
- **Category**: Security
- **Risk**: High
- **Legacy**: `OnGetCheckAdCodeNumber` — org structure check: verifies the PA's dealer is in the user's authorized dealer list
- **Modern**: `_coopApiService.GetDealersListAsync` for org structure check
- **Description**: Corporate users with org structure can only use pre-approvals belonging to dealers in their hierarchy. Prevents cross-dealer PA use.

### COOP-FU-053  Encrypted Parameters in Requests
- **Category**: Security
- **Risk**: High
- **Legacy**: `dealer_number_seq`, `program_dealer_type_seq`, `product_seq`, `preapproval_seq` encrypted in all client-facing values via `_encryptDecrypt`
- **Modern**: Same encryption pattern applied consistently
- **Description**: All database sequence IDs exposed to the client are encrypted. Server-side decrypts before use. Prevents enumeration attacks.
