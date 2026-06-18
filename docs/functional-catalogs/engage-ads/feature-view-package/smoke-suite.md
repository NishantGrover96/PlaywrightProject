# EngageAds — View Package (BundledAdPackages) Smoke Suite

Generated: 2026-06-18T16:37:04.157+05:30
Total Smoke Tests: 6

## ENGAGEADS-TC-001 — Dealer page load shows wizard and package catalog
- **Priority**: P1-Critical
- **Category**: UI
- **BR Covered**: BR-001, BR-002, BR-003, BR-007
- **Summary**: Confirms the dealer happy-path entry point loads the catalog instead of an error or empty state.

## ENGAGEADS-TC-002 — Unauthenticated user is redirected before page access
- **Priority**: P1-Critical
- **Category**: Security
- **BR Covered**: BR-001
- **Summary**: Verifies the feature is protected by authentication.

## ENGAGEADS-TC-003 — Dealer sees eligible packages and no empty state in UAT
- **Priority**: P1-Critical
- **Category**: BusinessLogic
- **BR Covered**: BR-002, BR-003, BR-007
- **Summary**: Checks the live dealer dataset expected by downstream automation.

## ENGAGEADS-TC-004 — Admin view is browse-only with no purchase CTA
- **Priority**: P1-Critical
- **Category**: Security
- **BR Covered**: BR-004, BR-005
- **Summary**: Verifies role-restricted browse-only behavior.

## ENGAGEADS-TC-005 — Selecting a standard package renders Step 2 payment summary
- **Priority**: P1-Critical
- **Category**: Workflow
- **BR Covered**: BR-009, BR-012, BR-022, BR-026
- **Summary**: Covers the core dealer package-selection workflow.

## ENGAGEADS-TC-006 — Accepting Terms enables payment and co-op interactions
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-014, BR-015, BR-016
- **Summary**: Confirms the primary checkout gate works as observed live.
