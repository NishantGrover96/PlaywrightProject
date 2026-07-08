# Smoke Suite — Submit Preapproval (Deer Australia)

**Client:** deer-australia | **Module:** coop | **Feature:** submit-preapproval  
**Tier:** Smoke | **Count:** 3 | **Run Order:** Sequential

---

## Purpose
Fast gate check (~2 min) run on every PR and deployment. Blocks progress if any test fails.

---

## Tests

| ID | Title | Priority | BR Covered |
|---|---|---|---|
| COOP-PA-SMOKE-001 | Page loads for authenticated dealer | P1-Critical | BR-PA-001, BR-PA-017 |
| COOP-PA-SMOKE-002 | Unauthenticated user redirected | P1-Critical | BR-PA-001 |
| COOP-PA-SMOKE-003 | Happy path: dealer submits valid preapproval | P1-Critical | BR-PA-009, BR-PA-024, BR-PA-025, BR-PA-026 |

---

## Run Command
```bash
npx playwright test --grep "COOP-PA-SMOKE" --project=chromium
```

## Exit Criteria
All 3 tests must pass. Any failure blocks promotion to regression suite.
