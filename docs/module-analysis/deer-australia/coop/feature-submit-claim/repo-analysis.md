# Coop — Submit Claim — Repository Analysis Report

**Client:** Deer Australia  
**Module:** CoopManagement  
**Feature:** Submit Claim (Online)  
**Framework:** ASP.NET WebForms (VB.NET)  
**Generated:** 2026-07-08

---

## Source Files Analyzed

| File | Layer | Purpose |
|---|---|---|
| `CoopManagement/Claims/Submit/OnlineClaimForm-Step1.aspx` | UI | Submit Claim form — fields, layout, client-side behavior |
| `CoopManagement/Claims/Submit/OnlineClaimForm-Step1.aspx.vb` | Business Logic | Page_Load, validation, business rules, DB orchestration |
| `Classes/ClaimInformation.vb` | Data Model | Claim session transfer object — all claim/activity properties |
| `Classes/clsBudget.vb` | Business Logic | Budget retrieval, fund transfers, program budget lookup |
| `Classes/clsDatabaseSelect.vb` | Data Access | Select SP calls — dealer, claim, activity queries |
| `Classes/clsDatabaseUpdate.vb` | Data Access | Update SP calls — claim, activity, document writes |
| `Classes/clsSession.vb` | Security | Session management, role assignments, login flows |
| `App_GlobalResources/GlobalResources.resx` | Localization | Validation messages, field labels |
| `Scripts/AjaxCall.js` | Client-side | AJAX wrapper, session timeout handling |

---

## UI / Form Fields

| Field ID | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| `drpPreapproval` | DropDownList | Yes | Select Pre-Approval Number | — | Value -1 = unselected; filters by finance type and JDF approval status |
| `txtEmail` | TextBox | Yes | Contact Email | — | Max 250 chars |
| `rbAdvertising` | RadioButton | Yes (one of 3) | Advertising | GroupName="expenseType" | Triggers `bindMediaType(lngMediaCategorySeqAdvertising)` |
| `rbSalesSupport` | RadioButton | Yes (one of 3) | Sales Support | GroupName="expenseType" | Triggers `bindMediaType(lngMediaCategorySeqSalesSupport)` |
| `rbDSO` | RadioButton | Yes (one of 3) | DSO | Visible=false initially | Only shown for DSO claim types |
| `drpMediaCategory` | DropDownList | Yes | Advertising Type | Populated after preapproval selected | Bound from `getMediaTypeByProgramSeq()` |
| `drpFund` | DropDownList | Yes | Select Allocation / Fund | — | Bound from program budget; affects reimbursement calculation |
| `txtMediaName` | TextBox | Yes | Vendor Name | — | Required |
| `txtInvoiceNumber` | TextBox | Yes | Invoice Number | — | Required |
| `txtInvoiceAmount` | TextBox | Yes | Paid Invoice Amount | — | Decimal only; max 12 chars; must be > 0; 2 decimal places enforced client-side |
| `ctrlCalendarTextBox1` | Calendar | Yes | Publisher/Vendor Invoice Date | — | No future dates |
| `ctrlCalendarTextBox2` | Calendar | Yes | Activity Date(s) | — | Multiple dates via Add Date; no duplicates |
| `calDealerInvoiceDate` | Calendar | No | Dealer Invoice Date | — | No future dates |
| `txtDealeInvoiceNo` | TextBox | No | Dealer Invoice Number | — | Optional |
| `txtClaim` | TextBox | Yes | Claim Amount | — | Must be > 0; client-side: decimal only |
| `lblClaimAmount` | Label | — | Auto-calculated Claim Amount (display) | — | Read-only; = invoice amount × 50% |
| `txtAutoClaim` | TextBox (hidden) | — | Auto-calculated claim value | — | Used as hidden carrier for 50% calculation |
| `txtTotalAdvertisementAmount` | TextBox | — | Total Advertisement Amount incl. GST | — | Populated from preapproval |
| `txtFirstPlacementDate` | TextBox (readonly) | — | First Placement Date | — | Populated from preapproval |
| `txtLastPlacementDate` | TextBox (readonly) | — | Last Placement Date | — | Populated from preapproval |
| `txtAvailablePreAppAmount` | TextBox (hidden) | — | Available preapproval amount | — | = TotalAdvertisementAmount - total_invoice_amount |
| `txtRemainingPreapproval` | TextBox (hidden) | — | Remaining preapproval balance | — | Used in claim amount cap validation |
| `dgrdActivityDates` | DataGrid | Yes | Activity Dates list | — | At least one required; Delete button per row |
| `btnNext` | Button | — | Submit Claim | Disabled if no funds | Triggers full validation and save |
| `btnAddDate` | Button | — | Add Activity Date | Disabled if no funds | Validates for duplicates |
| `litFundsAvailable` | Literal | — | Allocation Fund Remaining | — | Read-only fund balance display |
| `lblReimbursementPercent` | Label | — | Reimbursement % | — | Displays "50%" always (both TMF and non-TMF) |
| `hdnEditMode` | Hidden | — | Edit mode flag | — | "EDIT" or "" (empty = new) |

---

## API / Handler Endpoints

| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `Page_Load` (WebForms) | Role: BMDLR, BMAGDLR, BMADMIN | Load form; validate user role; get dealer country; load preapprovals; check fund balance |
| POST | `btnNext_Click` | Role: BMDLR, BMAGDLR, BMADMIN | Validate all fields; save claim (status=RECEIVED/IN PROGRESS); save activity; redirect to Step 2 |
| POST | `btnAddDate_Click` | Authenticated | Add activity date to session grid; validate no duplicates |
| POST | `drpPreapproval_SelectedIndexChanged` | Authenticated | Load preapproval details; calculate available amount; populate media types |
| POST | `drpMediaCategory_SelectedIndexChanged` | Authenticated | Recalculate claim amount |
| POST | `drpFund_SelectedIndexChanged` | Authenticated | Show reimbursement %; re-focus form |
| POST | `rbAdvertising_CheckedChanged` | Authenticated | Bind media types for Advertising category |
| POST | `rbSalesSupport_CheckedChanged` | Authenticated | Bind media types for Sales Support category |

---

## Business Rules

| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-CL-001 | Role enforcement | `Page_Load` | Only BMDLR, BMAGDLR, BMADMIN may access. Unauthorized → redirect to `~/DealerSearch/` |
| BR-CL-002 | Disabled dealer block | `Page_Load` | If BMDLR + `IsDisableDealerActivity()` = true → redirect to `DealerDisable.aspx` |
| BR-CL-003 | Zero fund balance block | `GetFundsAvailable()` | If `current_budget <= 0` → disable all form controls; show "You have no fund balance to continue." |
| BR-CL-004 | Preapproval filter — JDF Finance | `drpPreapprovalbind()` | Preapprovals with JDF Finance ("John Deere Financial - Consumer Finance" or "John Deere Financial - Commercial Finance") require both `status='APPROVED'` AND `jdf_status='APPROVED'` |
| BR-CL-005 | Preapproval filter — non-JDF Finance | `drpPreapprovalbind()` | Preapprovals with finance = NULL / "" / "No finance promoted" / "Other Financier" require only `status='APPROVED'` |
| BR-CL-006 | Preapproval filter — used balance | `drpPreapprovalbind()` | For NEW claims: only show preapprovals where `total_amount_used < amount` |
| BR-CL-007 | Preapproval filter — CRC user | `drpPreapprovalbind()` | If user level is BMAG or BMAGDLR: filter preapprovals to `crc_user_seq = clsSession.slngCRCUserSeq` |
| BR-CL-008 | Preapproval filter — placement date | `drpPreapprovalbind()` | Only preapprovals where `placement_date >= StartDateForPreapproval()` |
| BR-CL-009 | Reimbursement rate fixed at 50% | `setClaimAmount()`, `drpFund_SelectedIndexChanged()` | Both TMF and non-TMF funds pay at 50% reimbursement; no variation by fund type |
| BR-CL-010 | Claim amount cap — NEW claim | `btnNext_Click()` | `claimamount <= remainingpreappamount` (remaining from preapproval) |
| BR-CL-011 | Claim amount cap — EDIT claim (not denied/cancelled) | `btnNext_Click()` | `claimamount - existingclaimamount <= remainingpreappamount` |
| BR-CL-012 | Activity date uniqueness | `btnAddDate_Click()` | Duplicate activity dates rejected; message: "Activity date cannot be duplicated" (resource key: `StrNoDuplicateDate`) |
| BR-CL-013 | At least one activity date | `btnNext_Click()` | At least one date in `dgrdActivityDates` required before submitting |
| BR-CL-014 | Country-based currency display | `getDealerCountry()` | If country_code = "NZL": show NZD labels and currency conversion rate; if "AUS": show AUD labels |
| BR-CL-015 | NZL conversion rate | `getDealerCountry()` | Calls `getCurrencyByProgramSeq()` to get AUD→NZD rate; amounts stored in AUD after division by rate |
| BR-CL-016 | Claim status on submit | `saveClaim()` | New claim: status = "RECEIVED", sub_status = "IN PROGRESS" |
| BR-CL-017 | Claim status on edit (approved) | `saveActivity()` | If existing condition = "APPROVED": activity claim_status = "PROCESSED", condition = "APPROVED" |
| BR-CL-018 | Claim status on edit (other) | `saveActivity()` | If existing condition ≠ "APPROVED": activity claim_status = "NOT PROCESSED", condition = "VALID" |
| BR-CL-019 | BMADMIN querystring requirement | `Page_Load` | BMADMIN must supply: `lngClaimSeq`, `dealer_number_seq`, `procNum`, `CLAIM_MODE` via querystring |
| BR-CL-020 | Consumer media type clears preapproval | `drpMediaCategory_SelectedIndexChanged` | If media type contains "consumer": reset `drpPreapproval.SelectedIndex = 0` |

---

## Validation Rules

| Field | Rule | Error Message | Client / Server |
|---|---|---|---|
| `drpMediaCategory` | Required (index ≠ 0) | `lblMediaTypeError`: "* Required" | Server |
| `drpFund` | Required (index ≠ 0) | `lblSelectFundError`: "* Required" | Server |
| `txtMediaName` | Required (not null/empty) | `txtMediaNameValidator`: "* Required" | Server |
| `txtInvoiceNumber` | Required (not null/empty) | `txtInvoiceNumberVal`: "* Required" | Server |
| `ctrlCalendarTextBox1` | Required (not empty) | `lblError`: validation error text | Server |
| `txtInvoiceAmount` | Required | `lblErrorInvoiceAmount`: "Invoice amount cannot be 0" | Both |
| `txtInvoiceAmount` | Must be > 0 | `lblErrorInvoiceAmount`: "Invoice amount cannot be 0" | Both |
| `txtInvoiceAmount` | Max 12 chars | `lblErrorInvoiceAmount`: "can only be up to 12 characters long" | Both |
| `txtInvoiceAmount` | Decimal only (no letters) | client-side keypress handler | Client |
| `txtInvoiceAmount` | Max 2 decimal places | client-side input handler | Client |
| `txtClaim` | Required | `lblErrorClaimAmount`: "Claim amount cannot be 0" | Both |
| `txtClaim` | Must be > 0 | `lblErrorClaimAmount`: "Claim amount cannot be 0" | Both |
| `txtClaim` | Decimal only | client-side keypress handler | Client |
| `dgrdActivityDates` | At least one date required | `lblActivityDateError`: "Please Add an Activity Date" | Server |
| Activity dates | No duplicates | `lblActivityDateError`: resource `StrNoDuplicateDate` = "Activity date cannot be duplicated" | Server |
| Claim amount | ≤ remaining preapproval | `compareavailableamount`: amount comparison error | Server |
| Fund balance | Must be > 0 to submit | `lblalertmsg`: "You have no fund balance to continue." | Server |
| `txtEmail` | Required | Not shown explicitly (populated from session) | Server |
| `txtEmail` | Valid email | `StrEnterValidEmailAddress`: "Enter valid email address" | Client |
| Invoice Date | No future dates | Calendar control constraint | Client |
| Dealer Invoice Date | No future dates | Calendar control constraint | Client |

---

## Workflow / Status Transitions

| From Status | To Status | Sub-Status | Trigger | Notification |
|---|---|---|---|---|
| — | RECEIVED | IN PROGRESS | `btnNext_Click` → `saveClaim()` (new claim) | None at Step 1 |
| RECEIVED | RECEIVED | IN PROGRESS | `btnNext_Click` → `saveClaim()` (edit, not approved) | None |
| Any (if condition=APPROVED) | PROCESSED | PROCESSED | `saveActivity()` on edit of approved activity | None at Step 1 |
| INCOMPLETE / stored | RECEIVED | IN PROGRESS | Resume from session and resubmit | None |

**Existing status mapping (from `getClaimStatusByClaimSeq()`):**

| DB condition | DB claim_status | Mapped ExistingStatus |
|---|---|---|
| "APPROVED" | any | "APPROVED" |
| "VALID" | "PROCESSED" | "INPROGRESS" |
| "VALID" | "RECEIVED" | "INPROGRESS" |
| "VALID" | "UNDER REVIEW" | "UNDER REVIEW" |
| (DENY) | any | "DENIED" |
| (CANCELLED) | any | "CANCELLED" |
| (NEED AMENDMENTS) | any | "NEED AMENDMENTS" |

---

## Database Operations

| Operation | Table / SP | Trigger | Key Fields / Parameters |
|---|---|---|---|
| INSERT/UPDATE | `tblClaim` via `objClaim.updateClaim()` | `saveClaim()` | lngClaimSeq (0=new), lngProgramSeq, lngDealerNumberSeq, claimAmount (÷ conversionRate), claimStatus="RECEIVED", claimSubStatus="IN PROGRESS", in_use_flag="N" |
| INSERT/UPDATE | `tblActivity` via `objActivity.updateActivity()` | `saveActivity()` | lngActivitySeq (0=new), lngClaimSeq, media_type_seq, preapproval_seq, vendor_name, program_budget_seq, amount_submitted (÷ conversionRate), amount_not_payable, invoice_number, invoice_date, condition, claim_status |
| DELETE | `tblActivityDate` via `objactivity.deleteActivityDate()` | `saveActivity()` | lngActivitySeq |
| INSERT | `tblActivityDate` via `objactivity.updateActivityDate()` | `saveActivity()` | lngActivitySeq, activity_date |
| DELETE | `tblActivityAdjustment` via `deleteActivityAdjustment()` | `saveActivity()` | lngActivitySeq, lngPDCSeq |
| DELETE | `tblActivityProduct` via `objactivity.deleteActivityProduct()` | EDIT mode | lngActivitySeq |
| SELECT | `tblBudget` via `objReporting.getBudgetRecapByDivision()` | `GetFundsAvailable()` | lngProgramSeq, FiscalYear, "DEALER", lngDealerNumberSeq, lngDivisionSeq |
| SELECT | `tblPreapproval` via `objPreapproval.getPreapprovalAndClaimAmountUsedByDealerNumberSeq()` | `drpPreapprovalbind()` | dealer_number_seq |
| SELECT | `tblActivity` via `objActivity.getActivityByClaimSeq()` | EDIT mode | lngClaimSeq |
| SELECT | Currency via `objClaim.getCurrencyByProgramSeq()` | `getDealerCountry()` (NZL only) | lngProgramSeq |

---

## Security Rules

| Rule | Enforcement | Role / Scope |
|---|---|---|
| Authentication required | `Page_Load` role check; redirect to `~/DealerSearch/` if unauthorized | All roles |
| Dealer-level access | UserLevel must be BMDLR, BMAGDLR, or BMADMIN | BMDLR / BMAGDLR / BMADMIN |
| BMADMIN: explicit dealer scope | Must supply `dealer_number_seq` via querystring | BMADMIN only |
| Disabled dealer block | `IsDisableDealerActivity()` → redirect to `DealerDisable.aspx` | BMDLR |
| CRC user data scope | BMAGDLR: preapprovals filtered to `crc_user_seq = clsSession.slngCRCUserSeq` | BMAGDLR |
| Session-based identity | Dealer number, level, and name loaded from HTTP Session | All roles |
| Anti-forgery | Standard WebForms `__VIEWSTATE` / `__EVENTVALIDATION` | All POST operations |
| In-use flag | Claim `in_use_flag = "N"` set on save to prevent concurrent edits | System |

---

## Data Models

| Class | Key Fields | Purpose |
|---|---|---|
| `ClaimInformation` | Email, Preapproval (preapproval_seq), Reimbursement (%), MediaType, MediaName, Invoice, InvoiceDate, InvoiceAmount, ActivityDates, ActivitySeq, ClaimSeq, MediaSeq, ProgramMediaType, FundName (program_budget_seq), ClaimAmount, DealerAmount, DealerComment, DealerCommentSeq, ActivityNumber, DealerInvoice (PO#), DealerInvoiceDate, FirstPlacementDate, LastPlacementDate, AvailablePreAppAmount, TotalAdvertisementAmount, Admin_dealer_number_seq, ClaimMode ("EDIT"/"NEW"/"ACT"), ExitingStatus, ProcNum | Session transfer object between Claim Step 1 and Step 2 |

---

## Client-Side Behaviors

| Behavior | Trigger | Logic |
|---|---|---|
| Claim amount auto-calculation | `txtInvoiceAmount` focusout | `claimAmount = invoiceAmount × (reimbursementPercent / 100)`; default 50%; update `lblClaimAmount` and `txtAutoClaim` |
| Decimal-only input enforcement | `txtInvoiceAmount` keypress | Allow only digits (48–57), decimal point (46, max 1), backspace (8) |
| Max 2 decimal places | `txtInvoiceAmount` input | Truncate to 2 decimal places using regex `/^-?\d+(?:\.\d{0,2})?/` |
| Leading decimal prevention | `txtInvoiceAmount` input | Prepend "0" if value starts with "." |
| Fund change recalculation | `drpFund` click | Recalculate `(invoiceAmount - dealerAmount) × reimbursementPercent / 100` |
| Before-unload warning | `window.onbeforeunload` (commented out) | "When all your activities have been added, you must click on the 'Submit Claim' button…" |
| Cancel confirmation | `CancelClaim()` | `confirm("Are you sure you want to cancel this claim?")` |
| Ad search popup | `.pseudo-link` click | Show `.popoutPanel` modal; calculate position relative to scroll |
| Pre-made ad selection | `.item-link` click | Set `data-id` to `.ad-target`; reset preapproval and media dropdowns |
| DataTable initialization | `document.ready` | Initialize `dgrdActivityDates` as DataTable with scrollY=110px, scrollCollapse |
| Session timeout handling | AJAX 419 response | Redirect to `data.url` (login page) |
| Session validation | AJAX 400 response | GET `/Index/ValidateUserSession`; redirect to `/Account/Logout` if invalid |

---

## Quality Gate Summary

| Category | Count | Status |
|---|---|---|
| UI form fields documented | 25 | ✅ |
| Business rules extracted | 20 | ✅ |
| Validation rules (field-level) | 15 | ✅ |
| Status transitions mapped | 4 | ✅ |
| Database write operations documented | 6 | ✅ |
| Security constraints documented | 8 | ✅ |
| Client-side behaviors documented | 10 | ✅ |
