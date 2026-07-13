# Regression Suite - Submit Claim (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-claim  
**Tier:** Regression | **Count:** 44 | **Run Order:** Parallel by category

---

## Purpose
Full behavioral coverage - validation, business logic, workflow, data persistence, security, and error handling. Run on every merge to main and on scheduled nightly runs.

---

## Tests by Category

### Validation (17 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-CL-TC-001 | Submit without Preapproval selection -> error | P2-High |
| COOP-CL-TC-002 | Submit without invoice number -> error | P2-High |
| COOP-CL-TC-003 | Submit without vendor name -> error | P2-High |
| COOP-CL-TC-004 | Submit without invoice date -> error | P2-High |
| COOP-CL-TC-005 | Submit without invoice amount -> error | P2-High |
| COOP-CL-TC-006 | Submit with claim amount = 0 -> error | P2-High |
| COOP-CL-TC-007 | Claim amount exceeds preapproval balance -> blocked | P1-Critical |
| COOP-CL-TC-008 | Claim amount exceeds 50% of invoice -> blocked | P1-Critical |
| COOP-CL-TC-009 | Submit without email -> error | P2-High |
| COOP-CL-TC-010 | Invalid email format -> error | P2-High |
| COOP-CL-TC-011 | Submit without document and without link (non-admin) -> error | P1-Critical |
| COOP-CL-TC-012 | Provide link only -> accepted | P2-High |
| COOP-CL-TC-013 | Invalid file type rejected | P2-High |
| COOP-CL-TC-014 | File > 100 MB rejected | P2-High |
| COOP-CL-TC-015 | Submit with zero fund balance -> blocked | P1-Critical |
| COOP-CL-TC-016 | Duplicate invoice number -> blocked | P2-High |
| COOP-CL-TC-017 | Invoice date in future -> blocked | P2-High |

### Business Logic (10 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-CL-TC-018 | Reimbursement = 50% of invoice amount | P1-Critical |
| COOP-CL-TC-019 | Claim amount capped at preapproval balance | P1-Critical |
| COOP-CL-TC-020 | Email pre-populated from session | P2-High |
| COOP-CL-TC-021 | Preapproval dropdown shows only APPROVED preapprovals | P1-Critical |
| COOP-CL-TC-022 | JDF preapproval with pending jdf_status hidden from dropdown | P1-Critical |
| COOP-CL-TC-023 | BMADMIN querystring restricts scope | P2-High |
| COOP-CL-TC-024 | AUS/NZL country programs available | P2-High |
| COOP-CL-TC-025 | Preapproval balance updates after claim | P2-High |
| COOP-CL-TC-026 | Segment inherited from preapproval | P2-High |
| COOP-CL-TC-027 | Document type dropdown driven by preapproval media type | P2-High |

### Workflow (7 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-CL-TC-028 | Claim status = RECEIVED on dealer submit | P1-Critical |
| COOP-CL-TC-029 | Claim status = IN PROGRESS on admin submit | P1-Critical |
| COOP-CL-TC-030 | Admin submit button label = "Submit and Approve" | P2-High |
| COOP-CL-TC-031 | Dealer submit button label = "Submit" | P2-High |
| COOP-CL-TC-032 | Preapproval status transitions after claim link | P2-High |
| COOP-CL-TC-033 | Email notification sent on submit | P2-High |
| COOP-CL-TC-034 | Claim visible in dealer claim history after submit | P2-High |

### DataPersistence (6 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-CL-TC-035 | Claim record created in tblClaim | P1-Critical |
| COOP-CL-TC-036 | Dealer linked in tblClaimDealer | P1-Critical |
| COOP-CL-TC-037 | Document record created in tblDocumentImage | P2-High |
| COOP-CL-TC-038 | Document filename renamed on upload | P2-High |
| COOP-CL-TC-039 | Comment record created in tblComment | P2-High |
| COOP-CL-TC-040 | Contact record created in tblContact | P2-High |

### Security (4 tests)
| ID | Title | Priority |
|---|---|---|
| COOP-CL-TC-041 | BMDLR can access claim form | P2-High |
| COOP-CL-TC-042 | BMAGDLR can access claim form | P2-High |
| COOP-CL-TC-043 | Disabled dealer redirected | P1-Critical |
| COOP-CL-TC-044 | Invalid session cookie rejected | P1-Critical |

---

## Run Command
```bash
npx playwright test --grep "COOP-CL-TC" --project=chromium
```

## Exit Criteria
All 44 tests pass. P1-Critical failures block release. P2-High+ failures require documented exceptions.
