# DeerAd Builder — Load RTR2o — Repository Analysis Report
**Generated:** 2026-07-08  
**Module:** DeerAd Builder (ad-builder)  
**Feature:** Load RTR2o (frmloadrtr2o)  
**Client:** deereadbuilder

---

## Source Files Analyzed

| File | Layer | Location | Purpose |
|---|---|---|---|
| frmLoadRTR2o.aspx | UI / View | `AdBuilder/Ads/` | RTR2o template form with media type, file uploads, metadata fields |
| frmLoadRTR2o.aspx.cs | Code-Behind | `AdBuilder/Ads/` | Page initialization, session validation, Chili/FlexCMS integration |
| hnLoadRTR2o.ashx.cs | HTTP Handler | `AdBuilder/Ads/Handler/` | File upload processing, video conversion, template metadata persistence |
| jsLoadRTR2o.js | Client-Side Logic | `AdBuilder/Ads/JS/` | Form interaction, file upload dropzones, dynamic field show/hide, validation |

---

## UI / Form Fields

### **Core Template Configuration**

| Field ID | Field Name | Type | Required | Max Length | Data Source | Notes |
|---|---|---|---|---|---|---|
| `ddlTemplateType` | Template Type | Dropdown | Yes | N/A | RTR, Hybrid | Controls UI visibility: RTR=static, Hybrid=dynamic variables |
| `ddlLocale` | Locale | Dropdown | Yes | N/A | Dynamic | Language/region selection from master data |
| `txtName` | Display Name | Text Input | Conditional | 100 | User Entry | Hidden for Hybrid type; shown as `hide` class |
| `txtDescription` | Headline | Text Input | Yes | 100 | User Entry | Character counter via `spanDescription` |
| `txtShortName` | Offer | Text Input | No | 135 | User Entry | Character counter via `spanShortName` |

### **Media Type & Format Selection**

| Field ID | Field Name | Type | Conditional | Dynamic Data | Notes |
|---|---|---|---|---|---|
| `ddlMediaType` | Media Type | Dropdown | Yes | DM, LT, VC, TV, RO, WB, NS | Controls visibility of sub-categories & file upload types |
| `ddlSubCategoryMT` | POS Type / Sub-Category | Dropdown | Yes | Per media type | Populated after media type selection |
| `ddlSubMediaTypeFormat` | Format Selection | Dropdown | Yes | Per sub-category | Defines accepted file types & validation rules |
| `ddlSize` | Banner Size / Document Format | Dropdown | Conditional | Per sub-category | Contains metadata: `data-key`, `data-page_count`, `data-JobName`, `data-low_res_image_profileId`, `data-thumb_image_profileId`, `data-preview_itemId`, `data-pdf_export_setting_itemId` |
| `ddlSpotLen` | Spot Length | Dropdown | Conditional (Video) | 15s, 30s, 60s, Custom | For media types VC (Video Commercial), TV (Television) |
| `ddlVideoType` | Video Type | Dropdown | Conditional (Video) | Per media config | Classification of video (Commercial, Testimonial, etc.); class `hideImp` |
| `lstchkMaterial` | Material Type | Multi-select Checkbox | Conditional (Print) | Per media type | Paper, Digital, etc.; class `rowList` |
| `lstchkDimension` | Dimensions | Multi-select Checkbox | Conditional | Per media type | Dimensional variants; multi-select |
| `ddlJDF` | JDF Banner Dimensions | Dropdown | Conditional (WB) | Predefined sizes | Alternative dimension selector for banners |

### **File Upload Controls**

| Field ID | File Purpose | Handler Action | Dropzone Max | Accepted Types | Notes |
|---|---|---|---|---|---|
| `txtfile` / `dZUploadTemplateFile1` | Main template file | `RTR_FileUpload` | 9999 MB | PDF, ZIP, MP4, WMV, AVI, MOV | Drag & drop enabled; auto-detect media type |
| `txtfile2` / `dZUploadTemplateFile2` | Secondary template (multi-page) | `uploadFile2` | 9999 MB | PDF (single page) | For H1PTH, V1PTV, sizes requiring 2 PDFs |
| `txtScriptFile` / `dZUploadScriptFile` | Script / Config file | `uploadScriptFile` | 9999 MB | PDF, TXT, DOC | For TV (TV script), RO (Radio copy); separate upload |
| `txtHTMLZipFile_[CODE]` | HTML5 Banner Bundle | `upload_HTML5_ZipFile` | 9999 MB | ZIP | Contains `.html`, CSS, images, fonts; code suffix identifies banner type |
| `txtHTMLImageFile_[CODE]` | Static Banner Image | `upload_HTML5_ImageFile` | 9999 MB | JPG, PNG | Fallback for non-HTML5 browsers; code suffix for banner variant |
| `txtPrvfile` / `dZUploadPreviewFile1` | Preview / Thumbnail Images | `uploadPrvFile` | 9999 MB | JPG, PNG, GIF | Multiple previews supported; validated count ≤ 36 |

### **Metadata & Classification Fields**

| Field | Type | Purpose | Max Length | AI-Generated |
|---|---|---|---|---|
| `txtKeywords` / `Aikeyword` | Text/JSON | Asset keywords | N/A | Yes (Region 1) |
| `CustomerSegment` | Text | AI classification (Color, B&W, Studio, Environment) | N/A | Yes (Region 1) |
| `Category1, Category2, Category3` | Dropdown | Content categorization (Campaign, Topic, etc.) | N/A | No |
| `displayname1, displayname2, displayname3` | Text Input | Display names for template variants | N/A | No |
| `price_type`, `price_details` | JSON/XML | Price matrix for POS materials | N/A | JSON → XML on save |
| `ADIXNo` / `Tracking #` | Text Input | Advertising ID tracking (5-20 alphanumeric) | 20 | No |
| `MdlNoFeatured` | Text Input | Model number associated | N/A | No |
| `IncentiveType` | Text Input | Promotion / incentive code | N/A | No |
| `Division` | Dropdown | Business division / department | N/A | No |
| `productGroup` | Dropdown | Product category grouping | N/A | No |
| `productSegment` | Radio Button | Market segment targeting (Residential, Commercial, etc.) | N/A | No |

### **Date & Publishing Controls**

| Field | Validation | Format | Conditional | Notes |
|---|---|---|---|---|
| `txtPostdt` | `greaterThanCurrent` | mm/dd/yyyy or dd/mm/yyyy (regional) | Status = 2 | Publishing start date; no past dates |
| `txtExpDt` | `greaterThan(txtPostdt)` | Same as above | Status = 2 | Publishing expiration; must be ≥ Posting Date |
| `txtTExpDt` | Custom date validator | Same | Media type = RO/TV/VC (Talent) | Talent expiration date for media requiring talent rights |

### **Control & Flag Fields**

| Field | Type | Values | Purpose | Scope |
|---|---|---|---|---|
| `ddlStatus` | Dropdown | 1 = Active, 2 = Scheduled/Published | Controls posting date visibility & publishing behavior | All |
| `ddlColor` | Dropdown | Hardcoded to 57 | RTR2o region-specific color profile | RTR2o only |
| `chkNotification` | Checkbox | Checked / Unchecked | Enable email notification on save | All |
| `coopEligible` | Checkbox | Yes / No | Mark template as co-op eligible | Print/media templates |
| `bundleAd` | Checkbox | Yes / No | Bundle with other templates | All |
| `paperOnDemand` | Checkbox | Yes / No | Enable print-on-demand flag | Print media (LT, DM) |
| `Is_Hybrid` | Hidden (0/1) | 0 = RTR, 1 = Hybrid | Template build type; controls variable defaults | All |

### **Hidden / Server-Controlled Fields**

| Field | Purpose | Source |
|---|---|---|
| `hdnBasecolor` | Dealer's primary brand color | User session |
| `hdnSecColor` | Dealer's secondary brand color | User session |
| `hdnfolderpath` | Template storage path | `/Images/Asset/JD/Template` |
| `hdnZipfolderpath` | ZIP file storage path | `/Images/Asset/JD/Template/Native` |
| `hdnLoginType` | User login role | Session validation ("admin" for ACL) |
| `hdnhybridfile` | Hybrid template JSON data | Serialized from Template_DTO |

---

## API / Handler Endpoints

**Handler Path:** `AdBuilder/Ads/Handler/hnLoadRTR2o.ashx`

| Action | Method | Purpose | Request | Response | Auth |
|---|---|---|---|---|---|
| `SaveAITemplate` | POST | Save/update RTR template with AI metadata | JSON: template metadata | JSON: `{status, id, message}` | Session |
| `RTR_FileUpload` | POST (multipart) | Upload & process main template file | multipart: Filedata + metadata | JSON: file info & IDs | Session |
| `uploadFile2` | POST (multipart) | Upload secondary/single-page PDF | multipart: Filedata | JSON: success/error | Session |
| `GetTemplateDetail` | GET/POST | Retrieve template metadata (edit mode) | Query: `Assetid` (encrypted) | JSON: Template_DTO | Session |
| `RTR_Template_FileUpload` | POST (multipart) | Upload alternate template file | multipart: Filedata | JSON: file info | Session |
| `uploadScriptFile` | POST (multipart) | Upload TV script or audio config | multipart: Filedata | JSON: script file name | Session |
| `RTR_PrintUpload_Clubbed` | POST (multipart) | Upload multi-file banner set | multipart: 5 files max | JSON: 5 file names | Session |
| `RTR_BannerUpload` | POST (multipart) | Upload static banner or native ad | multipart: Filedata | JSON: banner files list | Session |

### **SaveAITemplate Key Parameters**

```
SaveMode: "create" | "update"
Id: encrypted template ID (update only)
mediaType: media type FK (int)
locale: language code
postdt, expDt: publish dates (mm/dd/yyyy)
status: 1 | 2
uploaded_file_name: original name
template_file_name: system name (Adbuilderfile...)
thumbnail_file_name: preview(s), comma-separated
Name, Description, ShortName: text (100/135 chars max)
Keywords, CustomerSegment, Aikeyword: AI data
ADIXNo, MdlNoFeatured, IncentiveType: tracking
Division, productGroup, productSegment: classification
Category1-3: content categories
price_type, price_details: POS pricing (JSON → XML)
UserType: access control (CFA, CA, AY, TLCA)
NotificationGroup, manuallyemail: notification
coopEligible, bundleAd, paperOnDemand: flags
talentExpDt: talent rights expiration
Other_Locales, Other_Locales_code: multi-locale
Is_Hybrid: 0/1 build type
hybrid_template_data: variable defaults (JSON)
mediaKey, mediaSizeKey: media codes
Job_Name, workspace_itemId, pdf_export_setting_itemId: Chili/FlexCMS IDs
is_base_altered, has_variables: template flags
changed_attributes: pipe-separated modified fields (for notifications)
```

---

## Business Rules

### **RTR2o Format & Media Types**

**RTR (Ready-to-Run) 2.0** is a dynamic advertising template system supporting multiple media formats:

| Media Type | Code | Description | File Type | Size/Layout | Special Rules |
|---|---|---|---|---|---|
| Direct Mail | DM | 2-page print templates | PDF | 2 pages (fixed) | Auto page count validation |
| Literature | LT | Variable-page print materials | PDF | BRTFT (2pg), BRTFL, etc. | User-selected page count |
| Video Commercial | VC | Video content | MP4, WMV, AVI, MOV | 1920x1080 standard | Auto-converted to MP4 low-res (640x480) |
| Television | TV | TV spot with script | MP4 + PDF script | 30s, 60s | Script ZIP bundled with video |
| Radio/Other | RO | Audio with optional script | MP3, WAV, M4A + PDF | Default thumbnail | Generates ZIP with audio + script |
| Web Banner | WB | Static or dynamic banner | PDF/ZIP/JPG | Multiple sizes | Hybrid (HTML5) or Static (JPG) |
| Native Ad | NS | Native advertising format | ZIP/HTML | 2 variants | Mobile-optimized variants |

### **Template Type Categories**

| Type | Code | Description | Variables | Editability |
|---|---|---|---|---|
| RTR (Standard) | 0 | Pre-designed, ready-to-use templates | None (read-only) | Fixed content; no dealer customization |
| Hybrid (BYO) | 1 | "Build Your Own"; dynamic content | Real_variable1-4 | Dealer replaces image, text, headline, body |

### **Hybrid Template Variables** (If `has_variables = true`)

| Variable # | Logical Name | Type | Max Length | Purpose |
|---|---|---|---|---|
| Real_variable1 | Image_1path | Image URL | N/A | Primary image/asset path |
| Real_variable2 | Headline | Text | 100 chars | Title/primary message |
| Real_variable3 | Subheadline | Text | 100 chars | Secondary message |
| Real_variable4 | Body_copy | Text | Unlimited | Full description/copy |

**Trigger:** When `has_variables = true`, thumbnail regenerated via `PageFlexHelper.GenerateThumbnailImage_WithVariables()` with default values from Template_DTO.

### **File Naming Convention**

```
Timestamp Format: dd_MM_yy_HHmmss
Pattern: Adbuilderfile{TIMESTAMP}[_{suffix}]{extension}

Examples:
- Adbuilderfile14_03_26_143022.pdf (single file)
- Adbuilderfile14_03_26_143022_1.pdf (page 1 of multi-page)
- Adbuilderfile14_03_26_143022_Thumb.jpg (thumbnail)
- Adbuilderfile14_03_26_143022_LowRes.mp4 (video low-res: 640x480)
```

### **Image Processing & Dimensions**

| Media Type | Max Width | Max Height | Processing |
|---|---|---|---|
| Video (VC/TV) | 1920 | 1080 | Convert to RGB JPEG; auto-resize if oversized |
| Thumbnail | ~300 | ~50 | Generated from PDF first page or uploaded |
| Low-Res (Print/Download) | 600-800 | 600-800 | Aspect ratio preservation |

### **Template Lifecycle & Status**

| Status | Code | Behavior | Publishing |
|---|---|---|---|
| Active | 1 | Immediately available to all users | No date range |
| Scheduled | 2 | Activate on Posting Date (12:00 AM CT); deactivate on Expiration Date (11:59 PM CT) | Requires posting_date & expiration_date |

### **Regional & Multi-Locale Support**

- **Primary Locale:** Stored in `locale` field (e.g., "en-US", "en-AU")
- **Additional Locales:** Comma-separated in `Other_Locales` field
- **Locale Codes:** Alternative codes in `Other_Locales_code` field
- **Regional Variants:** `Other_Regions` for region-specific tweaks
- **Validation:** `Check_OtherLocale_RTR_Template_insert()` prevents duplicate locale templates for same template ID

### **AI Image Analysis Integration** (Region 1 / Premium Templates)

- **Services Used:** Azure Computer Vision API + Custom Vision models
- **Confidence Threshold:** Tags with confidence > 0.80; keywords with confidence > 0.60
- **Auto-Generated Fields:**
  - Color (Color vs. Black & White)
  - Setting (Environment vs. Studio)
  - Customer Segment classification
  - Keywords / Tags
  - Image Dimensions (stored in `Categories` field as "1920X1080")

### **Chili / FlexCMS Integration**

- **Job/Document ID:** `job_name` field stores Chili/FlexCMS document ID
- **Workspace Reference:** `workspace_itemId` for Chili workspace context
- **Export Profiles:** `pdf_export_setting_itemId` specifies PDF export settings
- **Preview Rendering:** `view_preference_itemId` defines how previews are displayed
- **Thumbnail Generation:** Via `ChiliPublishHelper.GenerateThumbnailImage()` from PDF first page

### **Video & Audio Processing**

**Video Conversion (FFMpeg):**
- Input formats: `.wmv`→`asf`, `.avi`→`avi`, `.mov`→`mov`, others→`mp4`
- Output: Low-res MP4 at 640x480 resolution
- Failure handling: Error logged; template creation continues

**Audio ZIP Bundling:**
- For media type `RO` (Radio): Audio file + script ZIP together
- For type `TV`: Video MP4 + script PDF ZIP together

### **Print Media Tolerance Settings**

For production accuracy validation:
- `minWidthTolerance`, `maxWidthTolerance` (pixels or points)
- `minHeightTolerance`, `maxHeightTolerance`
- Stored in Template_DTO for dimensional validation at production time

---

## Validation Rules

### **Client-Side Validation (jQuery Validate - jsLoadRTR2o.js)**

| Field | Rule(s) | Error Message | Trigger |
|---|---|---|---|
| ADIX No | Required; 5-20 chars; alphanumeric | "ADIX No. must be alphanumeric." | On blur; custom method `alphanumeric` |
| Posting Date | Required; valid format; > current date | "Date should be greater than equal to current date." | Custom method `greaterThanCurrent` |
| Expiration Date | Required; valid format; ≥ Posting Date | "Expiration date should be greater than release date." | Custom method `greaterThan` |
| Email (Notification) | Valid format; multiple separated by `;` | "Please enter email(s) (separated with semicolon)." | Custom method `custom_method_one` |
| File Extension | Whitelist: .png, .jpg, .jpeg, .gif | "File extension not allowed." | On file input blur |
| File Size | Max 9999 MB | (implicit; Dropzone accepts any size) | Dropzone config |
| PDF Page Count | Expected count per media type/size | "Please upload PDF of [N] pages." or "Please upload pdf of single page." | On file complete; reads `data-page_count` from `ddlSize` |
| ZIP Content | Must contain `.html` file | "ZIP must contain an index.html file." | On upload complete; checks ZIP entries |
| Template Type | Required | "Please select template type." | Form submit |
| Media Type | Required | "Please select media type." | Form submit |
| Locale | Required | "Please select locale." | Form submit |
| Size | Required (conditional per media) | "Please select size." | Form submit if media supports sizes |

### **Server-Side Validations (hnLoadRTR2o.ashx.cs)**

#### Session & Authorization
```csharp
// Session validation required for all actions
if (!CommonClass.ValidateSessionOrReturnError(context, "Ads", "hnLoadRTR2o")) {
  return; // Access denied
}

// User type authorization
if (UserSession.User_Type not in ["CFA", "CA", "AY", "TLCA"]) {
  Response.Redirect("~/frmError.aspx"); // Forbidden
}
```

#### Media-Specific Page Count Validation
```csharp
if (media_key == "DM") {
  expected_page_count = 2; // Direct Mail always 2 pages
  if (document.Pages.Count != expected_page_count) {
    return "error code 2"; // Mismatch error
  }
}
if (media_key == "LT") {
  expected_page_count = context.Request["page_count"]; // From ddlSize data
  if (document.Pages.Count != expected_page_count) {
    return "error code 2";
  }
}
```

#### Video Conversion Validation
```csharp
if (media_key in ["VC", "TV"]) {
  string input_format = GetInputFormat(Path.GetExtension(file_name));
  string output_path = filePath + "_LowRes.mp4";
  ffMpeg.ConvertMedia(input, input_format, output_path, Format.mp4, 640, 480);
  
  if (!File.Exists(output_path)) {
    ErrorHandler.WriteErrorLog("Video conversion failed");
    // Continue with warning, not error
  }
}
```

#### Template ID Decryption
```csharp
// For edit/update mode
int Id = CommonClass.GetDecryptedId(context.Request["Id"]);
```

#### Multi-Locale Uniqueness Check
```csharp
objTemplateBIZ.Check_OtherLocale_RTR_Template_insert(
  objTemplate, 
  out errorMessage
);
if (errorMessage != "") {
  return errorMessage; // Prevents duplicate locale templates
}
```

#### File Name Truncation
```csharp
// Banner-specific: truncate long file names
if (cat_type in ["WBH", "WBS", "WBR"] || mediaKey == "NS") {
  // Skip truncation for banners
} else {
  if (objTemplate.uploaded_file_name.Length > 50) {
    objTemplate.uploaded_file_name = 
      Path.GetFileNameWithoutExtension(name).Substring(0, 40) + 
      Path.GetExtension(name);
  }
}
```

#### XML/JSON Serialization Validation
```csharp
// Preview Details: JSON → XML on save
List<Template_DTO.MultiplePreview> previews = 
  JavaScriptSerializer.Deserialize<List<...>>(json_preview_string);

// Output XML structure:
// <multipreview>
//   <multipreview_detail>
//     <Sno>1</Sno>
//     <filename>EscapeXml(filename)</filename>
//     <thumbnail_file_name>...</thumbnail_file_name>
//   </multipreview_detail>
// </multipreview>

// Price Details: JSON → XML similar structure
```

---

## Database Operations

### **Stored Procedures & Business Logic**

| Operation | BIZ Class | Method | SP Name | Purpose |
|---|---|---|---|---|
| Insert Template | `LoadRTRAI_BIZ` | `Insert_RTRAI_Template()` | `sp_InsertRTR_Template_v1` | Create new RTR template |
| Update Template | `LoadRTRAI_BIZ` | `UpdateTemplate()` | `sp_UpdateRTR_Template` | Update existing RTR template |
| Insert Banner | `LoadRTRAI_BIZ` | `Insert_RTR_Template_Banner()` | `sp_InsertRTR_Banner_Template` | Create web banner template |
| Update Banner | `LoadRTRAI_BIZ` | `Update_Banner_Template()` | `sp_UpdateRTR_Banner` | Update web banner |
| Retrieve Template | `LoadRTRAI_BIZ` | `GetTemplateDetailByID()` | `sp_GetTemplate_ByID` | Fetch by template ID |
| Multi-Locale Check | `TemplateManagement_BIZ` | `Check_OtherLocale_RTR_Template_insert()` | `sp_CheckOtherLocale_RTR_Insert` | Validate unique locale per template |

### **Template_DTO Key Persistent Fields**

```csharp
public int id { get; set; } // PK: template_id
public int program_seq { get; set; } // FK: Program
public string template_name { get; set; } // Display Name (100)
public string description { get; set; } // Headline (100)
public string short_name { get; set; } // Offer (135)
public string templateType { get; set; } // "RTR" | "BYO"
public int media_type_fk { get; set; } // Media Type ID
public string locale { get; set; } // Primary locale code
public string Other_Locales { get; set; } // Additional locales (comma-separated)
public string template_file_name { get; set; } // System file name (Adbuilderfile...)
public string thumbnail_file_name { get; set; } // Thumbnail(s), comma-separated
public string lowRes_file_name { get; set; } // Low-res variant
public string script_file_name { get; set; } // Script/config (TV/RO)
public string job_name { get; set; } // Chili document ID
public string keyword { get; set; } // AI keywords (comma-separated, validated)
public string Aikeyword { get; set; } // AI keywords (JSON format)
public string ADIX_no { get; set; } // Ad tracking ID (comma-separated)
public string model_number { get; set; } // Featured model
public string division { get; set; } // Business division
public string productSegment { get; set; } // Market segment
public int status { get; set; } // 1=Active, 2=Scheduled
public string strPostdt { get; set; } // Posting date (mm/dd/yyyy)
public string strExpdt { get; set; } // Expiration date (mm/dd/yyyy)
public bool coopEligible { get; set; } // Co-op flag
public string price_details { get; set; } // Price matrix (XML)
public string previewdetails { get; set; } // Multi-preview (XML)
public bool is_base_altered { get; set; } // Triggers thumbnail regen
public string Image_1path { get; set; } // Hybrid: default image
public string Headline { get; set; } // Hybrid: default headline
public string Subheadline { get; set; } // Hybrid: default subheadline
public string Body_copy { get; set; } // Hybrid: default body
public int created_by { get; set; } // Audit: creator user ID
public DateTime created_date { get; set; } // Audit: creation timestamp
```

### **Email Notification Data (On Save)**

**Notification Types:**
- `LORTR` — Load RTR (new)
- `EDITRTR` — Edit RTR (update)
- `LO_B_RTR` — Load Banner RTR
- `EDIT_B_RTR` — Edit Banner RTR
- `LO_N_RTR` — Load Native RTR
- `EDIT_N_RTR` — Edit Native RTR

**Template Parameters Passed to Email:**
- `<<Uploaded_By>>` — User name
- `<<Title>>` — Template name
- `<<DESC>>` — Description/headline
- `<<AD_Codes>>` — ADIX numbers
- `<<Topic>>` — Campaign name
- `<<Language>>` — Locale
- `<<Build_Type>>` — RTR or Hybrid
- `<<Media_Type>>` — Media type FK
- `<<Division>>` — Division
- `<<Model_Number>>` — Model #
- `<<Start_Date>>` / `<<End_Date>>` — Posting/expiration dates
- `<<Online_Status>>` — Active/Scheduled
- `<<img_thumbnail>>` — Thumbnail URL(s)
- `<<ImgTemplateFileReplace>>` — Template file URL

---

## Security Rules

### **Access Control & Authentication**

- **Handler Validation:** Session check via `CommonClass.ValidateSessionOrReturnError(context, "Ads", "hnLoadRTR2o")`
- **User Type Authorization:** Restricted to `["CFA", "CA", "AY", "TLCA"]`; others redirected to error page
- **Session Scoping:** All operations filtered by `UserSession.Client_Admin.Program_number`

### **File Security**

- **Extension Whitelist:** `.pdf`, `.zip`, `.mp4`, `.wmv`, `.avi`, `.mov`, `.jpg`, `.png`, `.gif`, `.txt`, `.doc`
- **Injection Prevention:** File name sanitization via `CommonClass.SanitizeFileName()`
- **Naming Strategy:** Timestamp-based (`Adbuilderfile_dd_MM_yy_HHmmss.ext`) prevents collisions & guessing
- **Path Validation:** Folder path validated against user's permitted tree

### **Template Data Isolation**

- **Multi-Tenancy:** Program FK ensures cross-client template isolation
- **Regional Isolation:** Region FK (implicit via program) prevents cross-region leakage
- **Audit Trail:** `created_by` & `modified_date` captured for compliance

---

## Client-Side Behaviors (JavaScript - jsLoadRTR2o.js)

### **Page Initialization**

1. Load media type master list
2. Initialize Dropzone for template file uploads (multiple dropzones per media type)
3. Load client config (divisions, segments, material types)
4. Setup jQuery date pickers for Posting & Expiration dates
5. Bind media type dropdown change event
6. If edit mode (URL param `Assetid`): Hide uploader, fetch & display template details

### **File Upload Workflow**

| Step | Trigger | Action | Response |
|---|---|---|---|
| 1 | File selected on `dZUploadTemplateFile1` | Send AJAX POST to `RTR_FileUpload` | Receive file metadata (JSON) |
| 2 | Upload complete (100%) | Show loader overlay | — |
| 3 | Response received | Parse AssetDTO-like JSON | File name, thumbnail, low-res, metadata |
| 4 | Metadata parsed | Display file info (name, size, format) | Show thumbnail preview |
| 5 | Secondary file (if required) | User uploads to `dZUploadTemplateFile2` | Send POST to `uploadFile2` |
| 6 | Script file (TV/RO media) | Optional upload to `dZUploadScriptFile` | Send POST to `uploadScriptFile` |

### **Dynamic Field Show/Hide Triggers**

| Trigger | Condition | Show | Hide |
|---|---|---|---|
| Media Type Change | "DM" selected | 2-page PDF form | Other media controls |
| Media Type Change | "LT" selected | Page count selector | Video/audio controls |
| Media Type Change | "VC" or "TV" | Spot length dropdown, script upload | Print controls |
| Media Type Change | "WB" (Web) | HTML5 ZIP upload, banner image upload | Print controls |
| Sub-Category Change | Sub-category has sub-types | Sub-format dropdown | — |
| Template Type = Hybrid | Is_Hybrid = 1 | Variable default fields (Image, Headline, etc.) | Display Name field (hidden) |
| Notification Checkbox | Checked | Notification group dropdown, email list | — |
| Status = Scheduled | Status = 2 | Posting Date, Expiration Date pickers | — |
| Status ≠ Scheduled | Status = 1 | — | Posting Date, Expiration Date pickers |

### **Form Validation & Save Workflow**

1. **Validate All Required Fields:** jQuery Validate checks all rules
2. **If Invalid:** Show error summary at top of form
3. **Collect Form Data:**
   - Media type, locale, size, file names
   - Metadata (Name, Description, Keywords, etc.)
   - Tracking info (ADIX, Model #, Incentive Type)
   - Dates (Posting, Expiration, Talent expiration)
   - Flags (CoopEligible, BundleAd, PaperOnDemand, etc.)
   - Multi-preview details (if applicable)
4. **Build Request Object:**
   - Serialize preview details to JSON
   - Serialize price details to JSON
   - Determine changed attributes for notifications
5. **AJAX POST to SaveAITemplate action**
6. **Response Handling:**
   - Status `"0"`: Success (new template) → Toast → Show "Save & New" button
   - Status `""`: Success (edit) → Toast → Redirect to template list
   - Error: Show error toast with message

---

## Quality Gate Checklist

✅ **UI Fields Documented:** 25+ form fields with types, requirements, labels, constraints  
✅ **API Endpoints Documented:** 8 handler actions with parameters & response structures  
✅ **Business Rules Extracted:** RTR2o format specs, media types, template types, lifecycle, AI integration, Chili/FlexCMS integration, file naming, dimensions, multi-locale support  
✅ **Validation Rules Complete:** 11+ client-side rules + 7 server-side validation checks with error messages  
✅ **Database Operations Mapped:** 6 stored procedures, Template_DTO schema (30+ fields), email notification structure  
✅ **Security Constraints Documented:** Session validation, user type authorization, file extension whitelist, file name sanitization, path validation, multi-tenancy scoping  
✅ **Client-Side Behaviors Detailed:** File upload workflow, dynamic field show/hide, form validation, Save workflow, media type handling, Chili integration  
✅ **Source Files:** 4 key files analyzed (UI, code-behind, handler, JavaScript)

**Metrics:**
- UI Fields: 25+ documented
- API Actions: 8 documented
- Media Types: 7 documented
- Business Rules: 30+ documented
- Validation Rules: 18+ documented
- Status Transitions: 2 documented
- Security Rules: 4 documented

---

