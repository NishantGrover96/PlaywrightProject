# Coop — Dealer Dashboard — E2E Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `coop` | Feature: `dealer-dashboard`  
Run: `playwright test tests/playwright/specs/coop/feature-dealer-dashboard/ --grep @e2e`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ✅ Yes | dev, testing, uat, production |

> `coop` feature flag is **ON** for all three clients.

E2E tests exercise complete end-to-end user flows. All flows are non-mutating (read-only search and navigation).
Safe to run on production.

---

## Flows: 3 tests

### COOP-DD-E2E-001 — Dealer role: search by dealer number → single result → auto-redirect to detail

**FUs exercised:** FU-DD-001, FU-DD-002, FU-DD-003, FU-DD-011, FU-DD-018, FU-DD-019, FU-DD-023, FU-DD-029, FU-DD-034, FU-DD-035, FU-DD-037

**Steps:**
1. Navigate to `/CoopManagement/Dashboard` as authenticated dealer
2. Assert dealer Index page loads (not redirected to AdminIndex)
3. Assert fiscal year dropdown present and defaulted to current year
4. Assert dealer number input visible
5. Fill dealer number with valid test dealer number
6. Click Search
7. Assert single result triggers immediate redirect to dealer detail page
8. Assert URL contains encrypted `dealer_number_seq` parameter
9. Assert dealer name visible on detail page

**Expected:** Dealer is taken directly to their detail page. Session contains 13+ dealer context keys. URL params are encrypted.

---

### COOP-DD-E2E-002 — Admin role: multi-field search → paginated results → select dealer → detail page

**FUs exercised:** FU-DD-001, FU-DD-004, FU-DD-006, FU-DD-007, FU-DD-022, FU-DD-025, FU-DD-031, FU-DD-032, FU-DD-033, FU-DD-044

**Steps:**
1. Navigate to `/CoopManagement/Dashboard` as authenticated admin
2. Assert redirect to AdminIndex page (not Dealer Index)
3. Assert multi-field search form renders (dealer number, name, city, state, country, page size)
4. Select a country from dropdown
5. Assert state dropdown repopulates via AJAX
6. Enter a partial dealer name that returns multiple results
7. Click Search
8. Assert paginated results table renders with all columns
9. Click a dealer row to navigate to detail
10. Assert detail page loads with correct dealer context

**Expected:** Admin can search across all dealers, navigate results, and access any dealer's detail. URL params are encrypted.

---

### COOP-DD-E2E-003 — Agency user: view agency dealer list → select dealer → detail page

**FUs exercised:** FU-DD-001, FU-DD-005, FU-DD-009, FU-DD-021, FU-DD-026, FU-DD-043

**Steps:**
1. Navigate to `/CoopManagement/Dashboard` as authenticated agency user
2. Assert agency dealer list DataTable is rendered (not the search form)
3. Assert table has sorting and filtering controls
4. Assert only dealers belonging to this agency are listed
5. Click a dealer row's action link
6. Assert navigation to dealer detail page
7. Assert attempting to access a dealer outside the agency relationship returns an error

**Expected:** Agency user sees only their own dealers. Cross-agency access is blocked. DataTable controls are functional.

---

## Prerequisites

| Requirement | Details |
|---|---|
| Dealer test data | Valid dealer number in `tests/playwright/data/coop/feature-dealer-dashboard/test-data.json` |
| Multi-result data | Partial name that returns ≥2 dealers for E2E-002 |
| Environments | All environments (dev, testing, uat, production) — flows are read-only |
| Admin session | `fixtures/.auth/admin.json` loaded for E2E-002 |
| Agency session | Agency user credentials configured for E2E-003 |
