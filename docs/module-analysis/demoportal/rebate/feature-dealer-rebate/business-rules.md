# Rebate Dealer Rebate — Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-DR-01 | Authenticated access required | Security | `BasePageModel` session auth | Redirect to `/Account/Login` | Critical |
| BR-DR-02 | Dealer or allowed role required (`IsAllowedRole()`) | Security | `IsAllowedRole()` role switch | Non-allowed roles see access denied | Critical |
| BR-DR-03 | Dealer gate for non-dealer users (TM/Admin) | Business Logic | `User.IsDealer == false` → show dealer lookup form | TM and Admin must search for a dealer to submit on behalf | High |
| BR-DR-04 | Territory validation for on-behalf submission | Business Logic | `IsDealerInUserTerritory()` | TM cannot submit on behalf of dealer outside their territory | Critical |
| BR-DR-05 | Payment info gate (Bug 141323) | Business Logic | `DealerHasPaymentInfoAsync(dealerSeq)` | Dealers without payment info excluded from rebate; error shown | Critical |
| BR-DR-06 | Dealer lookup: single result auto-selects | UI | `dealer_info.Count == 1` → auto-redirect | If search returns 1 dealer, goes directly to claim form | High |
| BR-DR-07 | Dealer lookup: multiple results show selection table | UI | `dealer_info.Count > 1` → show table | Selection table rendered when multiple dealers match | High |
| BR-DR-08 | Dealer lookup: no results shows error message | UI | `dealer_info.Count == 0` → `#spnNoRecord` | Error span shown when no dealers found | High |
| BR-DR-09 | On-behalf banner shown when TM/Admin submits for dealer | UI | `ViewData["OnBehalf"] = dealerName` | Banner visible at top of claim form showing dealer name | Medium |
| BR-DR-10 | Current and Future tabs for claim dates | UI | `isRebateFuture` flag | Current tab: active promotions; Future tab: future start dates | Medium |
| BR-DR-11 | Claim form validation: required fields | Validation | `[LocalizedRequired]` attributes | Customer name, purchase date, serial/model required | High |
| BR-DR-12 | Submit claim creates rebate claim record | Business Logic | `SubmitDealerClaimAsync(claimModel)` | Claim confirmation shown; claim stored in DB | Critical |
| BR-DR-13 | Validate Claim AJAX step (before final submit) | Workflow | `OnPostValidateClaim` handler | Client-side pre-validation before final POST | High |
| BR-DR-14 | Product serial or model number required | Validation | `product_serial_error` span | Either serial or model number must be entered | High |
| BR-DR-15 | Promotion selection required | Validation | `promotion_error` span | Must select a promotion before submitting claim | High |
