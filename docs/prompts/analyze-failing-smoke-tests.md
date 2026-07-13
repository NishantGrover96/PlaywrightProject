# Prompt: Analyze Failing EngageAds Smoke Tests

## Context

6 Playwright smoke tests are failing across two EngageAds features. Use this prompt to drive a structured root-cause investigation.

---

## Failing Tests

### Feature: Campaign Setup (`engage-ads/feature-campaign-setup/campaign-setup.spec.ts`)

| # | Test ID | Line | Description |
|---|---------|------|-------------|
| 1 | CS-SMOKE-001 | 77 | Page loads for authenticated dealer with valid session |
| 2 | CS-SMOKE-006 | 132 | Successful submission redirects to OrderConfirmation |

### Feature: View Package (`engage-ads/feature-view-package/view-package.spec.ts`)

| # | Test ID | Line | Description |
|---|---------|------|-------------|
| 3 | ENGAGEADS-TC-001 | 105 | Dealer page load shows wizard and package catalog |
| 4 | ENGAGEADS-TC-003 | 118 | Dealer sees eligible packages and no empty state in UAT |
| 5 | ENGAGEADS-TC-005 | 136 | Selecting a standard package renders Step 2 payment summary |
| 6 | ENGAGEADS-TC-006 | 151 | Accepting Terms enables payment and co-op interactions |

---

## What Each Test Does

### CS-SMOKE-001 (line 77)
```
goToCampaignSetup(page)          // navigates to /EngageAds/CampaignSetup (no orderSeq)
expect(page).toHaveURL(          // expects redirect to /EngageAds/BundledAdPackages
  testData.redirects.bundledAdPackages, timeout: 20s
)
```
**Guard:** Skips if dealer auth state file (`fixtures/.auth/user.json`) is missing.

### CS-SMOKE-006 (line 132)
```
completeCampaignSetupFlow(page)                     // fills all 4 steps + submits
expect(page).toHaveURL(orderConfirmation, 30s)      // expects /EngageAds/OrderConfirmation
```
**Guards:** Skips on `TEST_ENV=production`. Skips if dealer auth missing.
Requires `CAMPAIGN_ORDER_SEQ` env var (has fallback `lUvurFjFSQUEqual`).

### ENGAGEADS-TC-001 (line 105)
```
goToViewPackage(page)             // navigates to /EngageAds/BundledAdPackages
viewPackage.expectWizardVisible() // .commonWizard must be visible
viewPackage.expectPackagesVisible()
expect(page).toHaveURL(featureUrl)
expect(viewPackage.noPackageMessage).toBeHidden()  // .noPackage must be hidden
```
**Guard:** Skips if current URL doesn't include `/EngageAds/BundledAdPackages` (in-progress order redirects to Campaign Setup).

### ENGAGEADS-TC-003 (line 118)
```
goToViewPackage(page)
// Skips if not on package page (in-progress order)
viewPackage.getPackageCount()        // counts .card elements
viewPackage.getTotalBudget()         // reads #hdnTotalBudget value
expect(packageCount).toBeGreaterThanOrEqual(1)
expect(parsedBudget).toBeCloseTo(testData.budget.availableUAT, 2)  // = 0.0
expect(viewPackage.noPackageMessage).toBeHidden()
```

### ENGAGEADS-TC-005 (line 136)
```
probe.navigate()                                     // go to BundledAdPackages
// Skips if not on package page
selectPackageAndGoToStep2(page, "Local Lead Starter")
viewPackage.expectStep2Active()
expect(getTotalPlanCost()).toBeCloseTo(2875, 2)
expect(getPaymentCheckoutText()).toContain("Total Plan Cost")
expect(getQuoteBoxText()).toContain("will not be activated")
```

### ENGAGEADS-TC-006 (line 151)
```
probe.navigate()
// Skips if not on package page
selectPackageAndGoToStep2(page, "Local Lead Starter")
viewPackage.expectPaymentButtonDisabled()     // .btnPayment disabled
viewPackage.expectTermsErrorVisible()         // #lblTermsAndConditions visible
viewPackage.acceptTerms()                     // checks #termsAndConditions
viewPackage.expectPaymentButtonEnabled()
expect(viewPackage.coopFundsCheckbox).toBeEnabled()
```

---

## Key Locators to Verify

| Locator | Selector | Used in |
|---------|----------|---------|
| `wizardContainer` | `.commonWizard` | TC-001 |
| `noPackageMessage` | `.noPackage` | TC-001, TC-003 |
| `packageCards` | `.card` | TC-003, TC-005 |
| `selectPackageButtons` | `.selectPackage` | TC-005, TC-006 |
| `termsCheckbox` | `#termsAndConditions` | TC-006 |
| `termsError` | `#lblTermsAndConditions` | TC-006 |
| `paymentButton` | `.btnPayment` | TC-006 |
| `coopFundsCheckbox` | `#coopFunds` | TC-006 |
| `hdnTotalBudget` | `#hdnTotalBudget` | TC-003 |
| `hdnTotalPlanCost` | `#hdnTotalPlanCost` | TC-005 |
| `paymentCheckoutSection` | `.paymentCheckout` | TC-005 |
| `quoteText` | `.quoteBox, .quoteBox *` | TC-005 |

---

## Hypotheses - Ranked by Likelihood

### H1 - Auth State Missing or Stale (affects CS-SMOKE-001, CS-SMOKE-006)
The dealer session file `tests/playwright/fixtures/.auth/user.json` may be missing, expired, or authenticated to the wrong environment.

**Check:**
- Does `fixtures/.auth/user.json` exist?
- Run `npx playwright test --project=setup` to regenerate the auth state.
- Confirm `BASE_URL` in `.env.production` or `.env.uat` matches the environment you authenticated against.

---

### H2 - Dealer Has an In-Progress EngageAds Order (affects TC-001, TC-003, TC-005, TC-006)
All four View Package tests include skip guards that check whether the current URL is `/EngageAds/BundledAdPackages`. If the UAT dealer account has an active/draft order, the app redirects to `/EngageAds/CampaignSetup` instead.

However - if the tests are **failing** rather than **skipping**, the URL check itself may be throwing an error (e.g. `page.url()` called before navigation completes, or `goToViewPackage` throws before the guard can run).

**Check:**
- Log into the UAT dealer account manually. Do you land on BundledAdPackages or CampaignSetup?
- If redirected: cancel or complete the draft order, then re-run.
- If on the package page: the guards aren't firing - the real failure is in `expectWizardVisible()`, `expectPackagesVisible()`, or the locator assertions.

---

### H3 - CSS Selector Drift (affects TC-001, TC-003, TC-005, TC-006)
The app's HTML may have been updated - class names like `.commonWizard`, `.card`, `.selectPackage`, `.noPackage`, `.btnPayment` could have changed.

**Check:**
- Open browser DevTools on `/EngageAds/BundledAdPackages` and inspect:
  - Is there a `.commonWizard` element?
  - Are package cards using `.card` or a different class?
  - Is the payment button `.btnPayment` or a different selector?
  - Does `.noPackage` exist in the DOM?

---

### H4 - `CAMPAIGN_ORDER_SEQ` env var is Invalid or Expired (affects CS-SMOKE-001, CS-SMOKE-006)
CS-SMOKE-001 calls `goToCampaignSetup(page)` (no orderSeq), so it expects a redirect to BundledAdPackages.
CS-SMOKE-006 calls `completeCampaignSetupFlow(page)` which uses the fallback `lUvurFjFSQUEqual` - this is likely an encrypted sequence that has expired or belongs to a different environment.

**Check:**
- Is the orderSeq `lUvurFjFSQUEqual` still valid in the current environment?
- Does navigating to `/EngageAds/CampaignSetup?orderSeq=lUvurFjFSQUEqual` load a real order or redirect?
- Set `CAMPAIGN_ORDER_SEQ=<fresh-encrypted-seq>` to override with a live value.

---

### H5 - Budget Value Mismatch (affects TC-003)
`test-data.json` has `budget.availableUAT = 0.0`. The test asserts:
```js
expect(parsedBudget).toBeCloseTo(0.0, 2)
```
If the UAT dealer's actual Coop budget has changed (e.g. now `1500.00`), this assertion fails.

**Check:**
- What does `#hdnTotalBudget`'s value attribute show in UAT?
- Update `test-data.json` -> `budget.availableUAT` to match the actual UAT balance.

---

### H6 - Package Name Changed (affects TC-005, TC-006)
`selectPackageAndGoToStep2(page, "Local Lead Starter")` looks for a `.selectPackage` button inside a `.card` whose text contains "Local Lead Starter".

**Check:**
- Does a package named exactly "Local Lead Starter" appear in UAT?
- Update `test-data.json` -> `packages.knownStandard.name` if the name has changed.

---

## Recommended Investigation Steps

```
Step 1 - Confirm auth state exists and is fresh
  ls tests/playwright/fixtures/.auth/
  npx playwright test --project=setup

Step 2 - Manually open UAT dealer account
  Navigate to /EngageAds/BundledAdPackages
  Question: Does it load the package catalog or redirect to CampaignSetup?

Step 3 - If redirected: clear the in-progress order
  Cancel the draft order from the app, then re-run.

Step 4 - Inspect HTML selectors on the live page
  DevTools -> .commonWizard, .card, .selectPackage, .btnPayment, .noPackage

Step 5 - Verify orderSeq validity for Campaign Setup tests
  Open /EngageAds/CampaignSetup?orderSeq=lUvurFjFSQUEqual
  Does it load a wizard or redirect?

Step 6 - Check actual #hdnTotalBudget value vs test-data.json
  budget.availableUAT = 0.0  - is this still correct in UAT?

Step 7 - Check package name "Local Lead Starter"
  Is this package visible and selectable in UAT?

Step 8 - Run with --debug to pause on failure
  npx playwright test engage-ads --project=chromium --debug
```

---

## Files to Check

| File | Purpose |
|------|---------|
| `tests/playwright/fixtures/.auth/user.json` | Dealer session state |
| `tests/playwright/data/engage-ads/feature-campaign-setup/test-data.json` | CampaignSetup URLs, orderSeq, redirects |
| `tests/playwright/data/engage-ads/feature-view-package/test-data.json` | Package names, budget, expected messages |
| `tests/playwright/pages/engage-ads/feature-campaign-setup/CampaignSetupPage.ts` | All CampaignSetup locators |
| `tests/playwright/pages/engage-ads/feature-view-package/ViewPackagePage.ts` | All ViewPackage locators |
| `.env.production` / `.env.uat` | BASE_URL, TEST_USER_EMAIL |

---

## Quick Fix Checklist

- [ ] Auth state file exists at `fixtures/.auth/user.json`
- [ ] `BASE_URL` in env file points to correct environment
- [ ] UAT dealer account has no in-progress EngageAds order
- [ ] `CAMPAIGN_ORDER_SEQ` is a valid, non-expired encrypted sequence
- [ ] `budget.availableUAT` in `test-data.json` matches actual UAT dealer balance
- [ ] Package name `"Local Lead Starter"` exists in UAT catalog
- [ ] CSS selectors `.commonWizard`, `.card`, `.selectPackage`, `.btnPayment` match current app HTML
