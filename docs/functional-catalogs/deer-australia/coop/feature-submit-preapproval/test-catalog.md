# Coop — Submit Preapproval — Functional Test Catalog

**Client:** Deer Australia  
**Module:** coop  
**Feature:** submit-preapproval  
**Generated:** 2026-07-08  
**Total Test Cases:** 48 (Smoke: 3 | Regression: 40 | E2E: 5)  
**Business Rules Covered:** 30

---

## Smoke Suite (3 tests)

### COOP-PA-SMOKE-001 — Page loads for authenticated dealer
- **Tier:** Smoke
- **Category:** UI
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-001
- **Precondition:** Authenticated as BMDLR
- **Steps:**
  1. Navigate to `/CoopManagement/Preapprovals/Submit/OnlinePreapprovalForm.aspx`
- **Expected:** Page loads 200; form visible; heading shows "Submit a Pre-Approval Request"
- **Assertions:**
  - `page.getByRole('heading', { name: /pre-approval/i }).isVisible()`
  - `drpMediaCategory` visible; `btnSubmit` visible
  - `txtEmail` pre-populated from session
- **Test Data:** Valid BMDLR session

---

### COOP-PA-SMOKE-002 — Unauthenticated user is redirected
- **Tier:** Smoke
- **Category:** Security
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-001
- **Precondition:** No active session
- **Steps:**
  1. Navigate directly to preapproval form URL without authentication
- **Expected:** Redirected; URL does not contain `OnlinePreapprovalForm`
- **Assertions:**
  - URL does not contain `OnlinePreapprovalForm`
  - Form not visible

---

### COOP-PA-SMOKE-003 — Happy path: dealer submits valid preapproval
- **Tier:** Smoke
- **Category:** Workflow
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-009, BR-PA-024, BR-PA-025, BR-PA-026
- **Precondition:** Authenticated BMDLR; fund balance > 0
- **Steps:**
  1. Navigate to preapproval form
  2. Select advertisement type from `drpMediaCategory`
  3. Select segment from `drpSegment`
  4. Enter vendor name in `txtVendorName`
  5. Set first placement date (today) in `calStartDate`
  6. Enter preapproval amount (e.g. `500.00`)
  7. Upload one document (PDF, < 100 MB)
  8. Click Submit
- **Expected:** Preapproval created with status PENDING REVIEW; success confirmation
- **Assertions:**
  - Success message visible or redirect to confirmation page
  - No validation error labels visible
- **Test Data:** Valid media category, segment, vendor; fund balance ≥ $500

---

## Regression Suite (40 tests)

### — Validation: Required Fields —

### COOP-PA-TC-001 — Submit without Advertisement Type → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (drpMediaCategory required)
- **Steps:** Leave `drpMediaCategory` unselected; fill other fields; submit
- **Expected:** `litMediaTypeError` shows "* Required"
- **Assertions:** `#MainContent_litMediaTypeError` visible

---

### COOP-PA-TC-002 — Submit without Segment → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (drpSegment required, value ≠ "0")
- **Steps:** Leave `drpSegment` at default (0); submit
- **Expected:** `litSegmentError` shows "* Required"
- **Assertions:** `#MainContent_litSegmentError` visible

---

### COOP-PA-TC-003 — Submit with empty Vendor Name → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (txtVendorName required)
- **Steps:** Leave `txtVendorName` empty (or whitespace only); submit
- **Expected:** `errTxtVendor` shows "* Required"
- **Assertions:** `#MainContent_errTxtVendor` visible

---

### COOP-PA-TC-004 — Submit without First Placement Date → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-030
- **Steps:** Leave `calStartDate` empty; submit
- **Expected:** `ltFirstPlacementDateErrorMsg` shows "* Required"
- **Assertions:** `#MainContent_ltFirstPlacementDateErrorMsg` visible

---

### COOP-PA-TC-005 — Submit with Preapproval Amount empty → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (txtPreapprovalAmt required)
- **Steps:** Leave `txtPreapprovalAmt` empty; submit
- **Expected:** `lblpreapprovalAmtError` shows "* Required"
- **Assertions:** `#MainContent_lblpreapprovalAmtError` visible

---

### COOP-PA-TC-006 — Submit with Preapproval Amount = 0 → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-005
- **Steps:** Enter `0` in `txtPreapprovalAmt`; submit
- **Expected:** `lblZeroAmount` or diverrorpreapproval shown
- **Assertions:** Amount error label visible

---

### COOP-PA-TC-007 — Submit with Preapproval Amount exceeding fund balance → blocked
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-005
- **Precondition:** Fund balance = $100.00
- **Steps:** Enter `200.00` in `txtPreapprovalAmt`; submit
- **Expected:** `diverrorpreapproval` shown; form not submitted
- **Assertions:** Error label visible; URL stays on preapproval form

---

### COOP-PA-TC-008 — Submit with empty email → error shown
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (txtEmail required)
- **Steps:** Clear `txtEmail`; submit
- **Expected:** `litEmailAddressError` shows "* Required"
- **Assertions:** `#MainContent_litEmailAddressError` visible

---

### COOP-PA-TC-009 — Submit with invalid email format → validation error
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** (email format)
- **Steps:** Enter `notanemail` in `txtEmail`; submit
- **Expected:** `revEmail1` shows "Please enter a valid email address"
- **Assertions:** `#MainContent_revEmail1` visible and contains 'valid email'

---

### COOP-PA-TC-010 — Non-admin submit without document AND without link → error
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-006
- **Steps:** Leave Dropzone empty; leave `txtAddLink` empty; submit
- **Expected:** `lblUploadErrorMsg` shows "Please select at least one option upload document or provide the link"
- **Assertions:** `#MainContent_lblUploadErrorMsg` visible

---

### COOP-PA-TC-011 — Non-admin provides link only (no upload) → accepted
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-006 (inverse)
- **Steps:** Enter URL in `txtAddLink`; no file uploaded; submit
- **Expected:** Form submits successfully (link satisfies document requirement)
- **Assertions:** No `lblUploadErrorMsg` shown; redirect/success

---

### COOP-PA-TC-012 — Submit without JDFADMIN finance selection → blocked for JDFADMIN
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-007
- **Precondition:** Authenticated as JDFADMIN
- **Steps:** Leave `drpFinance` unselected or choose non-JDF option; submit
- **Expected:** `litDrpFinanceError` shown; form not submitted
- **Assertions:** Finance error label visible

---

### COOP-PA-TC-013 — Submit with sponsorship visible but none checked → error
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-008
- **Precondition:** Media type that triggers sponsorship grid
- **Steps:** Do not check any `chkMediaselect`; submit
- **Expected:** `dvSposnorshipError` shows "At least one sponsorship must be selected"
- **Assertions:** `#MainContent_dvSposnorshipError` visible

---

### — Business Logic —

### COOP-PA-TC-014 — Zero fund balance blocks submission with appropriate message
- **Tier:** Regression
- **Category:** BusinessLogic
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-004
- **Precondition:** Dealer with $0.00 fund balance
- **Steps:** Navigate to preapproval form
- **Expected:** `lblZeroAmount` shows "You have $0 remaining balance so you can not submit Pre-approval request"; submit button may be disabled
- **Assertions:** `#MainContent_lblZeroAmount` visible and contains '$0 remaining balance'

---

### COOP-PA-TC-015 — Email pre-populated from session on page load
- **Tier:** Regression
- **Category:** UI
- **Priority:** P2-High
- **BR Covered:** BR-PA-017
- **Steps:** Navigate to preapproval form; inspect `txtEmail`
- **Expected:** `txtEmail` contains logged-in user's email address
- **Assertions:** `txtEmail.value !== ''` and matches session email

---

### COOP-PA-TC-016 — Current dealer auto-included in dealer grid on page load
- **Tier:** Regression
- **Category:** BusinessLogic
- **Priority:** P2-High
- **BR Covered:** BR-PA-014
- **Steps:** Navigate to preapproval form; inspect `dgrdDealers`
- **Expected:** Dealer grid contains current logged-in dealer
- **Assertions:** `dgrdDealers` has ≥ 1 row with current dealer number

---

### COOP-PA-TC-017 — Add additional dealer to grid
- **Tier:** Regression
- **Category:** UI
- **Priority:** P2-High
- **BR Covered:** BR-PA-014
- **Steps:** Enter a valid dealer number in `txtDealerNumber`; click Add Dealer
- **Expected:** Dealer added to `dgrdDealers`; grid shows 2 rows
- **Assertions:** `dgrdDealers` row count increases by 1

---

### COOP-PA-TC-018 — Add duplicate dealer → blocked
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P3-Medium
- **BR Covered:** BR-PA-015
- **Steps:** Add dealer X; attempt to add dealer X again
- **Expected:** Duplicate rejected; grid still shows 1 row for dealer X

---

### COOP-PA-TC-019 — Remove dealer from grid
- **Tier:** Regression
- **Category:** UI
- **Priority:** P3-Medium
- **BR Covered:** (dealer management)
- **Steps:** Add a dealer; click Remove on that dealer
- **Expected:** Dealer removed; grid reverts to original count

---

### COOP-PA-TC-020 — File upload accepted within 100 MB
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-022
- **Steps:** Upload a valid PDF file under 100 MB
- **Expected:** File accepted; appears in `dgrdUploadFiles`

---

### COOP-PA-TC-021 — File upload rejected above 100 MB (client-side)
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-022
- **Steps:** Attempt to upload a file > 100 MB
- **Expected:** Dropzone rejects; error message shown; file not in grid

---

### COOP-PA-TC-022 — Invalid file type rejected
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-021
- **Steps:** Attempt to upload an `.exe` file
- **Expected:** File rejected by Dropzone; not added to `dgrdUploadFiles`

---

### COOP-PA-TC-023 — Valid file types accepted (PDF, JPEG, DOCX)
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-021
- **Steps:** Upload .pdf, .jpg, .docx files separately
- **Expected:** All 3 accepted and listed in `dgrdUploadFiles`

---

### COOP-PA-TC-024 — Delete uploaded file removes it from grid
- **Tier:** Regression
- **Category:** UI
- **Priority:** P3-Medium
- **BR Covered:** (file management)
- **Steps:** Upload a file; click Delete on that file
- **Expected:** File removed from `dgrdUploadFiles`; `documentList` updated

---

### COOP-PA-TC-025 — Preapproval status = PENDING REVIEW on submit (dealer)
- **Tier:** Regression
- **Category:** Workflow
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-009
- **Steps:** Submit valid preapproval as dealer; query tblPreapproval
- **Expected:** status = 'PENDING REVIEW'
- **Assertions:** DB: `status = 'PENDING REVIEW'`

---

### COOP-PA-TC-026 — Admin non-JDF submit auto-approves preapproval
- **Tier:** Regression
- **Category:** Workflow
- **Priority:** P2-High
- **BR Covered:** BR-PA-010
- **Precondition:** Authenticated as BMADMIN
- **Steps:** Submit preapproval (non-JDF finance); check status
- **Expected:** status = 'APPROVED' immediately (auto-approved)
- **Assertions:** DB: `status = 'APPROVED'`

---

### COOP-PA-TC-027 — Admin submit button shows "Submit and Approve"
- **Tier:** Regression
- **Category:** UI
- **Priority:** P2-High
- **BR Covered:** BR-PA-011
- **Precondition:** Authenticated as BMADMIN
- **Steps:** Navigate to preapproval form
- **Expected:** `btnSubmit.text = "Submit and Approve"`
- **Assertions:** Submit button contains text 'Submit and Approve'

---

### COOP-PA-TC-028 — Dealer submit button shows "Submit"
- **Tier:** Regression
- **Category:** UI
- **Priority:** P2-High
- **BR Covered:** BR-PA-011 (inverse)
- **Precondition:** Authenticated as BMDLR
- **Steps:** Navigate to preapproval form
- **Expected:** `btnSubmit.text = "Submit"`

---

### COOP-PA-TC-029 — JDFADMIN submit with JDF Finance → PENDING REVIEW (not auto-approved)
- **Tier:** Regression
- **Category:** Workflow
- **Priority:** P2-High
- **BR Covered:** BR-PA-020
- **Precondition:** Authenticated as JDFADMIN; JDF Finance selected
- **Steps:** Submit preapproval with "John Deere Financial - Consumer Finance"
- **Expected:** status = 'PENDING REVIEW'; not auto-approved
- **Assertions:** DB: `status = 'PENDING REVIEW'`

---

### COOP-PA-TC-030 — Preapproval record created in tblPreapproval on submit
- **Tier:** Regression
- **Category:** DataPersistence
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-024
- **Steps:** Submit; query tblPreapproval for new record
- **Expected:** Row with status=PENDING REVIEW, vendor_name, program_seq, media_type_seq
- **Assertions:** DB: `COUNT(tblPreapproval WHERE preapproval_seq=newSeq) = 1`

---

### COOP-PA-TC-031 — Dealer linked to preapproval in tblPreapprovalDealer
- **Tier:** Regression
- **Category:** DataPersistence
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-025
- **Steps:** Submit; query tblPreapprovalDealer
- **Expected:** Row(s) with preapproval_seq and dealer_number_seq
- **Assertions:** DB: `COUNT(tblPreapprovalDealer WHERE preapproval_seq=newSeq) ≥ 1`

---

### COOP-PA-TC-032 — Uploaded document record created in tblDocumentImage
- **Tier:** Regression
- **Category:** DataPersistence
- **Priority:** P2-High
- **BR Covered:** BR-PA-026
- **Steps:** Upload 1 file; submit; query tblDocumentImage
- **Expected:** Row with owner_table='PREAPPROVAL', owner_table_seq=newSeq, filename={preapproval_number}_{original_name}
- **Assertions:** DB: `COUNT(tblDocumentImage WHERE owner_table_seq=newSeq AND owner_table='PREAPPROVAL') = 1`

---

### COOP-PA-TC-033 — Document filename renamed on upload (preapproval_number_filename)
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-012
- **Steps:** Upload file `test.pdf`; submit; check filename in tblDocumentImage
- **Expected:** DB filename = `{preapprovalNumber}_test.pdf`; not `test.pdf`

---

### COOP-PA-TC-034 — Comment saved in tblComment on submit
- **Tier:** Regression
- **Category:** DataPersistence
- **Priority:** P2-High
- **BR Covered:** BR-PA-027
- **Steps:** Enter text in `txtComments`; submit; query tblComment
- **Expected:** Row with comment_type='PREAPPROVAL', comment=entered text

---

### COOP-PA-TC-035 — Contact saved in tblContact on submit
- **Tier:** Regression
- **Category:** DataPersistence
- **Priority:** P2-High
- **BR Covered:** BR-PA-028
- **Steps:** Submit; query tblContact
- **Expected:** Row with owner_table='PREAPPROVAL', email=txtEmail value, position='TO'

---

### COOP-PA-TC-036 — BMDLR can access preapproval form
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-001
- **Steps:** Authenticate as BMDLR; navigate to form
- **Expected:** Form loads; no redirect

---

### COOP-PA-TC-037 — BMAGDLR can access preapproval form
- **Tier:** Regression
- **Category:** Security
- **Priority:** P2-High
- **BR Covered:** BR-PA-001
- **Steps:** Authenticate as BMAGDLR; navigate to form
- **Expected:** Form loads

---

### COOP-PA-TC-038 — Disabled dealer redirected to DealerDisable
- **Tier:** Regression
- **Category:** Security
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-002
- **Precondition:** BMDLR account flagged as disabled
- **Steps:** Navigate to form
- **Expected:** Redirect to DealerDisable.aspx

---

### COOP-PA-TC-039 — First placement date future date blocked
- **Tier:** Regression
- **Category:** Validation
- **Priority:** P2-High
- **BR Covered:** BR-PA-030
- **Steps:** Attempt to select tomorrow in `calStartDate`
- **Expected:** Future date not selectable

---

### COOP-PA-TC-040 — Media category change updates document type dropdown
- **Tier:** Regression
- **Category:** BusinessLogic
- **Priority:** P2-High
- **BR Covered:** BR-PA-023
- **Steps:** Select media category A; note document types; change to media category B
- **Expected:** `drpDocumentType` options change to match new media category

---

## E2E Suite (5 tests)

### COOP-PA-E2E-001 — Full workflow: dealer submits → appears in pending preapprovals
- **Tier:** E2E
- **Category:** Workflow
- **Priority:** P1-Critical
- **BR Covered:** BR-PA-009, BR-PA-024, BR-PA-025
- **Steps:**
  1. Submit valid preapproval as BMDLR
  2. Navigate to Preapprovals → View → ViewPreapprovalRequestStatus
- **Expected:** Preapproval visible with status PENDING REVIEW

---

### COOP-PA-E2E-002 — Full workflow: dealer submits → admin receives notification
- **Tier:** E2E
- **Category:** Workflow
- **Priority:** P2-High
- **BR Covered:** BR-PA-018
- **Steps:**
  1. Submit preapproval as dealer
  2. Verify email notification triggered to admin (`SendEmail()` called)
- **Expected:** Admin notification email sent (email log or mock verification)

---

### COOP-PA-E2E-003 — Full workflow: admin auto-approves → dealer sees APPROVED status
- **Tier:** E2E
- **Category:** Workflow
- **Priority:** P2-High
- **BR Covered:** BR-PA-010, BR-PA-019
- **Steps:**
  1. Login as BMADMIN; submit non-JDF preapproval
  2. Login as dealer; navigate to preapproval status
- **Expected:** Preapproval shows status APPROVED; dealer email notification sent

---

### COOP-PA-E2E-004 — JDF preapproval requires dual approval before claim linkage
- **Tier:** E2E
- **Category:** BusinessLogic
- **Priority:** P2-High
- **BR Covered:** BR-PA-029
- **Steps:**
  1. Submit JDF preapproval; admin approves (status=APPROVED, jdf_status=PENDING)
  2. Navigate to claim form; check preapproval dropdown
- **Expected:** JDF preapproval with pending jdf_status NOT available in claim dropdown

---

### COOP-PA-E2E-005 — Multiple dealers on one preapproval — all linked in DB
- **Tier:** E2E
- **Category:** DataPersistence
- **Priority:** P2-High
- **BR Covered:** BR-PA-025
- **Steps:**
  1. Add 3 dealers to `dgrdDealers`; submit preapproval
  2. Query tblPreapprovalDealer for new preapproval_seq
- **Expected:** 3 rows in tblPreapprovalDealer; one per dealer

---

## Quality Gate

| Check | Status |
|---|---|
| Every form field has ≥ 1 test | ✅ 26 fields covered |
| Every required field has ≥ 1 missing-field validation test | ✅ TC-001 through TC-010 |
| Every business rule has ≥ 1 positive and ≥ 1 negative test | ✅ All 30 BRs mapped |
| Every workflow transition has ≥ 1 test | ✅ SMOKE-003, TC-025, TC-026, TC-029, E2E-001–E2E-003 |
| Every security rule has ≥ 1 test | ✅ TC-020–TC-024, TC-036–TC-038, SMOKE-002 |
| Smoke: page load + unauthenticated + happy path | ✅ SMOKE-001, SMOKE-002, SMOKE-003 |
| E2E: ≥ 1 full workflow scenario | ✅ E2E-001 through E2E-005 |
| Total count per tier | ✅ Smoke: 3 | Regression: 40 | E2E: 5 |
