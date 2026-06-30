# EngageAds — Campaign Setup — Regression Suite

Generated: 2026-06-19 | Pipeline: Step 4

Total: 22 regression tests (includes smoke)

## Authorization & Access (5)
- CS-TC-001 Admin accesses any order
- CS-TC-002 Dealer cross-order blocked → AccessDenied
- CS-TC-003 Invalid encrypted orderSeq → BundledAdPackages
- CS-TC-004 Missing orderSeq → BundledAdPackages
- CS-TC-005 Order not found → OrderHistory

## Edit Window (4)
- CS-TC-006 Edit Mode alert within 72-hour window
- CS-TC-007 Expired window shows countdown
- CS-TC-008 Not-yet-submitted always editable
- CS-TC-009 Update button label in edit mode

## Step 1 Validation (5)
- CS-TC-010 FirstName required
- CS-TC-011 LastName required
- CS-TC-012 PrimaryContactEmail required and valid format
- CS-TC-013 ContactPhoneNumber required
- CS-TC-014 LeadDestinationEmail optional / fallback

## Step 2 Validation (3)
- CS-TC-015 BusinessName required
- CS-TC-016 WebsiteUrl required + https pattern
- CS-TC-017 City / StateProvince / ZipCode required

## Step 3 Validation (5)
- CS-TC-018 ServiceArea required
- CS-TC-019 WebsiteAccuracyConfirmed required
- CS-TC-020 FacebookBusinessPageUrl required when Yes
- CS-TC-021 FacebookBusinessPageUrl hidden when No
- CS-TC-022 Facebook section not rendered when no channel

## Logo Upload (3)
- CS-TC-023 Valid PNG upload succeeds @mutation
- CS-TC-024 Oversized logo rejected
- CS-TC-025 Invalid file type rejected

## Submit & Update (3)
- CS-TC-026 Full submission succeeds @mutation
- CS-TC-027 ModelState invalid renders errors
- CS-TC-028 EDIT_WINDOW_EXPIRED error on POST
