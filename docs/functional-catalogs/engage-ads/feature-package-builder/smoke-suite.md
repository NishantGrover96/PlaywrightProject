# EngageAds — Package Builder — Smoke Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `package-builder`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-package-builder/ --grep @smoke`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.
> Package Builder is an **Admin-only** feature (`/EngageAds/Admin/PackageBuilder`). Requires admin session.

Smoke tests cover the critical-path behaviors that must pass before any deeper testing.
SMK-004, SMK-005, SMK-007 are mutating — skip on production.

---

## Suite: 8 tests

| Test ID | Test Name | Rule | Tags | Mutating |
|---|---|---|---|---|
| SMK-001 | Navigate to PackageBuilder as DFADMIN — page loads with all 4 tabs visible | BR-OV-001 | @smoke | No |
| SMK-002 | Attempt save with empty Package Name — error banner shown, save blocked | BR-OV-001 | @smoke | No |
| SMK-003 | Attempt save with no Billing Term selected — error banner shown, save blocked | BR-OV-002 | @smoke | No |
| SMK-004 | Save valid new package (Name + Billing Term only) — spinner, success banner, URL updated to `?id=N` | BR-SV-001, BR-SV-002 | @smoke @mutation | **Yes** |
| SMK-005 | Saved package appears in PackageList admin page (`/EngageAds/Admin/PackageList`) | BR-EL-001 | @smoke @mutation | **Yes** |
| SMK-006 | Tab navigation switches active tab and panel (click Pricing → Pricing panel visible) | BR-OV-001 | @smoke | No |
| SMK-007 | `package_eligibility` rows created after new package save (DB check) | BR-EL-001, BR-EL-002 | @smoke @mutation @db | **Yes** |
| SMK-008 | Edit existing package via `?id=N` — page loads in edit mode with existing data pre-populated | BR-SV-002 | @smoke | No |

---

## Prerequisites

- Authenticated admin session (`fixtures/.auth/admin.json`)
- SMK-004, SMK-005, SMK-007: dev/testing/UAT only — not production
- SMK-007: Database access configured (`DB_SERVER`, `DB_NAME` in `.env.*`)
- SMK-008: At least one existing package with a known `id` in the target environment

## Pass Criteria

All 8 tests green (SMK-004, SMK-005, SMK-007 skipped on production).  
SMK-007 requires DB connectivity — skip gracefully if `DB_SERVER` is not set.
