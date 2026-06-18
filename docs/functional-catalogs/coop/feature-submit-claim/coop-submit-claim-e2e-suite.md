# Co-op Submit Claim — End-to-End Suite

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 7 — E2E Suite

---

## Purpose

End-to-end tests validate the complete business workflow from a user perspective, spanning multiple systems: UI → API → Database → Notifications. These tests prove the entire claim lifecycle works correctly.

**Run Time Target:** < 60 minutes
**Execution Frequency:** Before each release; nightly in CI

---

## E2E Scenarios

---

### COOP-E2E-001 — Complete Claim Lifecycle: Submit → Approve → Pay

**Tag:** `@e2e @critical`
**Duration:** ~5 min
**Actors:** Dealer (submitter), Co-op Reviewer (approver)

**Business Objective:** Prove the full claim lifecycle from dealer submission to payment record.

**Flow:**
```
Login as Dealer
    → Navigate to Submit Claim
    → Fill in claim details
    → Upload supporting document
    → Submit Claim
    → Verify Submitted status
    → [Logout]
Login as CoopReviewer
    → Find submitted claim in review queue
    → Approve claim
    → Verify status = Approved
    → [Logout]
Login as CoopAdmin
    → Find approved claim in payment queue
    → Record payment
    → Verify status = Paid
```

**Expected Results at Each Step:**

| Step | Expected |
|---|---|
| Submit | Status = "Submitted", Workflow record created |
| Approve | Status = "Under Review" → "Approved", Audit record for approval |
| Payment | Status = "Payment Pending" → "Paid", Payment record created |

**Database Checkpoints:**
- After Submit: `dbo.CoopClaims.Status = 'Submitted'`, workflow record exists
- After Approve: `dbo.CoopClaims.Status = 'Approved'`, audit trail has approval
- After Payment: `dbo.CoopClaims.Status = 'Paid'`, payment record in `dbo.CoopPayments`

---

### COOP-E2E-002 — Complete Claim Lifecycle: Submit → Return → Resubmit → Approve

**Tag:** `@e2e`
**Duration:** ~6 min
**Actors:** Dealer, Co-op Reviewer

**Business Objective:** Prove the return-and-resubmit workflow is fully functional.

**Flow:**
```
Login as Dealer
    → Submit Claim
    → Verify status = Submitted
    → [Logout]
Login as CoopReviewer
    → Open claim
    → Click Return with reason "Missing receipt documentation"
    → Verify status = Returned
    → [Logout]
Login as Dealer
    → Find returned claim
    → View return reason
    → Upload additional attachment
    → Update description
    → Resubmit
    → Verify status = Submitted
    → [Logout]
Login as CoopReviewer
    → Open re-submitted claim
    → Approve
    → Verify status = Approved
```

**Expected Results:**
- Return reason visible to dealer
- Dealer can edit returned claim
- Audit trail shows: Submit → Returned → Submit
- Final status = "Approved"

---

### COOP-E2E-003 — Complete Claim Lifecycle: Submit → Reject

**Tag:** `@e2e`
**Duration:** ~4 min
**Actors:** Dealer, Co-op Reviewer

**Flow:**
```
Login as Dealer
    → Submit Claim
    → [Logout]
Login as CoopReviewer
    → Open claim
    → Reject with reason "Activity not covered by program"
    → Verify status = Rejected
```

**Expected Results:**
- Claim status = "Rejected"
- Rejection reason stored in audit
- Fund balance NOT decremented (claim was rejected)
- Dealer cannot resubmit a rejected claim

---

### COOP-E2E-004 — Multi-Attachment Submission Workflow

**Tag:** `@e2e`
**Duration:** ~5 min

**Flow:**
```
Login as Dealer
    → Navigate to Submit Claim
    → Fill in claim details
    → Upload Invoice (PDF)
    → Upload Receipt 1 (JPG)
    → Upload Receipt 2 (JPG)
    → Verify 3 attachments listed
    → Delete Receipt 2
    → Verify 2 attachments listed
    → Submit
    → Verify claim submitted with 2 attachments
```

**Database Checkpoints:**
- `dbo.CoopAttachments` has 2 active records for claim
- Deleted attachment is soft-deleted or removed

---

### COOP-E2E-005 — Fund Balance Enforcement End-to-End

**Tag:** `@e2e @financial`
**Duration:** ~5 min

**Business Objective:** Prove fund balance is correctly enforced across the full flow.

**Flow:**
```
Record fund balance for Program X = $1,000

Dealer A:
    → Submit claim for $600
    → Verify success

Dealer A:
    → Submit second claim for $500
    → Verify blocked: "Insufficient fund balance"
    → Verify fund balance still = $400 (first claim deducted OR pending)
```

**Expected Results:**
- First claim: success
- Second claim: blocked at fund validation
- Fund balance correctly updated or held

---

### COOP-E2E-006 — Data Isolation: Two Dealers Cannot See Each Other's Claims

**Tag:** `@e2e @security`
**Duration:** ~4 min

**Flow:**
```
Login as Dealer A
    → Submit Claim → Note ClaimID (e.g., 1001)
    → [Logout]

Login as Dealer B
    → Navigate to /Coop/Claims/1001
    → Expect: 403 Forbidden or 404 Not Found
    → Navigate to Claims list
    → Expect: Dealer A's claims NOT in list
```

**Expected Results:**
- Dealer B cannot access Dealer A's claim
- No data leakage in UI or API

---

### COOP-E2E-007 — Legacy vs Modern: Parallel Submission Comparison

**Tag:** `@e2e @comparison`
**Duration:** ~10 min

**Business Objective:** Execute the same claim submission against both Legacy and Modern platforms and compare all outcomes.

**Flow:**
```
[Legacy Platform]
    Login → Submit Claim with test data set A
    Record: ClaimID, Status, DB records

[Modern Platform]  
    Login → Submit Claim with identical test data set A
    Record: ClaimID, Status, DB records

Compare:
    - Status after submit
    - Database records created (table-by-table)
    - Workflow record structure
    - Audit record structure
    - Response times
```

**Expected Results:**
- Both platforms: Status = "Submitted"
- Database structure identical (same tables, same fields populated)
- No behavioral discrepancies

---

## E2E Test Data Requirements

| Scenario | Data Needed |
|---|---|
| All | Active Co-op Program with known balance |
| COOP-E2E-001 | Dealer with enrollment + Reviewer + Admin accounts |
| COOP-E2E-002 | Same as above |
| COOP-E2E-003 | Dealer + Reviewer accounts |
| COOP-E2E-004 | 3 test attachment files (PDF, 2x JPG) |
| COOP-E2E-005 | Program with $1,000 balance; 2 dealers |
| COOP-E2E-006 | 2 separate dealer accounts |
| COOP-E2E-007 | Access to both legacy and modern environments |

---

## E2E Execution

```bash
# Run full E2E suite against modern
npm run test:modern -- --grep @e2e

# Run comparison E2E
npm run test:compare -- --grep "@e2e and @comparison"

# Financial critical only
npm run test:modern -- --grep "@e2e and @financial"
```

---

## E2E Coverage Map

```
Login ──────────────────────────────────────────────► Auth verified
    │
    ├── Submit Claim
    │       ├── Draft ──────────────────────────────► DB: Draft record
    │       ├── Upload Attachment ──────────────────► DB: Attachment record
    │       └── Submit ─────────────────────────────► DB: Submitted, Workflow, Audit
    │               │
    │               ├── Approve ──────────────────── ► DB: Approved, Audit
    │               │       └── Payment ───────────► DB: Paid, Payment record
    │               │
    │               ├── Return ─────────────────────► DB: Returned, Audit
    │               │       └── Resubmit ──────────► DB: Submitted again
    │               │
    │               └── Reject ─────────────────────► DB: Rejected, Audit
    │                                                   Fund NOT decremented
    │
    └── Authorization
            ├── Cross-dealer blocked ───────────────► 403/404
            └── Unauthenticated blocked ────────────► 401/redirect
```
