# EngageAds - Campaign Setup - UI Analysis

Generated: 2026-06-19 | Pipeline: Step 2 (UI Analysis)

## 1. Page Header

| Element | Selector | Value |
|---|---|---|
| Page Title | `ViewData["Title"]` | "Campaign Setup" |
| Block Heading | `.a_Header .LeftSec h4` | "Bundled Ad Packages" |
| Sub-heading | `.a_Header .LeftSec p.sub-heading` | "Complete this form to activate your advertising campaign..." |

## 2. Package Info Header

| Element | Selector | Notes |
|---|---|---|
| Package Name | `.packageInfoHeader .packageName` | Bound from `Model.CampaignIntake.PackageName` |
| Package Price | `.packageInfoHeader .packagePrice` | `$X,XXX.XX` format |
| Paid Badge | `.packageInfoHeader .badge-success` | "PAID " - always visible when page loads |

## 3. Edit Window Status Alerts

| State | Selector | Content |
|---|---|---|
| Expired | `.alert.alert-warning` | "Campaign Form Already Submitted" + countdown `#redirectCountdown` |
| Edit Mode (within window) | `.alert.alert-info` | "Edit Mode" + expiration message |
| First submission | *(no alert)* | Form rendered normally |

## 4. Wizard Structure

Container: `.wrapperWithSteps > .commonWizard`

| Step | `<h3>` Header | Partial Content |
|---|---|---|
| 1 | "Primary Contact" | `_Step1PrimaryContact.cshtml` |
| 2 | "Business Details" | `_Step2BusinessDetails.cshtml` |
| 3 | "Campaign Details" | `_Step3CampaignDetails.cshtml` |
| 4 | "Review & Submit" | `_Step4ReviewSubmit.cshtml` |

## 5. Step 1 - Primary Contact Selectors

| Field | ID / Name | Type | Notes |
|---|---|---|---|
| First Name | `#FirstName` | text | required, maxlength=50 |
| Last Name | `#LastName` | text | required, maxlength=50 |
| Primary Contact Email | `#PrimaryContactEmail` | email | required, maxlength=100 |
| Contact Phone Number | `#ContactPhoneNumber` | text | required, phone mask `.clsPhoneMaskMobileLandline` |
| Lead Destination Email | `#LeadDestinationEmail` | email | optional, maxlength=100 |
| Phone Number to Display in Ads | `#PhoneNumberToDisplayInAds` | text | optional, mask `.clsPhoneMaskMobileLandlineAds` |

## 6. Step 2 - Business Details Selectors

| Field | ID / Name | Type | Notes |
|---|---|---|---|
| Business Name | `#BusinessName` | text | required, maxlength=100 |
| Street Address | `#StreetAddress` | text | required, maxlength=100 |
| Address Line 2 | `#AddressLine2` | text | optional, maxlength=100 |
| City | `#City` | text | required, maxlength=50 |
| State / Province | `#StateProvince` | text | required, maxlength=2 |
| Zip Code | `#ZipCode` | text | required, maxlength=10 |
| Email | `#Email` | email | required, maxlength=100 |
| Business Logo | `#BusinessLogo` | file | accept=image/png,image/jpeg,image/jpg |
| Logo Drop Zone | `#logoDropZone` | div | dropzone UI |
| Business Logo File Name | `#BusinessLogoFileName` | hidden | set after upload |
| Business Logo Path | `#BusinessLogoPath` | hidden | set after upload |
| Website URL | `#WebsiteUrl` | url | required, maxlength=200, pattern=https?://.+ |

## 7. Step 3 - Campaign Details Selectors

| Field | ID / Name | Type | Notes |
|---|---|---|---|
| Desired Campaign Start Date | `#DesiredCampaignStartDate` | text | date picker `.datepicker-input`, optional |
| Service Area | `#ServiceArea` | textarea | required, rows=3, maxlength=2400 |
| Website Accuracy Confirmed | `#WebsiteAccuracyConfirmed` | checkbox | required |
| Preferred Landing Page URLs | `#PreferredLandingPageUrls` | textarea | optional, rows=4 |
| Has Facebook Business Page - Yes | `#HasFacebookYes` | radio | `value="true"` |
| Has Facebook Business Page - No | `#HasFacebookNo` | radio | `value="false"` |
| Facebook Business Page URL | `#FacebookBusinessPageUrl` | url | shown in `#facebookUrlSection` when Yes selected |
| Facebook URL Section | `#facebookUrlSection` | div | visible when HasFacebookBusinessPage=true |
| Additional Notes | `#AdditionalNotes` | textarea | optional, rows=4, maxlength=2000 |
| Additional Notes Counter | `#additionalNotesCount` | span | character count |

> **Note**: The entire Facebook section (`.facebookSection`) is only rendered when `Model.HasFacebookChannel = true`. Instagram references exist in the model but no separate UI section was found in `_Step3CampaignDetails.cshtml`.

## 8. Step 4 - Review & Submit Selectors

| Element | Selector | Notes |
|---|---|---|
| Review: First Name | `#review_FirstName` | Read-only display |
| Review: Last Name | `#review_LastName` | |
| Review: Primary Email | `#review_PrimaryContactEmail` | |
| Review: Phone | `#review_ContactPhoneNumber` | |
| Review: Lead Email | `#review_LeadDestinationEmail` | Falls back to primary email |
| Review: Ads Phone | `#review_PhoneNumberToDisplayInAds` | Falls back to contact phone |
| Review: Business Name | `#review_BusinessName` | |
| Review: Street | `#review_StreetAddress` | |
| Review: City | `#review_City` | |
| Review: State | `#review_StateProvince` | |
| Review: Zip | `#review_ZipCode` | |
| Review: Business Email | `#review_Email` | |
| Review: Website URL | `#review_WebsiteUrl` | |
| Review: Business Logo | `#review_BusinessLogo` | "Yes" / "No" |
| Review: Package Name | `#review_PackageName` | |
| Review: Start Date | `#review_StartDate` | "MMMM dd, yyyy" or "-" |
| Review: Service Area | `#review_ServiceArea` | |
| Review: Accuracy | `#review_WebsiteAccuracyConfirmed` |  icon + "Yes" / ✗ icon + "No" |
| Review: Landing URLs | `#review_PreferredLandingPageUrls` | |
| Review: Facebook | `#review_FacebookBusinessPage` | "Yes" / "No" |
| Review: Facebook URL | `#review_FacebookBusinessPageUrl` | Only shown if HasFacebook=true |
| Review: Notes | `#review_AdditionalNotes` | "-" if empty |
| Terms Accepted | `#TermsAccepted` | required checkbox |
| Terms & Conditions Modal | `#termsConditionsModal` | Bootstrap modal |
| Terms Link | `[data-target="#termsConditionsModal"]` | Opens modal |

## 9. Navigation Buttons

| Button | Selector | Behaviour |
|---|---|---|
| Back | `#btnBack` | Goes to previous step; hidden on step 1 |
| Next / Continue | `#btnContinue` | Advances wizard step; hidden on last step |
| Cancel | `a.btnBordered[href]` | Returns to `Model.ReturnUrl` (default: `/EngageAds/OrderHistory`) |
| Submit | `#btnSubmit` | Visible on last step only; submits form |

Submit button label:
- New submission: "Submit Campaign Order"
- Edit mode with CampaignSetupSeq: "Update Campaign Setup"

## 10. Hidden Form Fields

| Field | Selector |
|---|---|
| OrderSeq | `input[name="CampaignIntake.OrderSeq"]` |
| OrderNumber | `input[name="CampaignIntake.OrderNumber"]` |
| PackageName | `input[name="CampaignIntake.PackageName"]` |
| PackageAmount | `input[name="CampaignIntake.PackageAmount"]` |
| CampaignSetupSeq | `input[name="CampaignIntake.CampaignSetupSeq"]` |

## 11. Redirect Countdown (Expired State)

| Element | Selector | Notes |
|---|---|---|
| Countdown span | `#redirectCountdown` | Counts down from 5 |
| Fallback button | `a.btnFill[href="/EngageAds/BundledAdPackages"]` | Manual escape in expired state |

## 12. Key JavaScript Behaviours

- `initializeCampaignSetupWizard(countryCodes, phoneMasks, mobileMasks, selectedCountry)` - initializes wizard and phone masking
- Wizard steps are jQuery Steps plugin (`$(".commonWizard").steps(...)`)
- `goToStep(index)` - jump directly to a wizard step (used by review edit buttons)
- `#facebookUrlSection` toggled based on `#HasFacebookYes` / `#HasFacebookNo` radio selection
- `#additionalNotesCount` updated on keyup of `#AdditionalNotes`
- Auto-redirect countdown via `setInterval` in expired state
