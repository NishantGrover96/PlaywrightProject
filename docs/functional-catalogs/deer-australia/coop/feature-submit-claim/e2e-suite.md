# E2E Suite — Submit Claim (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-claim  
**Tier:** E2E | **Count:** 5 | **Run Order:** Sequential (cross-role; shared state)

---

## Purpose
End-to-end workflow scenarios validating full user journeys across roles. Run on release candidates and post-deployment verification.

---

## Tests

| ID | Title | Priority | Roles |
|---|---|---|---|
| COOP-CL-E2E-001 | Dealer submits → claim appears in history with RECEIVED status | P1-Critical | BMDLR |
| COOP-CL-E2E-002 | Dealer submits → admin receives notification | P2-High | BMDLR → BMADMIN |
| COOP-CL-E2E-003 | Admin submits → claim status = IN PROGRESS; dealer sees update | P2-High | BMADMIN → BMDLR |
| COOP-CL-E2E-004 | Claim linked to preapproval reduces preapproval balance in DB | P1-Critical | BMDLR (DB verify) |
| COOP-CL-E2E-005 | Multiple documents on one claim — all records created in tblDocumentImage | P2-High | BMDLR (DB verify) |

---

## Preconditions
- At least one APPROVED preapproval exists (JDF jdf_status = APPROVED) for test dealer
- Fund balance > $0
- Test dealer not disabled

## Run Command
```bash
npx playwright test --grep "COOP-CL-E2E" --project=chromium
```

## Exit Criteria
All 5 tests pass. Failures block release sign-off.
