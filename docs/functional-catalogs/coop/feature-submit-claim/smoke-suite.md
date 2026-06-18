# Coop — Submit Claim — Smoke Suite

Generated: 2026-06-17 | Pipeline: Step 3  
Module: `coop` | Feature: `submit-claim`  
Run: `npm run test:coop:submit-claim:smoke`

Smoke tests cover the critical-path behaviors that must pass before any deeper testing.
All smoke tests are safe to run against production (non-mutating) except those tagged `@mutation`.

---

## Suite: 8 tests

| Test ID | Test Name | FU | Tags | Mutating |
|---|---|---|---|---|
| COOP-SC-SMOKE-001 | Page loads with wizard container visible | FU-001 | @smoke | No |
| COOP-SC-SMOKE-002 | Default claim type radio is No (NoPreapproval) | FU-003 | @smoke | No |
| COOP-SC-SMOKE-003 | Media tile step shows 13 tiles, Campaign excluded | FU-005 | @smoke | No |
| COOP-SC-SMOKE-004 | Activity form shows required fields (Invoice Amount, Number, File, Media Name) | FU-015, FU-016, FU-017, FU-019 | @smoke | No |
| COOP-SC-SMOKE-005 | Invoice upload area displays 10 MB size limit | FU-017 | @smoke | No |
| COOP-SC-SMOKE-006 | Draft save returns 6-digit temporary claim number | FU-043 | @smoke @mutation | **Yes** |
| COOP-SC-SMOKE-007 | Final submit returns 4-digit claim process number | FU-044 | @smoke @mutation | **Yes** |
| COOP-SC-SMOKE-008 | Unauthenticated access redirects to login | FU-068 | @smoke @security | No (known bug — `test.skip`) |

---

## Prerequisites

- Authenticated dealer session (storageState loaded)
- `SMOKE-006`, `SMOKE-007`: `sample-invoice.pdf` present in `tests/playwright/data/coop/feature-submit-claim/`
- `SMOKE-006`, `SMOKE-007`: Non-production environment (dev, testing, or UAT)

## Pass Criteria

All 8 tests green (SMOKE-008 expected to be skipped due to known security bug).  
If SMOKE-006 or SMOKE-007 fail due to missing invoice file, create it:
```
fsutil file createnew tests/playwright/data/coop/feature-submit-claim/sample-invoice.pdf 1048576
```
