# PopShop — New Order — Smoke Suite

Generated: 2026-07-01 | Pipeline: Step 3  
Module: `popshop` | Feature: `new-order`  
Run: `playwright test tests/playwright/specs/popshop/feature-new-order/ --grep @smoke`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `popshop: false` | — |

> **Do NOT run PopShop tests against Samsung HVAC.** The `popshop` feature flag is OFF for that client.

> ⚠️ **Modern Implementation Status:** Several critical PopShop FUs are missing in the modern platform
> (documented in `gap-analysis.md`). Smoke tests below reflect **currently implemented** behavior.
> Tests for unimplemented FUs are marked `@fixme` — they will be enabled as gaps are resolved.

---

## Suite: 5 tests

| Test ID | Test Name | FU | Tags | Mutating | Status |
|---|---|---|---|---|---|
| POPSHOP-SMOKE-001 | New Order page loads for authenticated dealer | FU-001 | @smoke | No | Active |
| POPSHOP-SMOKE-002 | Unauthenticated user is redirected to login | FU-032 | @smoke @security | No | Active |
| POPSHOP-SMOKE-003 | Product listing renders (grid or list view) | FU-002 | @smoke | No | `test.fixme` — Missing in Modern |
| POPSHOP-SMOKE-004 | Add single item to cart | FU-024 | @smoke @mutation | **Yes** | `test.fixme` — Missing in Modern |
| POPSHOP-SMOKE-005 | Dealer role only sees eligible products (role-based filtering) | FU-019 | @smoke @security | No | `test.fixme` — Missing in Modern |

---

## Active Tests (run now): 2

POPSHOP-SMOKE-001 and POPSHOP-SMOKE-002 are the only currently active smoke tests. The remaining 3 are blocked pending modern implementation of their respective FUs (see `gap-analysis.md`).

---

## Prerequisites

- Authenticated dealer session
- Target: DemoPortal or CertainTeed only (Samsung excluded)

## Pass Criteria

POPSHOP-SMOKE-001 and POPSHOP-SMOKE-002 green. POPSHOP-SMOKE-003 through 005 expected as `fixme` skips until modern gaps are resolved.
