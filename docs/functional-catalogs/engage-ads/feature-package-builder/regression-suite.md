# EngageAds — Package Builder — Regression Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `package-builder`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-package-builder/ --grep @regression`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat, production |
| CertainTeed | ✅ Yes | uat, production |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.
> Package Builder is an **Admin-only** feature. Requires admin session.

Total: 24 regression tests. Tests marked `@mutation` skip on production.

---

## Overview Tab (5 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-001 | Type in Package Name — identity strip and preview card update in real-time | BR-OV-005 | @regression |
| REG-002 | Select billing term — identity strip updates and all pricing billing term selects lock | BR-OV-006, BR-PR-003 | @regression |
| REG-003 | Toggle IsInquiryOnly ON — preview shows "Talk to Expert" buttons | BR-OV-003 | @regression |
| REG-004 | Toggle IsInquiryOnly OFF — preview shows "Select Package / Learn More" buttons | BR-OV-003 | @regression |
| REG-005 | Click icon option — identity strip and preview card icon update | BR-OV-004 | @regression |

---

## Pricing Tab (3 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-006 | Price $100 with breakdown totalling $90 — save blocked with error banner, Pricing tab activated | BR-PR-001 | @regression @mutation |
| REG-007 | Price $100 with breakdown totalling $100 — save succeeds; DB record has `price_cents=10000` | BR-PR-001, BR-PR-002 | @regression @mutation @db |
| REG-008 | Pricing billing term select is disabled (read-only) on Pricing tab | BR-PR-003 | @regression |

---

## Features Tab (4 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-009 | Add CAMPAIGN_LENGTH item — saves without DB constraint error | BR-FT-001, BR-FT-002 | @regression @mutation |
| REG-010 | Add items to all 4 sections — preview shows correct order (CAMPAIGN_LENGTH → WHATS_INCLUDED → BEST_FOR → RECOMMENDATION) | BR-FT-003 | @regression |
| REG-011 | Edit a feature item — modal opens pre-populated with existing values | BR-FT-001 | @regression |
| REG-012 | Delete a feature item — removed from list and preview updates | BR-FT-001 | @regression @mutation |

---

## Channels Tab (2 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-013 | Click channel row (not checkbox) — channel becomes checked, creative column appears | BR-CH-002, BR-CH-001 | @regression |
| REG-014 | Deselect a channel — creative upload column for that channel is removed | BR-CH-001 | @regression |

---

## Creatives (3 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-015 | Upload 5 images then try to add 6th — warning banner shown, 6th rejected | BR-CR-001 | @regression |
| REG-016 | Select image file — thumbnail preview card appears before save | BR-CR-002 | @regression |
| REG-017 | Delete pending creative (before save) — card removed locally, no API call | BR-CR-004 | @regression |

---

## Save Flow (3 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-018 | Save button shows "⟳ Saving..." during save and restores to "Save Package" on success | BR-SV-001 | @regression @mutation |
| REG-019 | Save new package — URL changes to `?id=N` without page reload | BR-SV-002 | @regression @mutation |
| REG-020 | Navigate away with unsaved changes — browser beforeunload dialog shown | BR-SV-005 | @regression |

---

## Package Eligibility (4 tests)

| Test ID | Test Name | Rule | Tags |
|---|---|---|---|
| REG-021 | New package has same eligibility row count as existing PROGRAM_DEALER_TYPE packages | BR-EL-001, BR-EL-002 | @regression @mutation @db |
| REG-022 | All seeded eligibility rows have `allow_flag=1`, `active_flag=1`, `is_deleted=0` | BR-EL-002 | @regression @mutation @db |
| REG-023 | New package appears in PackageList immediately after save | BR-EL-001 | @regression @mutation |
| REG-024 | Edit existing package — save updates fields without creating duplicate eligibility rows | BR-EL-001 | @regression @mutation @db |

---

## Total: 24 active regression tests

## Accepted Exceptions

| Condition | Note |
|---|---|
| REG-006, REG-007 | Mutation tests — skip on production |
| REG-009, REG-012, REG-018, REG-019, REG-021–024 | Mutation tests — skip on production |
| REG-007, REG-021, REG-022, REG-024 | DB assertions — skip gracefully if `DB_SERVER` not configured |
