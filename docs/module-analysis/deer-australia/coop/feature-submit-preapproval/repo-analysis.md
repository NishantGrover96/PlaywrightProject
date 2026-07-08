# Coop — Submit Preapproval — Repository Analysis Report

**Client:** Deer Australia  
**Module:** CoopManagement  
**Feature:** Submit Preapproval (Online)  
**Framework:** ASP.NET WebForms (VB.NET)  
**Generated:** 2026-07-08

---

## Source Files Analyzed

| File | Layer | Purpose |
|---|---|---|
| `CoopManagement/Preapprovals/Submit/OnlinePreapprovalForm.aspx` | UI | Submit Preapproval form — fields, layout, document upload, dealer selection |
| `CoopManagement/Preapprovals/Submit/OnlinePreapprovalForm.aspx.vb` | Business Logic | Page_Load, validation, submission logic, email triggers, auto-approval |
| `Classes/ClaimInformation.vb` | Data Model | ClaimInformation session object (shared with claims) |
| `Classes/clsBudget.vb` | Business Logic | Budget retrieval, fund balance checks |
| `Classes/clsDatabaseSelect.vb` | Data Access | Select SP calls — dealer, media type, segment queries |
| `Classes/clsDatabaseUpdate.vb` | Data Access | Update SP calls — preapproval, document, contact writes |
| `Classes/clsSession.vb` | Security | Session management, role enforcement |
| `App_GlobalResources/GlobalResources.resx` | Localization | Validation messages, field labels |
| `Scripts/AjaxCall.js` | Client-side | AJAX wrapper, session timeout handling |
| `CoopManagement/Preapprovals/Submit/FinanceOptions.xml` | Configuration | Finance type options loaded into `drpFinance` |

---

## UI / Form Fields

| Field ID | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| `txtEmail` | TextBox | Yes | Email Address | — | Max 250 chars; pre-populated from `clsSession.UserEmailAddress` |
| `drpMediaCategory` | DropDownList | Yes | Advertisement Type | — | Bound from `getMediaTypeByProgramSeq()`; triggers document type binding |
| `rblMediatype` | RadioButtonList | Conditional | Media Type | Visible=false initially | Alternative media type selection |
| `drpSegment` | DropDownList | Yes | Segment / Market Category | — | Value 0 = unselected; bound from `GetMarketCategoryByDivisionSeq()` |
| `txtTitle` | TextBox | Conditional | Pre-approval Title | Visible=false | Required when shown |
| `calStartDate` | Calendar | Yes | First Placement Date | — | No future dates |
| `calEndDate` | Calendar | No | Last Placement Date | — | Optional |
| `txtComments` | TextBox | No | Additional Comments to Reviewer | — | Max 250 chars; multiline; 6 rows |
| `txtPreapprovalAmt` | TextBox | Yes | Pre-approval Amount incl. GST | — | Max 10 chars; format $X.XX; must be numeric and > 0 and ≤ available funds |
| `txtAdvAmt` | TextBox (hidden) | — | Total Advertisement Amount | — | Calculated; hidden |
| `txtVendorName` | TextBox | Yes | Vendor / Media Name | — | Trimmed; required |
| `txtAddLink` | TextBox | No | Link / URL for additional documents | — | Optional |
| `drpFinance` | DropDownList | JDFADMIN only | Finance Type | Visible for JDFADMIN | Loaded from `FinanceOptions.xml`; must select JDF Consumer or Commercial Finance |
| `radFinance` | RadioButton | Conditional | Finance selection | — | Alternative to dropdown |
| `drpDocumentType` | DropDownList | Yes (when uploading) | Document Type | — | Bound from `GetDocumentTypeMediaTypeWise()` where `preapproval_required='Y'` |
| `my-awesome-dropzone` | File Upload (Dropzone) | Yes (unless link provided) | Document Upload | Non-admin required | Max 100 MB per file; accepted formats: .xls, .xlsx, .pdf, .jpg, .tif, .wmv, .mpeg, .png, .ppt, .zip, .rar, .avi, .mdi, .wav, .ppsx, .html, .msg, .mht, .xps, .mpg, .rtf, .vsd, .mp3, .mp4, .txt, .bmp, .jpeg, .doc, .docx |
| `documentList` | Hidden | — | Uploaded file names | — | Semicolon-separated; persists between postbacks |
| `dgrdUploadFiles` | DataGrid | — | Uploaded documents list | — | Shows filename + Delete button |
| `txtDealerNumber` | TextBox | No | Dealer account # | — | Used to add dealers to selection |
| `dgrdDealers` | DataGrid | — | Selected dealers | — | Auto-includes current dealer |
| `btnSelectDealers` | Button | — | Open dealer selection panel | — | Opens dealer search UI |
| `btnAddDealer` | Button | — | Add dealer | — | Adds dealer from `txtDealerNumber` |
| `gvSponsorshipDetails` | GridView | Conditional | Sponsorship details | Visible for sponsorship media types | Media type, dates, amounts |
| `chkMediaselect` | CheckBox (per row) | Conditional | Select sponsorship item | Required if sponsorships visible | At least one must be checked |
| `btnSubmit` | Button | — | Submit / Submit and Approve | — | Admin: "Submit and Approve" unless JDF Finance; Dealer: "Submit" |
| `lblConversionRate` | Label | — | AUD→NZD exchange rate | NZL dealers only | Currency conversion display |

---

## API / Handler Endpoints

| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `Page_Load` | Role: BMDLR, BMAGDLR | Load form; check user level; check fund balance; bind dropdowns; pre-populate email; load uploaded documents |
| POST | `btnSubmit_Click` | Role: BMDLR, BMAGDLR | Validate all fields; create preapproval; save dealers; upload documents; save comments; save contact; send emails / auto-approve |
| POST | `btnAddDealer_Click` | Authenticated | Validate dealer number; call `getDealerByDealerNumber()`; add to dealer grid |
| POST | `drpMediaCategory_SelectedIndexChanged` | Authenticated | Rebind document types |
| POST | `btnSubmitFinance_Click` | JDFADMIN | Submit with JDF Finance type |

---

## Business Rules

| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-PA-001 | Role enforcement | `Page_Load` | Only BMDLR and BMAGDLR may access. Unauthorized → redirect |
| BR-PA-002 | Disabled dealer block | `Page_Load` | If BMDLR + `IsDisableDealerActivity()` = true → redirect to `DealerDisable.aspx` |
| BR-PA-003 | No-cache headers | `Page_Load` | Sets HTTP response headers: NoCache, ServerAndNoCache, no-store |
| BR-PA-004 | Zero fund balance block | `GetAvailableFunds()` | If `current_budget <= 0` → show "You have $0 remaining balance so you can not submit Pre-approval request" |
| BR-PA-005 | Preapproval amount cap | `btnSubmit_Click()` | `txtPreapprovalAmt` must be ≤ available fund balance |
| BR-PA-006 | Document OR link required (non-admin) | `btnSubmit_Click()` | Non-admin must upload at least one document OR provide a link in `txtAddLink`; error: "Please select at least one option upload document or provide the link" |
| BR-PA-007 | JDF Finance selection enforcement | `btnSubmit_Click()` | If JDFADMIN: must select "John Deere Financial - Consumer Finance" or "John Deere Financial - Commercial Finance" |
| BR-PA-008 | Sponsorship checkbox required | `btnSubmit_Click()` | If `gvSponsorshipDetails` is visible: at least one `chkMediaselect` must be checked; error: "At least one sponsorship must be selected" |
| BR-PA-009 | Preapproval status on submit | `btnSubmit_Click()` | All new preapprovals saved with status = "PENDING REVIEW" |
| BR-PA-010 | Admin auto-approve (non-JDF) | `btnSubmit_Click()` | If BMADMIN submits without JDF finance (no checkbox): calls `AutoApprovePreapproval()` → status set to "APPROVED" immediately |
| BR-PA-011 | Admin submit and approve button | `Page_Load` | `btnSubmit.Text = "Submit and Approve"` for BMADMIN unless JDF Finance type selected |
| BR-PA-012 | Document file rename on upload | `btnSubmit_Click()` | Uploaded files renamed to `{preapproval_number}_{original_filename}` before record creation |
| BR-PA-013 | Country-based currency display | `getDealerCountry()` | NZL dealers see NZD labels and AUD conversion rate |
| BR-PA-014 | Default dealer included | `bindDealerGrid(True)` | Current logged-in dealer automatically added to `dgrdDealers` on load |
| BR-PA-015 | Duplicate dealer prevention | `btnAddDealer_Click()` | Checks if dealer already exists in grid before adding |
| BR-PA-016 | Contact auto-create | `GetAddressSeqForContact()` | If dealer has no address_type_seq = 2: creates one via `objAddress.updateAddress()` |
| BR-PA-017 | Email populated from session | `Page_Load` | `txtEmail.Text = clsSession.UserEmailAddress` |

---

## Validation Rules

| Field | Rule | Error Message | Client / Server |
|---|---|---|---|
| `txtEmail` | Required | `litEmailAddressError`: "* Required" | Server |
| `txtEmail` | Valid email format | `revEmail1`: "Please enter a valid email address" | Client |
| `drpMediaCategory` | Required (value ≠ "") | `litMediaTypeError`: "* Required" | Server |
| `drpSegment` | Required (value ≠ "0") | `litSegmentError`: "* Required" | Server |
| `txtTitle` | Required (when visible) | `errTxtTitle`: "* Required" | Server |
| `calStartDate` | Required | `ltFirstPlacementDateErrorMsg`: "* Required" | Server |
| `txtVendorName` | Required (trimmed, not empty) | `errTxtVendor`: "* Required" | Server |
| `txtPreapprovalAmt` | Required | `lblpreapprovalAmtError`: "* Required" | Server |
| `txtPreapprovalAmt` | Must be numeric | `lblpreapprovalAmtError` | Server |
| `txtPreapprovalAmt` | Must be > 0 | `lblZeroAmount` | Server |
| `txtPreapprovalAmt` | Must be ≤ available funds | `diverrorpreapproval` | Server |
| `txtPreapprovalAmt` | Max 10 chars | — | Client |
| Fund balance | Must be > $0 to submit | `lblZeroAmount`: "You have $0 remaining balance so you can not submit Pre-approval request" | Server |
| Document upload | Required for non-admin (unless link provided) | `dropzoneError`: "* Required" / `lblUploadErrorMsg`: "Please select at least one option upload document or provide the link" | Server |
| `drpDocumentType` | Required when uploading | `lblUploadErrorMsg` | Server |
| `drpFinance` | Required for JDFADMIN | `litDrpFinanceError` | Server |
| Sponsorship | At least one checked (when visible) | `dvSposnorshipError`: "At least one sponsorship must be selected" | Server |
| `txtDealerNumber` | Not empty before add | — | Server |
| Document upload | File size max 100 MB | Client-side Dropzone | Client |
| Document upload | File type whitelist | `.xls, .xlsx, .pdf, .jpg, .tif, .wmv, .mpeg, .png, .ppt, .zip, .rar, .avi, .mdi, .wav, .ppsx, .html, .msg, .mht, .xps, .mpg, .rtf, .vsd, .mp3, .mp4, .txt, .bmp, .jpeg, .doc, .docx` | Client |
| `calStartDate` | No future dates | Calendar control | Client |

---

## Workflow / Status Transitions

| From Status | To Status | Trigger | Who | Notification |
|---|---|---|---|---|
| — | PENDING REVIEW | `btnSubmit_Click()` (dealer/agency) | BMDLR / BMAGDLR | `SendEmail()` to admin |
| — | APPROVED | `AutoApprovePreapproval()` (admin, non-JDF) | BMADMIN | Optional `SendApprovedEmail()` |
| PENDING REVIEW | APPROVED | Admin approves later | BMADMIN | `SendApprovedEmail()` |
| — | PENDING REVIEW (JDF pending) | `btnSubmit_Click()` (JDFADMIN with JDF Finance) | JDFADMIN | `SendEmail()` |
| PENDING REVIEW | APPROVED (admin with checkbox) | `btnSubmit_Click()` + checkbox checked | BMADMIN | `SendAdminRequestedEmail()` or `SendApprovedEmail()` |

**JDF Status tracking:**
- Preapprovals with JDF Finance have separate `jdf_status` field
- `jdf_status = "APPROVED"` required in addition to `status = "APPROVED"` before claim can be linked

---

## Database Operations

| Operation | Table / SP | Trigger | Key Fields / Parameters |
|---|---|---|---|
| INSERT | `tblPreapproval` via `objPreapproval.updatePreapproval()` | `btnSubmit_Click()` | lngPreapprovalSeqOut (0=new), lngProgramSeq, media_type_seq, title, start_date, end_date, status="PENDING REVIEW", condition="NULL", lngOnlineSubmissionSourceSeq, decConversionRate |
| INSERT | `tblPreapprovalDealer` via `objPreapproval.updatePreapprovalDealer()` | Per dealer in grid | lngPreapprovalSeqOut, lngDealerNumberSeq |
| UPDATE | `tblPreapproval` via `objPreapproval.updatePreapprovaldata()` | After initial insert | lngPreapprovalSeqOut, preapprovalAmt, advAmt, vendorName, financeType, addLink, segmentSeq, drpFinanceValue |
| INSERT | `tblPreapprovalDetails` via `objPreapproval.updatePreapprovalDetails()` | If sponsorships selected | lngPreapprovalSeqOut, mediaName, mediaTypeSeq, detail |
| INSERT | `tblDocumentImage` via `objDocument.updateDocumentImage()` | Per uploaded file | documentTypeSeq, "PREAPPROVAL", lngPreapprovalSeqOut, renamedFilename |
| INSERT | `tblComment` via `objComment.updateComment()` | `txtComments` not empty | "PREAPPROVAL", lngPreapprovalSeqOut, comment_type="PREAPPROVAL", comment=txtComments.Text, "Y", "N", "Dealer" |
| INSERT/UPDATE | `tblContact` via `objAddress.updateContact()` | Always | "PREAPPROVAL", lngPreapprovalSeqOut, firstName, lastName, email=txtEmail.Text, position="TO" |
| INSERT | `tblAddress` via `objAddress.updateAddress()` | If no address_type_seq=2 | "DEALER_NAME", lngDealerNameSeq, address_type_seq=2 |
| SELECT | `tblBudget` via `objReporting.getBudgetRecapByDivision()` | `GetAvailableFunds()` | lngProgramSeq, FiscalYear, strAccessType, strAccessParam, lngDivisionSeq |
| SELECT | Media types via `objMedia.getMediaTypeByProgramSeq()` | `bindMediaType()` | lngProgramSeq, "Y" (active only) |
| SELECT | Segments via `objMarketCat.GetMarketCategoryByDivisionSeq()` | `bindMediaType()` | lngDivisionSeq |
| SELECT | Document types via `objMediaType.GetDocumentTypeMediaTypeWise()` | `bindDocumentType()` | lngProgramSeq, drpMediaCategory.SelectedValue; filter: preapproval_required='Y' |
| SELECT | `tblDealer` via `objDealer.getDealerByDealerNumber()` | `btnAddDealer_Click()` | lngProgramSeq, txtDealerNumber.Text |

---

## Security Rules

| Rule | Enforcement | Role / Scope |
|---|---|---|
| Authentication required | `Page_Load` role check | All roles |
| Dealer-only access | UserLevel must be BMDLR or BMAGDLR | BMDLR / BMAGDLR |
| Disabled dealer block | `IsDisableDealerActivity()` → redirect | BMDLR |
| No-cache headers | Set in `Page_Load` | All requests |
| Email pre-populated from session | `txtEmail = clsSession.UserEmailAddress` — prevents spoofing | BMDLR / BMAGDLR |
| Dealer data scope | Dealer in `dgrdDealers` must match valid dealer from `getDealerByDealerNumber()` | All roles |
| File upload type restriction | Dropzone client-side whitelist + server rename | All roles |
| File rename security | Files renamed to `{preapproval_number}_{filename}` preventing path traversal | Server |
| Session-based identity | All dealer info from HTTP Session | All roles |
| Anti-forgery | Standard WebForms `__VIEWSTATE` / `__EVENTVALIDATION` | All POST operations |
| JDFADMIN finance enforcement | Finance type required for JDFADMIN to prevent unapproved JDF submissions | JDFADMIN |

---

## Data Models

| Class | Key Fields | Purpose |
|---|---|---|
| `Preapproval` | preapproval_seq, preapproval_number, program_seq, media_type_seq, vendor_name, advertised_amount, start_date, end_date, status, jdf_status, program_budget_seq | Preapproval header |
| `PreapprovalDealer` | preapproval_seq, dealer_number_seq | Links dealers to preapproval |
| `DocumentImage` | document_image_seq, document_type_seq, owner_table, owner_table_seq, file_name | Uploaded document record |
| `Contact` | contact_seq, owner_table, owner_table_seq, first_name, last_name, email, position ("TO") | Contact linked to preapproval |
| `Comment` | comment_seq, owner_table ("PREAPPROVAL"), owner_table_seq, comment, comment_type | Dealer comments on submission |

---

## Client-Side Behaviors

| Behavior | Trigger | Logic |
|---|---|---|
| Email pre-population | Page load | `txtEmail` set from session; user can override |
| File drag-and-drop upload | Dropzone | Files uploaded immediately on drop; validate size ≤ 100 MB and file type |
| Document list persistence | Hidden `documentList` field | Semicolon-separated filenames persist across postbacks |
| Document delete | Delete button in `dgrdUploadFiles` | Remove from grid and `documentList` |
| Dealer add validation | `btnAddDealer_Click` | Check `txtDealerNumber` not empty; check not duplicate |
| Dealer remove | Remove button in `dgrdDealers` | Remove from dealer grid DataTable |
| Finance dropdown visibility | JDFADMIN role | `drpFinance` and related panel shown only for JDFADMIN |
| Sponsorship grid toggle | Media category selection | `gvSponsorshipDetails` visible when media type = sponsorship |
| Currency conversion display | NZL dealers | Show `lblConversionRate` with AUD→NZD rate |
| Session timeout | AJAX 419 | Redirect to login page |
| Session validation | AJAX 400 | GET `/Index/ValidateUserSession` → `/Account/Logout` if invalid |

---

## Email Notifications

| Scenario | Method | Recipients |
|---|---|---|
| Dealer submits (non-admin) | `SendEmail(strPreapprovalNumber, lngPreapprovalSeqOut)` | Admin notification |
| JDFADMIN submits with JDF Finance | `SendEmail()` | Admin / JDF team notification |
| Admin auto-approves | `AutoApprovePreapproval()` + optional `SendApprovedEmail()` | Dealer confirmation |
| Admin requests additional info | `SendAdminRequestedEmail()` | Dealer |
| Admin approves with checkbox | `SendApprovedEmail()` | Dealer |

---

## Quality Gate Summary

| Category | Count | Status |
|---|---|---|
| UI form fields documented | 26 | ✅ |
| Business rules extracted | 17 | ✅ |
| Validation rules (field-level) | 20 | ✅ |
| Status transitions mapped | 5 | ✅ |
| Database write operations documented | 8 | ✅ |
| Security constraints documented | 10 | ✅ |
| Client-side behaviors documented | 10 | ✅ |
| Email notification scenarios documented | 5 | ✅ |
