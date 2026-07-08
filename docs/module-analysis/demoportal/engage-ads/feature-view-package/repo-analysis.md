# EngageAds — View Package (BundledAdPackages) Repository Analysis Report

Generated: 2026-06-18T16:01:41.761+05:30

## 1. Feature Overview

| Item | Details |
|---|---|
| Feature | EngageAds — View Package / Bundled Ad Packages |
| Razor page | `Presentation\Web\Pages\EngageAds\BundledAdPackages.cshtml` |
| Page model | `BundledAdPackagesModel : BasePageModel` |
| Namespace | `Web.Pages.EngageAds` |
| Razor route | `@page "{handler?}"` |
| Main URL | `https://demoportaluat.channel-fusion.com/EngageAds/BundledAdPackages` |
| Primary purpose | Display EngageAds bundled packages for the current program, allow eligible dealers to select a package, optionally apply co-op funds, and start payment or inquiry flows. |
| Secondary purpose | Support deep-link package preselection, custom-package consultation requests, Stripe configuration bootstrap, and budget visibility. |

### Source Files Analyzed

| File | Layer | Purpose |
|---|---|---|
| `D:\Leads\DemoPortalV2\Presentation\Web\Pages\EngageAds\BundledAdPackages.cshtml` | UI | Page layout, package cards, payment step, expert modal, terms modal, hidden fields, script bootstrapping |
| `D:\Leads\DemoPortalV2\Presentation\Web\Pages\EngageAds\BundledAdPackages.cshtml.cs` | Page model | GET load, package detail AJAX, Stripe session creation, payment creation, inquiry submission, lookups, fee calculation |
| `D:\Leads\DemoPortalV2\Presentation\Web\wwwroot\WebScripts\EngageAds\jsengageads.js` | Client logic | Wizard flow, package selection, co-op allocation, AJAX handlers, validation, modal behavior |
| `D:\Leads\DemoPortalV2\Presentation\Web\wwwroot\WebScripts\EngageAds\StripePayment.js` | Client integration | Stripe embedded checkout bootstrap and iframe lifecycle helpers |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\PackageCompleteModel.cs` | Data model | Package, pricing, channel, description-item, eligibility, creative asset structures |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\CreatePayment.cs` | Data model | Payment request, line items, co-op fund allocation payload |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\InquiryRequest.cs` | Data model | Custom-package consultation request payload |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\PaymentResponse.cs` | Data model | Payment/order response returned for order confirmation |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\StripeSessionRequest.cs` | Data model | Stripe checkout session request/response |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\CoopModel\BudgetDetailModel.cs` | Data model | Available co-op budget summary used by the page |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\LookupModel.cs` | Data model | Business goal dropdown items |
| `D:\Leads\DemoPortalV2\Presentation\Web\Models\EngageAdsModel\StateDto.cs` | Data model | State dropdown items |
| `D:\Leads\DemoPortalV2\Presentation\Web\Infrastructure\Services\EngageAdsService.cs` | Service adapter | Backend API routing for packages, inquiry, states, Stripe config/session, payments |
| `D:\Leads\DemoPortalV2\Presentation\Web\Infrastructure\Services\CoopService.cs` | Service adapter | Backend API routing for combined budget lookup |

---

## 2. Authorization, Access, and Security

### Authentication

- The page model inherits `BasePageModel`; by project convention this page requires an authenticated session.
- Unauthenticated users are expected to be redirected to login before reaching the page.

### Role-Based Access

| Role / state | Access behavior |
|---|---|
| Admin | Can open the page and view all packages for the program |
| ChannelFusionAdmin | Can open the page and view all packages for the program |
| Dealer / non-admin authenticated user | Can open the page and see only packages eligible for the current dealer/program |

### Role-Based Restrictions

1. `IsAdminOrCFAdmin` is computed as `UserSession.Role == UserRole.Admin || UserSession.Role == UserRole.ChannelFusionAdmin`.
2. Admin / ChannelFusionAdmin users:
   - see all packages via `GetCompleteProgramPackagesAsync(programSeq, true)`;
   - see an administrator informational message in the quote box;
   - do **not** see the payment button;
   - therefore cannot purchase from this page.
3. Non-admin users:
   - see only eligible packages via `GetCompleteProgramPackagesAsync(programSeq, false)`;
   - can proceed to payment after meeting UI conditions.

### Security Controls

1. **Encrypted identifiers**
   - Every package card uses encrypted `packageSeq` values in HTML attributes and URLs.
   - Program budget sequence values are also encrypted before being placed in hidden fields and option values.
   - Server-side handlers decrypt incoming values before use.
2. **Program scoping**
   - Package list loading is scoped to `_programConfig.ProgramSeq`.
3. **Dealer scoping**
   - Budget lookup and payment payloads are scoped with current dealer/session values such as `Dealer_Number`, `Dealer_number_seq`, `Organization_structure_seq`, and active division.
4. **Graceful degradation**
   - Stripe can be disabled if configuration load fails; page still renders.
5. **Server-side validation**
   - Stripe session creation rejects zero/negative card charges.
6. **Client-side gating**
   - Payment button starts disabled and is enabled only after terms acceptance.

---

## 3. Page Load (GET) Behavior

### Route

- **Method:** `GET`
- **URL:** `/EngageAds/BundledAdPackages`
- **Handler:** `OnGetAsync`

### OnGetAsync Sequence

1. Set `CurrentUserEmail = UserSession.UserEmail ?? ""`.
2. Call `LoadCompleteDataAsync()`.
3. Call `LoadBudgetDetailsAsync()`.
4. Call `LoadStripeConfigurationAsync()`.
5. Return `Page()`.

### Data Loaded During GET

| Load step | Service / helper | What it loads | Notes |
|---|---|---|---|
| Package catalog | `IEngageAdsService.GetCompleteProgramPackagesAsync` | `CompletePackage : List<PackageCompleteModel>` | Admins get all packages; dealers get eligible packages only |
| Budget summary | `WebHelper.GetFiscalYearDates`, `IBudgetService.GetDealerBudgetTypeByProgramSeq`, `ICoopService.GetCombinedBudgetAsync`, `WebHelper.GetActiveDivision` | `BudgetDetails`, `BudgetTypeNamesCsv`, `AvailableBudgetsCsv`, `ProgramBudgetSeq` | Used by the co-op allocation UI |
| Stripe configuration | `IEngageAdsService.GetStripeConfigurationAsync` | `StripePublishKey`, `StripeSecretKey`, `IsStripeEnabled` | Only publish key is exposed to the view |
| User context | Session values | `CurrentUserEmail`, role flags | Used by payment JS and admin gating |

### GET Error Handling

| Load step | Failure behavior |
|---|---|
| Package load | Sets `ErrorMessage`, logs warning/error, shows warning/error notification, page still returns |
| Budget load | Logs warning/error only; no blocking notification; page still returns |
| Stripe config load | Sets `IsStripeEnabled = false`; logs warning/error; page still returns |

### Empty State

- If `CompletePackage.Count == 0`, the package wizard is not shown.
- The page renders a `NoPackageAvailable` empty-state panel instead.

### Deep-Link Support

- Query string `?packageSeq={encryptedSeq}` is read by `jsengageads.js`.
- On page load, if present, the script:
  - shows the loading panel,
  - hides the wizard,
  - programmatically clicks the matching `.selectPackage` button,
  - moves the user directly into the payment-summary flow.

---

## 4. Page Handlers (GET / POST)

## 4.1 Handler Summary

| Method | URL / handler | Purpose | Main inputs | Main output |
|---|---|---|---|---|
| GET | `/EngageAds/BundledAdPackages` | Initial page load | Session/program context | HTML page |
| POST | `/EngageAds/BundledAdPackages?handler=LoadPackageData` | Load a single package for step 2 | `packageSeq` (encrypted) | Serialized `PackageCompleteModel` |
| POST | `/EngageAds/BundledAdPackages?handler=CreateStripeSession` | Start Stripe checkout | package/payment/co-op form values | `{ success, redirectUrl }` or error |
| POST | `/EngageAds/BundledAdPackages?handler=CreatePayment` | Create payment/order for non-card path | package/payment/co-op values | `{ success, redirectUrl }` or error |
| POST | `/EngageAds/BundledAdPackages?handler=SubmitInquiry` | Submit Talk-to-an-Expert request | inquiry form fields | `{ success, inquiryNumber }` or error |
| GET | `/EngageAds/BundledAdPackages?handler=BusinessGoals` | Load expert-modal business goals | none | serialized list of `LookupModel` |
| GET | `/EngageAds/BundledAdPackages?handler=LoadStates` | Load expert-modal states | none | serialized list of `StateDto` |
| GET | `/EngageAds/BundledAdPackages?handler=ProcessingFee&amount={amount}[&country={country}]` | Calculate transaction fee | `amount`, optional `country` | `{ success, fee, total }` |

## 4.2 OnPostLoadPackageData

- **Purpose:** Load complete detail for the selected package and build the payment summary step.
- **Inputs:**
  - `packageSeq` from `Request.Form`
  - expected to be encrypted
- **Processing:**
  1. Decrypt `packageSeq`
  2. Call `GetCompletePackageAsync(decryptedPackageSeq)`
  3. Store response in `PackageDetail`
- **Success output:** HTTP 200 JSON containing serialized `PackageDetail`
- **Failure output:** HTTP 400/500 JSON with serialized error text
- **Notes for QA:**
  - Handler trusts that client sends an encrypted value.
  - Errors reuse generic "channels" wording inherited from copied logging/messages.

## 4.3 OnPostCreateStripeSession

- **Purpose:** Validate card portion, build Stripe session payload, store payment session data, and return redirect to payment page.
- **Inputs from form:**
  - `packageSeq`
  - `cardAmount`
  - `coopAmount`
  - `totalAmount`
  - `transactionFee`
  - `baseCardAmount`
  - `budgetAllocations`
  - `email`
- **Server processing:**
  1. Decrypt package sequence.
  2. Parse monetary values.
  3. Compute `packageAmount = totalAmountWithFee - transactionFee`.
  4. Validate `cardAmountWithFee > 0`.
  5. Load package details for item description.
  6. Load dealer details from `IDealerService.GetDealerByDealerNumberSeq`.
  7. Build `StripeSessionRequest` with:
     - dealer identity/address data,
     - co-op split information,
     - transaction fee,
     - one order item priced at the **base** card amount (without fee).
  8. Call `CreateStripeSessionAsync`.
  9. Store `PaymentSessionData` in `TempData["PaymentSession"]`.
- **Success output:** `{ success: true, redirectUrl: "/EngageAds/Payment" }`
- **Failure outputs:**
  - `cardAmount <= 0` -> `{ success: false, message: "Card amount must be greater than zero" }`
  - package lookup failed -> `{ success: false, message: "Package not found" }`
  - session creation failed -> `{ success: false, message: sessionResponse?.Message ?? "Failed to create Stripe session" }`
  - exception -> `{ success: false, message: "Internal server error" }`
- **Important behavior:** Current page does **not** mount Stripe embedded checkout directly after selection; it redirects to `/EngageAds/Payment`.

## 4.4 OnPostCreatePayment

- **Purpose:** Create order/payment using co-op-only flow from this page.
- **Current UI usage:** `jsengageads.js` calls this handler only when calculated `cardAmount == 0`.
- **Inputs from form:**
  - `packageSeq`
  - `TotalAmount`
  - `CardAmount`
  - `CoopAmount`
  - `BudgetAllocations`
  - optional `paymentIntentId`
- **Server processing:**
  1. Determine fiscal year from `WebHelper.GetFiscalYearDates`.
  2. Decrypt package sequence.
  3. Parse total/card/co-op amounts.
  4. If co-op is used and budget allocations are present:
     - deserialize JSON into `BudgetAllocationDto` list,
     - decrypt each `ProgramBudgetSeq`,
     - map to `CoopFundAllocation` with fiscal year and active division.
  5. Load package details for line item description.
  6. Build `CreatePayment` payload.
  7. Call `CreatePaymentAsync`.
  8. On success, enrich `PaymentResponse` with `PackageName` and `PackageStatus = "Active"`.
  9. Store response in `TempData["PaymentResponse"]`.
- **Success output:** `{ success: true, redirectUrl: "/EngageAds/OrderConfirmation" }`
- **Failure behavior:** warning/error notifications plus HTTP 400/500 JSON error payload.
- **Important note:** The handler accepts card-related inputs and `PaymentIntentId`, but the current page’s visible flow routes card scenarios to Stripe session creation first.

## 4.5 OnPostSubmitInquiry

- **Purpose:** Submit custom-package consultation request from modal.
- **Inputs from form:**
  - `packageSeq`
  - `businessGoal`
  - `stateSeq`
  - `monthlyBudget`
  - `additionalNotes`
  - `city`
- **Server-generated fields:**
  - `InquiryTypeCode = "CUSTOM_PACKAGE"`
  - `ContractorId = UserSession.Dealer_Number`
  - `ContractorName = UserSession.Name`
  - `ContactName = UserSession.UserFullName ?? UserSession.Name`
  - `ContactEmail = UserSession.UserEmail`
  - `SourcePage = "/EngageAds/BundledAdPackages"`
  - `InquiryStatusCode = "NEW"`
  - `AssignedTeamCode = "DIGITAL_FUSION"`
  - `AssignedTo = "sales@engageads.com"`
- **Special behavior:** If package decryption fails, the handler logs a warning and continues submitting the inquiry without a resolved package ID.
- **Success output:** `{ success: true, inquiryNumber }`
- **Success notification:** `"Your consultation request has been submitted successfully. Our team will contact you shortly."`
- **Failure output:** `{ success: false, message }`

## 4.6 OnGetBusinessGoals

- **Purpose:** Populate the Business Goal dropdown in the consultation modal.
- **Processing:** Calls `GetBusinessGoalsAsync()`.
- **Success output:** serialized `List<LookupModel>` with fields such as `LookupValueCode`, `LookupValueLabel`.
- **Failure output:** HTTP 400/500 with serialized error text.

## 4.7 OnGetLoadStates

- **Purpose:** Populate the State dropdown in the consultation modal.
- **Processing:** Calls `LoadStateAsync(1)`; country `1` is hard-coded.
- **Success output:** serialized `List<StateDto>` with `StateSeq`, `StateCode`, `Name`, `CountrySeq`.
- **Failure output:** HTTP 400/500 with serialized error text.

## 4.8 OnGetProcessingFee

- **Purpose:** Calculate transaction fee for the current card-funded portion.
- **Inputs:** `amount`, optional `country`
- **Processing:**
  1. If `amount <= 0`, return success with zero fee and zero total.
  2. Else call `CalculateTransactionFeeAsync`.
  3. Try external fee API first.
  4. If external API fails, fall back locally to `amount * 2.9% + $0.30`, rounded away from zero.
- **Success output:** `{ success: true, fee, total }`
- **Failure output:** `{ success: false, message: "Failed to calculate transaction fee" }`

---

## 5. Data Models Relevant to the UI

## 5.1 Page Model Properties

| Property | Type | Purpose |
|---|---|---|
| `CompletePackage` | `List<PackageCompleteModel>` | Full package list rendered in step 1 |
| `PackageDetail` | `PackageCompleteModel` | Single selected package returned to AJAX |
| `BudgetDetails` | `BudgetDetailModel` | Total available co-op budget |
| `BudgetTypeNamesCsv` | `string` | Comma-separated budget type names |
| `AvailableBudgetsCsv` | `string` | Comma-separated available amounts by budget type |
| `ProgramBudgetSeq` | `string` | Comma-separated encrypted program budget identifiers |
| `StripePublishKey` | `string` | Safe frontend Stripe key |
| `StripeSecretKey` | `string` | Backend-only Stripe secret key |
| `IsStripeEnabled` | `bool` | Stripe feature flag |
| `CurrentUserEmail` | `string` | Prefill/support email use during payment |
| `IsAdminOrCFAdmin` | `bool` | Role-based UI toggle |
| `IsLoading` | `bool` | Page/handler state flag |
| `ErrorMessage` | `string` | Generic error text |

## 5.2 PackageCompleteModel

### Header / metadata

- `PackageSeq`
- `ProgramSeq`
- `PackageName`
- `DefaultBillingTerm`
- `SortOrder`
- `CampaignDurationDays`
- `SetupTimeLabel`
- `EffectiveFromDate`
- `EffectiveToDate`
- `Subtitle`
- `DescriptionLong`
- `IconKey`
- `IsActive`
- `CreatedDate`
- `ModifiedDate`
- `IsCustom`
- `Note`

### Related collections used by this page

| Collection | Item type | Fields used by UI / flow |
|---|---|---|
| `Pricing` | `PackagePricingModel` | `PriceAmount`, `IntervalLabel`, `ClaimRulesNote`, `PrefixPrice`, `CoopEligiblePercent`, `AllowPaymentCoop`, `AllowPaymentCard`, `PricingBreakdowns` |
| `Channels` | `PackageChannelModel` | `ChannelSeq`, `Channel.ChannelCode`, `Channel.ChannelName` |
| `DescriptionItems` | `PackageDescriptionItemModel` | `ItemType`, `Title`, `BulletText`, `DisplayOrder` |
| `Features` | `PackageFeatureModel` | Present in model but not directly rendered on this page |
| `Eligibilities` | `PackageEligibilityDto` | Eligibility data is upstream-driven; not directly rendered |
| `CreativeAssets` | `CreativeAssetDto` | Not directly rendered on this page |

## 5.3 PackagePricingModel

| Field | Meaning |
|---|---|
| `PriceCents` / `PriceAmount` | Monetary package price; `PriceAmount = PriceCents / 100m` |
| `BillingTerm` / `IntervalLabel` | Billing interval text shown next to the price |
| `ClaimRulesNote` | Pricing note below the amount |
| `PrefixPrice` | Optional prefix label before the dollar amount |
| `CoopEligiblePercent` | Co-op eligibility percentage metadata |
| `AllowPaymentCoop` | Package permits co-op funding |
| `AllowPaymentCard` | Package permits card payment |
| `PricingBreakdowns` | Cost rows shown inside cost estimation |

## 5.4 BudgetDetailModel

| Field | Usage |
|---|---|
| `TotalBudget` | Main value written to `#hdnTotalBudget` and used to decide whether co-op UI is shown |
| `TotalAmountSpent` | Present in model, not rendered here |
| `AvailableBudget` | Present in model, not directly set by handler |
| `TotalHoldingBudget` | Present in model, not rendered |
| `PendingAmount` | Present in model, not rendered |

## 5.5 InquiryRequest

| Field | Source |
|---|---|
| `PrimaryGoalCode` | `#businessGoal` |
| `StateSeq` | `#ddlState` |
| `City` | `#txtCity` |
| `MonthlyBudget` | `#monthlyBudget` |
| `AdditionalNotes` | `#additionalNotes` |
| `PackageSeq` | decrypted `#selectedPackageSeq` if available |
| other contact/assignment fields | Session/default values assigned server-side |

## 5.6 CreatePayment / CoopFundAllocation

| Field | Usage |
|---|---|
| `TotalAmount` | Package total sent to payment API |
| `CardAmount` | Card-funded portion |
| `CoopAmount` | Co-op-funded portion |
| `TransactionFee` | Set to `0` in `OnPostCreatePayment` |
| `CoopFundAllocations` | Multiple selected budget lines |
| `PaymentIntentId` | Stripe payment linkage if provided |
| `LineItems` | Single package line item in this feature |

## 5.7 PaymentSessionData / PaymentResponse

- `PaymentSessionData` is stored in `TempData["PaymentSession"]` before redirecting to `/EngageAds/Payment`.
- `PaymentResponse` is stored in `TempData["PaymentResponse"]` before redirecting to `/EngageAds/OrderConfirmation`.

---

## 6. Form Elements and UI Elements

## 6.1 Hidden/System Fields

| Selector | Type | Purpose |
|---|---|---|
| `#hdnTotalBudget` | hidden | Total co-op budget available |
| `#hdnBudgetTypeNames` | hidden | CSV of budget type names |
| `#hdnAvailableBudget` | hidden | CSV of available budgets per type |
| `#hdnProgramBudgetSeq` | hidden | CSV of encrypted budget identifiers |
| `#hdnTotalPlanCost` | hidden | Package price without fee |
| `#hdnOrderTotalWithFee` | hidden | Package price plus fee |
| `#hdnBaseCardAmount` | hidden | Card portion before fee |
| `#hdnTransactionFee` | hidden | Calculated transaction fee |
| `#hdnCardAmount` | hidden | Card charge total including fee |
| `#hdnCoopAmount` | hidden | Total co-op amount selected |
| `#hdnStripePublishKey` | hidden | Stripe publishable key |
| `#hdnStripeEnabled` | hidden | Stripe feature flag |
| `#hdnUserEmail` | hidden | Current user email |
| `#hdnIsAdminOrCFAdmin` | hidden | Lowercase boolean used by JS |

## 6.2 Stripe Container (present but hidden by default)

| Selector | Purpose |
|---|---|
| `#stripeCheckoutContainer` | Wrapper for embedded Stripe checkout |
| `#stripePlanSummary` | Package summary placeholder |
| `#stripeCheckoutMount` | Stripe iframe mount target |

## 6.3 Step 1 — Package Selection

| Selector / element | Type | Purpose / behavior |
|---|---|---|
| `.commonWizard` | wizard container | 2-step package/payment wizard |
| `.plansWrapper .card` | package card | Repeated package tile |
| `.cardBadge[packageSeq]` | label/span | Displays package name and stores encrypted package seq |
| `.description` | text | Package subtitle |
| `a.btnBordered[packageSeq]` | link | `View Details` -> `/EngageAds/Detail?packageSeq={encryptedSeq}` |
| `button.selectPackage[packageSeq]` | button | Loads package into step 2 |
| `a.talkToExpertBtn` | button/link | Opens consultation modal for custom package |
| `.section` groups | content | Description item groups and channels |

## 6.4 Step 2 — Payment / Checkout Summary

### Summary / display-only fields

| Selector | Meaning |
|---|---|
| `.spnRemainingBalance` | Credit card amount before fee |
| `.spnTransactionFee` | Processing fee |
| `.spnCardChargeTotal` | Card charge including fee |
| `.spnOrderTotalWithFee` | Package total including fee |
| `.spnTotalCoopAmount` | Total co-op applied |
| `.spnBudgetType` | Container/table for added co-op allocations |
| `#splitPaymentMsg` | Informational split-payment banner inserted dynamically |

### Co-op controls

| Selector | Type | Purpose |
|---|---|---|
| `#coopFunds` | checkbox | Enables co-op allocation UI; rendered only when total budget > 0 |
| `#ddlBudgetTypeNames` | select | Budget/program line dropdown; option value is encrypted `ProgramBudgetSeq` |
| `#txtCoopPercentage` | text | User-entered co-op amount (despite name, treated as amount) |
| `#btnAddCoop` | button | Add or update co-op allocation line |
| `.btn-edit` | icon/button | Edit an existing co-op row |
| `.btn-delete` | icon/button | Remove an existing co-op row |
| `.budgetTypes` | div | Hidden until co-op checkbox is checked |

### Terms and payment controls

| Selector | Type | Purpose |
|---|---|---|
| `#termsAndConditions` | checkbox | Must be checked before payment UI is enabled |
| `#lblTermsAndConditions` | label | Inline error label for terms requirement |
| `.termsLink` | link | Opens terms modal |
| `.btnPayment[packageSeq]` | button | Proceed to payment/activation; hidden for admin roles |
| `.btnCancelPlan` | button | Return to step 1 |

## 6.5 Talk to an Expert Modal

| Selector | Type | Required | Notes |
|---|---|---|---|
| `#selectedPackageSeq` | hidden | No | Encrypted selected package seq |
| `#businessGoal` | select | Yes | Options loaded via AJAX; select2 enhanced |
| `#txtCity` | text | Yes | Letters/spaces only enforced client-side |
| `#ddlState` | select | Yes | Loaded via AJAX; select2 enhanced |
| `#monthlyBudget` | text | Yes | `maxlength="50"` |
| `#additionalNotes` | textarea | No | Optional notes |
| `#packagePriceNote` | alert text | N/A | Updated with package starting price |
| `#submitExpertConsultation` | button | N/A | Validates and submits modal form |
| `.btnCancel`, `.close` | buttons | N/A | Close modal and reset form |

## 6.6 Terms & Conditions Modal

- Modal title: `Ad Placement Terms & Conditions v2`
- Content is static HTML, not resource-driven.
- Opened by clicking `.termsLink`.

---

## 7. Business Rules

1. **BR-001 — Auth required:** Users must be authenticated to access the page.
2. **BR-002 — Program-scoped catalog:** Packages load for the current session program only.
3. **BR-003 — Role-scoped catalog:** Admin / ChannelFusionAdmin see all packages; dealers see only eligible packages.
4. **BR-004 — Purchase restriction for admin roles:** Admin / ChannelFusionAdmin can browse but cannot purchase because payment CTA is omitted.
5. **BR-005 — Custom package behavior:** `IsCustom == true` packages show `Talk to an Expert` rather than `Select Package`.
6. **BR-006 — Empty-state behavior:** If no packages are returned, the wizard is hidden and `NoPackageAvailable` is shown.
7. **BR-007 — Deep-link behavior:** `?packageSeq=` auto-selects a package on page load.
8. **BR-008 — Co-op visibility:** Co-op controls are shown only when total available co-op budget is greater than zero.
9. **BR-009 — Terms gate:** Payment UI is locked until Terms & Conditions are accepted.
10. **BR-010 — Transaction fee rule:** Transaction fee is calculated only when the card-funded portion is greater than zero.
11. **BR-011 — Fee service fallback:** If the fee API fails, the system falls back to local `2.9% + $0.30` calculation.
12. **BR-012 — Full co-op handling:** If co-op covers the full package amount, fee rows are hidden and card charge becomes zero.
13. **BR-013 — Multiple budget lines allowed:** Users may allocate co-op across multiple budget types.
14. **BR-014 — No duplicate budget line:** The same product/budget code cannot be added twice unless the user is editing the existing row.
15. **BR-015 — Budget-line cap:** A line allocation cannot exceed the selected product line’s available budget.
16. **BR-016 — Package-cost cap:** Total co-op allocations cannot exceed the package cost.
17. **BR-017 — Split payment supported:** Partial co-op + partial card payment is allowed; informational banner is shown but payment remains enabled.
18. **BR-018 — Package activation rule:** User-facing copy states the package will not be activated until the full amount is paid.
19. **BR-019 — Fiscal-year budget context:** Co-op budget lookup is based on current fiscal year and active division.
20. **BR-020 — Inquiry routing:** Custom-package consultation requests are sent as `CUSTOM_PACKAGE` inquiries to the `DIGITAL_FUSION` team.
21. **BR-021 — State list source:** State lookup uses hard-coded `countrySeq=1`.
22. **BR-022 — Package / budget identifier protection:** Encrypted IDs are used in client HTML and AJAX payloads.
23. **BR-023 — Stripe enablement:** If Stripe config cannot be loaded, the page degrades gracefully with `IsStripeEnabled = false`.
24. **BR-024 — Custom-only catalog behavior:** If there are no selectable non-custom packages, wizard tabs/actions and the payment panel are hidden.

---

## 8. Validation Rules

| ID | Field / area | Rule | Client / server | Error / user feedback |
|---|---|---|---|---|
| VR-001 | Payment | Card amount for Stripe session must be `> 0` | Server | `"Card amount must be greater than zero"` |
| VR-002 | Terms checkbox | Must be checked before payment button is enabled | Client | Inline label using `Please_accept_the_Terms_and_Conditions_continue`; also toastr on payment click |
| VR-003 | `#businessGoal` | Required | Client (HTML5) | Browser validity UI |
| VR-004 | `#txtCity` | Required | Client (HTML5) | Browser validity UI |
| VR-005 | `#ddlState` | Required | Client (HTML5) | Browser validity UI |
| VR-006 | `#monthlyBudget` | Required | Client (HTML5) | Browser validity UI |
| VR-007 | `#monthlyBudget` | Max length 50 | Client (HTML attr) | Native browser limit |
| VR-008 | `#txtCity` | Letters and spaces only | Client | Non-matching characters are stripped |
| VR-009 | `#txtCoopPercentage` | Numeric input only; max 2 decimals | Client | Non-numeric characters are stripped |
| VR-010 | Co-op add | Must select budget type and enter positive numeric amount | Client | `"Please select a valid product code and enter a value."` |
| VR-011 | Co-op add | Amount cannot exceed selected product line balance | Client | `"Co-op amount ($X) exceeds available balance ($Y) for this product line."` |
| VR-012 | Co-op add | Amount cannot exceed package cost | Client | `"Co-op amount cannot exceed the package cost. Please adjust the amount or pay the remaining balance."` |
| VR-013 | Co-op add | Combined co-op total cannot exceed package cost | Client | Same package-cost error message |
| VR-014 | Co-op add | Duplicate product code not allowed | Client | `"This product code has already been added."` |
| VR-015 | Fee API | Failed fee calculation should surface error | Client | `"Failed to calculate transaction fee."` |
| VR-016 | Inquiry submit | Modal form uses `checkValidity()` / `reportValidity()` before AJAX post | Client | Native browser validation |
| VR-017 | Package lookup | Selected package must exist | Server | `"Package not found"` |

### Additional Observations

- `#coopFunds` is initially disabled and becomes enabled only after terms are accepted.
- `#btnPayment` is rendered disabled and becomes enabled only when terms are accepted.
- The script also watches `#txtAdvertisingBudget`, but that element is not present on this page.

---

## 9. JavaScript Behavior and UI State Management

## 9.1 Startup Behavior

On `document.ready` the page script:

1. checks for `packageSeq` query string and auto-triggers selection if present;
2. otherwise shows the wizard;
3. calls `checkAndHideWizardTabs()` to hide payment/navigation when only custom packages exist;
4. calls `loadBusinessGoals()`;
5. calls `loadStates()`.

## 9.2 Package Selection Flow

When `.selectPackage` is clicked:

1. POST `/EngageAds/BundledAdPackages?handler=LoadPackageData` with encrypted `packageSeq`.
2. Parse returned package JSON.
3. Dynamically build the full step-2 HTML:
   - package header,
   - pricing rows,
   - description groups,
   - channel list,
   - cost estimation,
   - terms block,
   - optional co-op controls,
   - quote box,
   - payment / cancel buttons.
4. Populate hidden totals:
   - total plan cost,
   - order total with fee,
   - base card amount,
   - card amount,
   - co-op amount.
5. Call `refreshEngageAdsPaymentSummary()`.
6. Advance the wizard to the next step.

## 9.3 Payment Summary Refresh Logic

`refreshEngageAdsPaymentSummary()`:

1. reads package amount and co-op amount;
2. calculates `baseCardAmount = packageAmount - coopAmount`;
3. if `baseCardAmount <= 0`:
   - zeroes fee/card fields,
   - hides `.feeRow`,
   - leaves order total equal to package amount;
4. else:
   - GET `/EngageAds/BundledAdPackages?handler=ProcessingFee&amount={baseCardAmount}`;
   - updates fee, card charge, and order total labels/hidden fields.

## 9.4 Terms Behavior

- Clicking `#termsAndConditions`:
  - enables/disables `.btnPayment`;
  - enables/disables `#coopFunds`;
  - shows/hides `#lblTermsAndConditions`.

## 9.5 Co-op Allocation Behavior

- Checking `#coopFunds` shows `.budgetTypes`; unchecking hides it and removes split-payment info message.
- Changing `#ddlBudgetTypeNames` shows `Available Budget: $X`.
- Adding/updating a co-op row:
  - validates input,
  - writes/updates a table inside `.spnBudgetType`,
  - recalculates total co-op and remaining balance,
  - refreshes fee calculations,
  - shows split-payment info if both card and co-op are used.
- Deleting a co-op row recalculates the same summary values.

## 9.6 Payment Routing

When `.btnPayment` is clicked:

1. validate terms acceptance;
2. inspect calculated `cardAmount`;
3. if `cardAmount > 0` -> call `initiateStripeCheckout(packageSeq)` which posts `CreateStripeSession`;
4. if `cardAmount == 0` -> call `processOrderWithoutCard(packageSeq)` which posts `CreatePayment`.

## 9.7 Expert Modal Behavior

- `.talkToExpertBtn` sets hidden package seq, updates package price note, and opens the modal.
- `#submitExpertConsultation`:
  - runs HTML5 form validation;
  - POSTs `SubmitInquiry`;
  - on success shows toastr success, closes modal, resets form.
- `#talkToExpertModal` on show:
  - initializes `#businessGoal` and `#ddlState` with select2.
- On hide:
  - destroys select2 instances.
- Cancel/close buttons reset the form and clear hidden package seq.

## 9.8 Terms Modal Behavior

- Clicking `.termsLink` opens `#termsConditionsModal`.

## 9.9 Stripe Utility Script

`StripePayment.js` provides:

- dynamic Stripe.js loading if needed,
- `initEngageAdsStripeCheckout(clientSecret, onComplete, stripePublicKey)`,
- iframe resize logic,
- responsive fallback heights,
- cleanup helper `cleanupEngageAdsStripeCheckout()`.

### Important integration note

- This page includes a hidden embedded-checkout container and Stripe helper script.
- However, the current `CreateStripeSession` success path redirects to `/EngageAds/Payment`, so embedded checkout is not completed on this page in the current visible flow.

---

## 10. Payment Flows

## 10.1 Shared Pre-Conditions

1. User selects a non-custom package.
2. Step 2 is rendered.
3. Optional co-op allocations are applied.
4. User accepts Terms & Conditions.

## 10.2 Stripe / Card or Split-Payment Flow

1. User clicks `Proceed with Payment and Activate`.
2. JS detects `cardAmount > 0`.
3. JS collects budget allocations and posts to `?handler=CreateStripeSession`.
4. Server validates card amount and creates Stripe session.
5. Server stores `PaymentSessionData` in TempData.
6. Server returns `{ success: true, redirectUrl: "/EngageAds/Payment" }`.
7. Browser redirects to `/EngageAds/Payment`.
8. Downstream payment page is expected to complete the Stripe checkout using stored session data.

### Amount handling in Stripe flow

| Amount | Meaning |
|---|---|
| `baseCardAmount` | Card-funded portion before transaction fee |
| `transactionFee` | Calculated fee applied to card-funded portion |
| `cardAmount` | Stripe charge amount = base card amount + fee |
| `coopAmount` | Amount deducted from co-op |
| `totalAmount` | Order total including fee |
| `packageAmount` | `totalAmount - transactionFee` |

## 10.3 Co-op-Only Flow

1. User applies enough co-op to reduce card amount to zero.
2. Fee rows are hidden and fee becomes zero.
3. User clicks `Proceed with Payment and Activate`.
4. JS detects `cardAmount == 0`.
5. JS posts to `?handler=CreatePayment`.
6. Server creates payment/order with co-op allocations.
7. Server stores `PaymentResponse` in TempData.
8. Browser redirects to `/EngageAds/OrderConfirmation`.

## 10.4 Inquiry Flow for Custom Packages

1. User clicks `Talk to an Expert`.
2. User completes modal form.
3. JS posts `SubmitInquiry`.
4. Server creates `CUSTOM_PACKAGE` inquiry.
5. Success notification is shown.

---

## 11. API Endpoints and Request/Response Shapes

## 11.1 Razor Page Handlers

| Method | Endpoint | Request shape | Response shape |
|---|---|---|---|
| GET | `/EngageAds/BundledAdPackages` | none | HTML |
| POST | `/EngageAds/BundledAdPackages?handler=LoadPackageData` | `packageSeq` | serialized `PackageCompleteModel` |
| POST | `/EngageAds/BundledAdPackages?handler=CreateStripeSession` | `packageSeq`, `cardAmount`, `coopAmount`, `totalAmount`, `transactionFee`, `baseCardAmount`, `budgetAllocations`, `email` | `{ success, redirectUrl }` or `{ success:false, message }` |
| POST | `/EngageAds/BundledAdPackages?handler=CreatePayment` | `packageSeq`, `TotalAmount`, `CardAmount`, `CoopAmount`, `BudgetAllocations`, optional `paymentIntentId` | `{ success, redirectUrl }` or error text |
| POST | `/EngageAds/BundledAdPackages?handler=SubmitInquiry` | `packageSeq`, `businessGoal`, `stateSeq`, `monthlyBudget`, `additionalNotes`, `city` | `{ success, inquiryNumber }` or `{ success:false, message }` |
| GET | `/EngageAds/BundledAdPackages?handler=BusinessGoals` | none | serialized `LookupModel[]` |
| GET | `/EngageAds/BundledAdPackages?handler=LoadStates` | none | serialized `StateDto[]` |
| GET | `/EngageAds/BundledAdPackages?handler=ProcessingFee&amount={amount}[&country={country}]` | query params | `{ success, fee, total }` |

## 11.2 Upstream Backend APIs Called by Services

| Consumer | Backend endpoint |
|---|---|
| `GetCompleteProgramPackagesAsync` | `GET api/Packages/program/{programSeq}/complete` for admin; `GET api/Packages/program/{programSeq}/my-eligible` for dealer |
| `GetCompletePackageAsync` | `GET api/Packages/{packageSeq}/complete` |
| `GetCombinedBudgetAsync` | `POST api/Budget/combined-details` |
| `GetBusinessGoalsAsync` | `GET api/Lookup` |
| `CreateInquiryAsync` | `POST api/Inquiry` |
| `LoadStateAsync` | `GET api/Location/states?countrySeq=1` |
| `GetStripeConfigurationAsync` | `GET api/Payment/stripe-config` |
| `CreateStripeSessionAsync` | `POST api/Payment/create-stripe-session` |
| `CreatePaymentAsync` | `POST api/Payment/process` |
| `CalculateTransactionFeeAsync` | `POST api/StripeCalculations/calculateTransactionFee` |

## 11.3 Additional Client Endpoint Present in JS

- `processOrderWithCard()` contains a call to `/api/EngageAds/CreateOrder`.
- This is part of client script but is not the primary active path from this page’s current redirect-to-`/EngageAds/Payment` flow.

---

## 12. Services and Dependencies

| Dependency | Role in feature |
|---|---|
| `IEngageAdsService` | Package catalog/detail retrieval, business goals, inquiry creation, Stripe config, Stripe session creation, payment creation, states lookup |
| `ICoopService` | Combined budget retrieval for current dealer/program/fiscal year |
| `IBudgetService` | Determine dealer budget types / program budget seq values |
| `IFiscalService` | Fiscal-year date support via `WebHelper` |
| `INotificationService` | Success, warning, and error notifications |
| `IEncryptDecrypt` | Encrypt/decrypt package seq and budget seq values |
| `IDealerService` | Dealer profile/address lookup for Stripe customer payload |
| `IBaseApiService` | Direct fee-calculation API call from the page model |
| `WebHelper` | Fiscal-year resolution and active division lookup |
| `BasePageModel` | Session/program context, auth conventions, shared page infrastructure |

---

## 13. Localization Keys Used

### Resource-driven keys observed in the page / JS

- `Engage_Ads_Bundled_Packages`
- `Bundled_Ad_Packages`
- `Do_It_For_Me`
- `Choose_Plan`
- `Choose_a_plan`
- `Select_a_predefined_goalbased_advertising_package`
- `Talk_To_An_Expert`
- `CHANNELS_AD_FORMATS`
- `View_Details`
- `Packaged_Confirmed`
- `Package_price`
- `Total_Plan_Cost`
- `Payment_Checkout`
- `Include_Coop_Funds`
- `Available_Balance`
- `I_accept_the`
- `Terms_and_Conditions`
- `Please_accept_the_Terms_and_Conditions_continue`
- `Cancel_plan`
- `Estimated_start_timeframe`
- `Cost_Estimation`
- `NoPackageAvailable`
- `Your_package`
- `will_not_be_activated`
- `until_full_amount_paid`
- `You_will_receive_a_notification_via_email_after_full_payment_paid`

### Hard-coded English text also present

- `Complete Your Payment`
- `Enter your card details to complete the order`
- `Business Goal`
- `Service Area (City)`
- `Service Area (State)`
- `Monthly Advertising Budget`
- `Additional Notes (Optional)`
- `Request Consultation`
- `Ad Placement Terms & Conditions v2`
- fee/co-op validation error messages
- admin informational quote-box copy

---

## 14. Error Handling and Graceful Degradation

| Area | Behavior |
|---|---|
| Package load failure | Warning/error notification; page still renders |
| Budget load failure | Silent from user perspective; co-op section may be empty/unavailable |
| Stripe config failure | Stripe disabled but page remains usable |
| Fee API failure | Fallback local fee calculation keeps checkout available |
| Inquiry package decryption failure | Warning logged; inquiry still submitted |
| Payment/session creation failure | Error JSON returned; client shows toastr or notification |

---

## 15. QA-Relevant Coverage Summary

### Key paths to test

1. Authenticated dealer with eligible packages
2. Admin view with packages visible but no purchase CTA
3. Empty package response
4. Deep-link package auto-selection
5. Custom package inquiry submission
6. Co-op disabled (no budget)
7. Co-op partial allocation / split payment
8. Co-op full allocation / no card fee
9. Duplicate budget type validation
10. Product-line budget cap validation
11. Terms gating
12. Stripe config unavailable
13. Fee API fallback
14. Only custom packages available (wizard tabs hidden)

### Counts for downstream QA catalog seeding

| Coverage area | Count / scope |
|---|---|
| Page handlers | 8 |
| Primary UI sections | 6 |
| Business rules documented | 24 |
| Validation rules documented | 17 |
| Upstream service/API integrations | 10+ |
