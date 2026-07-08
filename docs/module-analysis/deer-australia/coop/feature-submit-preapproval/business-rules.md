# Coop — Submit Preapproval — Business Rule Catalog

**Client:** Deer Australia  
**Module:** coop  
**Feature:** submit-preapproval  
**Generated:** 2026-07-08  
**Source:** repo-analysis.md (repo-only; no UI analysis)

---

## Business Rule Catalog

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-PA-001 | Role enforcement — dealer/agency only | Security | `Page_Load` role check | Redirect for unauthorized roles; only BMDLR / BMAGDLR allowed | P1-Critical |
| BR-PA-002 | Disabled dealer block | Security | `IsDisableDealerActivity()` | Redirect to `DealerDisable.aspx` | P1-Critical |
| BR-PA-003 | No-cache HTTP headers | Security | `Page_Load` response headers | Response.Cache = NoCache, ServerAndNoCache, no-store | P2-High |
| BR-PA-004 | Zero fund balance blocks submission | Business Logic | `GetAvailableFunds()` | `lblZeroAmount`: "You have $0 remaining balance so you can not submit Pre-approval request" | P1-Critical |
| BR-PA-005 | Preapproval amount must not exceed available funds | Validation | `btnSubmit_Click()` amount check | `txtPreapprovalAmt <= decFundsAvailable` | P1-Critical |
| BR-PA-006 | Document required for non-admin | Business Logic | `btnSubmit_Click()` upload check | Non-admin must upload ≥1 file OR provide a link; error: "Please select at least one option upload document or provide the link" | P1-Critical |
| BR-PA-007 | JDF Finance type required for JDFADMIN | Business Logic | `btnSubmit_Click()` JDFADMIN check | JDFADMIN must select "John Deere Financial - Consumer Finance" or "John Deere Financial - Commercial Finance" | P2-High |
| BR-PA-008 | Sponsorship checkbox required when visible | Validation | `btnSubmit_Click()` sponsorship check | At least one `chkMediaselect` checked; error: "At least one sponsorship must be selected" | P2-High |
| BR-PA-009 | New preapproval status = PENDING REVIEW | Workflow | `objPreapproval.updatePreapproval()` | status="PENDING REVIEW" for all dealer/agency submissions | P1-Critical |
| BR-PA-010 | Admin auto-approve for non-JDF | Workflow | `AutoApprovePreapproval()` | BMADMIN non-JDF submit → `AutoApprovePreapproval()` → status="APPROVED" immediately | P2-High |
| BR-PA-011 | Admin submit button label changes | UI Behavior | `Page_Load` BMADMIN check | `btnSubmit.Text = "Submit and Approve"` for BMADMIN (unless JDF Finance) | P2-High |
| BR-PA-012 | Document renamed on upload | Security | `btnSubmit_Click()` file rename | Files renamed to `{preapproval_number}_{filename}`; prevents path traversal | P2-High |
| BR-PA-013 | Country-based currency display | Business Logic | `getDealerCountry()` | NZL dealers see NZD labels + AUD conversion rate display | P3-Medium |
| BR-PA-014 | Current dealer auto-included in dealer grid | Business Logic | `bindDealerGrid(True)` | Logged-in dealer pre-populated in `dgrdDealers` on page load | P2-High |
| BR-PA-015 | Duplicate dealer prevention | Validation | `btnAddDealer_Click()` | Duplicate dealer rejected before adding to grid | P3-Medium |
| BR-PA-016 | Contact auto-created if missing | Data Persistence | `GetAddressSeqForContact()` | If dealer lacks address_type_seq=2, creates one via `updateAddress()` | P3-Medium |
| BR-PA-017 | Email pre-populated from session | UI Behavior | `Page_Load` session load | `txtEmail = clsSession.UserEmailAddress`; editable by user | P2-High |
| BR-PA-018 | Email to admin on dealer submission | Workflow | `SendEmail()` | Dealer submit → `SendEmail(preapprovalNumber, preapprovalSeq)` to admin | P2-High |
| BR-PA-019 | Email to dealer on admin auto-approve | Workflow | `SendApprovedEmail()` | Admin non-JDF submit → optional `SendApprovedEmail()` to dealer | P2-High |
| BR-PA-020 | JDF Finance submission — email flow | Workflow | `SendEmail()` JDFADMIN path | JDFADMIN JDF Finance submit → `SendEmail()` (separate flow; no auto-approve) | P2-High |
| BR-PA-021 | File type whitelist enforced client-side | Security | Dropzone config | Accepted: .xls, .xlsx, .pdf, .jpg, .tif, .wmv, .mpeg, .png, .ppt, .zip, .rar, .avi, .mdi, .wav, .ppsx, .html, .msg, .mht, .xps, .mpg, .rtf, .vsd, .mp3, .mp4, .txt, .bmp, .jpeg, .doc, .docx | P2-High |
| BR-PA-022 | File size limit — max 100 MB | Security | Dropzone config | Files > 100 MB rejected client-side | P2-High |
| BR-PA-023 | Media category drives document type options | Business Logic | `bindDocumentType()` filter | `drpDocumentType` options filtered by `preapproval_required='Y'` for selected media type | P2-High |
| BR-PA-024 | Preapproval record written on submit | Data Persistence | `objPreapproval.updatePreapproval()` | New row in `tblPreapproval`: status=PENDING REVIEW | P1-Critical |
| BR-PA-025 | Dealer(s) linked to preapproval | Data Persistence | `objPreapproval.updatePreapprovalDealer()` | Row(s) in `tblPreapprovalDealer` per dealer in grid | P1-Critical |
| BR-PA-026 | Document record written per uploaded file | Data Persistence | `objDocument.updateDocumentImage()` | Row in `tblDocumentImage` per file; owner_table="PREAPPROVAL" | P2-High |
| BR-PA-027 | Comment saved on submission | Data Persistence | `objComment.updateComment()` | `tblComment`: comment_type="PREAPPROVAL"; "Dealer" submitter | P2-High |
| BR-PA-028 | Contact saved on submission | Data Persistence | `objAddress.updateContact()` | `tblContact`: position="TO"; email from `txtEmail` | P2-High |
| BR-PA-029 | JDF preapproval requires dual approval before claim | Business Logic | Claim form `drpPreapprovalbind()` | JDF preapproval needs `status='APPROVED'` AND `jdf_status='APPROVED'` before claims can be linked | P2-High |
| BR-PA-030 | Start placement date required; no future dates | Validation | Calendar control + `btnSubmit_Click()` | `calStartDate.ReturnDateText` required; calendar blocks future dates | P2-High |

---

## Discovery Checklist

### UI / Form Behaviors
- [x] Page load and initialization — BR-PA-001, BR-PA-002, BR-PA-003, BR-PA-004, BR-PA-014, BR-PA-017
- [x] Each form field rendering — 26 fields documented in repo-analysis.md
- [x] Dropdown population — BR-PA-023, `bindMediaType()`, `bindDocumentType()`
- [x] Conditional UI — BR-PA-007, BR-PA-008, BR-PA-011
- [x] Admin vs dealer submit button — BR-PA-011

### Validation Rules
- [x] Required fields — 8+ required fields documented
- [x] Amount cap — BR-PA-005
- [x] Document/link required — BR-PA-006
- [x] Date constraint — BR-PA-030
- [x] Duplicate dealer — BR-PA-015
- [x] File type and size — BR-PA-021, BR-PA-022
- [x] Sponsorship selection — BR-PA-008

### Business Logic Rules
- [x] Fund balance check — BR-PA-004, BR-PA-005
- [x] Document requirement — BR-PA-006
- [x] JDF enforcement — BR-PA-007, BR-PA-020, BR-PA-029
- [x] Sponsorship — BR-PA-008

### Workflow Rules
- [x] Submit → PENDING REVIEW — BR-PA-009
- [x] Admin auto-approve → APPROVED — BR-PA-010
- [x] Email triggers — BR-PA-018, BR-PA-019, BR-PA-020
- [x] Admin request email — BR-PA-020

### Data Persistence Rules
- [x] Preapproval header — BR-PA-024
- [x] Dealer association — BR-PA-025
- [x] Document records — BR-PA-026
- [x] Comment — BR-PA-027
- [x] Contact — BR-PA-028

### Security Rules
- [x] Auth required — BR-PA-001
- [x] Disabled dealer — BR-PA-002
- [x] No-cache — BR-PA-003
- [x] File rename — BR-PA-012
- [x] File type whitelist — BR-PA-021
- [x] File size limit — BR-PA-022

**Total Business Rules: 30**
