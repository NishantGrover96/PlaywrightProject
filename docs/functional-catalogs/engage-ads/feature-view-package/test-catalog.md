# EngageAds — View Package (BundledAdPackages) Functional Test Catalog

Generated: 2026-06-18T16:37:04.157+05:30
Total Test Cases: 45 (Smoke: 6 | Regression: 34 | E2E: 5)

## Business Rules Covered: 32

## Coverage Notes

- Smoke suite covers page access, auth protection, package visibility, admin browse-only behavior, package selection, and terms-gated checkout.
- Regression suite covers display rules, deep-linking, all documented validation/error messages, co-op rules, fee logic, payment routing, inquiry validation, and graceful degradation.
- E2E suite covers Stripe payment, co-op-only payment, split payment, custom inquiry, and deep-link checkout.

## Test Cases

### Smoke Suite (6 tests)

#### ENGAGEADS-TC-001 — Dealer page load shows wizard and package catalog
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-001, BR-002, BR-003, BR-007
- **Precondition**: User is authenticated as a dealer with access to an EngageAds program that has active bundled packages.
- **Steps**:
  1. Sign in as a dealer user.
  2. Navigate to `/EngageAds/BundledAdPackages`.
  3. Wait for the page heading and package cards to render.
- **Expected**: The page loads successfully with the Step 1 catalog view visible.
- **Assertions**:
  - Heading `Bundled Ad Packages (Do It For Me)` is visible.
  - `Choose Plan` is the active wizard step.
  - At least one `.card` package tile is visible and `.noPackage` is not visible.
- **Test Data**: Authenticated dealer fixture with package data available.

#### ENGAGEADS-TC-002 — Unauthenticated user is redirected before page access
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-001
- **Precondition**: No authenticated session exists.
- **Steps**:
  1. Open a new browser context with no saved auth state.
  2. Request `/EngageAds/BundledAdPackages` directly.
- **Expected**: The user is redirected to login or another auth gate before the package page is displayed.
- **Assertions**:
  - Response is not the bundled package page content for an anonymous user.
  - Current URL matches the application login/auth flow.
- **Test Data**: Anonymous browser context.

#### ENGAGEADS-TC-003 — Dealer sees eligible packages and no empty state in UAT
- **Tier**: Smoke
- **Category**: BusinessLogic
- **Priority**: P1-Critical
- **BR Covered**: BR-002, BR-003, BR-007
- **Precondition**: User is authenticated as the UAT dealer with known eligible packages.
- **Steps**:
  1. Sign in with the dealer auth state.
  2. Navigate to the bundled packages page.
  3. Capture the visible package cards and header summary.
- **Expected**: The dealer sees the populated catalog for the current program.
- **Assertions**:
  - Seven or more package cards are visible in the grid.
  - `Total Funds: $1,139.00` is displayed in the header area.
  - The empty-state message is hidden.
- **Test Data**: Dealer account with the confirmed $1,139.00 co-op balance and 7+ visible packages.

#### ENGAGEADS-TC-004 — Admin view is browse-only with no purchase CTA
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-004, BR-005
- **Precondition**: User is authenticated as Admin or ChannelFusionAdmin for the same program.
- **Steps**:
  1. Sign in as an admin-role user.
  2. Navigate to `/EngageAds/BundledAdPackages`.
  3. Open at least one standard package card or selected-package summary.
- **Expected**: Admin users can browse packages but cannot initiate purchase from this page.
- **Assertions**:
  - Package catalog renders for the admin user.
  - Payment CTA `.btnPayment` is not visible.
  - Informational admin quote-box copy is visible instead of purchase controls.
- **Test Data**: Admin/CFAdmin credential or auth state.

#### ENGAGEADS-TC-005 — Selecting a standard package renders Step 2 payment summary
- **Tier**: Smoke
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-009, BR-012, BR-022, BR-026
- **Precondition**: Dealer is on the populated Step 1 catalog and at least one standard package is visible.
- **Steps**:
  1. Click `Select Package` on a standard card such as `Local Lead Starter`.
  2. Wait for the payment summary step to render.
- **Expected**: The wizard advances to Step 2 and displays the selected package summary and price breakdown.
- **Assertions**:
  - `Payment & Checkout` step becomes active.
  - Selected package content shows price, channels, and description groups.
  - Payment summary shows total plan cost, transaction fee, card charge, and inactive-until-paid messaging.
- **Test Data**: Standard package such as Local Lead Starter with price $2,875.

#### ENGAGEADS-TC-006 — Accepting Terms enables payment and co-op interactions
- **Tier**: Smoke
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-014, BR-015, BR-016
- **Precondition**: Dealer has selected a standard package and is viewing Step 2.
- **Steps**:
  1. Observe the checkout state before accepting terms.
  2. Check the `I accept the Terms and Conditions` checkbox.
- **Expected**: Terms acceptance unlocks the payment CTA and co-op checkbox.
- **Assertions**:
  - Before checking, payment button is disabled and terms error text is visible.
  - After checking, payment button is enabled.
  - After checking, `#coopFunds` becomes enabled/interactable.
- **Test Data**: Dealer package-selection flow with available co-op budget.

### Regression Suite (34 tests)

#### ENGAGEADS-TC-010 — Empty package response shows NoPackageAvailable state
- **Tier**: Regression
- **Category**: ErrorHandling
- **Priority**: P2-High
- **BR Covered**: BR-006
- **Precondition**: Test environment can stub the package catalog response to an empty list.
- **Steps**:
  1. Intercept the package catalog load and return an empty collection.
  2. Navigate to `/EngageAds/BundledAdPackages`.
- **Expected**: The wizard is hidden and the empty-state panel is rendered.
- **Assertions**:
  - `.noPackage` is visible with the no-package messaging.
  - Package cards and wizard navigation are hidden.
- **Test Data**: Mocked empty package response for the current program.

#### ENGAGEADS-TC-011 — Custom-only catalog hides wizard payment actions
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-008, BR-031
- **Precondition**: Test environment can return only custom packages in the catalog response.
- **Steps**:
  1. Stub the catalog to include only `IsCustom = true` packages.
  2. Open the bundled package page.
- **Expected**: Only consultation actions remain; wizard payment actions are hidden.
- **Assertions**:
  - Package cards show `Talk To An Expert` buttons.
  - Checkout or step-2 payment actions are not shown.
  - Wizard tabs/actions related to purchase are hidden.
- **Test Data**: Mocked response with custom packages only.

#### ENGAGEADS-TC-012 — Custom package card shows Talk To An Expert only
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-008
- **Precondition**: Catalog contains at least one custom package.
- **Steps**:
  1. Open the package catalog.
  2. Locate the `Custom Package` card.
- **Expected**: The custom package uses consultation CTA behavior instead of purchase controls.
- **Assertions**:
  - `Talk To An Expert` button is visible on the custom card.
  - `Select Package` button is not present on the custom card.
  - The custom badge and note about consultation are visible.
- **Test Data**: Custom Package card from the live catalog.

#### ENGAGEADS-TC-013 — Standard package card shows View Details and Select Package
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-009
- **Precondition**: Catalog contains at least one standard package.
- **Steps**:
  1. Open the package catalog.
  2. Inspect a standard package card such as `Local Lead Starter`.
- **Expected**: Standard cards provide both discovery and checkout actions.
- **Assertions**:
  - `View Details` link is visible.
  - `Select Package` button is visible.
  - Package badge, subtitle, price, interval, and channels are rendered.
- **Test Data**: Any standard package card from the dealer view.

#### ENGAGEADS-TC-014 — View Details navigates to the package detail page
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-009, BR-010
- **Precondition**: Catalog contains a standard package with a visible `View Details` link.
- **Steps**:
  1. Click `View Details` on `Local Lead Starter`.
  2. Wait for navigation to `/EngageAds/Detail`.
- **Expected**: The detail page opens for the selected package using an encrypted packageSeq route value.
- **Assertions**:
  - URL contains `/EngageAds/Detail?packageSeq=` with an opaque encrypted token.
  - Detail page shows heading `Local Lead Starter` and the expected price hero.
  - `Proceed to Checkout` and `Back` controls are visible.
- **Test Data**: Local Lead Starter standard package.

#### ENGAGEADS-TC-015 — Package and budget identifiers remain encrypted in client markup
- **Tier**: Regression
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-010
- **Precondition**: Dealer page is loaded with package cards and available budget options.
- **Steps**:
  1. Inspect `.cardBadge[packageSeq]`, `.selectPackage[packageSeq]`, and budget dropdown option values.
  2. Capture the `packageSeq` tokens used in DOM attributes and request payloads.
- **Expected**: Client-visible identifiers remain opaque encrypted values rather than raw numeric database keys.
- **Assertions**:
  - packageSeq attributes are non-empty opaque strings and not plain integers.
  - Budget dropdown option values are encrypted tokens, not raw ProgramBudgetSeq numbers.
  - The same encrypted package token is reused for the detail link and select action.
- **Test Data**: Any live package card and at least one budget option.

#### ENGAGEADS-TC-016 — Deep-link packageSeq auto-selects the matching package
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-011, BR-012
- **Precondition**: An encrypted packageSeq value is available from a standard package card.
- **Steps**:
  1. Capture an encrypted `packageSeq` from a standard package card.
  2. Open `/EngageAds/BundledAdPackages?packageSeq={encryptedSeq}` directly.
  3. Wait for the page to finish the auto-selection flow.
- **Expected**: The page bypasses manual selection and loads Step 2 for the matching package.
- **Assertions**:
  - `Payment & Checkout` step is active on load.
  - Selected package summary matches the deep-linked package.
  - The same Step 2 totals and terms block appear as in a manual selection.
- **Test Data**: Valid encrypted packageSeq from a standard package.

#### ENGAGEADS-TC-017 — Invalid package selection returns Package not found
- **Tier**: Regression
- **Category**: ErrorHandling
- **Priority**: P2-High
- **BR Covered**: BR-013
- **Precondition**: Test can submit an invalid or non-existent encrypted package token to the server.
- **Steps**:
  1. Invoke `POST /EngageAds/BundledAdPackages?handler=CreateStripeSession` or selection flow with a package token that cannot be resolved.
  2. Capture the JSON response.
- **Expected**: The server rejects the request with the exact package-not-found error.
- **Assertions**:
  - Response indicates failure.
  - Message equals `Package not found`.
  - No Step 2 confirmation or payment redirect occurs.
- **Test Data**: Invalid encrypted package token.

#### ENGAGEADS-TC-018 — Unchecked Terms keeps payment disabled and shows the exact inline error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-014
- **Precondition**: Dealer has selected a standard package and is viewing Step 2.
- **Steps**:
  1. Load Step 2 for a standard package.
  2. Ensure the terms checkbox remains unchecked.
- **Expected**: Checkout remains blocked until the user accepts the terms.
- **Assertions**:
  - `.btnPayment` is disabled.
  - `#lblTermsAndConditions` is visible.
  - Error text equals `Please accept the Terms and Conditions to continue.`
- **Test Data**: Standard package in Step 2 before terms acceptance.

#### ENGAGEADS-TC-019 — Checking Terms enables payment and hides the error label
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-014, BR-015
- **Precondition**: Dealer is on Step 2 with a standard package selected.
- **Steps**:
  1. Observe the initial disabled checkout state.
  2. Check the terms checkbox.
- **Expected**: The error clears and checkout controls become usable.
- **Assertions**:
  - Payment button becomes enabled.
  - Terms error label is hidden.
  - `#coopFunds` becomes enabled at the same time.
- **Test Data**: Standard package in Step 2.

#### ENGAGEADS-TC-020 — Co-op option is hidden when available budget is zero
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-016
- **Precondition**: Environment can load the page with `#hdnTotalBudget = 0` for the dealer/program.
- **Steps**:
  1. Stub budget details so the total available budget is zero.
  2. Select a standard package and inspect Step 2.
- **Expected**: The co-op checkbox and allocation controls are not rendered for zero-budget users.
- **Assertions**:
  - `#coopFunds` is absent or hidden.
  - No available balance / co-op allocation block is displayed.
  - Card-funded payment remains available when allowed.
- **Test Data**: Mocked budget response with zero available balance.

#### ENGAGEADS-TC-021 — Include Co-op Funds reveals the allocation controls
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-015, BR-016
- **Precondition**: Dealer has budget available, selected a standard package, and accepted terms.
- **Steps**:
  1. Check the `Include Co-op Funds` checkbox.
  2. Inspect the co-op allocation area.
- **Expected**: The budget controls expand so the user can add allocations.
- **Assertions**:
  - `.budgetTypes` becomes visible.
  - `#ddlBudgetTypeNames`, `#txtCoopPercentage`, and `#btnAddCoop` are visible and enabled.
  - Available balance context is shown to the user.
- **Test Data**: Dealer balance with at least one available product budget line.

#### ENGAGEADS-TC-022 — Missing budget type or invalid amount shows the shared co-op validation error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-017
- **Precondition**: Dealer is on Step 2 with co-op controls visible.
- **Steps**:
  1. Leave the budget type unselected and click `Add`.
  2. Repeat with a selected budget type but blank or zero amount.
- **Expected**: The page blocks the add action and shows the exact shared validation message.
- **Assertions**:
  - `#coopErrorMsg` is visible after each invalid attempt.
  - Displayed text equals `Please select a valid product code and enter a value.`
  - No co-op allocation row is added.
- **Test Data**: At least one selectable budget type; blank and zero amount values.

#### ENGAGEADS-TC-023 — Non-numeric co-op input is sanitized to numeric-only format
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P3-Medium
- **BR Covered**: BR-017
- **Precondition**: Dealer is on Step 2 with co-op controls visible.
- **Steps**:
  1. Type characters such as `abc12.345x` into `#txtCoopPercentage`.
  2. Blur the field or attempt to add the allocation.
- **Expected**: The input accepts only numeric content with a maximum of two decimal places.
- **Assertions**:
  - Stored input value contains only digits and an optional decimal point.
  - Value is limited to two decimal places.
  - Invalid non-numeric characters are stripped before validation/submission.
- **Test Data**: Mixed alphanumeric co-op amount input.

#### ENGAGEADS-TC-024 — Co-op amount over available product balance shows the exact balance error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-018
- **Precondition**: Dealer has an available budget line with a known balance.
- **Steps**:
  1. Enable co-op funds and select a budget type.
  2. Enter an amount greater than that product line's available balance.
  3. Click `Add`.
- **Expected**: The allocation is rejected with the exact available-balance error.
- **Assertions**:
  - No co-op row is added.
  - Error text matches `Co-op amount ($X) exceeds available balance ($Y) for this product line.` with runtime amounts.
- **Test Data**: A budget type with a known available balance smaller than the entered amount.

#### ENGAGEADS-TC-025 — Single co-op amount over the package cost shows the package-cost cap error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-019
- **Precondition**: Dealer is on Step 2 with a selected package and co-op controls visible.
- **Steps**:
  1. Select a budget type.
  2. Enter an amount greater than the total package cost.
  3. Click `Add`.
- **Expected**: The allocation is rejected with the package-cost cap error.
- **Assertions**:
  - No co-op row is added.
  - Error text equals `Co-op amount cannot exceed the package cost. Please adjust the amount or pay the remaining balance.`
- **Test Data**: Amount larger than the selected package total.

#### ENGAGEADS-TC-026 — Cumulative co-op total over package cost shows the same cap error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-019, BR-021
- **Precondition**: Dealer can add more than one distinct budget type.
- **Steps**:
  1. Add a first valid co-op allocation below the package cost.
  2. Add a second distinct budget line that causes the cumulative total to exceed the package price.
- **Expected**: The second add is rejected with the same package-cost cap error.
- **Assertions**:
  - Only valid allocations up to the allowed limit remain in the table.
  - Error text equals `Co-op amount cannot exceed the package cost. Please adjust the amount or pay the remaining balance.`
- **Test Data**: Two distinct budget types whose combined attempted amount exceeds the package total.

#### ENGAGEADS-TC-027 — Duplicate product code shows the duplicate-allocation error
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P2-High
- **BR Covered**: BR-020
- **Precondition**: Dealer has already added one valid co-op allocation row.
- **Steps**:
  1. Select the same budget type again without entering edit mode.
  2. Enter another amount and click `Add`.
- **Expected**: The page rejects the duplicate line.
- **Assertions**:
  - Displayed error equals `This product code has already been added.`
  - The allocation table still contains only the original row for that budget type.
- **Test Data**: Existing co-op allocation row plus second attempt for the same budget type.

#### ENGAGEADS-TC-028 — Valid single co-op allocation recalculates totals and remaining card amount
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-021, BR-022, BR-026
- **Precondition**: Dealer has budget available and is on Step 2 with terms accepted.
- **Steps**:
  1. Enable co-op funds.
  2. Add a valid budget type and amount below the package total.
  3. Observe the payment summary values.
- **Expected**: The summary reflects the applied co-op and recalculated card-funded portion.
- **Assertions**:
  - `.spnTotalCoopAmount` increases by the entered amount.
  - `.spnRemainingBalance` decreases by the same amount before fee.
  - Transaction fee and order total are recalculated for the remaining card-funded amount.
- **Test Data**: One valid product line and amount less than package total.

#### ENGAGEADS-TC-029 — Multiple distinct co-op allocations produce split-payment state
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-021, BR-024
- **Precondition**: Dealer can add at least two distinct budget types.
- **Steps**:
  1. Add a valid first co-op allocation.
  2. Add a valid second allocation for a different budget type.
  3. Review the payment summary and informational messaging.
- **Expected**: The page supports split funding across multiple co-op lines while preserving a card balance.
- **Assertions**:
  - Two distinct co-op rows are listed.
  - Split-payment informational messaging is shown.
  - Payment CTA remains enabled when terms stay checked and card amount remains above zero.
- **Test Data**: Two distinct product lines with valid amounts that do not fully cover the package.

#### ENGAGEADS-TC-030 — Editing or deleting co-op rows recalculates the payment summary
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-021
- **Precondition**: At least one co-op allocation row already exists.
- **Steps**:
  1. Edit an existing co-op row and change its amount.
  2. Delete one allocation row.
  3. Review the summary after each action.
- **Expected**: Summary totals stay synchronized with the current allocation table.
- **Assertions**:
  - Edited row updates instead of creating a duplicate.
  - Co-op total, remaining balance, and fee values recalculate after edit and delete.
  - Removed rows no longer appear in the allocation table.
- **Test Data**: One or more existing allocation rows.

#### ENGAGEADS-TC-031 — Full co-op coverage zeroes card charge and hides fee rows
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P1-Critical
- **BR Covered**: BR-022, BR-025
- **Precondition**: Dealer has enough co-op across one or more budget lines to cover the full package price.
- **Steps**:
  1. Apply co-op allocations until the total equals the package cost.
  2. Observe the payment summary values.
- **Expected**: Card-funded amounts fall to zero and fee rows are hidden before checkout.
- **Assertions**:
  - Base card amount becomes `$0.00`.
  - Transaction fee becomes `$0.00` and `.feeRow` is hidden.
  - Order total equals the package price with no card surcharge.
- **Test Data**: Co-op allocations totaling exactly the package amount.

#### ENGAGEADS-TC-032 — Fee API failure uses fallback calculation and keeps checkout available
- **Tier**: Regression
- **Category**: ErrorHandling
- **Priority**: P2-High
- **BR Covered**: BR-023
- **Precondition**: Test can force `?handler=ProcessingFee` external API calculation to fail while preserving the handler response path.
- **Steps**:
  1. Select a standard package so a card amount greater than zero exists.
  2. Trigger a fee refresh while the external fee API is forced to fail.
  3. Observe the returned fee and checkout state.
- **Expected**: The page still receives a calculated fee using the local fallback formula.
- **Assertions**:
  - Handler returns success with a fee based on 2.9% + $0.30, rounded away from zero.
  - Checkout summary shows a fee value instead of blocking payment.
  - Payment CTA remains usable after the fallback completes.
- **Test Data**: Injected fee-service failure for a non-zero card amount.

#### ENGAGEADS-TC-033 — CreateStripeSession rejects a zero or negative card amount
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P1-Critical
- **BR Covered**: BR-022, BR-024
- **Precondition**: Test can call the Stripe-session handler directly with manipulated request values.
- **Steps**:
  1. POST to `/EngageAds/BundledAdPackages?handler=CreateStripeSession` with `cardAmount = 0` or less and otherwise valid payload fields.
  2. Capture the JSON response.
- **Expected**: The server rejects the request with the documented card-amount error.
- **Assertions**:
  - Response indicates failure.
  - Message equals `Card amount must be greater than zero`.
  - No redirect URL is returned.
- **Test Data**: Valid encrypted packageSeq plus invalid `cardAmount <= 0`.

#### ENGAGEADS-TC-034 — Card or split-payment flow posts CreateStripeSession and redirects to /EngageAds/Payment
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-024
- **Precondition**: Dealer is on Step 2 with terms accepted and card-funded amount greater than zero.
- **Steps**:
  1. Optionally apply a partial co-op allocation that leaves a positive card amount.
  2. Click `Proceed with Payment and Activate`.
  3. Observe the network call and returned redirect.
- **Expected**: The client uses the Stripe-session path for any checkout with a remaining card amount.
- **Assertions**:
  - A POST request is sent to `?handler=CreateStripeSession`.
  - Successful response contains redirect URL `/EngageAds/Payment`.
  - Browser navigates to the payment page.
- **Test Data**: Standard package with full card or split-payment balance.

#### ENGAGEADS-TC-035 — Co-op-only flow posts CreatePayment and redirects to OrderConfirmation
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-025
- **Precondition**: Dealer has reduced the card-funded amount to zero by applying co-op.
- **Steps**:
  1. Confirm the package summary shows zero card amount and zero fee.
  2. Click `Proceed with Payment and Activate`.
  3. Observe the request and resulting redirect.
- **Expected**: The client uses the co-op-only payment handler instead of Stripe.
- **Assertions**:
  - A POST request is sent to `?handler=CreatePayment`.
  - Successful response contains redirect URL `/EngageAds/OrderConfirmation`.
  - Browser navigates to the order confirmation page.
- **Test Data**: Selected package fully covered by valid co-op allocations.

#### ENGAGEADS-TC-036 — Expert modal requires Business Goal before submit
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P2-High
- **BR Covered**: BR-027
- **Precondition**: A custom package card is visible and the Talk To An Expert modal can be opened.
- **Steps**:
  1. Open the `Talk To An Expert` modal.
  2. Populate all required fields except Business Goal.
  3. Click `Request Consultation`.
- **Expected**: HTML5 validation blocks submission until Business Goal is supplied.
- **Assertions**:
  - Modal stays open.
  - Browser validity state marks `#businessGoal` as invalid.
  - No `SubmitInquiry` request is sent.
- **Test Data**: Custom package modal with Business Goal intentionally left blank.

#### ENGAGEADS-TC-037 — Expert modal requires City and strips non-letter characters
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P2-High
- **BR Covered**: BR-027, BR-028
- **Precondition**: Talk To An Expert modal is open.
- **Steps**:
  1. Leave City blank and attempt to submit the modal.
  2. Then type a mixed value such as `Dallas123!` into City and blur the field.
- **Expected**: City is required, and when entered it is restricted to letters and spaces.
- **Assertions**:
  - Blank-city submit is blocked by HTML5 validity on `#txtCity`.
  - Non-letter characters are stripped from the field value.
  - No inquiry submit occurs until City is valid.
- **Test Data**: Blank city scenario plus mixed alphanumeric city input.

#### ENGAGEADS-TC-038 — Expert modal requires State before submit
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P2-High
- **BR Covered**: BR-027
- **Precondition**: Talk To An Expert modal is open and state options are loaded.
- **Steps**:
  1. Populate all required fields except State.
  2. Click `Request Consultation`.
- **Expected**: HTML5 validation blocks submission until a state is chosen.
- **Assertions**:
  - Modal stays open.
  - Browser validity marks `#ddlState` as invalid.
  - No `SubmitInquiry` request is sent.
- **Test Data**: Custom package modal with no selected state.

#### ENGAGEADS-TC-039 — Expert modal requires Monthly Budget and enforces maxlength 50
- **Tier**: Regression
- **Category**: Validation
- **Priority**: P2-High
- **BR Covered**: BR-027
- **Precondition**: Talk To An Expert modal is open.
- **Steps**:
  1. Attempt to submit the modal with Monthly Budget blank.
  2. Then enter a value longer than 50 characters into Monthly Budget.
- **Expected**: Monthly Budget is required and the input cannot exceed 50 characters.
- **Assertions**:
  - Blank-budget submit is blocked by HTML5 validity on `#monthlyBudget`.
  - Field value length is capped at 50 characters.
  - No inquiry submit occurs until a valid Monthly Budget is present.
- **Test Data**: Blank and overlength Monthly Budget values.

#### ENGAGEADS-TC-040 — Expert modal loads dropdown data and submits successfully
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-029, BR-030
- **Precondition**: Custom package card is visible to the dealer.
- **Steps**:
  1. Open the `Talk To An Expert` modal.
  2. Wait for Business Goals and States lookups to load.
  3. Complete the form with valid data and submit it.
- **Expected**: The modal loads lookup data, posts the inquiry, and shows a success notification.
- **Assertions**:
  - `?handler=BusinessGoals` request succeeds and populates `#businessGoal`.
  - `?handler=LoadStates` request succeeds and populates `#ddlState` with countrySeq=1 data.
  - `?handler=SubmitInquiry` succeeds and a success toast/message is shown before the modal resets/closes.
- **Test Data**: Valid Business Goal, City, State, Monthly Budget, and optional notes.

#### ENGAGEADS-TC-041 — Stripe configuration failure degrades gracefully
- **Tier**: Regression
- **Category**: ErrorHandling
- **Priority**: P3-Medium
- **BR Covered**: BR-032
- **Precondition**: Environment can force Stripe configuration retrieval to fail during page load.
- **Steps**:
  1. Stub the Stripe configuration call to fail.
  2. Navigate to the bundled packages page.
- **Expected**: The page still renders and records Stripe as disabled.
- **Assertions**:
  - Package catalog still loads if package data is available.
  - `#hdnStripeEnabled` is `false` or equivalent disabled state.
  - No page-crash or unhandled error is shown to the user.
- **Test Data**: Mocked Stripe config failure on page load.

#### ENGAGEADS-TC-042 — Cancel Plan returns the user from Step 2 to the package catalog
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P3-Medium
- **BR Covered**: BR-012
- **Precondition**: Dealer is on Step 2 after selecting a standard package.
- **Steps**:
  1. Click `Cancel Plan`.
- **Expected**: The page returns to the Step 1 catalog without submitting a payment request.
- **Assertions**:
  - `Choose Plan` becomes the active wizard step again.
  - Package card grid is visible.
  - No payment or inquiry network call is triggered by the cancel action.
- **Test Data**: Any selected standard package.

#### ENGAGEADS-TC-043 — Payment summary displays inactive-until-paid messaging
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-026
- **Precondition**: Dealer is on Step 2 after selecting any standard package.
- **Steps**:
  1. Review the quote box and informational messaging in the payment summary.
- **Expected**: The page explains that activation occurs only after full payment is received.
- **Assertions**:
  - Quote box contains `Your package will not be activated until full amount paid.`
  - Quote box also references email notification after full payment.
- **Test Data**: Any standard package selection.

### E2E Suite (5 tests)

#### ENGAGEADS-TC-E2E-001 — Dealer completes a full Stripe-funded purchase flow
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-012, BR-014, BR-022, BR-024, BR-026
- **Precondition**: Dealer has a valid payment method/test card path in the target environment and selects a standard package with no co-op applied.
- **Steps**:
  1. Sign in as the dealer and open the package catalog.
  2. Select a standard package and accept Terms & Conditions.
  3. Proceed to payment, complete the Stripe payment flow on `/EngageAds/Payment`, and continue to the post-payment confirmation experience.
- **Expected**: The user completes a full card-funded purchase and receives the expected post-payment outcome.
- **Assertions**:
  - CreateStripeSession is called and redirects to `/EngageAds/Payment`.
  - Stripe payment completes successfully using the configured test payment path.
  - Confirmation flow indicates the order was created and payment was accepted.
- **Test Data**: Dealer account, selected package, and valid Stripe test payment details.

#### ENGAGEADS-TC-E2E-002 — Dealer completes a full co-op-only checkout
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-014, BR-021, BR-022, BR-025, BR-026
- **Precondition**: Dealer has enough co-op budget to cover a selected package fully.
- **Steps**:
  1. Sign in as the dealer and select a standard package.
  2. Accept terms, apply valid co-op allocations until the card amount is zero, and proceed.
  3. Allow the flow to redirect to `/EngageAds/OrderConfirmation`.
- **Expected**: The order completes without card payment and ends on the order-confirmation experience.
- **Assertions**:
  - Co-op totals match the package cost and fee is zero before submit.
  - CreatePayment is called instead of CreateStripeSession.
  - Order confirmation page loads successfully.
- **Test Data**: Dealer account with sufficient co-op balance and one or more valid budget lines.

#### ENGAGEADS-TC-E2E-003 — Dealer completes a split-payment checkout using co-op plus card
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-014, BR-021, BR-022, BR-024, BR-026
- **Precondition**: Dealer has co-op budget but not enough to cover the full package cost, and a valid test card path is available.
- **Steps**:
  1. Select a standard package and accept Terms & Conditions.
  2. Apply one or more valid co-op allocations that leave a positive card amount.
  3. Proceed through Stripe payment and finish the order.
- **Expected**: The purchase uses split funding and still completes via the Stripe path.
- **Assertions**:
  - Split-payment summary shows both co-op and card contributions before checkout.
  - CreateStripeSession receives co-op allocations and positive card amount values.
  - Payment succeeds and confirmation is displayed.
- **Test Data**: Dealer account, valid co-op budget lines, and Stripe test payment details.

#### ENGAGEADS-TC-E2E-004 — Custom package inquiry is submitted successfully from the modal
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-008, BR-027, BR-029, BR-030
- **Precondition**: Dealer can access the custom package card and inquiry endpoints.
- **Steps**:
  1. Open the `Talk To An Expert` modal from the custom package card.
  2. Wait for business goals and states to load, then complete all required fields.
  3. Submit the form and capture the success response.
- **Expected**: A consultation inquiry is created and the user receives success confirmation.
- **Assertions**:
  - SubmitInquiry returns success with an inquiry number.
  - Success notification is shown.
  - Modal closes or resets after submit.
- **Test Data**: Valid inquiry form data for a custom package.

#### ENGAGEADS-TC-E2E-005 — Deep-link package selection can complete checkout without manual Step 1 interaction
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-011, BR-012, BR-014, BR-024
- **Precondition**: A valid encrypted packageSeq for a standard package is known ahead of navigation.
- **Steps**:
  1. Open `/EngageAds/BundledAdPackages?packageSeq={encryptedSeq}` directly.
  2. Verify the package auto-selects into Step 2.
  3. Accept terms and complete either the Stripe or co-op checkout path appropriate to the selected funding setup.
- **Expected**: The user can start from a deep link and still complete checkout successfully.
- **Assertions**:
  - Page opens directly in Step 2 for the targeted package.
  - No manual `Select Package` click is required.
  - Checkout proceeds successfully through the applicable payment branch.
- **Test Data**: Valid encrypted packageSeq and a checkout-capable dealer account.
