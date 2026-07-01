# Coop — Dealer Dashboard — Regression Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `coop` | Feature: `dealer-dashboard`  
Run: `playwright test tests/playwright/specs/coop/feature-dealer-dashboard/ --grep @regression`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ✅ Yes | dev, testing, uat, production |

> `coop` feature flag is **ON** for all three clients.

Tests marked `@mutation` should not run on production.

---

## UI / Page Init (10 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-001 | Dealer user remains on Index; admin redirected to AdminIndex | FU-DD-001 | @regression |
| COOP-DD-REG-002 | Fiscal year dropdown populated with available years, current year pre-selected | FU-DD-002 | @regression |
| COOP-DD-REG-003 | Dealer Index renders fiscal year dropdown + dealer number input | FU-DD-003 | @regression |
| COOP-DD-REG-004 | Admin Index renders multi-field form (dealer, name, city, state, country, page size) | FU-DD-004 | @regression |
| COOP-DD-REG-005 | Agency user sees agency dealer list DataTable (not search form) | FU-DD-005 | @regression |
| COOP-DD-REG-006 | Country dropdown is populated on Admin Index page load | FU-DD-006 | @regression |
| COOP-DD-REG-007 | State dropdown refreshes via AJAX when country is changed | FU-DD-007 | @regression |
| COOP-DD-REG-008 | Admin search results table renders with all columns | FU-DD-008 | @regression |
| COOP-DD-REG-009 | Agency dealer list DataTable has sorting, filtering, and pagination | FU-DD-009 | @regression |
| COOP-DD-REG-010 | Admin pagination controls render (first, prev, next, last, page numbers) | FU-DD-010 | @regression |

---

## DataEntry (8 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-011 | Empty dealer number submission shows required validation error | FU-DD-011 | @regression |
| COOP-DD-REG-012 | Dealer number over 15 characters is rejected | FU-DD-011 | @regression |
| COOP-DD-REG-013 | Fiscal year selection persists across search | FU-DD-012 | @regression |
| COOP-DD-REG-014 | Admin dealer name input supports partial match search | FU-DD-013 | @regression |
| COOP-DD-REG-015 | Admin city input supports partial match search | FU-DD-014 | @regression |
| COOP-DD-REG-016 | State dropdown is populated after country selection | FU-DD-015, FU-DD-016 | @regression |
| COOP-DD-REG-017 | Page size dropdown changes result set count per page | FU-DD-017 | @regression |
| COOP-DD-REG-018 | Search button click triggers OnPostSearch handler | FU-DD-018 | @regression |

---

## BusinessLogic (10 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-019 | Valid dealer number returns matching dealer in results | FU-DD-019 | @regression |
| COOP-DD-REG-020 | Dealer role cannot search for a different dealer's number | FU-DD-020 | @regression @security |
| COOP-DD-REG-021 | Agency user can only search dealers in their agency relationship | FU-DD-021 | @regression @security |
| COOP-DD-REG-022 | Admin user can search any dealer without restriction | FU-DD-022 | @regression |
| COOP-DD-REG-023 | Single-result search auto-redirects to dealer detail page | FU-DD-023 | @regression |
| COOP-DD-REG-024 | Corporate dealer context is set when dealer is selected | FU-DD-024 | @regression |
| COOP-DD-REG-025 | Multi-result search shows paginated list | FU-DD-025, FU-DD-032 | @regression |
| COOP-DD-REG-026 | Agency dealer list loads all agency-associated dealers | FU-DD-026 | @regression |
| COOP-DD-REG-027 | Country-state relationship lookup returns correct states | FU-DD-027 | @regression |
| COOP-DD-REG-028 | Export to Excel generates downloadable file | FU-DD-028 | @regression |

---

## Workflow (8 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-029 | Full search flow: validate → authenticate → search → process results | FU-DD-029 | @regression |
| COOP-DD-REG-030 | ModelState validation runs before dealer lookup | FU-DD-030 | @regression |
| COOP-DD-REG-031 | Single-result search redirects to detail without showing list | FU-DD-031 | @regression |
| COOP-DD-REG-032 | Multi-result search shows list with selectable rows | FU-DD-032 | @regression |
| COOP-DD-REG-033 | Initial GET request applies role-based routing | FU-DD-033 | @regression |
| COOP-DD-REG-034 | Selecting a dealer from results sets all 14 session context keys | FU-DD-034 | @regression |
| COOP-DD-REG-035 | Detail URL contains encrypted dealer_number_seq and dealer_type params | FU-DD-035 | @regression @security |
| COOP-DD-REG-036 | Breadcrumb/return URL session is set on initial page load | FU-DD-036 | @regression |

---

## DataPersistence (4 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-037 | Session stores all 13 dealer context keys after dealer selection | FU-DD-037 | @regression |
| COOP-DD-REG-038 | FiscalYear session key is set after search | FU-DD-038 | @regression |
| COOP-DD-REG-039 | PageReturnURL session key is set on page load | FU-DD-039 | @regression |
| COOP-DD-REG-040 | FiscalYear session is cleared on context switch (new OnGet) | FU-DD-040 | @regression |

---

## Security (6 tests)

| Test ID | Test Name | FU | Tags |
|---|---|---|---|
| COOP-DD-REG-041 | Role switch: admin → admin page; dealer → dealer page | FU-DD-041 | @regression @security |
| COOP-DD-REG-042 | Dealer cannot access another dealer's data via URL manipulation | FU-DD-042 | @regression @security |
| COOP-DD-REG-043 | Agency user rejected when dealer not in agency relationship | FU-DD-043 | @regression @security |
| COOP-DD-REG-044 | Dealer seq in URL is encrypted (not plain integer) | FU-DD-044 | @regression @security |
| COOP-DD-REG-045 | Anti-forgery token present on both Index and AdminIndex forms | FU-DD-045 | @regression @security |
| COOP-DD-REG-046 | User identity verified via external username before context set | FU-DD-046 | @regression @security |

---

## Total: 46 active tests

## FUs covered
FU-DD-001 through FU-DD-046 — all 46 FUs from coverage-matrix.md (100% coverage)
