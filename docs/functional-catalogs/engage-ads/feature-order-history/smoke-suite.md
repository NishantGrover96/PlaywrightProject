# EngageAds — Order History — Smoke Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `order-history`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-order-history/ --grep @smoke`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.
> Tests are scoped to DemoPortal and CertainTeed only.

Smoke tests cover the critical-path behaviors that must pass before any deeper testing.
All smoke tests are non-mutating and safe to run against production.

---

## Suite: 5 tests

| Test ID | Test Name | FU | Tags | Mutating |
|---|---|---|---|---|
| OH-SMOKE-001 | Order History page loads for authenticated dealer | FU-OH-001 | @smoke @navigation | No |
| OH-SMOKE-002 | Order list is displayed with correct columns | FU-OH-002 | @smoke @display | No |
| OH-SMOKE-003 | Unauthenticated user is redirected to login | FU-OH-003 | @smoke @security | No |
| OH-SMOKE-004 | Campaign status badges render correctly (PAID, PENDING, etc.) | FU-OH-004 | @smoke @display | No |
| OH-SMOKE-005 | Edit link visible within edit window; absent after expiry | FU-OH-005 | @smoke @edit-window | No |

---

## Prerequisites

- Authenticated dealer session with at least one EngageAds order in the target environment
- Target: DemoPortal or CertainTeed only (Samsung excluded)
- `LOGIN_PATH` env var set correctly per client (CertainTeed requires `?Internal`)

## Pass Criteria

All 5 tests green. If the dealer account has no orders, OH-SMOKE-002 will still pass (empty state is valid) but OH-SMOKE-004 and OH-SMOKE-005 require at least one order with a known status.
