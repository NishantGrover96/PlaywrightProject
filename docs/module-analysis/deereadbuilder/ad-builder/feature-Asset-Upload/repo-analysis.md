# DeerAd Builder - Asset Upload - Repository Analysis Report
**Generated:** 2026-07-08  
**Module:** DeerAd Builder (ad-builder)  
**Feature:** Asset Upload (frmassetupload)  
**Client:** deereadbuilder

---

## Source Files Analyzed

| File | Layer | Location | Purpose |
|---|---|---|---|
| frmAssetUpload.aspx | UI / View | `AdBuilder/DAL/` | Upload form with asset details fields, validation, file dropzone |
| frmAssetUpload.aspx.cs | Code-Behind | `AdBuilder/DAL/` | Page initialization, session validation, asset ID decryption |
| hnAssetUpload.ashx.cs | HTTP Handler | `AdBuilder/DAL/Handler/` | File upload processing, AI analysis, asset metadata extraction, notifications |
| jsAssetUpload.js | Client-Side Logic | `AdBuilder/DAL/JS/` | Form interaction, dropzone upload, tag management, dynamic UI show/hide |

---

## UI / Form Fields

| Field Name | Type | Required | Label/ID | Max Length | Region Scope | Notes |
|---|---|---|---|---|---|---|
| Display Name | Text Input | Yes | `assetName` | 140 | All | Alphanumeric + common symbols; AI auto-populated |
| Additional Description | Text Input | No | `assetDec` | 140 | All | Optional metadata field |
| Asset Type | Dropdown | Yes | `assetType` | - | All | Image (IM) or Video (VC); auto-detected by file extension |
| Tracking # | Text Input | Yes* | `assetTracking` | 20 | Region 1 (NA) only | 5-20 alphanumeric; required for Region 1, hidden for Region 2 |
| Model # | Text Input | Yes | `assetModel` | 20 | All | AI auto-populated for Region 1 |
| Customer Segment | Dropdown | Yes* | `assetCustomerSeg` | - | Region 1 (NA) only | AI-matched; ≥75% word-match threshold |
| Product Segment | Radio Button Group | Yes* | `lstProductSegment` | - | Region 1 (NA) only | Visible only for Region 1; multiple options |
| Color | Dropdown | Yes* | `assetColor` | - | Region 1 (NA) + Images | Populated from client config; hidden for videos or Region 2; AI-detected |
| Image ID / Media Bin # | Text Input (Repeating) | Yes* | `imageId` (5 fields) | 45 each | Images only | Region 1: "Image ID"; Region 2: "Media Bin #"; alphanumeric |
| Setting | Dropdown | Yes* | `assetSetting` | - | Region 1 (NA) + Images | "Environment" (E) or "Studio" (S); hidden for Region 2 or videos; AI-suggested |
| Status | Dropdown | Yes | `assetStatus` | - | All | Active (1), Inactive (0), Date Range (2) |
| Release Date | Date Picker | Yes* | `txtpostdt` | - | All (if Date Range) | MM/DD/YYYY format; shown only if Status = 2 (Date Range); no past dates |
| End Date | Date Picker | Yes* | `txtremdt` | - | All (if Date Range) | MM/DD/YYYY format; shown only if Status = 2; must be ≥ Release Date |
| Admin Only | Checkbox | No | `isAdmin` | - | All | Restricts visibility to admin users only |
| Keywords / Tags | Contenteditable Div | No | `suggKeyword` / `hiddenTags` | 1000 per tag | All | User-entered or AI-generated; comma-separated; tag management UI with remove buttons |
| Locale | Checkbox Group | Yes | `assetLocale` | - | All | Multi-select; options from client config; defaults to all |
| Division | Checkbox Group | Yes | `assetDivision` | - | All | Multi-select; AI auto-matched or user-selected; Region 1: smart-match, Region 2: first only |
| Collection | Checkbox Group | No | `assetCollection` | - | All (if Collections exist) | Multi-select; populated dynamically per selected locale; optional |
| Asset File Upload | Dropzone | Yes | `dZUploadImageFile` (change: `dZChangeImageFile`) | 9999 MB | All | Single file; drag & drop or click to select; auto-detects type |
| Notify Groups (UserControl) | Multi-Checkbox | No | `ucEmailNotification` | - | All (new assets) | Optional email notification recipients on asset creation |
| Manually Add Email | Text Input | No | `assetManuallyEmail` | - | All (new assets) | Semicolon-separated email addresses; bypasses preset groups |

---

## API / Handler Endpoints

**Handler Path:** `AdBuilder/DAL/Handler/hnAssetUpload.ashx`

| Action | HTTP Method | Parameters | Return Type | Purpose | Auth |
|---|---|---|---|---|---|
| GetAssetType | POST | None | JSON Array | Fetch asset type master list (Image/Video) for program | Session |
| get_ClientConfig_details | POST | None | JSON Object | Fetch client-specific config (divisions, segments, colors, locales) | Session |
| GetCollectionsByLocale | POST | `locale` | JSON Array | Fetch campaigns/collections for comma-separated locales | Session |
| Uploadfile | POST | `Filedata` (multipart) + `folderpath` | JSON (AssetDTO) | Upload & process file; detect type; generate thumbnails; run AI analysis | Session |
| SaveAssetData | POST | 30+ metadata fields (see below) | Plain text: `"0"`, `""`, or error | Validate & insert/update asset to database; send notifications | Session |
| GetAssetDetail | POST | `Assetid` | JSON (AssetDTO) | Retrieve existing asset metadata (edit mode) | Session |
| SaveirrelevantTag | POST | `TagName`, `TagType` | Plain text (status) | Flag AI/user tags as irrelevant; prevent future suggestions | Session |

**SaveAssetData Key Parameters:**
- Core: `assetType`, `color`, `status`, `adminOnly`, `assetid` (0=new), `fileSize_KB`
- Content: `DisplayName`, `Description`, `keyword` (user tags), `AIGeneratedKeyword` (AI tags)
- Metadata: `customerSegment`, `setting`, `locale`, `division`, `collection`, `trackingNo`, `modelNo`, `imageIdValues`
- Dates: `postdt`, `removedt` (if Status=2)
- File paths: `uploaded_file_name`, `asset_file_name`, `thumbnail_file_name`, `low_res_file_name`, `file_ext`
- Region: `Region_FK`, `Locale_FK`, `Default_region`

---

## Business Rules

### File Type & Size
- **Supported Image Formats:** `.jpg`, `.png`, `.jpeg`, `.tif`, `.tiff`, `.eps`, `.gif`
- **Supported Video Formats:** `.avi`, `.mov`, `.mp4`, `.wmv`
- **Max File Size:** 9,999 MB
- **Auto-Detection:** Extension -> "IM" (Image) or "VC" (Video)
- **Invalid Extensions:** `.exe`, `.bat`, `.asp`, etc. (rejected)

### Asset Type Conversion Rules
| Source Format | Actions |
|---|---|
| `.jpg`, `.png`, `.jpeg` | Generate 150x150 thumbnail; low-res version; extract width, height, DPI |
| `.tif`, `.tiff` | Convert to PNG; generate thumbnail; preserve DPI; handle transparency (checkerboard overlay) |
| `.eps` | Convert to JPG (ImageMagick, 144 DPI); treat as graphic preview |
| `.gif` | Generate thumbnail; extract dimensions; skip AI analysis |
| Video (`.avi`, `.mov`, `.mp4`, `.wmv`) | Convert to MP4 (FFMpeg); extract duration; create frame thumbnail at 1-2 sec |

### Region-Based Rules

| Feature | Region 1 (NA) | Region 2 (Australia) |
|---|---|---|
| Customer Segment | Required, AI-matched | Hidden; N/A |
| Tracking # | Required (5-20 alphanumeric) | Hidden; N/A |
| AI Analysis | Yes (non-GIF images) | No; disabled |
| Product Segment | Required (radio buttons) | Hidden |
| Color Field | Required (images) | Hidden; defaults to "Color" |
| Setting Field | Required (images) | Hidden; defaults to "Environment" |
| Image ID Label | "Image ID" | "Media Bin #" |
| Division Selection | AI-matched (>50% threshold) | Manual; first checkbox only |
| AI Icons Display | Yes (visible) | No (hidden) |

### Status & Availability
- **Active (1):** Immediately available; no date range
- **Inactive (0):** Not available; no date range
- **Date Range (2):** Available from Release Date 12:00 AM CT to End Date 11:59 PM CT
  - End Date must be ≥ Release Date

### AI Features (Region 1, Non-GIF Images Only)
- **Services Used:** Azure Computer Vision API + Custom Vision API
- **Auto-Generated Fields:** Display Name, Keywords, Color, Setting, Customer Segment, Division
- **Keyword Filtering:**
  - User-entered tags override AI suggestions
  - Flagged tags prevented from future suggestions
  - Keyword relevance threshold: minimum 2 characters, max 1000 per tag
- **Matching Algorithm:**
  - Customer Segment: ≥75% word-match threshold
  - Division: >50% word-match; if no match & new asset, select all divisions
  - Color Detection: Maps to "Color" or "Black & White"

### Edit vs. New Asset Behavior
| Scenario | New Asset | Existing Asset |
|---|---|---|
| Upload UI | Visible (dropzone shown) | Hidden initially (change asset option only) |
| Metadata Form | Side-by-side with uploader | Immediate display |
| Notification | Sent if configured | Not sent on update |
| Save Option | "Save & Duplicate" or "Save & New" | "Update" button only |
| DB Operation | INSERT new record | UPDATE existing record |

---

## Validation Rules

### Client-Side Validation (jQuery Validate Plugin)

| Field | Validation Rule(s) | Error Message | Client / Server |
|---|---|---|---|
| Display Name | Required; valid chars (alphanumeric + symbols) | "Please enter display name." / "Display name contains invalid characters." | Both |
| Model # | Required; alphanumeric | "Please enter model #." | Client |
| Tracking # | Required (if Region 1); 5-20 chars; alphanumeric | "Please enter tracking # from 5 to 20 characters." / "Tracking # must be alphanumeric." | Client |
| Image ID (each) | Required; alphanumeric; unique per upload | "Please enter image id." / "Please enter unique image id." / "Image ID must be alphanumeric." | Client |
| Color | Required (if image) | "Please select color." | Client |
| Setting | Required (if image) | "Please select setting." | Client |
| Division | Required; at least one checkbox | "Please select division." | Client |
| Locale | Required; at least one checkbox | "Please select locale." | Client |
| Customer Segment | Required (if Region 1) | "Please select customer segment." | Client |
| Product Segment | Required (if Region 1) | "Please select product segment." | Client |
| Status Dates (if Date Range) | Release Date required; valid format (MM/DD/YYYY); End Date ≥ Release Date | "Please enter release date (mm/dd/yyyy)." / "End date should be greater than release date." | Client |
| Tree Category | Required; exactly one folder selected | "Please select category." | Client |
| Asset File | Required; valid extension | "Please select asset file." / "File type not allowed." | Client |
| Email (manual) | Valid email format; multiple separated by semicolon | "Please enter a valid email." (regex per email) | Client |
| Keywords / Tags | Each tag: 2-1000 chars; no duplicates; not flagged irrelevant | "Please enter valid keyword." / "A maximum of 1000 characters is allowed per tag." / "This tag already exists." / "This tag is flagged as irrelevant." | Client |

### File Name Validation (Server-Side)
- **Check:** `CommonClass.ValidFileName()` prevents path traversal & injection
- **Sanitization:** `CommonClass.SanitizeFileName()` replaces unsafe chars
- **Final Format:** `Adbuilderfile_{dd_MM_yy_HHmmss}.{ext}` (timestamp prevents collisions)
- **Logged:** Original filename for audit trail

### Email Validation (Multiple)
- **Regex:** `/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/`
- **Separator:** Semicolon (`;`)
- **Rule:** All entries must be valid or entire field fails

### Date Validation
- **Format:** Locale-aware (e.g., "mm/dd/yyyy", "dd/mm/yyyy" per `lblDateFormat` variable)
- **Custom Regex:** Per format to validate actual date validity (e.g., no Feb 30)
- **Range:** No past dates (minDate: today); End Date ≥ Release Date

---

## Workflow / Status Transitions

| From Status | To Status | Trigger | Action | Notification |
|---|---|---|---|---|
| - | Active (1) | "Save & New" button | INSERT new asset with Active status | Email sent (if configured) |
| - | Inactive (0) | "Save & New" button | INSERT new asset with Inactive status | Email sent (if configured) |
| - | Date Range (2) | "Save & New" button + Release/End dates | INSERT new asset with Date Range status | Email sent (if configured) |
| Active/Inactive/Date Range | Active/Inactive/Date Range | "Update" button (edit) | UPDATE existing asset status | No email |
| (any) | - (Asset Deleted by Admin) | Admin action (external) | DELETE (not via this form) | Notification may vary |

---

## Database Operations

### Stored Procedure: InsertAsset
**Namespace:** `BIZ.AssetLibraryAI.AssetUpload_BIZ`

**Key Parameters:**
```
InsertAsset(
  int Program_FK,                           // User's program
  int AssetType_FK,                         // Image/Video type ID
  string Title,                             // Display Name
  string PostingDate,                       // Start date (yyyy-MM-dd) or NULL
  string RemovalDate,                       // End date (yyyy-MM-dd) or NULL
  string UploadedFileName,                  // Original filename
  string AssetFileName,                     // Sanitized (Adbuilderfile_dd_MM_yy_HHmmss.ext)
  string ThumbnailFileName,                 // Generated thumbnail
  string LowResFileName,                    // Low-res for download
  string FileExtension,                     // .jpg, .eps, .mp4, etc.
  int FileSize_KB,                          // Numeric file size
  int Color_FK,                             // Color ID (image-specific)
  int Height_PX,                            // Image/video height
  int Width_PX,                             // Image/video width
  string DPI,                               // Image DPI
  string Status_Code,                       // "1" (Active), "0" (Inactive), "2" (Date Range)
  string Description,                       // Additional description
  string MetaData,                          // Searchable concatenated string
  string Division,                          // Comma-separated division IDs
  int CreatedBy_UserID,                     // Audit trail
  string ImageIds,                          // Comma-separated Media Bin IDs
  string ModelNumber,                       // Model # field
  string Locale,                            // Comma-separated locale IDs
  string FolderPath,                        // Selected tree folder ID
  string Keyword,                           // User-entered keywords
  string Setting,                           // "E" (Environment) or "S" (Studio)
  int Region_FK,                            // 1=NA, 2=AU
  string CustomerSegment,                   // Customer segment ID
  string TrackingNumber,                    // Tracking # (Region 1 only)
  string CollectionIds,                     // Comma-separated campaign IDs
  string AIGeneratedKeyword,                // AI-suggested keywords
  int AdminOnly,                            // 1=Admin only, 0=Public
  int AssetId,                              // 0=New, >0=Edit
  string ProductSegment,                    // Product segment (Region 1 only)
  out string ErrorMessage                   // Return: "0" (success), "" (success), or error
)
```

**Returns:** 
- `"0"` = Success (new asset created)
- `""` (empty) = Success (edit/duplicate)
- Error message or code = Failure

### Post-Insert Image Processing (C# Code-Behind)
After successful InsertAsset:

| Source Format | Actions |
|---|---|
| EPS Conversion | Source JPG/PNG -> `.eps` file via `CommonClass.Convertepsto_jpg()` |
| TIFF Archive | Source non-TIF -> `.tif` file for long-term archival |
| JPG Web | Source non-JPG & non-GIF -> `.jpg` for web delivery |
| Low-Res Download | Source JPG -> `{filename}_Download_lowres.jpg` (custom client config dimensions) |

### Email Notification (New Assets Only)
- **Trigger:** On successful SaveAssetData if notification group or manual emails configured
- **Function:** `EmailNotification.SendEmailNotification()`
- **Email Template Keys:**
  - Region 1 (NA): `"ASSETADDNA"`
  - Region 2 (AU): `"ASSETADD"`
- **Template Parameters Passed:**
  - Asset metadata: `<<title>>`, `<<comment>>`, `<<Tracking_No>>`, `<<MediaBin>>`, `<<Model_Number>>`
  - Classification: `<<Language>>`, `<<Division>>`, `<<Online_Status>>`
  - Dates: `<<Start_Date>>`, `<<End_Date>>`
  - Audit: `<<Uploaded_By>>`
  - Attachments: `<<img_thumbnail>>`, `<<Isshared>>`, `<<footer1>>`, `<<footer2>>`
- **Recipients:**
  - Notification groups (via `assetNotifi` parameter)
  - Manual email addresses (via `assetManuallyEmail` parameter, semicolon-separated)

### Irrelevant Tag Tracking
- **Operation:** `InsertirrelevantTag(TagName, TagType, ModifiedBy_UserID)`
- **Purpose:** Prevent re-suggestion of user-rejected AI tags
- **Tag Types:** 
  - `"AIG-TT"` = AI-Generated Tag
  - `"UD-TT"` = User-Defined Tag

---

## Security Rules

### Access Control & Authentication
- **Page-Level:** Handler verifies dealer/admin role via `BasePage.CommonClass.IsPageValidForDealers()`
- **Request Handler:** Session validation via `CommonClass.ValidateSessionOrReturnError(context, "AssetLibraryAI", "hnAssetUpload")`
  - Returns error if session invalid or expired
  - Blocks all unauthenticated requests

### Session-Based Data Scoping
| Scope | Source | Effect |
|---|---|---|
| Program | `UserSession.Client_Admin.Program_number` | All assets filtered to user's program |
| Region | `UserSession.Default_Region_FK` | Region-specific UI & AI features |
| Locale | `UserSession.Default_Locale_FK` | Collection & notification locale filtering |
| Audit | `UserSession.Logged_UserID` | CreatedBy/ModifiedBy trail |
| User Type | `UserSession.User_Type` | "D"=Dealer notification behavior differs |

### File Name Security
- **Injection Prevention:** `CommonClass.ValidFileName()` rejects path traversal (e.g., `../../../etc/passwd`)
- **Sanitization:** `CommonClass.SanitizeFileName()` replaces unsafe characters
- **Naming Strategy:** `Adbuilderfile_{timestamp}.{ext}` prevents guessing & collisions
- **Extension Whitelist:** Only `.jpg`, `.png`, `.jpeg`, `.tif`, `.tiff`, `.eps`, `.gif`, `.avi`, `.mov`, `.mp4`, `.wmv`
- **Rejected Extensions:** `.exe`, `.bat`, `.asp`, `.aspx`, `.php`, `.js`, `.vbs`, etc.

### Folder Path Security
- **Request Parameter Validation:** Folder path from request cross-checked against user's permitted asset tree
- **Tree Constraint:** User can only select folders from their allowed asset folder hierarchy

### Data Isolation
- **Multi-Tenancy:** Program number ensures cross-client asset isolation
- **Regional Isolation:** Region FK prevents cross-region data leakage
- **Audit Compliance:** All creates/modifies include UserID, timestamp, action type

### Email Privacy
- **Manual Email Field:** Not pre-validated on form; regex check validates format
- **Notification Groups:** Selected from admin-configured predefined groups; no free-form entry

---

## Client-Side Behaviors (JavaScript)

### Page Initialization
1. Load asset tree structure from server
2. Fetch asset types (Image/Video master list)
3. Load client config (divisions, segments, colors, locales)
4. Initialize Dropzone file uploader on `#dZUploadImageFile`
5. Setup jQuery date pickers for Release & End dates
6. Load custom menu (optional)
7. If edit mode (URL param `Assetid`): Hide uploader, fetch & display asset details

### File Upload Workflow (Dropzone)
| Step | Action | Trigger |
|---|---|---|
| 1 | Init dropzone | Doc ready; max 1 file; auto-process on select |
| 2 | Show loader | Upload 100% complete |
| 3 | Remove file preview | Remove button clicked |
| 4 | Send AJAX POST | File selected; multipart to `hnAssetUpload.ashx?action=Uploadfile` |
| 5 | Parse response (AssetDTO) | Handler returns JSON with metadata & thumbnails |
| 6 | Display preview | Image/video preview in `.uploadView` div |
| 7 | Populate AI fields | Region 1 images: Title, Keywords, Color, Setting, Segment, Division |
| 8 | Show asset details form | Hide uploader (`.dvAssetUploader`); show form (`.nextPage`) |

### Post-Upload Response Processing
**Response JSON (AssetDTO) Contains:**
- File metadata: `TimeStamp`, `file_ext`, `Assettype`, `uploaded_file_name`, `asset_file_name`
- Image data: `file_size`, `height`, `width`, `img_dpi`, `thumbnail_file_name`, `low_res_file_name`
- AI (Region 1 only): `AIGeneratedKeyword`, `color`, `setting`, `CustomerSegment`
- Paths: `uploaded_file_path`, `thumbnail_file_path`

**UI Updates (OnCompletegetfiledetails):**
1. Store response in jQuery object: `$('#dvAssetDetail').data('UploadFileData', response)`
2. Display preview: image or video player in `.uploadView`
3. Show file title, size, resolution
4. **For Images (Region 1, non-GIF):**
   - Auto-populate AI fields (Customer Segment ≥75% match, Division >50% match)
   - Display AI-generated keywords as editable tags
   - Populate matching divisions
5. **For Videos:**
   - Hide AI fields, color, setting
   - Display video player
   - Set Asset Type to "AVC"
6. Check all locale checkboxes (default)
7. Populate collections per locale
8. Focus on Display Name field

### Tag Management System
| Element | Interaction | Action |
|---|---|---|
| `#suggKeyword` (contenteditable div) | Type + Enter or comma | Add tag if valid (2-1000 chars, no duplicate, not flagged) |
| `.tag span` | Content | Display tag text |
| `.remove-tag` (×) | Click | Show context menu (delete or flag as irrelevant) |
| Flag as Irrelevant | Click | AJAX to `SaveirrelevantTag`; remove from suggestions |
| Delete | Click | Remove from `#hiddenTags` hidden input |
| `#hiddenTags` (hidden input) | Auto-updated | Stores comma-separated tags for POST |

### Dynamic Field Show/Hide Triggers

| Trigger | Condition | Show | Hide |
|---|---|---|---|
| Document Load | URL param `Assetid` present | Asset details form | Upload dropzone |
| Document Load | URL param `Assetid` absent | Upload dropzone | Asset details form |
| Asset Type Change | "Image" selected | Setting, Color, Image ID fields | Video-only fields |
| Asset Type Change | "Video" selected | Video-only fields | Setting, Color, Image ID |
| Status Dropdown | Status = 2 (Date Range) | Release Date, End Date pickers | - |
| Status Dropdown | Status ≠ 2 | - | Release Date, End Date pickers |
| Region Check | Region 2 (AU) | - | Customer Segment, Tracking #, Product Segment, Color, Setting, AI icons |
| Locale Checkbox | Any locale checked | Collections for that locale | - |

### Form Validation & Save Workflow
1. **Validate Form:** jQuery Validate plugin checks all required fields against rules
2. **If Invalid:** Scroll to top; highlight `.alertBlock` with error list
3. **Collect Data:**
   - Selected tree folder (single checkbox)
   - Keywords from `#hiddenTags`
   - All form field values
4. **Build Request Object:**
   - Separate AI vs. user keywords based on edit scenario
   - Concatenate metadata string for database searchability
5. **AJAX POST to SaveAssetData**
6. **Response Handling:**
   - `""` (empty): New asset success -> Toast "Saved successfully" -> Show "Save & Duplicate" button
   - `"0"`: Edit success -> Toast "Updated successfully" -> Redirect to asset list
   - Error: Show error toast with message

### "Save & Duplicate" Workflow
1. User clicks **Save & Duplicate** button (post-success)
2. Form preserved; uploader re-shown (`.Imageuploader`)
3. User can select new file while keeping Display Name, Description, Asset Type, etc.
4. Second `#saveAsset` submit creates duplicate asset with new file

---

## Quality Gate Checklist

✅ **UI Fields Documented:** 21 form fields + custom notification control documented with types, requirements, labels, constraints  
✅ **API Endpoints Documented:** 7 handler actions (GetAssetType, SaveAssetData, Uploadfile, etc.) with parameters & return types  
✅ **Business Rules Extracted:** File types, conversion logic, region-based rules, status transitions, AI features, edit vs. new asset behavior  
✅ **Validation Rules Complete:** 16+ client-side rules + server-side file/email/date validation with error messages  
✅ **Database Operations Mapped:** InsertAsset SP with 35+ parameters, post-insert image processing, email notification triggers, irrelevant tag tracking  
✅ **Security Constraints Documented:** Session validation, program/region/locale scoping, file name injection prevention, folder path security, email privacy  
✅ **Client-Side Behaviors Detailed:** Dropzone upload workflow, tag management, dynamic field show/hide, form validation, Save & Duplicate flow, AI field population logic  
✅ **Source Files:** 4 key files analyzed (UI, code-behind, handler, JavaScript)

**Metrics:**
- UI Fields: 21 documented
- API Actions: 7 documented
- Business Rules: 25+ documented
- Validation Rules: 16+ documented
- Status Transitions: 3 documented
- Security Rules: 7 documented
- Client Behaviors: 6 major workflows documented

---

