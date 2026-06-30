# EngageAds — Campaign Setup — Repository Analysis

Generated: 2026-06-19 | Pipeline: Step 1 (Repository Analysis)

## 1. Feature Identity

| Property | Value |
|---|---|
| Module | engage-ads |
| Feature | campaign-setup |
| Feature Label | Campaign Setup |
| URL | `/EngageAds/CampaignSetup` |
| Source File | `Pages/EngageAds/CampaignSetup.cshtml` |
| Code-Behind | `Pages/EngageAds/CampaignSetup.cshtml.cs` |
| Page Model | `Web.Pages.EngageAds.CampaignSetupModel` |
| Base Class | `BasePageModel` (requires authentication) |
| JS File | `wwwroot/WebScripts/EngageAds/jsCampaignSetup.js` |
| Localization JS | `wwwroot/WebScripts/LocalizationJS/Localizationjs.js` |

## 2. Authentication & Authorization

- **Auth Required**: Yes — inherits `BasePageModel`; unauthenticated users redirected to `/Account/Login`
- **Role-Based Access**:
  - `Admin` and `ChannelFusionAdmin` can access any order's campaign setup
  - `Dealer` can only access orders belonging to their own `dealer_number_seq`
  - Unauthorized access redirects to `/Security/AccessDenied` with an error notification

## 3. Partials (4-Step Wizard)

| Step | Partial | Required Fields |
|---|---|---|
| 1 — Primary Contact | `_Step1PrimaryContact.cshtml` | FirstName, LastName, PrimaryContactEmail, ContactPhoneNumber |
| 2 — Business Details | `_Step2BusinessDetails.cshtml` | BusinessName, StreetAddress, City, StateProvince, ZipCode, Email, WebsiteUrl |
| 3 — Campaign Details | `_Step3CampaignDetails.cshtml` | ServiceArea, WebsiteAccuracyConfirmed |
| 4 — Review & Submit | `_Step4ReviewSubmit.cshtml` | TermsAccepted |

## 4. Bound Model — `CampaignIntakeModel`

### Step 1 — Primary Contact
| Field | Type | Required | Max Length | Notes |
|---|---|---|---|---|
| FirstName | string | ✅ | 50 | |
| LastName | string | ✅ | 50 | |
| PrimaryContactEmail | string (email) | ✅ | 100 | |
| ContactPhoneNumber | string | ✅ | — | Phone mask (clsPhoneMaskMobileLandline); cleaned via `CleanPhoneNumber()` |
| LeadDestinationEmail | string (email) | ❌ | 100 | Falls back to PrimaryContactEmail in review |
| PhoneNumberToDisplayInAds | string | ❌ | — | Falls back to ContactPhoneNumber in review |

### Step 2 — Business Details
| Field | Type | Required | Max Length | Notes |
|---|---|---|---|---|
| BusinessName | string | ✅ | 100 | Appears in ads |
| StreetAddress | string | ✅ | 100 | |
| AddressLine2 | string | ❌ | 100 | |
| City | string | ✅ | 50 | |
| StateProvince | string | ✅ | 2 | |
| ZipCode | string | ✅ | 10 | |
| Email | string (email) | ✅ | 100 | Business email |
| BusinessLogoFileName | string (hidden) | ❌ | — | Set by UploadLogo handler |
| BusinessLogoPath | string (hidden) | ❌ | — | Permanent URL after submit |
| WebsiteUrl | string (url) | ✅ | 200 | Pattern: `https?://.+` |

### Step 3 — Campaign Details
| Field | Type | Required | Max Length | Notes |
|---|---|---|---|---|
| DesiredCampaignStartDate | DateTime? | ❌ | — | Datepicker, MM/DD/YYYY |
| ServiceArea | string | ✅ | 2400 | Defaults to 15-mile radius if blank |
| WebsiteAccuracyConfirmed | bool | ✅ | — | Must check to continue |
| PreferredLandingPageUrls | string | ❌ | — | One URL per line |
| HasFacebookBusinessPage | bool | ❌ | — | Shown only when `HasFacebookChannel=true` |
| FacebookBusinessPageUrl | string (url) | Conditional | — | Required when `HasFacebookBusinessPage=true` |
| AdditionalNotes | string | ❌ | 2000 | Character counter shown |

### Step 4 — Review & Submit
| Field | Type | Required | Notes |
|---|---|---|---|
| TermsAccepted | bool | ✅ | Terms and Conditions checkbox; enables submit |

### Hidden Fields
| Field | Notes |
|---|---|
| OrderSeq | Bound from TempData / URL orderSeq |
| OrderNumber | Bound from TempData / DB |
| PackageName | Bound from TempData / DB |
| PackageAmount | Bound from TempData / DB |
| CampaignSetupSeq | Populated when editing an existing setup |

## 5. Handlers

| Handler | Method | Route | Description |
|---|---|---|---|
| `OnGetAsync(orderSeq, returnUrl)` | GET | `/EngageAds/CampaignSetup?orderSeq=<encrypted>` | Loads order, checks edit window, pre-populates form |
| `OnPostAsync()` | POST | `/EngageAds/CampaignSetup` | Creates or updates campaign setup |
| `OnPostUploadLogo(logo)` | POST | `?handler=UploadLogo` | Uploads logo to temp folder, returns JSON |

## 6. Service Calls

| Service Method | When Called |
|---|---|
| `GetOrderDetailsBySeqAsync(orderSeq)` | GET — load order info, verify authorization |
| `GetCampaignSetupByOrderSeqAsync(orderSeq)` | GET — check if setup exists; load for edit |
| `GetPackageChannelsByOrderSeqAsync(orderSeq)` | GET — determine Facebook/Instagram channel availability |
| `SubmitCampaignSetupAsync(request)` | POST — create new campaign setup |
| `UpdateCampaignSetupAsync(request)` | POST — update existing campaign setup |

## 7. Entry Points

| Source | How Navigated |
|---|---|
| Post-payment (Stripe flow) | `TempData["PaymentResponse"]` set by Payment page; auto-loads order info |
| Direct link (edit mode) | `?orderSeq=<encrypted>` in query string |
| Order History page | Edit link per order |

## 8. Exit Points / Redirects

| Condition | Destination |
|---|---|
| No order info (no TempData, no orderSeq) | `/EngageAds/BundledAdPackages` |
| Invalid/undecryptable orderSeq | `/EngageAds/BundledAdPackages` |
| Order not found | `/EngageAds/OrderHistory` with error notification |
| Unauthorized access | `/Security/AccessDenied` with error notification |
| Edit window expired (GET) | `/EngageAds/OrderHistory` with error notification |
| Edit window expired (POST) | `Page()` with `EDIT_WINDOW_EXPIRED` model error |
| Successful submit/update | `/EngageAds/OrderConfirmation` |

## 9. Logo Upload Contract

- **Endpoint**: `POST ?handler=UploadLogo`
- **Field Name**: `logo` (IFormFile)
- **Allowed Types**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`
- **Max Size**: 5 MB
- **Temp Storage**: `Temp/` folder; moved to `EngageAds/Logos/` on form submit
- **Success Response**: `{ success: true, fileName, fileUrl, fileSize }`
- **Failure Response**: `{ success: false, message }`

## 10. Edit Window Logic

- Edit window duration: 72 hours from `SubmittedDate` (configurable via `EditWindowHours`)
- Within window + submitted → `IsEditMode=true`, `CanEdit=true`, edit alert shown
- Beyond window → `IsExpired=true`, countdown timer → auto-redirect to OrderHistory after 5 seconds
- Not yet submitted → always editable (`CanEdit=true`, no expiry)
- Both Admin and Dealer users subject to same 72-hour window

## 11. Security Controls

- `IEncryptDecrypt` used for `orderSeq` in query string
- Phone numbers sanitized by `CleanPhoneNumber()` before persistence
- Logo filename sanitized (regex strips special chars, spaces → underscores)
- `ModelState.IsValid` checked before POST processing
- Authorization double-checked: server-side (`GetOrderDetailsBySeqAsync`) + frontend (`DealerNumberSeq` comparison)
