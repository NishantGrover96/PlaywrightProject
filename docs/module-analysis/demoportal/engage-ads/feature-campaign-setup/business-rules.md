# EngageAds - Campaign Setup - Business Rules

Generated: 2026-06-19 | Pipeline: Step 3 (Business Rule Discovery)

Total Business Rules: 28

| BR ID | Title | Category | Source | Evidence | Priority |
|---|---|---|---|---|---|
| BR-001 | Authenticated session required | Auth/Security | `BasePageModel` inheritance | Unauthenticated users redirected to `/Account/Login` before page renders | Critical |
| BR-002 | orderSeq or TempData PaymentResponse required | Page Load | `OnGetAsync` entry logic | No order info -> redirect to `/EngageAds/BundledAdPackages` | Critical |
| BR-003 | orderSeq is encrypted in the URL | Security | `IEncryptDecrypt.Decrypt(orderSeq)` | Raw integer never exposed in URL; invalid/undecryptable orderSeq -> redirect to BundledAdPackages | Critical |
| BR-004 | Dealer can access only their own order | Authorization | `DealerNumberSeq` comparison in `OnGetAsync` | Unauthorized access -> redirect to `/Security/AccessDenied` with error notification | Critical |
| BR-005 | Admin and CFAdmin can access any order | Authorization | `UserRole.Admin \|\| ChannelFusionAdmin` bypass check | Admin path skips ownership check; logs warning when enforced | High |
| BR-006 | Order not found redirects to Order History | Error Handling | `orderDetailsResponse.Success == false` branch | Error notification shown; redirect to `/EngageAds/OrderHistory` | High |
| BR-007 | Campaign setup edit window is 72 hours from submission | Edit Window | `setupData.EditWindowHours` (default 72) | Both Admin and Dealer subject to same window | High |
| BR-008 | Within edit window shows Edit Mode alert | Edit Window | `IsEditMode=true`, `CanEdit=true` | `alert.alert-info` with expiration timestamp displayed | High |
| BR-009 | Expired edit window shows countdown and auto-redirects | Edit Window | `IsExpired=true`; setInterval countdown | 5-second countdown rendered in `alert.alert-warning`; JS redirects to `/EngageAds/OrderHistory` | Critical |
| BR-010 | Expired edit window on GET redirects server-side too | Edit Window | `if (IsExpired) return RedirectToPage(...)` | Server redirects before rendering expired countdown UI | High |
| BR-011 | Not-yet-submitted setup is always editable | Edit Window | `SubmittedDate == null` branch | `CanEdit=true`, no expiry; form shown with saved data | Medium |
| BR-012 | User info pre-populated for new submissions | UX | `PrePopulateUserInformation()` | Name, email, phone auto-filled from UserSession on first visit | Medium |
| BR-013 | Package channels loaded to control conditional fields | Page Load | `GetPackageChannelsByOrderSeqAsync` | `HasFacebookChannel` gates Facebook section in Step 3 | High |
| BR-014 | Step 1 requires FirstName, LastName, PrimaryContactEmail, ContactPhoneNumber | Validation | HTML5 `required`; maxlength constraints | Client-side invalid-feedback shown per field | Critical |
| BR-015 | Step 2 requires BusinessName, StreetAddress, City, StateProvince, ZipCode, Email, WebsiteUrl | Validation | HTML5 `required`; pattern for WebsiteUrl | WebsiteUrl must match `https?://.+`; invalid-feedback per field | Critical |
| BR-016 | WebsiteUrl must start with http:// or https:// | Validation | `pattern="https?://.+"` in `_Step2BusinessDetails.cshtml` | Invalid URL blocked at HTML5 validation step | High |
| BR-017 | Step 3 requires ServiceArea and WebsiteAccuracyConfirmed | Validation | HTML5 `required` on both fields | ServiceArea max 2400 chars; checkbox must be checked | Critical |
| BR-018 | FacebookBusinessPageUrl required when HasFacebookBusinessPage is true | Validation | `#facebookUrlSection` visibility + required attribute | URL shown/hidden dynamically; validation enforced by client JS | High |
| BR-019 | Step 4 requires TermsAccepted checkbox | Validation | `required` on `#TermsAccepted` | Submit blocked until terms accepted | Critical |
| BR-020 | Logo upload accepts PNG, JPG, JPEG, GIF, SVG only (max 5 MB) | Logo Upload | `OnPostUploadLogo` extension + size check | Other types return `{ success: false, message: "Invalid file type..." }` | High |
| BR-021 | Logo saved to Temp folder on upload; moved to permanent on submit | Logo Upload | `tempFolderPath` -> `permanentFolderPath` logic | Logo moved only when form is successfully submitted | High |
| BR-022 | Phone numbers cleaned before persistence | Data Quality | `_webHelper.CleanPhoneNumber(...)` | Applied to ContactPhoneNumber and PhoneNumberToDisplayInAds | Medium |
| BR-023 | New submission calls SubmitCampaignSetupAsync; edit calls UpdateCampaignSetupAsync | API Routing | `CampaignIntake.CampaignSetupSeq.HasValue` branch | Update path sends `UpdateCampaignSetupRequest`; create sends `CampaignSetupRequest` | Critical |
| BR-024 | Successful submit stores CampaignIntake in TempData and redirects to OrderConfirmation | Workflow | `TempData["CampaignIntake"]` + `RedirectToPage("/EngageAds/OrderConfirmation")` | TempData carries form data to confirmation page | Critical |
| BR-025 | EDIT_WINDOW_EXPIRED error shown when edit window expires during POST | Error Handling | `response.Errors.Contains("EDIT_WINDOW_EXPIRED")` | Specific user-friendly error message displayed on form | High |
| BR-026 | ModelState invalidity renders Page() without calling service | Validation | `if (!ModelState.IsValid) return Page()` | Server-side model validation gate before any service call | High |
| BR-027 | If no start date selected, campaign launches on 1st or 15th of month | Business Logic | Helper text in `_Step3CampaignDetails.cshtml` | Informational note; no validation enforcement | Medium |
| BR-028 | LeadDestinationEmail and PhoneNumberToDisplayInAds fall back to primary values in review | UX | `_Step4ReviewSubmit.cshtml` fallback rendering | `@(Model.LeadDestinationEmail ?? Model.PrimaryContactEmail)` pattern | Low |
