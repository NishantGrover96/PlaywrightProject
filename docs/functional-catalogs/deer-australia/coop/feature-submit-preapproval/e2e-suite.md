# E2E Suite - Submit Preapproval (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-preapproval  
**Tier:** E2E | **Count:** 5 | **Run Order:** Sequential (cross-role; shared state)

---

## Purpose
End-to-end workflow scenarios validating full user journeys across roles. Run on release candidates and post-deployment verification.

---

## Tests

| ID | Title | Priority | Roles |
|---|---|---|---|
| COOP-PA-E2E-001 | Dealer submits -> appears in pending preapprovals with PENDING REVIEW | P1-Critical | BMDLR |
| COOP-PA-E2E-002 | Dealer submits -> admin receives notification email | P2-High | BMDLR -> BMADMIN |
| COOP-PA-E2E-003 | Admin auto-approves non-JDF -> dealer sees APPROVED status | P2-High | BMADMIN -> BMDLR |
| COOP-PA-E2E-004 | JDF preapproval with pending jdf_status not in claim dropdown | P2-High | BMDLR (DB verify) |
| COOP-PA-E2E-005 | Multiple dealers on one preapproval - all linked in tblPreapprovalDealer | P2-High | BMDLR (DB verify) |

---

## Preconditions
- At least one dealer with fund balance > $0 available
- BMADMIN account active and accessible
- JDFADMIN account active (for JDF scenarios)
- Test dealers not disabled

## Run Command
```bash
npx playwright test --grep "COOP-PA-E2E" --project=chromium
```

## Exit Criteria
All 5 tests pass. Failures block release sign-off.
