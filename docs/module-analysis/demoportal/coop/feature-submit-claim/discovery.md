# Coop - Submit Claim : Discovery Report

> Generated: 2026-06-17
> Pipeline step: Step 1 - Repository Discovery
> Module: `coop` | Feature: `submit-claim`

---

## Legacy Source Files

| File | Purpose |
|---|---|
| `Pages\CoopManagement\Claims\Submit\SubmitClaim.cshtml` | 4-step wizard UI |
| `Pages\CoopManagement\Claims\Submit\SubmitClaim.cshtml.cs` | Page model: all handlers, service calls, submit orchestration |
| `Pages\CoopManagement\Claims\Submit\_ClaimMediaType.cshtml` | Partial: media type icon grid |
| `Pages\CoopManagement\Claims\Submit\_ClaimProcess.cshtml` | Partial: activity form (invoice, amounts, product lines, vendor) |
| `Pages\CoopManagement\Claims\Submit\_DealerShipContactDetail.cshtml` | Partial: confirmation email section |
| `Pages\CoopManagement\Claims\Submit\_VendorInformation.cshtml` | Partial: vendor name/address form (conditional) |

## Modern Source Files

| File | Purpose |
|---|---|
| `Pages\CoopManagement\Claims\Submit\SubmitClaim.cshtml` | Identical UI - same 4-step wizard (shared CSHTML) |
| `Pages\CoopManagement\Claims\Submit\SubmitClaim.cshtml.cs` | Async page model - all service calls replaced with API client calls |
| `Pages\CoopManagement\Claims\Submit\SubmitClaim.cshtml.Email.cs` | Email partial class (new in modern) |
| `Infrastructure\ApiClients\Coop\CoopApiService.cs` | HTTP client -> `{Gateway}coop/api/SubmitClaim/*` |
| `Infrastructure\ApiClients\Coop\ClaimActivityApiService.cs` | HTTP client: media, preapproval, contacts, documents |
| `Infrastructure\ApiClients\Dealer\IDealerInfoApiService.cs` | HTTP client: dealer contacts and address |
| `BackendAPI\src\modules\coop\Coop.API\Controllers\` | API endpoint controllers |
| `BackendAPI\src\modules\coop\Coop.Application\Services\` | Application-layer services |
| `BackendAPI\src\modules\coop\Coop.Application\Validators\` | FluentValidation validators |
| `BackendAPI\src\modules\coop\Coop.Domain\` | Domain models |
| `BackendAPI\src\modules\coop\Coop.Infrastructure\` | Repository / database layer |

---

## Wizard Steps (UI)

| Step | Section | Condition |
|---|---|---|
| 1 | Choose Claim Type (Pre-approval Yes/No) + Contact Info | Always |
| 2 | Dealer Search | `showDealerSearch == true` (admin/corporate users) |
| 3 | Media Type Selection + Dealer Type filter | Always |
| 4 | Claim Form (activities + confirmation emails) | Always |
| 5 | Confirmation screen (process number + next actions) | After submit |

---

## UI Components

### Hidden State Fields (SubmitClaim.cshtml)

| Field ID | Bound To | Purpose |
|---|---|---|
| `hdnGetVendorInformation` | `Model.getVendorInformation` | Flag: show vendor form |
| `hdnSelectedFiscalYear` | `SelectedFiscalYear` | Selected fiscal year |
| `hdnShowFiscalYearSelection` | `Model.ShowFiscalYearSelection` | Flag: show year radio buttons |
| `hdnOCREnabled` | `Model.isOCREnabled` | OCR feature toggle |
| `hdnshowdealersearchsection` | `Model.showDealerSearch` | Flag: show dealer step |
| `hdnDealerNumberSeq` | `Model.DealerNumberSeq` | Resolved dealer |
| `hdUserProfileEmail` | `Model.Email` | User email for confirmation |
| `hdnCurrentFiscalYear` | `Model.SelectedFiscalYear` | Fiscal year for JS |
| `TempClaimSeq` | `Model.TempClaimSeq` | Draft ID (0 = new) |
| `hdnTempCommentseq` | `Model.claimInformation.TempCommentSeq` | Draft comment seq |
| `hdPDealerTypeSeq` | `Model.ProgramDealerTypeSeq` | Encrypted dealer type |

### Step 1 Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `ClaimType` (radio) | Radio | Yes | `Preapproval` \| `NoPreapproval` |
| `txtAdCode` | Text | Conditional | Pre-approval number; maxlength=25 |
| `txtContactName` / `txtContactName1` | Text | Yes | Submitter name |
| `txtContactEmail` / `txtContactEmail1` | Text | Yes | Submitter email |
| `txtContactPhone` / `txtContactPhone1` | Text | Yes | Phone mask applied |
| `SelectedFiscalYear` (radio) | Radio | Conditional | Shown when `ShowFiscalYearSelection=true` |

### Step 3 Fields

| Field | Type | Notes |
|---|---|---|
| `programDealerTypeDropdown` | Select | Populated via `OnGetDealerTypeList`; filters media type grid |
| Media type icons (`.clsSelectMediaType`) | Clickable li | Sets `media-id`, `program_dealer_type_seq`, `dealeridtext`, `dealeridtextrequiredflag` |

### Step 4 - _ClaimProcess Fields

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `dropzone_fuBGImageInvoice` | File (Dropzone) | Yes | Invoice upload |
| `dropzone_fuBGImage` | File (Dropzone) | No | Supporting documents |
| `drpProductCodes` | Select | Conditional | `DisplayProductBlock != "N"` |
| `txtProductMeasurement` | Text | Conditional | Percentage; rows sum must = 100 |
| `activityCreativeType` | Select | Conditional | Per media type requirement |
| `ddlInvoiceCurrency` | Select | Conditional | `MultiCurrencyInvoice && >1 currency` |
| `txtInvoiceAmt` | Text | Yes | Currency format; maxlength=15 |
| `txtInvoiceNumber` | Text | Yes | maxlength=20 |
| `hdtxtActivityDate` / `txtActivityDate` | Date picker | No | Add multiple; no future dates |
| `txtMediaName` | Text | Yes | maxlength=100; hidden when vendor mode |
| `txtDealerIdText` | Text | Conditional | Per media `dealeridtextrequiredflag` |

### Step 4 - _DealerShipContactDetail Fields

| Field ID | Type | Required | Notes |
|---|---|---|---|
| `txtEmailMe` | Text (readonly) | Yes | Auto-populated from profile |
| `.clsDealerShipContact` | Checkbox | No | Dealer coop-tagged contact emails |
| `txtOtherMediaContact` | Text | No | Add freeform emails |
| `txtMainComment` | Textarea | No | maxlength=500 |

### _VendorInformation Fields (conditional)

| Field | Type | Notes |
|---|---|---|
| `vendorDropdown` | Select | Populated via `OnGetVendorList` |
| `txtVendorName` | Text | maxlength=100 |
| `txtFirstName` / `txtLastName` | Text | max 250 each |
| `txtVendorAddress` | Text | maxlength=100 |
| `txtVendorCity` | Text | maxlength=100 |
| `sltVendorCountry` | Select | Conditional on >1 country |
| `sltVendorState` | Select | Dynamic per country |
| `txtZipCode` | Text | maxlength=15 |
| `txtEmail` | Text | maxlength=300 |
| `txtPhoneNumber` | Text | maxlength=30; phone mask |

---

## API Endpoints (Modern - CoopApiService -> BackendAPI)

| Method | Route | Purpose |
|---|---|---|
| POST | `coop/api/SubmitClaim/GetProgramCurrency` | Multi-currency list |
| POST | `coop/api/SubmitClaim/GetCountryByProgramSeq` | Country dropdown |
| POST | `coop/api/SubmitClaim/GetStates` | States by country |
| POST | `coop/api/SubmitClaim/GetDivisionByProgramSeq` | Active divisions |
| POST | `coop/api/SubmitClaim/GetDealerTypeByDealerNumberSeqSaaS` | Dealer types |
| POST | `coop/api/SubmitClaim/GetDealerBudgetType` | Budget availability |
| POST | `coop/api/SubmitClaim/GetProductLineByDealerNumberSeq` | Product lines |
| POST | `coop/api/SubmitClaim/GetDealerLanguageCurrency` | Dealer currency seq |
| POST | `coop/api/SubmitClaim/GetCurrencyConversionLogByDate` | Conversion rates |
| POST | `coop/api/SubmitClaim/GetProgramData` | Program config (OCR keys etc.) |
| POST | `coop/api/SubmitClaim/GetTempClaimByTempClaimSeq` | Resume draft header |
| POST | `coop/api/SubmitClaim/GetOnlineActivityTempByTempSeq` | Resume draft activities |
| POST | `coop/api/SubmitClaim/GetOnlineActivityProduct` | Resume product lines |
| GET  | `coop/api/SubmitClaim/GetActivityMediaTypeRequirement` | Creative type requirement |
| POST | `coop/api/SubmitClaim/GetDealersByBranchParentSeqSaaS` | Branch dealer list |
| POST | `coop/api/SubmitClaim/GetDealersList` | Dealers by org structure |
| POST | `coop/api/SubmitClaim/UpdateOnlineClaimTemp` | Upsert temp claim header |
| POST | `coop/api/SubmitClaim/UpdateTempClaimDealerNumber` | Temp dealer number (split) |
| POST | `coop/api/SubmitClaim/UpdateOnlineActivityTemp` | Upsert temp activity |
| POST | `coop/api/SubmitClaim/InsertActivityMediaTypeRequirement` | Creative type link |
| POST | `coop/api/SubmitClaim/UpdateOnlineActivityProduct` | Product line per activity |
| POST | `coop/api/SubmitClaim/InsertCurrencyConversionLog` | Log currency conversion |
| POST | `coop/api/SubmitClaim/CreateClaimAndActivityRecords` | Finalize temp -> Claim |
| POST | `coop/api/SubmitClaim/InsertActivityProductSaaS` | Budget deduction |
| POST | `coop/api/SubmitClaim/UpdateClaimDealerNumber` | Claim dealer number (split) |
| POST | `coop/api/SubmitClaim/DeleteTempClaimDealerNumber` | Cleanup temp dealer |
| POST | `coop/api/SubmitClaim/UpdateOCRHit` | Record OCR usage |
| POST | `coop/api/ClaimActivity/GetClaimByClaimSeq` | Get process number |

---

## Services

| Legacy Service Interface | Modern Equivalent |
|---|---|
| `IOnlineClaimService.UpdateOnlineClaimTemp` | `CoopApiService.UpdateOnlineClaimTempAsync` |
| `IOnlineClaimService.UpdateOnlineActivityTemp` | `CoopApiService.UpdateOnlineActivityTempAsync` |
| `IOnlineClaimService.CreateClaimAndActivityRecords` | `CoopApiService.CreateClaimAndActivityRecordsAsync` |
| `IOnlineClaimService.InsertActivityProduct_SaaS` | `CoopApiService.InsertActivityProductSaaSAsync` |
| `IClaimService.GetClaimByClaimSeq` | `CoopApiService.GetClaimByClaimSeqAsync` |
| `IBudgetService.GetDealerBudgetType` | `CoopApiService.GetDealerBudgetTypeAsync` |
| `IBudgetService.GetProductLineByDealerNumberSeq` | `CoopApiService.GetProductLineByDealerNumberSeqAsync` |
| `IMediaService.GetMediaTypesBranchWithProgramSeq` | `ClaimActivityApiService.GetMediaTypesBranchWithProgramSeqAsync` |
| `IMediaService.GetAllMediaTypesRequirementByProgramSeq` | `ClaimActivityApiService.GetMediaTypesRequirementByProgramSeqAsync` |
| `IDealerService.GetDealerByDealerNumSeq` | `DealerInfoApiService.GetDealerSummaryByDealerNumberSeqAsync` |
| `IDealerService.GetDealerTypeByDealerNumberSeq` | `CoopApiService.GetDealerTypeByDealerNumberSeqSaaSAsync` |
| `IAddressService.GetContact (DealerNumber)` | `DealerInfoApiService.GetContactAsync` |
| `IAddressService.GetContact (CRC_USER / ONLINE_ACTIVITY_TEMP)` | `ClaimActivityApiService.GetContactAsync` |
| `IAddressService.GetCountryByProgramSeq` | `CoopApiService.GetCountryByProgramSeqAsync` |
| `IAddressService.UpdateContact` | `CommonAPIService.UpdateContactU01Async` |
| `IPreapprovalService.GetPreapprovalBySearch` | `ClaimActivityApiService.GetPreapprovalBySearchAsync` |
| `IPreapprovalService.GetPreapprovalProduct` | `ClaimActivityApiService.GetPreapprovalProductsAsync` |
| `ICommentService.getComment` | `ClaimActivityApiService.GetCommentAsync` |
| `ICommentService.updateComment` | `ClaimActivityApiService.UpdateCommentAsync` |
| `ICommentService.deleteComment` | `CommonAPIService.DeleteCommentAsync` |
| `IDocumentService.GetDocumentImage` | `ClaimActivityApiService.GetDocumentImageAsync` |
| `IUserService.GetCRCUser` | `ClaimActivityApiService.GetCRCUserAsync` |
| `IDivisionService.GetDivisionByProgramSeq` | `CoopApiService.GetDivisionByProgramSeqAsync` |
| `IProgramService.GetProgramData` | `CoopApiService.GetProgramDataAsync` |
| `IProgramService.GetCurrencyConversionLogbyDate` | `CoopApiService.GetCurrencyConversionLogByDateAsync` |
| `IAddressService.GetCoopVendorContact` | **NOT MIGRATED** - still `_addressService` direct call |
| `IReportService.GetStates` | `CoopApiService.GetStatesByCountrySeqAsync` |

---

## Stored Procedures / Database

| SP / Table | Purpose |
|---|---|
| `USP_ONLINE_CLAIM_TEMP_U01` | Upsert draft claim header |
| `USP_ONLINE_ACTIVITY_TEMP_U01` | Upsert draft activity |
| `USP_ONLINE_ACTIVITY_PRODUCT_U01` | Upsert product line for activity |
| `USP_ONLINE_ACTIVITY_DATE_U01` | Upsert activity date |
| `USP_DOCUMENT_IMAGE_U01` | Upsert file reference record |
| `USP_CREATE_CLAIM_AND_ACTIVITY_RECORDS` | Promote temp records -> CLAIM + ACTIVITY |
| `USP_INSERT_ACTIVITY_PRODUCT_SAAS` | Budget deduction post-submit |
| `CLAIM` (read) | Retrieve `process_number` after finalization |
| `USP_CLAIM_DEALER_NUMBER_U01` | Split/group claim dealer number |
| `USP_TEMP_CLAIM_DEALER_NUMBER_U01` | Draft split dealer number |

---

## Data Models

| Entity | Legacy | Modern |
|---|---|---|
| Draft claim header | `DataSet` from `ONLINE_CLAIM_TEMP` | `SubmitClaimApiModel` (generic) |
| Draft activity | `DataSet` from `ONLINE_ACTIVITY_TEMP` | `SubmitClaimOnlineActivityApiModel` |
| Product line | `DataSet` | `SubmitClaimOnlineActivityProductApiModel` |
| Media type | `MediaTypeModel` | `MediaTypeModel` (mapped from API response) |
| Pre-approval | `PreApprovalModel` | `PreapprovalSearchApiModel` |
| Vendor info | `VendorInformation` (CommonEntity) | `VendorInformation` (local - NOT on API yet) |
| Claim info | `ClaimInformation` (CommonEntity) | `ClaimInformation` (local model) |

---

## Known Gaps (Preliminary)

| # | Gap | Severity |
|---|---|---|
| G-01 | `OnGetVendorInformation` + `OnGetVendorList` still call legacy `_addressService` directly | High |
| G-02 | Modern `OnPostSaveClaim` removed future activity date validation present in legacy | Medium |
| G-03 | Modern `OnPostSaveClaim` removed duplicate activity date check present in legacy | Medium |
| G-04 | `SendClaimEmailToUser` (Email.cs) - verify full API migration of email send | Medium |
| G-05 | File upload storage path - verify `OnPostUploadFile` uses same path strategy in modern | Medium |
