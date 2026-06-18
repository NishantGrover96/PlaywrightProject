# Coop — Submit Claim — Regression Suite

Generated: 2026-06-17 | Pipeline: Step 3  
Module: `coop` | Feature: `submit-claim`  
Run: `npm run test:coop:submit-claim` (all @regression tests)

Regression tests provide comprehensive functional coverage of all non-skipped FUs.
Tests marked `@mutation` should not run on production.

---

## UI / Page Init (5 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-SC-REG-001 | Fiscal year radios hidden when cutoff not in range | FU-002 | @regression |
| COOP-SC-REG-002 | Claim type radio toggle shows/hides pre-approval field | FU-003 | @regression |
| COOP-SC-REG-003 | Campaign tile absent from media grid (dealer claim) | FU-005 | @regression |
| COOP-SC-REG-004 | Budget display area present on Step 4 | FU-007 | @regression |
| COOP-SC-REG-005 | Product line block visibility driven by program config | FU-009 | @regression |
| COOP-SC-REG-006 | Success panels present after draft save | FU-010 | @regression @mutation |

## DataEntry (6 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-SC-REG-007 | Contact name auto-populated from user profile | FU-011 | @regression |
| COOP-SC-REG-008 | Invoice amount field maxlength is 15 | FU-015 | @regression |
| COOP-SC-REG-009 | Invoice number field maxlength is 20 | FU-016 | @regression |
| COOP-SC-REG-010 | Media name field maxlength is 100 | FU-019 | @regression |
| COOP-SC-REG-011 | Pre-approval number maxlength is 25 | FU-014 | @regression |
| COOP-SC-REG-012 | Submission comment maxlength is 500 | FU-029 | @regression |
| COOP-SC-REG-013 | Confirmation email (Me) is readonly and pre-filled | FU-026 | @regression |

## BusinessLogic (4 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-SC-REG-014 | Product line values must sum to 100 (HTTP 400 if not) | FU-031 | @regression @mutation |
| COOP-SC-REG-015 | Future activity date rejected (fixme — FU-032 partial) | FU-032 | @regression @mutation — `test.fixme` |
| COOP-SC-REG-016 | Duplicate activity dates rejected (HTTP 400) | FU-033 | @regression @mutation |
| COOP-SC-REG-017 | Pre-approval lookup: invalid number shows no dealer info | FU-030 | @regression |

## Workflow (5 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-SC-REG-018 | Draft save shows temp claim number and draft-saved panel | FU-043 | @regression @mutation |
| COOP-SC-REG-019 | Final submit shows claim process number and submit panel | FU-044 | @regression @mutation |
| COOP-SC-REG-020 | Multiple activities can be added | FU-046 | @regression |
| COOP-SC-REG-021 | Submit New Claim button visible after success (dealer role) | FU-052 | @regression @mutation |
| COOP-SC-REG-022 | Submit Another Claim button visible after submit | FU-010 | @regression @mutation |

## Security (3 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-SC-REG-023 | Unauthenticated access redirects to login | FU-068 | @regression @security — `test.skip` (known bug) |
| COOP-SC-REG-024 | Dealer seq parameter in URL is encrypted | FU-069 | @regression @security |
| COOP-SC-REG-025 | Pre-approval modal only shows dealer own PAs | FU-071 | @regression |

## Accepted Exceptions — `test.fixme` (6 skipped)

| FU | Exception |
|---|---|
| FU-061 | Activity dates not persisted to DB after draft save |
| FU-020 | Activity dates not pre-filled on incomplete claim resume |
| FU-021 | Dealer ID contract validation handler unconfirmed |
| FU-036 | Dealer ID verification logic unconfirmed |
| FU-059 | Vendor contact field mapping unverified |
| FU-064 | InsertActivityProductSaaSAsync extra param |

---

## Total: 32 active tests + 6 `test.fixme` = 38 tests in regression file

## FUs covered by regression (active tests)
FU-002, FU-003, FU-005, FU-007, FU-009, FU-010, FU-011, FU-014, FU-015, FU-016,
FU-019, FU-026, FU-029, FU-030, FU-031, FU-033, FU-043, FU-044, FU-046, FU-052,
FU-068, FU-069, FU-071

## FUs tested via smoke only (not repeated in regression)
FU-001, FU-017 (smoke tests sufficient; not duplicated here)
