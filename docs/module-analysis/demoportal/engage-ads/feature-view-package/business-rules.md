# EngageAds - View Package (BundledAdPackages) Business Rules

Generated: 2026-06-18T16:37:04.157+05:30

Total Business Rules: 32

| BR ID | Title | Category | Source | Evidence (UI) | Priority |
|---|---|---|---|---|---|
| BR-001 | Authenticated session is required | Auth/Security | BundledAdPackages.cshtml.cs inherits BasePageModel; repo-analysis 2 Authentication | Unauthenticated users are expected to redirect before the package page renders. | Critical |
| BR-002 | Catalog is scoped to the current program | Page Load | OnGetAsync -> LoadCompleteDataAsync -> GetCompleteProgramPackagesAsync(programSeq) | Catalog loads program packages for the active EngageAds context. | High |
| BR-003 | Dealers see only eligible packages | Authorization | GetCompleteProgramPackagesAsync(programSeq, false); repo-analysis 2 Role-Based Restrictions | Dealer live view shows purchasable packages and payment actions. | High |
| BR-004 | Admin and CFAdmin can browse all packages | Authorization | IsAdminOrCFAdmin + GetCompleteProgramPackagesAsync(programSeq, true) | UI analysis notes admin users can browse all packages. | High |
| BR-005 | Admin and CFAdmin cannot purchase from this page | Authorization | Payment CTA omitted when IsAdminOrCFAdmin = true | Admin view shows informational quote-box messaging instead of a purchase CTA. | Critical |
| BR-006 | Empty package response renders NoPackageAvailable | Page Load | OnGetAsync empty-state branch; repo-analysis 3 Empty State | When no packages exist, wizard is hidden and `.noPackage` message is shown. | High |
| BR-007 | Initial dealer view renders the package wizard and package grid | UI | BundledAdPackages.cshtml Step 1 markup + OnGetAsync data binding | Observed live: `Choose Plan` step active with 7+ package cards visible. | Critical |
| BR-008 | Custom packages use Talk To An Expert instead of checkout actions | Package Display | IsCustom conditional rendering in BundledAdPackages.cshtml | Observed live: Custom Package card shows `Talk To An Expert` and no `Select Package` button. | High |
| BR-009 | Standard packages expose View Details and Select Package | Package Display | Non-custom card rendering in BundledAdPackages.cshtml | Observed live: standard cards show `View Details` and `Select Package`. | High |
| BR-010 | Client-visible package and budget identifiers remain encrypted | Security | IEncryptDecrypt usage for packageSeq and ProgramBudgetSeq; repo-analysis 2 Security Controls | Selectors such as `.cardBadge[packageSeq]`, `.selectPackage[packageSeq]`, and budget option values use encrypted tokens. | Critical |
| BR-011 | Deep-link packageSeq auto-selects the package on load | Workflow | jsengageads.js document.ready query-string handler | Source confirms `?packageSeq=` skips directly into the payment-summary step. | High |
| BR-012 | Selecting a standard package loads Step 2 via LoadPackageData | Workflow | POST ?handler=LoadPackageData + dynamic Step 2 build in jsengageads.js | Observed live: selecting Local Lead Starter advances to `Payment & Checkout` with cost summary. | Critical |
| BR-013 | Invalid package selection is rejected | Error Handling | OnPostCreateStripeSession / package lookup validation; repo-analysis VR-017 | Source-confirmed error message: `Package not found`. | High |
| BR-014 | Terms acceptance is required before payment can proceed | Validation | #termsAndConditions click handler; repo-analysis BR-009 / VR-002 | Observed live: red message shown and `Proceed with Payment and Activate` disabled until terms are accepted. | Critical |
| BR-015 | Terms acceptance also enables the Co-op Funds control | UI State | jsengageads.js terms toggle logic | Observed live: co-op option becomes interactable only after terms are checked. | High |
| BR-016 | Co-op controls are rendered only when budget is available | Co-op | BudgetDetails.TotalBudget -> #hdnTotalBudget gating; repo-analysis BR-008 | Dealer live view shows Available Balance $1,139.00 and co-op option; zero-budget path hides co-op controls. | High |
| BR-017 | Co-op allocation requires a budget type and positive numeric amount | Validation | Client validation around #ddlBudgetTypeNames and #txtCoopPercentage; VR-010 | Exact message: `Please select a valid product code and enter a value.` | Critical |
| BR-018 | Co-op line amount cannot exceed selected product balance | Validation | Client validation rule VR-011 | Exact message: `Co-op amount ($X) exceeds available balance ($Y) for this product line.` | Critical |
| BR-019 | Total co-op cannot exceed package cost | Validation | Client validation rules VR-012 and VR-013 | Exact message: `Co-op amount cannot exceed the package cost. Please adjust the amount or pay the remaining balance.` | Critical |
| BR-020 | Duplicate co-op product lines are not allowed | Validation | Client validation rule VR-014 | Exact message: `This product code has already been added.` | High |
| BR-021 | Multiple distinct co-op lines and split payment are supported | Co-op | Dynamic allocation table + split-payment message logic in jsengageads.js | Source confirms multiple budget lines, recalculation, and split-payment banner when card and co-op are both used. | High |
| BR-022 | Transaction fee applies only when card-funded amount is greater than zero | Payment | refreshEngageAdsPaymentSummary() + OnGetProcessingFee | Observed live: $86.17 fee shown for a $2,875 card-funded selection; full co-op path hides fee rows. | Critical |
| BR-023 | Fee calculation falls back to 2.9% + $0.30 when the fee API fails | Payment | OnGetProcessingFee fallback logic | Repo analysis documents graceful fallback while keeping checkout available. | High |
| BR-024 | Stripe-enabled card or split-payment flow redirects to /EngageAds/Payment | Payment | OnPostCreateStripeSession + jsengageads.js payment routing | Observed live indicates Stripe is enabled; source returns `{ success: true, redirectUrl: '/EngageAds/Payment' }`. | Critical |
| BR-025 | Full co-op checkout posts CreatePayment and redirects to OrderConfirmation | Payment | OnPostCreatePayment + jsengageads.js zero-card branch | Source confirms `cardAmount == 0` routes to `/EngageAds/OrderConfirmation`. | Critical |
| BR-026 | Package remains inactive until the full amount is paid | Business Logic | Quote-box copy in Step 2; repo-analysis BR-018 | Observed live message: `Your package will not be activated until full amount paid.` | High |
| BR-027 | Expert modal requires Business Goal, City, State, and Monthly Budget; Monthly Budget max length is 50 | Validation | Inquiry form fields + HTML5 attributes; VR-003..VR-007 | Observed live modal fields and source-confirmed HTML5 required validation / `maxlength="50"`. | High |
| BR-028 | City input allows letters and spaces only | Validation | Client filter for #txtCity; VR-008 | UI analysis notes non-letter characters are stripped client-side. | Medium |
| BR-029 | Custom package inquiries are created as CUSTOM_PACKAGE requests for DIGITAL_FUSION | Inquiry | OnPostSubmitInquiry server-generated fields | Success message indicates consultation request was submitted and team follow-up will occur. | High |
| BR-030 | Business goals and states are loaded asynchronously; states use countrySeq=1 | Inquiry | OnGetBusinessGoals + OnGetLoadStates | Source confirms modal dropdowns are loaded via AJAX before submit. | Medium |
| BR-031 | When only custom packages exist, wizard payment actions are hidden | UI | checkAndHideWizardTabs() + repo-analysis BR-024 | Source confirms custom-only catalog hides wizard tabs/actions and payment panel. | Medium |
| BR-032 | If Stripe configuration fails, the page still renders with Stripe disabled | Error Handling | LoadStripeConfigurationAsync failure branch; repo-analysis BR-023 | Repo analysis states `IsStripeEnabled = false` while catalog remains usable. | Medium |
