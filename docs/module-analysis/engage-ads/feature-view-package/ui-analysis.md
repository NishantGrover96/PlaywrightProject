# EngageAds — View Package (BundledAdPackages) UI Analysis Report

Generated: 2026-06-18T16:20:47.888+05:30  
Environment: DemoPortal UAT  
Feature URL: `https://demoportaluat.channel-fusion.com/EngageAds/BundledAdPackages`  
Auth State: `tests/playwright/fixtures/.auth/user.json` (Dealer)

## Execution Summary

- **Observed live via Playwright screenshots:** initial load, package selection, terms acceptance, package detail page, Talk To An Expert modal.
- **Partially observed / inferred from source code:** deep-link `?packageSeq=`, full co-op apply flow, exact network log payloads, and modal validation messages.
- The scripted run captured screenshots successfully but timed out before persisting the final JSON/network summary, so sections below explicitly call out **Observed live** vs **Inferred from source code**.

---

## 1. Page Overview

### Observed live

- **Main heading:** `Bundled Ad Packages (Do It For Me)`
- **Primary structure:** 2-step wizard
  - `Choose Plan`
  - `Payment & Checkout`
- **Left navigation:**
  - `Ads & Assets`
  - `Assets`
  - `Create Ad`
  - `My Library`
  - `Engage Ads`
    - `View Packages` (selected)
    - `Order History`
- **Top-right user context:**
  - `Total Funds: $1,139.00`
  - User shown as `Paul Kasian`
  - Role shown as `Dealer`
- **Cookie banner** is present and overlays the lower viewport in all captured pages.

### Layout summary

1. **Step 1 / catalog view** shows package cards in a multi-column grid.
2. **Custom packages** use `Talk To An Expert`.
3. **Standard packages** use `View Details` and `Select Package`.
4. **Step 2 / checkout view** shows:
   - selected package summary on the left
   - cost estimation / payment summary on the right
   - terms checkbox
   - co-op funds section
   - payment CTA

---

## 2. Initial State

### Observed live

- The page **loads packages**, not the empty-state.
- Wizard step `Choose Plan` is active.
- A top-level `Talk To An Expert` button is visible beside the package-grid heading.
- At least **7 package cards** are visible in the dealer view.

### Hidden/system values

| Field | Status | Value / interpretation |
|---|---|---|
| `#hdnTotalBudget` | **Inferred from live UI + source** | `1139.00` (matches header `Total Funds: $1,139.00` and right-panel `Available Balance : $1139.00`) |
| `#hdnIsAdminOrCFAdmin` | **Inferred from live UI + source** | `false` (dealer role shown; payment CTA visible after terms) |
| `#hdnStripeEnabled` | **Inferred from live UI + source** | `true` (transaction fee and payment flow are active) |

### Package visibility state

| State | Result |
|---|---|
| Wizard visible | Yes |
| Package catalog visible | Yes |
| No-packages message visible | No |
| Dealer purchase controls visible | Yes |

---

## 3. Package Cards

> Package catalog below is based on the live screenshots, with minor wording completion from the page text where visible. Long bullet copy is preserved only where clearly legible.

| Package | Subtitle / Positioning | Price | Interval | Channels listed | Description groups / highlights | Buttons | Notes / badge |
|---|---|---:|---|---|---|---|---|
| **Custom Package** | Work with the Digital Fusion team to build a fully managed campaign with a tailored channel mix | Starting at **$2500** | `/campaign` | Google Search Ads, Google Display Ads, Meta ads, Meta Retargeting, Direct Mail Postcard, Direct Mail with IP Targeting, Tiktok, LinkedIn Ads, OTT/CTV, YouTube Ads | `Campaign Length: Varies`; `What's Included`: campaign setup/configuration, optimizations, creative assets; `Best For`: tailored digital mix | `Talk To An Expert` | Badge: `CUSTOM PACKAGE`; note: `*Requires a brief consultation to determine the best mix of services.` |
| **Local Lead Starter** | Balanced starting point for visibility across search and social | **$2875** | `/campaign` | Facebook & Instagram, Google Search Ads | `Campaign Length: 1–8 Weeks`; `What's Included`: Campaign Setup & Configuration, Campaign Optimizations, Creative Assets, Monthly Reporting; `Best For`: steady pipeline of high-intent leads; reach homeowners via social + search | `View Details`, `Select Package` | Badge: `LOCAL LEAD STARTER` |
| **Meta Leads Ads** | Quick lead capture using low-friction, mobile-friendly forms with retargeting | **$2530** | `/campaign` | Facebook & Instagram, Meta Retargeting | `Campaign Length: 1–8 Weeks`; same 4 standard included items; `Best For`: steady social-media lead flow; re-engaging warm audiences | `View Details`, `Select Package` | Badge: `META LEADS ADS` |
| **Google Growth Starter** | Streamlined Google-only option for lead momentum without cross-platform complexity | **$2760** | `/campaign` | Google Search Ads, Google Display Ads | `Campaign Length: 1–8 Weeks`; same 4 standard included items; `Best For`: Google search visibility and focused entry-level program | `View Details`, `Select Package` | Badge: `GOOGLE GROWTH STARTER` |
| **Storm Response/Seasonal Boost** | Fast high-intent leads for storm/seasonal demand spikes | **$2875** | `/campaign` | Google Paid Search, Meta (FB & IG) Lead Ads | `Campaign Length: 7–14 Days`; same 4 standard included items; `Best For`: urgent or weather-driven demand, quick warm-audience re-engagement | `View Details`, `Select Package` | Badge: `STORM RESPONSE/SEASONAL BOOST` |
| **Direct Mail Performance Package** | Reach homeowners through targeted, printed postcard mailers | **$2150** | `/mailing` | Direct Mail Postcard | `Campaign Length: One Mailing`; includes postcard & mailing, gloss cover standard mail, purchased mail list, mail processing/delivery coordination; `Best For`: neighborhood targeting and offline awareness | `View Details`, `Select Package` | Badge: `DIRECT MAIL PERFORMANCE PACKAGE` |
| **Direct Mail Performance w/ IP Targeting Package** | Reinforced direct mail with supporting digital advertising | **$2500** | `/mailing` | Direct Mail Postcard, IP Targeting for display & social ads | `Campaign Length: One Mailing`; includes postcard & mailing, gloss cover standard mail, purchased mail list, IP targeting ads, mail processing/delivery coordination, tracking options | `View Details`, `Select Package` | Badge: `DIRECT MAIL PERFORMANCE W/ IP TARGETING PACKAGE` |

---

## 4. Selected Package / Cost Summary

### Observed live

The package selected in the captured flow is **Local Lead Starter**.

#### Selected package panel (left)

- Badge remains visible: `LOCAL LEAD STARTER`
- Subtitle: balanced search + social positioning
- Price: `$2875 /campaign`
- Selected-state button text: `Packaged Confirmed`
- Sections visible:
  - `CAMPAIGN LENGTH` → `1–8 Weeks`
  - `WHATS INCLUDED`
    - Campaign Setup & Configuration
    - Campaign Optimizations
    - Creative Assets
    - Monthly Reporting
  - `BEST FOR`
  - `CHANNELS / AD FORMATS`
    - Facebook & Instagram
    - Google Search Ads

#### Cost summary panel (right)

- `Estimated start timeframe` → `3–5 Business Days`
- `Cost Estimation` breakdown:
  - Meta (FB & IG) Lead Ads → `$1000`
  - Google search Ads → `$1500`
  - Management Fee → `$375`
  - Package price → `$2875`
  - **Total Plan Cost** → `$2875`

#### Before terms acceptance

- Terms checkbox is visible and unchecked.
- Inline red validation text is shown:
  - `Please accept the Terms and Conditions to continue.`
- `Proceed with Payment and Activate` is **disabled**.

#### After terms acceptance

- Terms checkbox becomes checked.
- `Proceed with Payment and Activate` becomes **enabled**.
- Co-op option becomes interactable.

#### Amounts visible after terms

| Field | Value |
|---|---:|
| Available Balance | `$1139.00` |
| Total Amount of Co-op included | `$0` |
| Credit Card Amount (Before Fee) | `$2875` |
| Transaction Fee | `$86.17` |
| Credit Card Charge | `$2961.17` |
| Order Total (Including Transaction Fee) | `$2961.17` |

#### Messaging

- `Your package will not be activated until full amount paid.`
- `You will receive a notification via email after full payment paid.`

---

## 5. Selector Inventory

### 5.1 Package cards

| Element | Preferred selector | Fallback selector |
|---|---|---|
| Package card | `page.locator('.plansWrapper .card')` | `page.locator('.card')` |
| Package badge / name | `page.locator('.cardBadge[packageSeq]')` | `page.locator('.cardBadge')` |
| Package subtitle | `page.locator('.card .description')` | `page.getByText(/balanced starting point|ideal for quick lead capture/i)` |
| View Details | `page.getByRole('link', { name: /view details/i })` | `page.locator('a.btnBordered[packageSeq]')` |
| Select Package | `page.getByRole('button', { name: /select package/i })` | `page.locator('button.selectPackage[packageSeq]')` |
| Talk To An Expert | `page.getByRole('button', { name: /talk to an expert/i })` | `page.locator('.talkToExpertBtn')` |

### 5.2 Cost summary / payment step

| Element | Preferred selector | Fallback selector |
|---|---|---|
| Total plan cost hidden input | `page.locator('#hdnTotalPlanCost')` | `page.locator('input[id=\"hdnTotalPlanCost\"]')` |
| Remaining balance | `page.getByText(/credit card amount \\(before fee\\)/i)` | `page.locator('.spnRemainingBalance')` |
| Transaction fee | `page.getByText(/transaction fee/i)` | `page.locator('.spnTransactionFee')` |
| Card charge | `page.getByText(/credit card charge/i)` | `page.locator('.spnCardChargeTotal')` |
| Order total incl. fee | `page.getByText(/order total \\(including transaction fee\\)/i)` | `page.locator('.spnOrderTotalWithFee')` |
| Total co-op amount | `page.getByText(/total amount of co-op included/i)` | `page.locator('.spnTotalCoopAmount')` |
| Budget allocation area | `page.locator('.spnBudgetType')` | `page.locator('.budgetTypes')` |
| Cancel plan | `page.getByRole('button', { name: /cancel plan/i })` | `page.locator('.btnCancelPlan')` |
| Payment CTA | `page.getByRole('button', { name: /proceed with payment and activate/i })` | `page.locator('.btnPayment')` |

### 5.3 Budget / Co-op

| Element | Preferred selector | Fallback selector |
|---|---|---|
| Include co-op funds checkbox | `page.getByLabel(/include co-op funds/i)` | `page.locator('#coopFunds')` |
| Budget type dropdown | `page.getByRole('combobox').filter({ has: page.locator('#ddlBudgetTypeNames') })` | `page.locator('#ddlBudgetTypeNames')` |
| Co-op amount textbox | `page.locator('#txtCoopPercentage')` | `page.getByRole('textbox').filter({ hasNotText: '' })` |
| Add co-op button | `page.locator('#btnAddCoop')` | `page.getByRole('button', { name: /add/i })` |
| Available budget hidden/meta | `page.locator('#hdnAvailableBudget')` | `page.locator('#hdnProgramBudgetSeq')` |

### 5.4 Terms & Conditions

| Element | Preferred selector | Fallback selector |
|---|---|---|
| Terms checkbox | `page.getByLabel(/i accept the terms and conditions/i)` | `page.locator('#termsAndConditions')` |
| Terms link | `page.getByRole('link', { name: /terms and conditions/i })` | `page.locator('.termsLink')` |
| Terms validation label | `page.getByText(/please accept the terms and conditions/i)` | `page.locator('#lblTermsAndConditions')` |

### 5.5 Talk To An Expert modal

| Element | Preferred selector | Fallback selector |
|---|---|---|
| Modal | `page.getByRole('dialog')` | `page.locator('#talkToExpertModal')` |
| Business Goal | `page.getByLabel(/business goal/i)` | `page.locator('#businessGoal')` |
| City | `page.getByLabel(/service area \\(city\\)/i)` | `page.locator('#txtCity')` |
| State | `page.getByLabel(/service area \\(state\\)/i)` | `page.locator('#ddlState')` |
| Monthly Budget | `page.getByLabel(/monthly advertising budget/i)` | `page.locator('#monthlyBudget')` |
| Additional Notes | `page.getByLabel(/additional notes/i)` | `page.locator('#additionalNotes')` |
| Submit consultation | `page.getByRole('button', { name: /request consultation/i })` | `page.locator('#submitExpertConsultation')` |
| Cancel modal | `page.getByRole('button', { name: /cancel/i })` | `page.locator('.btnCancel, .close')` |

---

## 6. User Journeys Observed

### Journey 1 — Page load → view packages

**Observed live**

1. Dealer lands on `/EngageAds/BundledAdPackages`.
2. Package catalog renders immediately.
3. Wizard shows step 1 active.
4. Custom and standard packages are visible together.

### Journey 2 — Select Package → cost summary → accept T&C → payment button enabled

**Observed live**

1. User clicks `Select Package` on `Local Lead Starter`.
2. Wizard advances to payment step.
3. Right panel shows cost estimation and payment summary.
4. Payment CTA is disabled until T&C is accepted.
5. After checking T&C, CTA becomes enabled.

### Journey 3 — Select Package → apply COOP funds → payment

**Partially observed live / inferred from source code**

- Live UI confirms:
  - `Include Co-op Funds` checkbox exists
  - available balance is `$1139.00`
  - co-op section is present after package selection
- Source code confirms:
  1. user checks `#coopFunds`
  2. budget controls expand
  3. user selects `#ddlBudgetTypeNames`
  4. user enters amount in `#txtCoopPercentage`
  5. user clicks `#btnAddCoop`
  6. totals recalculate
  7. if card amount remains `> 0`, Stripe-session flow is used
  8. if card amount becomes `0`, co-op-only order flow is used

### Journey 4 — Click `Talk To An Expert` → fill modal → submit

**Observed live**

1. User opens modal.
2. Modal title: `Talk To An Expert`
3. Fields shown:
   - Business Goal
   - Service Area (City)
   - Service Area (State)
   - Monthly Advertising Budget
   - Additional Notes (Optional)
4. Yellow note shown:
   - `Note: This is a customized package starting at $2500 with a recommended 6 month commitment`

**Inferred from source code**

- Submit uses HTML5 validation (`checkValidity()` / `reportValidity()`) before AJAX `SubmitInquiry`.

### Journey 5 — Click `View Details` → navigate to detail page

**Observed live**

Detail page for `Local Lead Starter` includes:

- page heading `Local Lead Starter`
- price hero `$2875 /campaign`
- `Proceed to Checkout` button
- `Back` button
- `Channels Included`
  - Facebook & Instagram
  - Google Search Ads
- `What's Included` tiles
  - Campaign Setup & Configuration
  - Campaign Optimizations
  - Creative Assets
  - Monthly Reporting
- `Creative Layouts` carousel
- `Campaign Details`
  - `Campaign Duration: 1–8 Weeks`
  - `Setup Time: 3–5 Business Days`
- `How It Works?`
  - `1. Select`
  - `2. Launch`
  - `3. Track`
- warning banner:
  - `Campaign configuration, targeting, channels, and creative are fixed and cannot be modified by contractors`

### Journey 6 — Deep-link with `?packageSeq=`

**Inferred from source code**

- If `?packageSeq={encryptedSeq}` is present:
  - page load auto-selects the matching package
  - wizard skips directly into the payment-summary step
  - same package-detail AJAX handler is used

---

## 7. Validation Behavior

### Observed live

| Area | Behavior |
|---|---|
| Terms checkbox not accepted | Inline red message shown: `Please accept the Terms and Conditions to continue.` |
| Payment button before T&C | Disabled |
| Payment button after T&C | Enabled |

### Inferred from source code

| Area | Behavior |
|---|---|
| Talk To An Expert required fields | Native HTML5 required-field validation for Business Goal, City, State, Monthly Advertising Budget |
| City input | Letters/spaces only client-side filtering |
| Monthly budget | Required, max length 50 |
| Co-op amount | Numeric only, max 2 decimals |
| Co-op add | Rejects empty product code / empty or invalid amount |
| Co-op amount over budget | Shows specific available-balance error |
| Co-op amount over package price | Shows package-cost cap error |
| Duplicate budget line | Rejected |

### Validation trigger model

- **Terms gate:** immediate client-side toggle
- **Expert modal:** HTML5 validation on submit
- **Co-op rules:** client-side validation on add/update
- **Payment amount rule:** server-side check for `cardAmount > 0` in Stripe flow

---

## 8. API Calls Observed

### Observed live or strongly implied by live interaction

| Action | Method | Endpoint |
|---|---|---|
| Load feature page | `GET` | `/EngageAds/BundledAdPackages` |
| Select package | `POST` | `/EngageAds/BundledAdPackages?handler=LoadPackageData` |
| Open Talk To An Expert support data | `GET` | `/EngageAds/BundledAdPackages?handler=BusinessGoals` |
| Open Talk To An Expert state list | `GET` | `/EngageAds/BundledAdPackages?handler=LoadStates` |
| View details | `GET` | `/EngageAds/Detail?packageSeq={encryptedSeq}` |

### Inferred from source code

| Action | Method | Endpoint | Notes |
|---|---|---|---|
| Recalculate fee | `GET` | `/EngageAds/BundledAdPackages?handler=ProcessingFee&amount={amount}` | Used when card-funded amount changes |
| Start Stripe flow | `POST` | `/EngageAds/BundledAdPackages?handler=CreateStripeSession` | Used when `cardAmount > 0` |
| Co-op-only checkout | `POST` | `/EngageAds/BundledAdPackages?handler=CreatePayment` | Used when `cardAmount == 0` |
| Submit inquiry | `POST` | `/EngageAds/BundledAdPackages?handler=SubmitInquiry` | Modal submit |

### Note

- Exact request/response capture was **not persisted** because the scripted run timed out after successful screenshot capture.

---

## 9. Role Differences

### Dealer behavior (observed + confirmed by source)

- Dealer sees eligible packages.
- Dealer can select a standard package.
- Dealer sees co-op balance and payment summary.
- Dealer can enable payment by accepting terms.

### Admin / ChannelFusionAdmin behavior (inferred from source)

- Admin users can browse all packages.
- Payment CTA is omitted/hidden for admin roles.
- Admin sees informational quote-box messaging instead of purchase flow.

### Dealer-vs-admin signal

- The live session shows `Dealer`, so `#hdnIsAdminOrCFAdmin` should be `false`.

---

## 10. Stripe Integration

### Observed live

- Stripe-backed fee calculation appears active:
  - package price `$2875`
  - transaction fee `$86.17`
  - order total `$2961.17`
- This indicates `Stripe enabled = true` in the live dealer experience.

### Inferred from source code

- Page stores Stripe publishable key in `#hdnStripePublishKey`.
- Page stores feature flag in `#hdnStripeEnabled`.
- Current card flow posts to `CreateStripeSession` and then redirects to `/EngageAds/Payment`.
- Although hidden Stripe containers exist on the page, the current visible flow does **not** complete embedded checkout directly on this screen.

---

## 11. Screenshots Taken

| File | What it shows |
|---|---|
| `reports/test-results/engage-ads/feature-view-package/ui-analysis/01-initial-load.png` | Full package catalog in dealer view |
| `reports/test-results/engage-ads/feature-view-package/ui-analysis/02-package-selected.png` | Local Lead Starter selected; payment summary before terms acceptance |
| `reports/test-results/engage-ads/feature-view-package/ui-analysis/03-terms-accepted.png` | T&C accepted; payment button enabled |
| `reports/test-results/engage-ads/feature-view-package/ui-analysis/04-view-details.png` | Local Lead Starter detail page |
| `reports/test-results/engage-ads/feature-view-package/ui-analysis/05-expert-modal.png` | Talk To An Expert modal with all form fields visible |

---

## 12. Final Assessment

- The **dealer live UI is working and package data is present**.
- The feature supports:
  - package browsing
  - package detail navigation
  - package selection
  - terms-gated checkout
  - co-op balance usage
  - expert consultation requests
- The most important live-confirmed business behavior is the **terms gate**: payment remains disabled until T&C is accepted.
- Deep-linking, detailed co-op validation messages, and exact request payloads should be treated as **source-confirmed** until a non-timed-out scripted capture is rerun.
