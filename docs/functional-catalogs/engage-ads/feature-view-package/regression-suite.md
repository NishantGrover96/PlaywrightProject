# EngageAds — View Package (BundledAdPackages) Regression Suite

Generated: 2026-06-18T16:37:04.157+05:30
Total Regression Tests: 34

## ENGAGEADS-TC-010 — Empty package response shows NoPackageAvailable state
- **Priority**: P2-High
- **Category**: ErrorHandling
- **BR Covered**: BR-006
- **Summary**: Validates the empty-state branch.

## ENGAGEADS-TC-011 — Custom-only catalog hides wizard payment actions
- **Priority**: P3-Medium
- **Category**: UI
- **BR Covered**: BR-008, BR-031
- **Summary**: Ensures the page degrades correctly when no selectable standard package exists.

## ENGAGEADS-TC-012 — Custom package card shows Talk To An Expert only
- **Priority**: P2-High
- **Category**: UI
- **BR Covered**: BR-008
- **Summary**: Verifies custom-package rendering rules.

## ENGAGEADS-TC-013 — Standard package card shows View Details and Select Package
- **Priority**: P2-High
- **Category**: UI
- **BR Covered**: BR-009
- **Summary**: Verifies standard package CTA rendering.

## ENGAGEADS-TC-014 — View Details navigates to the package detail page
- **Priority**: P2-High
- **Category**: Workflow
- **BR Covered**: BR-009, BR-010
- **Summary**: Validates detail-page navigation and encrypted parameter usage.

## ENGAGEADS-TC-015 — Package and budget identifiers remain encrypted in client markup
- **Priority**: P1-Critical
- **Category**: Security
- **BR Covered**: BR-010
- **Summary**: Protects against identifier enumeration in the UI.

## ENGAGEADS-TC-016 — Deep-link packageSeq auto-selects the matching package
- **Priority**: P2-High
- **Category**: Workflow
- **BR Covered**: BR-011, BR-012
- **Summary**: Verifies the documented deep-link feature.

## ENGAGEADS-TC-017 — Invalid package selection returns Package not found
- **Priority**: P2-High
- **Category**: ErrorHandling
- **BR Covered**: BR-013
- **Summary**: Covers the explicit package lookup failure path.

## ENGAGEADS-TC-018 — Unchecked Terms keeps payment disabled and shows the exact inline error
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-014
- **Summary**: Dedicated test for the exact terms validation message.

## ENGAGEADS-TC-019 — Checking Terms enables payment and hides the error label
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-014, BR-015
- **Summary**: Confirms the positive terms-acceptance state transition.

## ENGAGEADS-TC-020 — Co-op option is hidden when available budget is zero
- **Priority**: P2-High
- **Category**: BusinessLogic
- **BR Covered**: BR-016
- **Summary**: Covers the budget-gated co-op visibility rule.

## ENGAGEADS-TC-021 — Include Co-op Funds reveals the allocation controls
- **Priority**: P2-High
- **Category**: UI
- **BR Covered**: BR-015, BR-016
- **Summary**: Verifies co-op UI activation.

## ENGAGEADS-TC-022 — Missing budget type or invalid amount shows the shared co-op validation error
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-017
- **Summary**: Dedicated test for the primary co-op validation message.

## ENGAGEADS-TC-023 — Non-numeric co-op input is sanitized to numeric-only format
- **Priority**: P3-Medium
- **Category**: Validation
- **BR Covered**: BR-017
- **Summary**: Covers the numeric-only client filter for co-op amounts.

## ENGAGEADS-TC-024 — Co-op amount over available product balance shows the exact balance error
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-018
- **Summary**: Dedicated test for the line-balance validation message.

## ENGAGEADS-TC-025 — Single co-op amount over the package cost shows the package-cost cap error
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-019
- **Summary**: Dedicated test for the single-line package-cost validation message.

## ENGAGEADS-TC-026 — Cumulative co-op total over package cost shows the same cap error
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-019, BR-021
- **Summary**: Validates the cumulative package-cost ceiling.

## ENGAGEADS-TC-027 — Duplicate product code shows the duplicate-allocation error
- **Priority**: P2-High
- **Category**: Validation
- **BR Covered**: BR-020
- **Summary**: Dedicated test for duplicate product-line protection.

## ENGAGEADS-TC-028 — Valid single co-op allocation recalculates totals and remaining card amount
- **Priority**: P2-High
- **Category**: BusinessLogic
- **BR Covered**: BR-021, BR-022, BR-026
- **Summary**: Covers the standard partial co-op path.

## ENGAGEADS-TC-029 — Multiple distinct co-op allocations produce split-payment state
- **Priority**: P2-High
- **Category**: Workflow
- **BR Covered**: BR-021, BR-024
- **Summary**: Validates multi-line split-payment behavior.

## ENGAGEADS-TC-030 — Editing or deleting co-op rows recalculates the payment summary
- **Priority**: P2-High
- **Category**: Workflow
- **BR Covered**: BR-021
- **Summary**: Covers co-op row maintenance behavior.

## ENGAGEADS-TC-031 — Full co-op coverage zeroes card charge and hides fee rows
- **Priority**: P1-Critical
- **Category**: BusinessLogic
- **BR Covered**: BR-022, BR-025
- **Summary**: Validates the zero-card precondition for the co-op-only payment route.

## ENGAGEADS-TC-032 — Fee API failure uses fallback calculation and keeps checkout available
- **Priority**: P2-High
- **Category**: ErrorHandling
- **BR Covered**: BR-023
- **Summary**: Covers the documented graceful fee fallback.

## ENGAGEADS-TC-033 — CreateStripeSession rejects a zero or negative card amount
- **Priority**: P1-Critical
- **Category**: Validation
- **BR Covered**: BR-022, BR-024
- **Summary**: Dedicated test for the Stripe card-amount server validation message.

## ENGAGEADS-TC-034 — Card or split-payment flow posts CreateStripeSession and redirects to /EngageAds/Payment
- **Priority**: P1-Critical
- **Category**: Workflow
- **BR Covered**: BR-024
- **Summary**: Verifies the active Stripe routing branch.

## ENGAGEADS-TC-035 — Co-op-only flow posts CreatePayment and redirects to OrderConfirmation
- **Priority**: P1-Critical
- **Category**: Workflow
- **BR Covered**: BR-025
- **Summary**: Verifies the zero-card checkout route.

## ENGAGEADS-TC-036 — Expert modal requires Business Goal before submit
- **Priority**: P2-High
- **Category**: Validation
- **BR Covered**: BR-027
- **Summary**: Dedicated missing-field validation for Business Goal.

## ENGAGEADS-TC-037 — Expert modal requires City and strips non-letter characters
- **Priority**: P2-High
- **Category**: Validation
- **BR Covered**: BR-027, BR-028
- **Summary**: Combines the City required and client-side character-filter checks.

## ENGAGEADS-TC-038 — Expert modal requires State before submit
- **Priority**: P2-High
- **Category**: Validation
- **BR Covered**: BR-027
- **Summary**: Dedicated missing-field validation for State.

## ENGAGEADS-TC-039 — Expert modal requires Monthly Budget and enforces maxlength 50
- **Priority**: P2-High
- **Category**: Validation
- **BR Covered**: BR-027
- **Summary**: Covers both the required and maxlength constraints for Monthly Budget.

## ENGAGEADS-TC-040 — Expert modal loads dropdown data and submits successfully
- **Priority**: P2-High
- **Category**: Workflow
- **BR Covered**: BR-029, BR-030
- **Summary**: Validates the end-to-end custom inquiry workflow and lookup hydration.

## ENGAGEADS-TC-041 — Stripe configuration failure degrades gracefully
- **Priority**: P3-Medium
- **Category**: ErrorHandling
- **BR Covered**: BR-032
- **Summary**: Covers graceful degradation when Stripe bootstrap data is unavailable.

## ENGAGEADS-TC-042 — Cancel Plan returns the user from Step 2 to the package catalog
- **Priority**: P3-Medium
- **Category**: Workflow
- **BR Covered**: BR-012
- **Summary**: Validates the back-out path from checkout.

## ENGAGEADS-TC-043 — Payment summary displays inactive-until-paid messaging
- **Priority**: P2-High
- **Category**: BusinessLogic
- **BR Covered**: BR-026
- **Summary**: Ensures the activation rule is communicated in the UI.
