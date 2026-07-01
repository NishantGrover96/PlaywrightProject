# EngageAds — Package Builder — E2E Suite

Generated: 2026-07-01 | Pipeline: Step 4  
Module: `engage-ads` | Feature: `package-builder`  
Run: `playwright test tests/playwright/specs/engage-ads/feature-package-builder/ --grep @e2e`

## Applies To

| Client | Supported | Environments |
|---|---|---|
| DemoPortal | ✅ Yes | dev, testing, uat only — all flows mutating |
| CertainTeed | ✅ Yes | uat only — all flows mutating |
| Samsung HVAC | ❌ No — `engageAds: false` | — |

> **Do NOT run EngageAds tests against Samsung HVAC.** The `engageAds` feature flag is OFF for that client.
> All E2E flows are mutating — **do not run on production**.
> Package Builder is an **Admin-only** feature. All flows require admin session.

---

## Flows: 4 tests

### E2E-001 — Create full package from scratch `@mutation`

**Rules exercised:** BR-OV-001 → BR-OV-006, BR-PR-001, BR-PR-002, BR-CH-001, BR-CH-002, BR-CR-001–004, BR-FT-001–003, BR-SV-001–005, BR-EL-001, BR-EL-002

**Steps:**
1. Navigate to `/EngageAds/Admin/PackageBuilder` (new — no `?id`) as admin
2. Fill Overview tab: Package Name, Billing Term, Subtitle, select an icon
3. Assert identity strip and preview card update in real-time
4. Go to Pricing tab: add 1 pricing record with price $500 and 2 breakdown rows totalling $500
5. Go to Features tab: add 1 item per section (CAMPAIGN_LENGTH, WHATS_INCLUDED, BEST_FOR, RECOMMENDATION)
6. Assert preview panel shows sections in correct order
7. Go to Channels tab: select 2 channels by clicking rows
8. Upload 1 creative per channel (valid image file)
9. Click Save Package
10. Assert spinner appears then success banner shows
11. Assert URL updated to `?id=N` (no page reload)
12. Navigate to `/EngageAds/Admin/PackageList`
13. Assert new package visible in list
14. (If DB configured) Assert `package_eligibility` rows seeded with correct flags

**Expected:** Package created end-to-end. Visible in list. Eligibility rows present in DB.  
**Environment:** dev, testing, or UAT only.

---

### E2E-002 — Edit existing package — modify name and pricing `@mutation`

**Rules exercised:** BR-OV-005, BR-PR-001, BR-PR-002, BR-SV-001, BR-SV-002, BR-EL-001

**Steps:**
1. Open PackageBuilder with `?id=N` for a known existing package
2. Assert all fields pre-populated; identity strip shows existing name
3. Change Package Name in Overview tab
4. Go to Pricing tab; change the package price
5. Assert pricing billing term select is disabled (read-only)
6. Click Save Package
7. Assert success banner
8. Navigate to PackageList; assert updated name is shown
9. (If DB configured) Assert no duplicate eligibility rows created

**Expected:** Package updated. No duplicates. PackageList reflects new name.  
**Environment:** dev, testing, or UAT only.

---

### E2E-003 — Validate all save-blocking conditions trigger correct tab switch `@mutation`

**Rules exercised:** BR-OV-001, BR-OV-002, BR-PR-001, BR-SV-001

**Steps:**
1. Open PackageBuilder (new)
2. Add a pricing record with mismatched breakdown (e.g., price $100, breakdown total $90)
3. Click Save Package — assert Pricing tab becomes active; error banner mentions cost breakdown mismatch
4. Fix the breakdown to match; now clear the Package Name field
5. Click Save Package — assert Overview tab becomes active; error banner mentions Package Name
6. Re-enter Package Name; clear the Billing Term selection
7. Click Save Package — assert Overview tab still active; error banner mentions Billing Term

**Expected:** Each validation failure activates the corresponding tab and shows a specific error banner.  
**Environment:** dev, testing, or UAT only.

---

### E2E-004 — Create inquiry-only package `@mutation`

**Rules exercised:** BR-OV-001, BR-OV-002, BR-OV-003, BR-SV-001, BR-SV-002, BR-EL-001

**Steps:**
1. Open PackageBuilder (new)
2. Fill Package Name and Billing Term
3. Toggle IsInquiryOnly ON
4. Assert preview shows "Talk to Expert" action buttons (not "Select Package / Learn More")
5. Click Save Package
6. Assert success banner; URL updated to `?id=N`
7. Reload the page at `?id=N`
8. Assert IsInquiryOnly checkbox is still checked; preview still shows "Talk to Expert" buttons

**Expected:** Inquiry-only state persisted. Preview is consistent before and after save.  
**Environment:** dev, testing, or UAT only.

---

## Prerequisites

| Requirement | Details |
|---|---|
| Admin session | `fixtures/.auth/admin.json` — admin role required for all flows |
| Creative file | Valid image file (e.g., `.png`, ≤5 MB) in `tests/playwright/data/engage-ads/feature-package-builder/` |
| Existing package | Known `?id=N` for E2E-002; can be the package created by E2E-001 |
| Environments | dev, testing, or UAT only — all flows are mutating |
| Clients | DemoPortal and CertainTeed only — Samsung excluded |
