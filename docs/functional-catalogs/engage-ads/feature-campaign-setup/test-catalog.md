# EngageAds — Campaign Setup — Test Catalog

Generated: 2026-06-19 | Pipeline: Step 4 (Functional Test Catalog)

## Summary

| Suite | Count |
|---|---|
| Smoke | 6 |
| Regression | 22 |
| E2E | 4 |
| **Total** | **32** |

---

## Smoke Tests

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-SMOKE-001 | Authenticated dealer without orderSeq redirects to BundledAdPackages | BR-002 | @smoke |
| CS-SMOKE-002 | Unauthenticated user is redirected to login | BR-001 | @smoke |
| CS-SMOKE-003 | 4-step wizard is rendered with package info header | BR-013 | @smoke |
| CS-SMOKE-004 | Step 1 required fields show validation errors when blank | BR-014 | @smoke |
| CS-SMOKE-005 | Step 4 TermsAccepted is required to submit | BR-019 | @smoke |
| CS-SMOKE-006 | Successful form submission redirects to OrderConfirmation | BR-023, BR-024 | @smoke @mutation |

---

## Regression Tests

### Authorization & Access

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-001 | Admin can access any order's campaign setup | BR-005 | @regression |
| CS-TC-002 | Dealer cannot access another dealer's order — redirected to AccessDenied | BR-004 | @regression |
| CS-TC-003 | Invalid encrypted orderSeq redirects to BundledAdPackages | BR-003 | @regression |
| CS-TC-004 | Missing orderSeq and no TempData redirects to BundledAdPackages | BR-002 | @regression |
| CS-TC-005 | Order not found redirects to OrderHistory with error | BR-006 | @regression |

### Edit Window

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-006 | Edit Mode alert shown when within 72-hour edit window | BR-007, BR-008 | @regression |
| CS-TC-007 | Expired edit window shows countdown and redirects after 5 seconds | BR-009, BR-010 | @regression |
| CS-TC-008 | Not-yet-submitted setup is always editable with no expiry alert | BR-011 | @regression |
| CS-TC-009 | Submit button label is "Update Campaign Setup" in edit mode | BR-023 | @regression |

### Step 1 Validation

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-010 | FirstName required — invalid feedback shown when blank | BR-014 | @regression |
| CS-TC-011 | LastName required — invalid feedback shown when blank | BR-014 | @regression |
| CS-TC-012 | PrimaryContactEmail required and must be valid email format | BR-014 | @regression |
| CS-TC-013 | ContactPhoneNumber required | BR-014 | @regression |
| CS-TC-014 | LeadDestinationEmail is optional; falls back to primary email in review | BR-028 | @regression |

### Step 2 Validation

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-015 | BusinessName required | BR-015 | @regression |
| CS-TC-016 | WebsiteUrl required and must match https?://.+ pattern | BR-015, BR-016 | @regression |
| CS-TC-017 | City, StateProvince, ZipCode required | BR-015 | @regression |

### Step 3 Validation

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-018 | ServiceArea required — cannot advance without it | BR-017 | @regression |
| CS-TC-019 | WebsiteAccuracyConfirmed checkbox required | BR-017 | @regression |
| CS-TC-020 | FacebookBusinessPageUrl required when HasFacebookBusinessPage is Yes | BR-018 | @regression |
| CS-TC-021 | FacebookBusinessPageUrl section hidden when HasFacebookBusinessPage is No | BR-018 | @regression |
| CS-TC-022 | Facebook section not rendered when HasFacebookChannel is false | BR-013 | @regression |

### Logo Upload

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-023 | Valid PNG logo upload returns success with fileName and fileUrl | BR-020, BR-021 | @regression @mutation |
| CS-TC-024 | Oversized logo (>5 MB) returns error message | BR-020 | @regression |
| CS-TC-025 | Invalid file type logo returns error message | BR-020 | @regression |

### Submit & Update

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-TC-026 | New submission with all required fields succeeds | BR-023, BR-024 | @regression @mutation |
| CS-TC-027 | ModelState invalid (missing required fields) renders Page() with errors | BR-026 | @regression |
| CS-TC-028 | EDIT_WINDOW_EXPIRED error shown when window expires during POST | BR-025 | @regression |

---

## E2E Tests

| TC ID | Title | BR | Tags |
|---|---|---|---|
| CS-E2E-001 | Complete new campaign setup flow: Step 1→2→3→4 → Submit → OrderConfirmation | BR-014..BR-024 | @e2e @mutation |
| CS-E2E-002 | Complete edit flow: load existing setup → modify → Update → OrderConfirmation | BR-007, BR-008, BR-023, BR-024 | @e2e @mutation |
| CS-E2E-003 | Complete flow with logo upload and Facebook Business Page URL | BR-018, BR-020, BR-021, BR-024 | @e2e @mutation |
| CS-E2E-004 | Admin accesses dealer order, completes setup, verifies OrderConfirmation | BR-005, BR-024 | @e2e @mutation |
