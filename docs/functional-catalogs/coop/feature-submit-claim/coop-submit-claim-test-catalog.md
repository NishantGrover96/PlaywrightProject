# Co-op Submit Claim — Functional Test Catalog

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 4 — Functional Test Catalog

---

## Summary

| Category | Count |
|---|---|
| Happy Path | 8 |
| Validation | 15 |
| Negative | 8 |
| Boundary | 6 |
| Authorization | 6 |
| Workflow / Status Transition | 7 |
| **Total** | **50** |

---

## Happy Path Tests

### COOP-TC-001 — Full Submit Claim Flow (Happy Path)

**Priority:** P0 — Critical
**Functional Units:** COOP-CLAIM-001, 034, 035, 036, 039, 040, 041, 043, 044

**Preconditions:**
- User is authenticated with Dealer role
- Dealer is enrolled in at least one active Co-op Program
- Selected program has available fund balance ≥ test claim amount

**Steps:**
1. Navigate to `/Coop/SubmitClaim`
2. Select dealer from dropdown
3. Select an active Co-op Program
4. Enter claim date within program period
5. Enter claim amount less than fund balance and per-claim max
6. Enter a description (50 chars)
7. Upload a valid PDF attachment
8. Click "Submit"

**Expected Result:**
- Success message displayed: "Claim submitted successfully"
- Page redirects to claim detail or list
- Claim status = "Submitted"
- Database: ClaimHeader record created with Status = "Submitted"
- Database: ClaimDetail records created
- Database: WorkflowRecord created with initial approval step
- Database: AuditRecord created with Action = "Submit"
- Email notification sent to submitter and approver queue

---

### COOP-TC-002 — Save as Draft

**Priority:** P1
**Functional Units:** COOP-CLAIM-034, 039, 040

**Preconditions:** User authenticated as Dealer

**Steps:**
1. Navigate to `/Coop/SubmitClaim`
2. Fill in program, date, and amount
3. Do NOT upload attachment
4. Click "Save Draft"

**Expected Result:**
- Success message: "Draft saved"
- Claim status = "Draft"
- No workflow record created
- No notification sent
- Claim is retrievable for continued editing

---

### COOP-TC-003 — Submit Previously Saved Draft

**Priority:** P1
**Functional Units:** COOP-CLAIM-034, 035

**Preconditions:** Existing claim in Draft status for the current dealer

**Steps:**
1. Open existing Draft claim
2. Upload required attachment
3. Click "Submit"

**Expected Result:**
- Claim transitions from Draft → Submitted
- Workflow and audit records created

---

### COOP-TC-004 — Upload Multiple Attachments

**Priority:** P1
**Functional Units:** COOP-CLAIM-030, 031

**Preconditions:** Claim in Draft status

**Steps:**
1. Upload a PDF attachment
2. Upload a JPG attachment
3. Verify both attachments appear in list

**Expected Result:**
- Both attachments listed with correct filenames
- `dbo.CoopAttachments` has 2 records for this claim

---

### COOP-TC-005 — Delete an Attachment

**Priority:** P2
**Functional Units:** COOP-CLAIM-032

**Preconditions:** Draft claim with 2 attachments

**Steps:**
1. Click delete on first attachment
2. Confirm deletion

**Expected Result:**
- Attachment removed from list
- `dbo.CoopAttachments` has 1 record (soft deleted or removed)

---

### COOP-TC-006 — Submit with Multiple Line Items

**Priority:** P1
**Functional Units:** COOP-CLAIM-029, 040

**Preconditions:** User authenticated as Dealer

**Steps:**
1. Navigate to Submit Claim
2. Add 3 claim detail line items with different amounts
3. Upload attachment
4. Submit

**Expected Result:**
- All 3 detail records created in `dbo.CoopClaimDetails`
- Total amount = sum of line items

---

### COOP-TC-007 — Fund Balance Updates After Submission

**Priority:** P1
**Functional Units:** COOP-CLAIM-019

**Preconditions:** Program has known fund balance

**Steps:**
1. Record fund balance before submission
2. Submit a valid claim for $500
3. Check fund balance

**Expected Result:**
- Fund balance decreased by $500 (or claim is held pending approval, depending on business rule)

---

### COOP-TC-008 — Returned Claim Can Be Resubmitted

**Priority:** P1
**Functional Units:** COOP-CLAIM-026, 035

**Preconditions:** Claim exists in Returned status

**Steps:**
1. Open returned claim
2. Update description per reviewer notes
3. Submit again

**Expected Result:**
- Claim transitions from Returned → Submitted
- New audit record created for re-submission

---

## Validation Tests

### COOP-TC-009 — Dealer Required

**Priority:** P1
**Functional Units:** COOP-CLAIM-011

**Steps:** Submit form with dealer field blank

**Expected Result:** Error: "Dealer is required". Form not submitted.

---

### COOP-TC-010 — Program Required

**Priority:** P1
**Functional Units:** COOP-CLAIM-012

**Steps:** Submit form with program not selected

**Expected Result:** Error: "Program is required". Form not submitted.

---

### COOP-TC-011 — Claim Date Required

**Priority:** P1
**Functional Units:** COOP-CLAIM-014

**Steps:** Submit form with claim date blank

**Expected Result:** Error: "Claim date is required"

---

### COOP-TC-012 — Claim Date Cannot Be Future

**Priority:** P1
**Functional Units:** COOP-CLAIM-015

**Steps:** Enter claim date = today + 1 day. Submit.

**Expected Result:** Error: "Claim date cannot be in the future"

---

### COOP-TC-013 — Claim Date Outside Program Period

**Priority:** P1 — High Risk
**Functional Units:** COOP-CLAIM-016

**Steps:** Select program with period Jan 1–Mar 31. Enter claim date = April 15. Submit.

**Expected Result:** Error: "Claim date is outside the program period"

---

### COOP-TC-014 — Claim Amount Required

**Priority:** P1
**Functional Units:** COOP-CLAIM-017

**Steps:** Submit with amount field blank

**Expected Result:** Error: "Claim amount is required"

---

### COOP-TC-015 — Claim Amount Zero

**Priority:** P1
**Functional Units:** COOP-CLAIM-018

**Steps:** Enter $0.00. Submit.

**Expected Result:** Error: "Claim amount must be greater than zero"

---

### COOP-TC-016 — Claim Amount Exceeds Fund Balance

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-019

**Steps:** Enter amount $1 more than fund balance. Submit.

**Expected Result:** Error: "Insufficient fund balance for this claim"

---

### COOP-TC-017 — Claim Amount Exceeds Per-Claim Maximum

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-020

**Steps:** Enter amount exceeding program's per-claim max. Submit.

**Expected Result:** Error: "Amount exceeds maximum allowed per claim"

---

### COOP-TC-018 — Description Required

**Priority:** P1
**Functional Units:** COOP-CLAIM-021

**Steps:** Submit with empty description

**Expected Result:** Error: "Description is required"

---

### COOP-TC-019 — Description Exceeds 500 Characters

**Priority:** P2
**Functional Units:** COOP-CLAIM-028

**Steps:** Enter 501 characters in description. Submit.

**Expected Result:** Error about description length. Form not submitted.

---

### COOP-TC-020 — Attachment Required for Submission

**Priority:** P1
**Functional Units:** COOP-CLAIM-022

**Steps:** Fill all fields. Do NOT upload attachment. Click "Submit".

**Expected Result:** Error: "At least one attachment is required to submit"
**Note:** Save Draft should still work without attachment.

---

### COOP-TC-021 — Invalid File Type Rejected

**Priority:** P2
**Functional Units:** COOP-CLAIM-033

**Steps:** Attempt to upload a `.exe` file

**Expected Result:** Error: invalid file type. File not uploaded.

---

### COOP-TC-022 — Program Eligibility Validation

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-013

**Steps:** Attempt to submit for a program the dealer is NOT enrolled in

**Expected Result:** Error: "You are not eligible for this program"

---

### COOP-TC-023 — Annual Cap Enforcement

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-023

**Preconditions:** Dealer has claims totaling at or near annual cap

**Steps:** Submit claim that would exceed annual cap

**Expected Result:** Error indicating annual cap exceeded

---

## Negative Tests

### COOP-TC-024 — Negative Claim Amount

**Priority:** P1
**Steps:** Enter -$100. Submit.
**Expected Result:** Validation error (negative not allowed)

---

### COOP-TC-025 — Claim Amount with Invalid Format

**Priority:** P2
**Steps:** Enter "abc" in amount field. Submit.
**Expected Result:** Validation error (invalid format)

---

### COOP-TC-026 — Duplicate Claim Submission

**Priority:** P1
**Functional Units:** COOP-CLAIM-024

**Steps:** Submit the same claim twice within 24 hours (same dealer, program, date)
**Expected Result:** Second submission blocked: duplicate claim error

---

### COOP-TC-027 — Edit Submitted Claim

**Priority:** P1
**Functional Units:** COOP-CLAIM-025

**Steps:** Navigate to a submitted claim. Attempt to change amount.
**Expected Result:** Fields are read-only. No edit possible.

---

### COOP-TC-028 — Delete Attachment from Submitted Claim

**Priority:** P1
**Steps:** Attempt to delete attachment from a Submitted claim
**Expected Result:** Delete button not available or action blocked

---

### COOP-TC-029 — Submit with XSS Payload in Description

**Priority:** P1
**Functional Units:** COOP-CLAIM-049

**Steps:** Enter `<script>alert('xss')</script>` in description. Submit.
**Expected Result:** Script not executed. Input sanitized.

---

### COOP-TC-030 — Submit with SQL Injection in Description

**Priority:** P1
**Functional Units:** COOP-CLAIM-049

**Steps:** Enter `'; DROP TABLE CoopClaims;--` in description. Submit.
**Expected Result:** Input treated as plain text. No error 500. No data loss.

---

### COOP-TC-031 — Invalid Date Format

**Priority:** P2
**Steps:** Enter "not-a-date" in claim date field. Submit.
**Expected Result:** Validation error (invalid date format)

---

## Boundary Tests

### COOP-TC-032 — Claim Amount Exactly at Fund Balance

**Priority:** P1
**Steps:** Enter amount exactly equal to fund balance. Submit.
**Expected Result:** Submission succeeds (boundary inclusive)

---

### COOP-TC-033 — Claim Amount Exactly at Per-Claim Maximum

**Priority:** P1
**Steps:** Enter amount exactly equal to per-claim maximum. Submit.
**Expected Result:** Submission succeeds (boundary inclusive)

---

### COOP-TC-034 — Claim Date on First Day of Program Period

**Priority:** P1
**Steps:** Enter claim date = program start date. Submit.
**Expected Result:** Submission succeeds

---

### COOP-TC-035 — Claim Date on Last Day of Program Period

**Priority:** P1
**Steps:** Enter claim date = program end date. Submit.
**Expected Result:** Submission succeeds

---

### COOP-TC-036 — Description at Exactly 500 Characters

**Priority:** P2
**Steps:** Enter exactly 500 characters in description. Submit.
**Expected Result:** Submission succeeds (boundary inclusive)

---

### COOP-TC-037 — Claim Amount $0.01 (Minimum Positive)

**Priority:** P2
**Steps:** Enter $0.01. Submit.
**Expected Result:** Submission succeeds (if above minimum)

---

## Authorization Tests

### COOP-TC-038 — Unauthenticated Access Redirects to Login

**Priority:** P0
**Functional Units:** COOP-CLAIM-045

**Steps:** Open Submit Claim URL without authentication
**Expected Result:** Redirect to login page. 401 or redirect.

---

### COOP-TC-039 — CoopReviewer Cannot Access Submit Page

**Priority:** P1
**Functional Units:** COOP-CLAIM-048

**Steps:** Login as CoopReviewer. Navigate to `/Coop/SubmitClaim`
**Expected Result:** 403 Forbidden or redirect to unauthorized page

---

### COOP-TC-040 — Dealer Cannot Access Another Dealer's Claim

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-047

**Steps:** Login as Dealer A. Navigate to claim URL for Dealer B's claim.
**Expected Result:** 403 Forbidden or 404 Not Found. Dealer B's data not shown.

---

### COOP-TC-041 — API Endpoint Requires Valid Token

**Priority:** P0
**Functional Units:** COOP-CLAIM-045

**Steps:** Call `POST /api/coop/claims` without Authorization header
**Expected Result:** 401 Unauthorized

---

### COOP-TC-042 — API Endpoint Enforces Dealer Scope

**Priority:** P0 — High Risk
**Functional Units:** COOP-CLAIM-047

**Steps:** Call `GET /api/coop/claims/{id}` for claim belonging to another dealer
**Expected Result:** 403 Forbidden or 404 Not Found

---

### COOP-TC-043 — Expired Token Rejected

**Priority:** P1
**Steps:** Submit API request with expired JWT token
**Expected Result:** 401 Unauthorized

---

## Workflow / Status Transition Tests

### COOP-TC-044 — Status After Draft Save is Draft

**Priority:** P1
**Steps:** Save as Draft. Check claim status.
**Expected Result:** Status = "Draft"

---

### COOP-TC-045 — Status After Submit is Submitted

**Priority:** P0
**Steps:** Submit claim. Check claim status.
**Expected Result:** Status = "Submitted"

---

### COOP-TC-046 — Workflow Record Created on Submit

**Priority:** P0
**Functional Units:** COOP-CLAIM-036, 043

**Steps:** Submit claim. Query `dbo.CoopWorkflow` for claim.
**Expected Result:** 1 workflow record with correct initial step and approver assignment

---

### COOP-TC-047 — Audit Record Created on Submit

**Priority:** P1
**Functional Units:** COOP-CLAIM-038, 044

**Steps:** Submit claim. Query `dbo.CoopAudit` for claim.
**Expected Result:** 1 audit record: Action = "Submit", OldStatus = "Draft", NewStatus = "Submitted", with user and timestamp

---

### COOP-TC-048 — Audit Record Created on Draft Save

**Priority:** P2
**Steps:** Save draft. Query `dbo.CoopAudit` for claim.
**Expected Result:** Audit record for "SaveDraft" action

---

### COOP-TC-049 — Status Transition: Returned → Re-submitted

**Priority:** P1
**Steps:** Return claim from approval. Re-submit. Check status.
**Expected Result:** Status transitions Returned → Draft → Submitted

---

### COOP-TC-050 — No Workflow Record Created for Draft Save

**Priority:** P1
**Steps:** Save as Draft. Query `dbo.CoopWorkflow`.
**Expected Result:** No workflow record for claim in Draft status

---
