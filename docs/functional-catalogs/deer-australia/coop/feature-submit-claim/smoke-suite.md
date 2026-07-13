# Smoke Suite - Submit Claim (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-claim  
**Tier:** Smoke | **Count:** 3 | **Run Order:** Sequential

---

## Purpose
Fast gate check (~2 min) run on every PR and deployment. Blocks progress if any test fails.

---

## Tests

| ID | Title | Priority | BR Covered |
|---|---|---|---|
| COOP-CL-SMOKE-001 | Page loads for authenticated dealer | P1-Critical | BR-CL-001 |
| COOP-CL-SMOKE-002 | Unauthenticated user redirected | P1-Critical | BR-CL-001 |
| COOP-CL-SMOKE-003 | Happy path: dealer submits valid claim | P1-Critical | BR-CL-002, BR-CL-010, BR-CL-025, BR-CL-026 |

---

## Run Command
```bash
npx playwright test --grep "COOP-CL-SMOKE" --project=chromium
```

## Exit Criteria
All 3 tests must pass. Any failure blocks promotion to regression suite.
