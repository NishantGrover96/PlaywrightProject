# Coop — Submit Claim — Business Rule Catalog

**Client:** Deer Australia  
**Module:** coop  
**Feature:** submit-claim  
**Generated:** 2026-07-08  
**Source:** repo-analysis.md (repo-only; no UI analysis)

---

## Business Rule Catalog

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-CL-001 | Role enforcement — dealer roles only | Security | `Page_Load` role check | Redirect to `~/DealerSearch/` for unauthorized roles | P1-Critical |
| BR-CL-002 | Disabled dealer block | Security | `IsDisableDealerActivity()` | Redirect to `DealerDisable.aspx` | P1-Critical |
| BR-CL-003 | Zero fund balance disables form | Business Logic | `GetFundsAvailable()` → `decFundsAvailable <= 0` | All controls disabled; alert "You have no fund balance to continue." | P1-Critical |
| BR-CL-004 | JDF Finance preapproval filter — dual approval required | Business Logic | `drpPreapprovalbind()` JDF status check | Preapprovals with JDF finance require both `status='APPROVED'` AND `jdf_status='APPROVED'` | P2-High |
| BR-CL-005 | Non-JDF Finance preapproval filter — single approval | Business Logic | `drpPreapprovalbind()` non-JDF filter | Non-JDF preapprovals require only `status='APPROVED'` | P2-High |
| BR-CL-006 | Preapproval filter — exclude fully-used | Business Logic | `drpPreapprovalbind()` amount check | For NEW claims: `total_amount_used < amount`; exhausted preapprovals hidden | P2-High |
| BR-CL-007 | Preapproval filter — CRC user scope | Security | `drpPreapprovalbind()` CRC filter | BMAGDLR sees only preapprovals for their `crc_user_seq` | P2-High |
| BR-CL-008 | Preapproval filter — placement date window | Business Logic | `drpPreapprovalbind()` date filter | Only preapprovals where `placement_date >= StartDateForPreapproval()` | P2-High |
| BR-CL-009 | Reimbursement rate fixed at 50% | Business Logic | `setClaimAmount()`, `drpFund_SelectedIndexChanged()` | `lblReimbursementPercent` always shows "50%"; claim = invoice × 50% | P2-High |
| BR-CL-010 | Claim amount cap — new claim | Business Logic | `btnNext_Click()` cap check | `claimAmount <= remainingPreapprovalAmount` | P1-Critical |
| BR-CL-011 | Claim amount cap — edit claim | Business Logic | `btnNext_Click()` edit cap check | `claimAmount - existingClaimAmount <= remainingPreapprovalAmount` | P2-High |
| BR-CL-012 | Activity date uniqueness | Validation | `btnAddDate_Click()` duplicate check | Error: "Activity date cannot be duplicated" | P2-High |
| BR-CL-013 | At least one activity date required | Validation | `btnNext_Click()` date count check | Error: "Please Add an Activity Date" | P2-High |
| BR-CL-014 | Country-based currency display | Business Logic | `getDealerCountry()` country_code check | AUS = AUD labels; NZL = NZD labels + conversion rate display | P3-Medium |
| BR-CL-015 | NZL currency conversion on amounts | Business Logic | `getDealerCountry()` → `getCurrencyByProgramSeq()` | NZL amounts divided by conversion rate; stored in AUD | P3-Medium |
| BR-CL-016 | New claim status on submit | Workflow | `saveClaim()` status assignment | status="RECEIVED", sub_status="IN PROGRESS" | P1-Critical |
| BR-CL-017 | Approved activity status on edit | Workflow | `saveActivity()` condition check | If condition="APPROVED": claim_status="PROCESSED", condition="APPROVED" | P2-High |
| BR-CL-018 | Non-approved activity status on edit | Workflow | `saveActivity()` condition check | If condition≠"APPROVED": claim_status="NOT PROCESSED", condition="VALID" | P2-High |
| BR-CL-019 | BMADMIN requires querystring scope | Security | `Page_Load` BMADMIN check | BMADMIN must supply `lngClaimSeq`, `dealer_number_seq`, `procNum`, `CLAIM_MODE` | P2-High |
| BR-CL-020 | Consumer media type clears preapproval | Business Logic | `drpMediaCategory_SelectedIndexChanged()` | If media type contains "consumer" → `drpPreapproval.SelectedIndex = 0` | P3-Medium |
| BR-CL-021 | Media category disabled until preapproval selected | UI Behavior | `drpPreapprovalbind()` enable logic | `drpMediaCategory` enabled only after a valid preapproval is selected | P2-High |
| BR-CL-022 | Claim amount auto-calculation from invoice | UI Behavior | `txtInvoiceAmount.focusout` JS handler | `claimAmount = invoiceAmount × 0.50`; display updated on focusout | P2-High |
| BR-CL-023 | Invoice date must not be in the future | Validation | Calendar control constraint | Calendar blocks selection of future dates | P2-High |
| BR-CL-024 | Dealer invoice date must not be in the future | Validation | Calendar control constraint | Calendar blocks selection of future dates for dealer invoice | P3-Medium |
| BR-CL-025 | Invoice amount max 2 decimal places | Validation | Client-side input handler | Truncates to 2 decimal places; 3+ decimal input truncated | P3-Medium |
| BR-CL-026 | Invoice amount decimal-only input | Validation | Client-side keypress handler | Letters and symbols blocked; only 0-9, `.`, backspace allowed | P3-Medium |
| BR-CL-027 | Activity stored in session for Step 2 | Data Persistence | `saveClaim()` + Session("ClaimInformation") | `ClaimInformation` object stored in session; redirect to Step 2 | P2-High |
| BR-CL-028 | Claim record written on submit | Data Persistence | `objClaim.updateClaim()` | New row in `tblClaim`: status=RECEIVED, sub_status=IN PROGRESS | P1-Critical |
| BR-CL-029 | Activity record written on submit | Data Persistence | `objActivity.updateActivity()` | New row in `tblActivity` linked to tblClaim | P1-Critical |
| BR-CL-030 | Activity dates written on submit | Data Persistence | `objActivity.updateActivityDate()` | Rows inserted in `tblActivityDate` per date added | P2-High |

---

## Discovery Checklist

### UI / Form Behaviors
- [x] Page load and initialization (auth guard, data pre-load, default values) — BR-CL-001, BR-CL-002, BR-CL-003
- [x] Each form field rendering — 20 fields documented in repo-analysis.md
- [x] Dropdown/select population (preapproval, media category, fund) — BR-CL-004 through BR-CL-008, BR-CL-021
- [x] Conditional field show/hide (DSO radio, media category enable) — BR-CL-020, BR-CL-021
- [x] Multi-step wizard navigation (Step 1 → Step 2) — BR-CL-027
- [x] Read-only vs editable state per role — BR-CL-003, BR-CL-019

### Validation Rules
- [x] Required fields — 8 required fields documented
- [x] Field format (decimal, date) — BR-CL-023, BR-CL-025, BR-CL-026
- [x] Field length (max 12 chars for invoice amount) — in validation table
- [x] Cross-field validation (claim amount vs preapproval remaining) — BR-CL-010, BR-CL-011
- [x] Business rule validation — BR-CL-012, BR-CL-013

### Business Logic Rules
- [x] Balance / limit checks — BR-CL-003, BR-CL-010, BR-CL-011
- [x] Reimbursement calculation — BR-CL-009, BR-CL-022
- [x] Duplicate detection — BR-CL-012
- [x] Filter rules — BR-CL-004 through BR-CL-008

### Workflow Rules
- [x] Initial state on page load — BR-CL-003
- [x] Submit → status = RECEIVED / IN PROGRESS — BR-CL-016
- [x] Edit flow — BR-CL-017, BR-CL-018
- [x] Step 1 → Step 2 redirect — BR-CL-027

### Data Persistence Rules
- [x] Claim header record — BR-CL-028
- [x] Activity record — BR-CL-029
- [x] Activity date records — BR-CL-030

### Security Rules
- [x] Unauthenticated access → redirect — BR-CL-001
- [x] Disabled dealer block — BR-CL-002
- [x] Data scoping (BMAGDLR CRC filter) — BR-CL-007
- [x] BMADMIN explicit scope — BR-CL-019

**Total Business Rules: 30**
