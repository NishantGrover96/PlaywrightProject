# Co-op Submit Claim — Regression Suite

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 6 — Regression Suite

---

## Purpose

The Regression Suite provides complete functional coverage to detect regressions after any code change. It includes all test categories from the Functional Test Catalog executed against a single environment.

**Run Time Target:** < 30 minutes
**Execution Frequency:** After every deployment; required before any release

---

## Suite Composition

The regression suite includes all 50 tests from the Functional Test Catalog, organized by priority:

| Priority | Count | Description |
|---|---|---|
| P0 — Critical | 15 | Any failure = deployment blocked |
| P1 — High | 24 | Failures require fix before release |
| P2 — Medium | 11 | Failures require ticket before next sprint |

---

## Regression Test Groups

### Group 1: Happy Path (P0/P1)

Tests included: COOP-TC-001 through COOP-TC-008

**Execution order:**
1. COOP-TC-001 Full Submit Flow
2. COOP-TC-002 Save as Draft
3. COOP-TC-003 Submit Previously Saved Draft
4. COOP-TC-004 Upload Multiple Attachments
5. COOP-TC-005 Delete an Attachment
6. COOP-TC-006 Submit with Multiple Line Items
7. COOP-TC-007 Fund Balance Updates
8. COOP-TC-008 Returned Claim Resubmitted

**Pass Threshold:** 8/8 required to proceed

---

### Group 2: Validation (P0/P1)

Tests included: COOP-TC-009 through COOP-TC-023

Priority P0 tests in this group:
- COOP-TC-016 Amount Exceeds Fund Balance
- COOP-TC-017 Amount Exceeds Per-Claim Max
- COOP-TC-022 Program Eligibility
- COOP-TC-023 Annual Cap Enforcement

**Note:** These four are financial-critical. Run first in group.

---

### Group 3: Negative Tests (P1/P2)

Tests included: COOP-TC-024 through COOP-TC-031

Focus on edge cases and security:
- COOP-TC-026 Duplicate Claim Prevention (P1)
- COOP-TC-029 XSS Prevention (P1)
- COOP-TC-030 SQL Injection Prevention (P1)

---

### Group 4: Boundary Tests (P1/P2)

Tests included: COOP-TC-032 through COOP-TC-037

**Critical boundaries:**
- Claim amount exactly at fund balance (COOP-TC-032)
- Claim amount exactly at per-claim max (COOP-TC-033)
- Claim date on first/last day of period (COOP-TC-034, 035)

---

### Group 5: Authorization (P0/P1)

Tests included: COOP-TC-038 through COOP-TC-043

All P0:
- COOP-TC-038 Unauthenticated redirect
- COOP-TC-040 Cross-dealer data isolation
- COOP-TC-041 API requires valid token
- COOP-TC-042 API enforces dealer scope

---

### Group 6: Workflow & Status (P0/P1)

Tests included: COOP-TC-044 through COOP-TC-050

All P0:
- COOP-TC-045 Status = Submitted after submit
- COOP-TC-046 Workflow record created
- COOP-TC-047 Audit record created

---

## Regression Execution Plan

```bash
# Full regression suite against modern platform
npm run test:modern -- --grep @regression

# Subset: critical only (P0)
npm run test:modern -- --grep "@regression and @critical"

# Database verification (run after UI regression)
# Execute: tests/database/coop/verify-claim-records.sql
```

---

## Pass/Fail Criteria

| Scenario | Criterion |
|---|---|
| All P0 tests pass | Required for deployment |
| ≥ 95% of P1 tests pass | Required for release |
| ≥ 90% of P2 tests pass | Required for sprint sign-off |
| Any data isolation failure | Immediate rollback |
| Any financial calculation failure | Immediate rollback |

---

## Regression vs Smoke Relationship

```
Deployment
    │
    ▼
[Smoke Suite - 8 tests - 5 min]
    │
    ▼ PASS
[Regression Suite - 50 tests - 30 min]
    │
    ▼ PASS
Release Candidate Confirmed
```
