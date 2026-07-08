# DeerAd Builder — Asset Upload — Business Rules Catalog
**Generated:** 2026-07-08

---

## Business Rules Extracted & Cataloged

### BR-001: Page Access Requires Authentication
- **Category:** Security
- **Source:** frmAssetUpload.aspx.cs — `CommonClass.IsPageValidForDealers()`
- **Evidence:** BasePage redirect on failed auth check
- **Description:** Unauthenticated users are redirected to login
- **Test Priority:** Critical (P1)

### BR-002: Display Name Required
- **Category:** Validation
- **Source:** jsAssetUpload.js — jQuery Validate required rule
- **Evidence:** Form error "Please enter display name." shown on submit
- **Description:** Display Name field must be filled before submit
- **Test Priority:** High (P2)

### BR-003: Display Name Character Validation
- **Category:** Validation
- **Source:** jsAssetUpload.js — custom validator `displayNameValid`
- **Evidence:** Error "Display name contains invalid characters." if special chars present
- **Description:** Only alphanumeric, spaces, underscore, `.,-&()™'` allowed
- **Test Priority:** High (P2)

### BR-004: Asset Type Auto-Detection by File Extension
- **Category:** Business Logic
- **Source:** hnAssetUpload.ashx.cs — `Uploadfile()` method
- **Evidence:** Asset Type dropdown populated after upload
- **Description:** File extension `.jpg/.png/.tif/.eps/.gif` → "IM" (Image); `.avi/.mov/.mp4/.wmv` → "VC" (Video)
- **Test Priority:** Critical (P1)

### BR-005: Thumbnail Generation on Image Upload
- **Category:** Business Logic
- **Source:** hnAssetUpload.ashx.cs — thumbnail creation for images
- **Evidence:** Thumbnail preview shown in `.uploadView` after upload
- **Description:** All images generate 150x150 thumbnail; aspect ratio preserved
- **Test Priority:** High (P2)

### BR-006: Video Conversion to Low-Res MP4
- **Category:** Business Logic
- **Source:** hnAssetUpload.ashx.cs — FFMpeg video conversion
- **Evidence:** Low-res MP4 available in download options
- **Description:** Videos converted to MP4 at 640x480; low-res variant generated
- **Test Priority:** High (P2)

### BR-007: Tracking Number Required (Region 1 Only)
- **Category:** Validation (Region-Dependent)
- **Source:** jsAssetUpload.js — conditional required rule; frmAssetUpload.aspx `#dvTracking.hide` for Region 2
- **Evidence:** Error "Please enter tracking# from 5 to 20 characters." shown for Region 1
- **Description:** Region 1 (NA): 5-20 alphanumeric chars required; Region 2 (AU): hidden field
- **Test Priority:** High (P2)

### BR-008: Customer Segment AI-Matched (Region 1 Only)
- **Category:** AI/Business Logic
- **Source:** hnAssetUpload.ashx.cs — AI analysis integration; jsAssetUpload.js field population
- **Evidence:** Customer Segment auto-selected after Region 1 image upload
- **Description:** Region 1 images: AI analysis matches customer segment with ≥75% word-match threshold; Region 2: hidden
- **Test Priority:** Medium (P3)

### BR-009: Product Segment Required (Region 1 Only)
- **Category:** Validation (Region-Dependent)
- **Source:** jsAssetUpload.js — conditional required; frmAssetUpload.aspx `#lstProductSegment.hide` for Region 2
- **Evidence:** Error "Please select product segment." shown for Region 1 radio group
- **Description:** Region 1: required radio button selection; Region 2: hidden
- **Test Priority:** High (P2)

### BR-010: Color Field Required for Images
- **Category:** Validation
- **Source:** jsAssetUpload.js — conditional required if asset type = Image
- **Evidence:** Error "Please select color." when image selected but color empty
- **Description:** Images only; dropdown populated from client config; Region 1 required, Region 2 hidden
- **Test Priority:** High (P2)

### BR-011: Setting (Environment/Studio) Required for Images
- **Category:** Validation
- **Source:** jsAssetUpload.js — conditional required if asset type = Image; frmAssetUpload.aspx `#assetSetting.hide` for videos/Region 2
- **Evidence:** Error "Please select setting." shown for images
- **Description:** Images only; dropdown options: Environment (E), Studio (S); Region 1 AI-suggested, Region 2 hidden
- **Test Priority:** High (P2)

### BR-012: Image ID/Media Bin Required & Unique (Per Upload)
- **Category:** Validation
- **Source:** jsAssetUpload.js — custom validator `unique` per field
- **Evidence:** Error "Please enter unique image id." if duplicates exist in upload
- **Description:** Up to 5 fields; each required, alphanumeric, must be unique within upload; Region 1 label "Image ID", Region 2 label "Media Bin #"
- **Test Priority:** High (P2)

### BR-013: Locale Required (Multi-Select)
- **Category:** Validation
- **Source:** jsAssetUpload.js — required rule on locale checkboxes
- **Evidence:** Error "Please select locale." if no locales checked
- **Description:** At least one locale must be selected; dynamic checkboxes per client config
- **Test Priority:** High (P2)

### BR-014: Division Required (Multi-Select)
- **Category:** Validation
- **Source:** jsAssetUpload.js — required rule on division checkboxes
- **Evidence:** Error "Please select division." if no divisions checked
- **Description:** At least one division must be selected; Region 1: AI-matched (>50% threshold), Region 2: first only
- **Test Priority:** High (P2)

### BR-015: Tree Category (Folder) Required
- **Category:** Validation
- **Source:** jsAssetUpload.js — custom validator on tree checkbox
- **Evidence:** Error "Please select category." if no folder selected
- **Description:** Exactly one folder must be selected from asset tree
- **Test Priority:** High (P2)

### BR-016: Asset File Upload Required
- **Category:** Validation
- **Source:** jsAssetUpload.js — required rule on Dropzone
- **Evidence:** Error "Please select asset file." if form submitted without upload
- **Description:** File must be uploaded before submit; Dropzone configured for single file
- **Test Priority:** Critical (P1)

### BR-017: File Extension Whitelist
- **Category:** Security/Validation
- **Source:** hnAssetUpload.ashx.cs — extension validation in `Uploadfile()`
- **Evidence:** Upload fails if extension not in whitelist
- **Description:** Allowed: `.jpg,.png,.jpeg,.tif,.tiff,.eps,.gif,.avi,.mov,.mp4,.wmv`; others rejected
- **Test Priority:** Critical (P1)

### BR-018: File Name Sanitization
- **Category:** Security
- **Source:** hnAssetUpload.ashx.cs — `CommonClass.SanitizeFileName()`
- **Evidence:** Original file name logged; sanitized name used for storage (Adbuilderfile_dd_MM_yy_HHmmss.ext)
- **Description:** Prevents path traversal & injection attacks; timestamp-based naming prevents collisions
- **Test Priority:** High (P2)

### BR-019: Status Active/Inactive/Date Range
- **Category:** Workflow
- **Source:** jsAssetUpload.js — conditional show/hide of date fields; hnAssetUpload.ashx.cs — SaveAssetData
- **Evidence:** Release Date & End Date fields shown only when Status = 2 (Date Range)
- **Description:** Status 1=Active (immediate), 0=Inactive (hidden), 2=Date Range (requires start/end dates)
- **Test Priority:** High (P2)

### BR-020: End Date > Release Date Validation
- **Category:** Validation
- **Source:** jsAssetUpload.js — custom validator `greaterThan`
- **Evidence:** Error "End date should be greater than release date." if End ≤ Release
- **Description:** When Status = Date Range, End Date must be ≥ Release Date; no past dates allowed
- **Test Priority:** High (P2)

### BR-021: Email Address Format Validation (Manual Emails)
- **Category:** Validation
- **Source:** jsAssetUpload.js — custom validator `custom_method_one`
- **Evidence:** Error "Please enter email(s) (separated with semicolon)." if invalid format
- **Description:** Multiple emails separated by semicolon (`;`); each must be valid email format
- **Test Priority:** Medium (P3)

### BR-022: Keyword/Tag Management (Min 2 Chars, Max 1000/Tag)
- **Category:** Validation
- **Source:** jsAssetUpload.js — tag input validation on Enter/comma
- **Evidence:** Tag rejected if <2 chars or >1000 chars; prevents duplicates & flagged tags
- **Description:** User-entered or AI-generated; stored in hidden input; tag removal available; context menu for flag-as-irrelevant
- **Test Priority:** Medium (P3)

### BR-023: Keyword/Tag Uniqueness Check
- **Category:** Business Logic
- **Source:** jsAssetUpload.js — tag array uniqueness check
- **Evidence:** Error "This tag already exists." if duplicate entered
- **Description:** Prevents duplicate tags; flagged tags ("irrelevant") also excluded
- **Test Priority:** Medium (P3)

### BR-024: AI Keyword Suggestions (Region 1, Non-GIF Images)
- **Category:** AI Feature
- **Source:** hnAssetUpload.ashx.cs — Azure Computer Vision API integration
- **Evidence:** AI keywords auto-populated in tags field after Region 1 image upload
- **Description:** Region 1 non-GIF images: AI analysis generates keywords (confidence > 0.60); Region 2 & GIFs: disabled
- **Test Priority:** Low (P4)

### BR-025: New Asset Sends Notification Email
- **Category:** Workflow
- **Source:** hnAssetUpload.ashx.cs — `EmailNotification.SendEmailNotification()` post-insert
- **Evidence:** Email template parameters populated (title, tracking #, media bin, model #, division, dates, uploader, thumbnail)
- **Description:** On successful new asset save: email sent if notification group configured or manual emails provided
- **Test Priority:** High (P2)

### BR-026: Edit Mode Hides Uploader, Shows Details
- **Category:** UI/Workflow
- **Source:** jsAssetUpload.js — document ready check for `Assetid` URL param
- **Evidence:** Initial upload dropzone hidden; asset details form shown if `Assetid` query param present
- **Description:** Edit mode triggered by URL param `?Assetid={encrypted_id}`; shows asset details, hides uploader
- **Test Priority:** High (P2)

### BR-027: Save & Duplicate Workflow
- **Category:** Workflow
- **Source:** jsAssetUpload.js — "Save & Duplicate" button handler
- **Evidence:** Button appears after successful new asset save; allows re-upload while keeping metadata
- **Description:** New assets only; after save success, shows "Save & Duplicate" button; enables uploader for new file with same metadata
- **Test Priority:** Medium (P3)

### BR-028: Asset Record INSERT on Save
- **Category:** Data Persistence
- **Source:** hnAssetUpload.ashx.cs — `InsertAsset()` stored procedure call
- **Evidence:** Asset appears in asset list after save success
- **Description:** SaveAssetData handler calls InsertAsset SP with 35+ parameters; returns asset ID on success
- **Test Priority:** Critical (P1)

### BR-029: Post-Upload Image Conversions
- **Category:** Business Logic
- **Source:** hnAssetUpload.ashx.cs — image conversion methods (JPG, PNG, TIFF, EPS)
- **Evidence:** Multiple file formats available in download options after save
- **Description:** After successful insert: EPS conversion, TIFF archive, JPG web, Low-Res download generated asynchronously
- **Test Priority:** Medium (P3)

### BR-030: Admin-Only Flag Restricts Visibility
- **Category:** Security
- **Source:** jsAssetUpload.js — `isAdmin` checkbox; hnAssetUpload.ashx.cs — `AdminOnly` parameter
- **Evidence:** Checkbox toggles whether asset visible only to admins
- **Description:** If checked: asset hidden from dealers; visible to admin/owner only
- **Test Priority:** Medium (P3)

### BR-031: New Asset Shows "Save & New" Button
- **Category:** UI/Workflow
- **Source:** jsAssetUpload.js — "Save & New" button rendered on success response `""`
- **Evidence:** After save success on new asset, "Save & New" button shown (vs "Update" for edit)
- **Description:** New asset save returns empty string; enables "Save & New" for continuous asset creation
- **Test Priority:** Medium (P3)

### BR-032: Region-Based UI Variations
- **Category:** UI/Configuration
- **Source:** frmAssetUpload.aspx.cs — `Default_region` variable; jsAssetUpload.js — conditional hiding
- **Evidence:** Region 1 shows: Tracking #, Customer Segment, Product Segment, Color, Setting, AI icons; Region 2 hides all
- **Description:** Region 1 (NA) = enhanced features with AI; Region 2 (AU) = simplified UI
- **Test Priority:** High (P2)

---

## Business Rules by Category

### Validation Rules: 14 rules
BR-002, BR-003, BR-007, BR-009, BR-010, BR-011, BR-012, BR-013, BR-014, BR-015, BR-016, BR-020, BR-021, BR-022, BR-023

### Business Logic Rules: 7 rules
BR-004, BR-005, BR-006, BR-024, BR-028, BR-029, BR-032

### Workflow Rules: 4 rules
BR-019, BR-025, BR-026, BR-027, BR-031

### Security Rules: 3 rules
BR-001, BR-017, BR-018, BR-030

### Data Persistence: 1 rule
BR-028

---

## Business Rules Coverage Summary

| Category | Count | Coverage |
|---|---|---|
| Security | 4 | Access control, file extension whitelist, name sanitization, admin-only flag |
| Validation | 14 | Required fields, formats, ranges, email, dates, tags |
| Business Logic | 7 | Auto-detection, thumbnail/video conversion, AI features, image conversions |
| Workflow | 5 | Status lifecycle, notifications, edit mode, save & duplicate, new asset UI |
| Data Persistence | 1 | Asset INSERT on save |
| **Total** | **32** | All major functional areas covered |

---

