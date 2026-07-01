# Coop — Dealer Dashboard — Smoke Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `coop` | Feature: `dealer-dashboard`  
Run: `playwright test tests/playwright/specs/coop/feature-dealer-dashboard/ --grep @smoke`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ✅ Yes | dev, testing, uat, production |

> `coop` feature flag is **ON** for all three clients. All smoke tests run against all clients.

Smoke tests cover the critical-path behaviors that must pass before any deeper testing.
All smoke tests are non-mutating and safe to run against production.

---

## Suite: 7 tests

| Test ID | Test Name | FU | Tags | Mutating |
|---|---|---|---|---|
| COOP-DD-SMOKE-001 | Dealer user lands on Dealer Index page (not redirected to admin) | FU-DD-001 | @smoke | No |
| COOP-DD-SMOKE-002 | Admin user is redirected to Admin Index on page load | FU-DD-001 | @smoke | No |
| COOP-DD-SMOKE-003 | Dealer search form renders with fiscal year dropdown and dealer number input | FU-DD-003 | @smoke | No |
| COOP-DD-SMOKE-004 | Fiscal year dropdown is populated and defaults to current fiscal year | FU-DD-002 | @smoke | No |
| COOP-DD-SMOKE-005 | Dealer number input rejects empty submission with validation error | FU-DD-011 | @smoke | No |
| COOP-DD-SMOKE-006 | Valid dealer number search auto-redirects to dealer detail (single result) | FU-DD-023 | @smoke | No |
| COOP-DD-SMOKE-007 | Dealer number and fiscal year are passed as encrypted parameters in detail URL | FU-DD-035, FU-DD-044 | @smoke @security | No |

---

## Prerequisites

- Authenticated dealer session (storageState loaded) for SMOKE-001, SMOKE-003–007
- Authenticated admin session (storageState loaded) for SMOKE-002
- A known valid dealer number configured in test data (`tests/playwright/data/coop/feature-dealer-dashboard/`)

## Pass Criteria

All 7 tests green. SMOKE-006 requires a dealer number that maps to exactly 1 result in the target environment.
