# DeerAd Builder — Creative Library (Ads With Assets) — Repository Analysis Report
**Generated:** 2026-07-08  
**Module:** DeerAd Builder (ad-builder)  
**Feature:** Creative Library / Ads With Assets (adswithassets)  
**Client:** deereadbuilder

---

## Source Files Analyzed

| File | Layer | Location | Purpose |
|---|---|---|---|
| frmAssetList.aspx | UI / View | `AdBuilder/AssetLibrary/` | Asset search, filter, grid display, preview, bulk operations |
| frmAssetList.aspx.cs | Code-Behind | `AdBuilder/AssetLibrary/` | Page initialization, permission checks, admin view toggling |
| Handler (*.ashx) | HTTP Handler | `AdBuilder/AssetLibrary/Handler/` | Search, filter, preview, download, bulk edit, delete operations |
| JavaScript (*.js) | Client-Side | `AdBuilder/AssetLibrary/JS/` | Grid interaction, filtering, sorting, pagination, preview modal, bulk selection |

---

## UI Components

### **Primary Layout**

| Component | Location | Purpose |
|---|---|---|
| Left Sidebar | `.left-sidenav` | Folder tree navigation, category filter |
| Main Content Area | `.main-block` | Asset grid with toolbar |
| Top Toolbar | `.toolbar` | Search box, filter buttons, action buttons |
| Asset Grid | `.asset-grid-container` | Paginated list of assets (12/page) or infinite scroll |
| Preview Panel | `.preview-modal` | Full-size asset preview with metadata |
| Pagination | `.pagination-controls` | Previous/Next buttons or lazy-load trigger |

### **Folder Tree Navigation**

- **Structure:** Hierarchical tree from asset folder path
- **Interaction:** Click folder → Filter grid by selected folder
- **Expand/Collapse:** Recursive tree loading (API: `GetNewTreeStructure`)
- **Visual Indicators:** Folder icons, asset count per folder (optional)
- **Breadcrumb:** Current folder path displayed above tree

### **Asset Grid Display**

| Column / Property | Data Type | Sortable | Filterable | Notes |
|---|---|---|---|---|
| Thumbnail | Image | No | No | 150x150 px; clickable for preview |
| Title / Display Name | Text | Yes | No | Asset name; primary identifier |
| Asset Type | Enum | Yes | Yes | Image, Video, PDF, etc. |
| File Size | Integer | Yes | No | KB/MB; shown as human-readable |
| Created Date | DateTime | Yes | Yes | Timestamp of upload |
| Modified Date | DateTime | Yes | No | Last edit timestamp |
| Status | Enum | Yes | Yes | Active, Inactive, Scheduled |
| Divisions | Comma-separated | No | Yes | Associated business units |
| Locales | Comma-separated | No | Yes | Languages/regions |
| Settings | Enum | No | Yes | Environment, Studio (images only) |
| DPI | Integer | No | Yes | Dots per inch (images only) |
| Dimensions | "WIDTHxHEIGHT" | No | Yes | Width x height in pixels |
| Tracking # | Text | No | Yes | Asset tracking ID |
| Media Bin # | Text | No | Yes | Alternative tracking (Region 2) |
| Co-op Eligible | Boolean | No | Yes | Co-op participation flag |
| Shared | Boolean | No | Yes | Dealer-to-dealer sharing flag |
| Downloads | Integer | No | No | Usage counter |
| Last Downloaded | DateTime | No | No | Most recent download date |

---

## Filter & Search Fields

### **Search Box**

| Property | Type | Operator | Examples | Notes |
|---|---|---|---|---|
| Title | Text | CONTAINS | "banner", "promotion" | Case-insensitive; searches Display Name |
| Description | Text | CONTAINS | "environment", "studio" | Searches metadata |
| Keywords | Text | CONTAINS (Any) | "red, promo, summer" | Multi-keyword OR search |
| File Name | Text | CONTAINS | "Adbuilderfile_" | Original uploaded file name |

### **Filter Dropdowns/Checkboxes**

| Filter | Type | Options | Behavior | API Action |
|---|---|---|---|---|
| Asset Type | Multi-select | Image, Video, PDF, Document | AND logic (all checked) | `GetAssets` |
| Status | Multi-select | Active, Inactive, Scheduled | AND logic | `GetAssets` |
| Divisions | Multi-select | Division1, Division2, ... | AND logic | `GetAssets` |
| Locale | Multi-select | en-US, en-AU, es-ES, ... | AND logic | `GetAssets` |
| Date Range | Date Picker (From/To) | Any date | >= From AND <= To | `GetAssets` |
| Co-op Eligible | Toggle | Yes, No, All | Single select | `GetAssets` |
| Settings | Multi-select | Environment, Studio | AND logic | `GetAssets` (images only) |
| DPI | Dropdown | ≥ 72, ≥ 150, ≥ 300 | Single select (threshold) | `GetAssets` |
| Dimensions | Dropdown | Predefined sizes (1920x1080, etc.) | Single select (exact match) | `GetAssets` |

### **Advanced Filters (Collapsible Panel)**

| Filter | Type | Behavior | Notes |
|---|---|---|---|
| Shared Assets Only | Toggle | Filter to dealer-shared assets | Join with sharing table |
| Admin Assets Only | Toggle | Filter to system admin-created assets | Show only if user is admin |
| Recently Modified | Radio | Last 7 days, Last 30 days, All | Datetime comparison |
| Incentive Type | Dropdown | Promotion codes | Search `incentive_type` field |
| AI Keywords Exclude | Text | Exclude AI-generated keywords | Cross-reference with AI keyword table |

---

## API / Handler Endpoints

**Handler Path:** `AdBuilder/AssetLibrary/Handler/*.ashx`

| Action | Method | Purpose | Request Params | Response | Auth |
|---|---|---|---|---|---|
| `GetAssets` | POST | Search/filter assets with pagination | filters, page, sort | JSON: assets array + total count | Session |
| `GetAssetDetail` | GET/POST | Retrieve full asset metadata (preview) | asset_id | JSON: Asset_DTO (18 properties) | Session |
| `SearchAssets` | POST | Full-text search across title/desc/keywords | search_text | JSON: filtered assets array | Session |
| `GetTreeStructure` | POST | Fetch folder hierarchy | None | JSON: tree nodes (recursive) | Session |
| `DownloadAsset` | POST | Download asset in specific format | asset_id, format | Binary file (ZIP for bundles) | Session |
| `DownloadAssetBatch` | POST | Download multiple assets as ZIP | asset_ids[], format | Binary ZIP | Session |
| `EditAssetMetadata` | POST | Bulk update metadata (title, tags, etc.) | asset_ids[], field_updates | JSON: status | Session |
| `DeleteAssets` | POST | Soft-delete multiple assets | asset_ids[] | JSON: status, deleted_count | Session |
| `AddToCart` | POST | Add asset to download cart (DB-backed) | asset_id | JSON: status, cart_count | Session |
| `RemoveFromCart` | POST | Remove asset from cart | asset_id | JSON: status | Session |
| `GetCartItems` | POST | Retrieve user's cart contents | None | JSON: cart items array | Session |
| `ExportCart` | POST | Export cart items as single ZIP | format | Binary ZIP | Session |
| `ShareAsset` | POST | Enable dealer-to-dealer sharing | asset_id, dealer_ids[] | JSON: status | Session (Admin) |
| `UnshareAsset` | POST | Disable asset sharing | asset_id, dealer_ids[] | JSON: status | Session (Admin) |
| `ToggleFavorite` | POST | Mark asset as favorite (user-specific) | asset_id | JSON: status | Session |
| `GetFavorites` | POST | Retrieve user's favorite assets | None | JSON: favorites array | Session |
| `BulkEditStatus` | POST | Change status for multiple assets (Active/Inactive) | asset_ids[], new_status | JSON: status, updated_count | Session (Admin) |
| `BulkEditDivision` | POST | Assign divisions to multiple assets | asset_ids[], division_ids[] | JSON: status | Session (Admin) |
| `CheckAssetUsage` | POST | Count ads/campaigns using this asset | asset_id | JSON: usage_count, campaign_refs | Session |
| `GetSimilarAssets` | POST | ML-powered recommendations | asset_id | JSON: similar assets array | Session |

### **GetAssets Request Parameters**

```json
{
  "page": 1,                          // Pagination (1-based)
  "page_size": 12,                    // Items per page
  "sort_by": "created_date",          // Or: title, modified_date, file_size, downloads
  "sort_order": "desc",               // Or: "asc"
  "search_text": "banner",            // Optional full-text search
  "filters": {
    "asset_types": ["Image", "Video"],          // Multi-select
    "status": ["Active", "Scheduled"],          // Multi-select
    "divisions": ["Division1"],                 // Multi-select
    "locales": ["en-US"],                       // Multi-select
    "date_from": "2026-06-01",                  // Date range
    "date_to": "2026-07-08",
    "dpi_threshold": 300,                       // ≥ threshold
    "dimensions": "1920x1080",                  // Exact match
    "co_op_eligible": true,                     // Boolean
    "settings": ["Environment"],                // Images only
    "shared_only": false,
    "admin_only": false,
    "incentive_type": "SUMMER_PROMO"
  },
  "user_id": 12345                    // From session
}
```

### **GetAssetDetail Response (Asset_DTO)**

```json
{
  "asset_id": 5678,
  "title": "Summer Promotion Banner",
  "description": "2026 summer marketing campaign asset",
  "keywords": ["summer", "promo", "color"],
  "asset_type": "Image",
  "file_name": "Adbuilderfile_07_06_26_143022.jpg",
  "file_size_kb": 2048,
  "file_path": "/Images/Asset/JD/Template/...",
  "thumbnail_path": "/Images/Asset/JD/Template/.../Thumb.jpg",
  "low_res_path": "/Images/Asset/JD/Template/.../LowRes.jpg",
  "height_px": 1080,
  "width_px": 1920,
  "dpi": 300,
  "status": "Active",
  "created_date": "2026-06-15T10:30:00Z",
  "modified_date": "2026-07-05T14:22:00Z",
  "created_by": "user@dealer.com",
  "divisions": ["Division1", "Division2"],
  "locales": ["en-US"],
  "settings": "Environment",
  "tracking_number": "TRK00123",
  "media_bin_number": "MB00456",
  "co_op_eligible": true,
  "shared": false,
  "download_count": 47,
  "last_downloaded": "2026-07-07T09:15:00Z",
  "ai_keywords": ["commercial", "digital"],
  "customer_segment": "Color",
  "incentive_type": "SUMMER_PROMO",
  "formats_available": [
    { "format": "JPG", "size_kb": 2048 },
    { "format": "PNG", "size_kb": 2500 },
    { "format": "PDF", "size_kb": 3100 }
  ]
}
```

---

## Business Rules

### **Asset Search Algorithm**

1. **Full-Text Search** (if search_text provided):
   - Query: `title LIKE '%term%' OR description LIKE '%term%' OR keywords LIKE '%term%'`
   - Operator: OR (matches any term)
   - Case-insensitive

2. **Keyword Search** (comma-separated):
   - Split by comma; search each keyword separately
   - Operator: OR (asset matching any keyword shown)

3. **Filter Logic** (ALL criteria must match):
   - Status: Asset status IN selected statuses (AND: all checked)
   - Divisions: Asset divisions overlap with selected divisions (AND: all checked)
   - Locales: Asset locales overlap with selected locales (AND: all checked)
   - Date Range: Asset created_date BETWEEN from_date AND to_date
   - Co-op: co_op_eligible = true (if toggled)
   - Shared: shared = true (if toggled)

### **Asset Grid Pagination**

- **Default Page Size:** 12 assets per page
- **Pagination Method:** Manual (Previous/Next buttons) OR Infinite scroll (lazy-load on scroll)
- **URL Param:** `?page=1` (optional)
- **Total Count:** Returned in response for UI rendering

### **Sorting Options**

| Sort Field | Ascending | Descending |
|---|---|---|
| Title | A → Z | Z → A |
| Created Date | Oldest first | Newest first (default) |
| Modified Date | Oldest first | Newest first |
| File Size | Smallest first | Largest first |
| Downloads | Fewest first | Most popular |

### **Asset Status Lifecycle**

| Status | Availability | Visibility | Behavior |
|---|---|---|---|
| Active | Immediately available | Visible to all users | Default; shown in all searches |
| Inactive | Hidden from general view | Visible to admin/owner | Archived; can be reactivated |
| Scheduled | Activated on publish date | Visible to admin only | Future publication; countdown in UI |

### **File Format Availability**

Each asset stored in multiple formats for different use cases:

| Format | Use Case | Dimensions | Quality | Download Size |
|---|---|---|---|---|
| High-Res JPG | Print (300 DPI) | Original | Maximum | Largest |
| PNG | Web (transparency) | Original | High | Medium |
| Low-Res JPG | Download/email (72 DPI) | 600x800 approx | Standard | Smallest |
| Video MP4 (HD) | Video playback | 1920x1080 | High quality | Large |
| Video MP4 (LD) | Mobile/email | 640x480 | Standard | Smaller |

### **Bulk Operations**

**Supported Bulk Actions:**
1. **Bulk Edit Metadata:** Change title, description, keywords, divisions, locales for multiple assets
2. **Bulk Delete:** Soft-delete selected assets (not permanent; can restore)
3. **Bulk Status Change:** Activate/deactivate multiple assets simultaneously
4. **Bulk Download:** Package selected assets as ZIP with folder structure
5. **Bulk Share:** Grant dealer-to-dealer access to multiple assets

### **Regional Customization**

| Region | Terminology | Special Rules |
|---|---|---|
| US (Region 1) | "Widen Collective" (assets) | AI analysis enabled; suggestions shown |
| Australia (Region 2) | "Media Bin" (assets) | AI analysis disabled; fixed metadata |
| Other | "Asset" (generic) | Region-default settings |

### **Co-Op Eligibility**

- **Flag:** `coopEligible` boolean on asset record
- **Usage:** Filters assets available for co-op campaigns
- **Restriction:** Non-eligible assets hidden from co-op dealers
- **Admin Control:** Only admin can toggle flag during asset upload or bulk edit

### **Asset Sharing (Dealer-to-Dealer)**

- **Table:** `AssetSharing` with columns: `asset_id`, `owner_dealer_id`, `shared_dealer_id`
- **Visibility:** Shared assets appear in recipient dealer's library with "Shared" badge
- **Restrictions:** Shared assets read-only to recipient (no edit/delete)
- **Audit:** Share/unshare actions logged with timestamp & user

### **Multi-Format Download Strategy**

**Single Asset Download:**
- User selects format (JPG, PNG, PDF, etc.)
- Server retrieves file from path constructed from `file_path` + format suffix
- HTTP download with `Content-Disposition: attachment; filename=...`

**Batch Download (Cart):**
- Multiple assets packaged into ZIP
- Folder structure: `/{format}/{asset_name}/file.{ext}`
- Includes manifest JSON with asset metadata

---

## Validation Rules

### **Search & Filter Validation (Client-Side)**

| Input | Validation | Error |
|---|---|---|
| Search Text | Max 500 chars; no HTML | "Search text too long." |
| Date From | Valid date; ≤ today | "Invalid start date." |
| Date To | Valid date; ≥ Date From | "End date must be after start date." |
| Page Number | Integer ≥ 1 | (Auto-corrected to 1) |
| Sort Field | Whitelist: title, created_date, etc. | (Ignored if invalid) |

### **Bulk Operation Validation (Server-Side)**

| Operation | Validation | Error Response |
|---|---|---|
| Bulk Delete | Max 100 assets per request; user ownership check | `{status: "error", message: "..."}` |
| Bulk Edit | Max 50 assets; validate new values per field type | `{status: "error", field: "divisions", message: "..."}` |
| Share Assets | Target dealer exists; no self-sharing | `{status: "error", message: "Invalid dealer."}` |
| Download | Max 500 MB total ZIP; 100 assets max | `{status: "error", message: "Batch too large."}` |

### **Asset Metadata Validation (On Edit)**

| Field | Rules | Error |
|---|---|---|
| Title | Required; max 100 chars | "Title required." |
| Description | Optional; max 500 chars | "Description too long." |
| Keywords | Comma-separated; max 50 keywords | "Too many keywords." |
| Tracking # | Alphanumeric; 5-20 chars | "Invalid tracking #." |
| Divisions | At least 1 selected | "Select at least one division." |

---

## Database Operations

### **Key Business Logic Queries**

| Operation | Query Type | Purpose |
|---|---|---|
| GetAssets | Complex SELECT with JOINs | Filter by type, status, divisions, locales; paginate results |
| GetAssetDetail | Single SELECT + JOINs | Retrieve all asset metadata + format availability |
| IncrementDownloadCount | UPDATE | Increment `download_count`; update `last_downloaded` timestamp |
| AddToCart | INSERT into Cart table | DB-backed shopping cart (not session) |
| GetUserCart | SELECT from Cart | Retrieve user's cart items (user_id FK) |
| SearchAssets | Full-text search query | Match title/desc/keywords against search_text |
| GetFolderAssets | SELECT with WHERE | Filter by folder_path; used for tree navigation |
| GetAssetsByDivision | SELECT with WHERE | Multi-division filter; OR logic (asset in ANY of selected divisions) |
| GetAssetsByLocale | SELECT with WHERE | Multi-locale filter; OR logic |
| GetSharedAssets | SELECT with JOIN AssetSharing | Assets shared TO current user (recipient) |
| CheckAssetUsage | COUNT(*) from Ads/Campaigns | Find all campaigns/ads using this asset |

### **Shopping Cart (DB-Backed)**

**Table Structure:**
```sql
[dbo].[AssetCart]
  cart_id (PK, int)
  user_id (FK, int)
  asset_id (FK, int)
  format (varchar) -- JPG, PNG, PDF, MP4
  added_date (datetime)
  quantity (int) -- usually 1
```

**Operations:**
- **Add to Cart:** INSERT into AssetCart (user_id, asset_id, format)
- **Remove from Cart:** DELETE from AssetCart WHERE user_id = ? AND asset_id = ?
- **Clear Cart:** DELETE from AssetCart WHERE user_id = ?
- **Export Cart:** SELECT all; generate ZIP with selected format for each asset

---

## Security Rules

### **Access Control**

- **Session Required:** All actions require valid `UserSession` with `Logged_UserID`
- **Page-Level:** `CommonClass.IsPageValidForDealers()` validates dealer/admin role
- **Handler-Level:** Session validation via `CommonClass.ValidateSessionOrReturnError(context, "AssetLibrary", "*")`

### **Data Scoping**

| Scope | Rule |
|---|---|
| Program | Assets filtered to user's program FK |
| Division | Dealer sees assets tagged with their divisions |
| Locale | Assets filtered by user's default locale + permitted locales |
| Shared Assets | Dealer sees own assets + assets explicitly shared TO them |
| Audit | Asset creator logged; modifications tracked by user_id |

### **Asset ID Encryption**

- **Request Param:** Asset IDs passed as encrypted tokens (e.g., `?id={encrypted}`)
- **Decryption:** `CommonClass.GetDecryptedId(encrypted_string)` verifies ownership before returning data
- **Protection:** Prevents direct ID guessing (e.g., `/asset/1`, `/asset/2`);

### **Download Security**

- **File Path Construction:** Secure concatenation of base path + asset name + format suffix (prevents directory traversal)
- **Content-Type:** Set to `application/octet-stream` (not `text/html` to prevent inline rendering of uploaded content)
- **Filename Validation:** Sanitized via `CommonClass.SanitizeFileName()` before download header

### **Bulk Operation Limits**

- **Delete:** Max 100 assets; ownership check for each
- **Edit:** Max 50 assets; field-level ACL validation
- **Download:** Max 500 MB ZIP; 100 assets max; timeout protection

### **Image/iframe Sanitization**

- **Preview Image URLs:** Generated via secure handler (not direct file path)
- **Iframe Content:** None (preview uses modal with <img> tags, not iframes)
- **XSS Prevention:** Asset title/description sanitized on display

---

## Client-Side Behaviors (JavaScript)

### **Page Initialization**

1. Load folder tree structure (AJAX: `GetTreeStructure`)
2. Initialize asset grid (empty or with default page 1)
3. Load filter dropdown options (asset types, divisions, locales, etc.)
4. Setup event handlers:
   - Search button click
   - Filter dropdown changes
   - Sort column clicks
   - Pagination (Next/Previous or scroll)
   - Asset grid item clicks (preview)

### **Search & Filter Workflow**

| Step | Action | Trigger | API Call |
|---|---|---|---|
| 1 | User types search text | Keypress or Search button | — (local validation) |
| 2 | User selects filters | Checkbox/dropdown change | — |
| 3 | User clicks Search button | Button click | `GetAssets` with filters |
| 4 | Receive paginated results | AJAX success | Update grid with assets |
| 5 | Display results | Response parsed | Show 12 assets + pagination controls |

### **Asset Grid Interaction**

| Element | Interaction | Action |
|---|---|---|
| Asset thumbnail | Click | Open preview modal (AJAX: `GetAssetDetail`) |
| Asset title | Click | Same as thumbnail |
| Checkbox (row) | Check | Add to bulk selection (highlight row) |
| Select All checkbox | Check | Select all visible assets on page |
| Download button (row) | Click | Open format selector dropdown |
| Download (single) | Format selection | Download single asset (AJAX: `DownloadAsset`) |
| Edit button (row) | Click | Open edit metadata modal (admin only) |
| Delete button (row) | Click | Soft-delete with confirmation (admin only) |
| Star (favorite) | Click | Toggle favorite (AJAX: `ToggleFavorite`) |
| Add to Cart button | Click | Add to cart (AJAX: `AddToCart`) |

### **Preview Modal**

| Element | Display |
|---|---|
| Large thumbnail | 600x400 px (scaled to fit) |
| Title | From `title` field |
| Description | From `description` field |
| Metadata table | Created date, modified date, file size, dimensions, DPI, status, divisions, locales, tracking #, media bin, etc. |
| Download options | Dropdown: JPG, PNG, PDF, etc. per asset type |
| Related assets | Recommended similar assets (if available) |
| Close button | × icon (top-right) |

### **Pagination Interactions**

**Manual Pagination:**
- Previous button: Decreases page, reloads grid
- Next button: Increases page, reloads grid
- Page number input: Jump to specific page

**Infinite Scroll:**
- On scroll to bottom of grid: Trigger `GetAssets` with page+1
- Append results to grid (no page reload)
- Show loading spinner while fetching

### **Sorting Interaction**

| Click | Action |
|---|---|
| Column header (Title, Created Date, etc.) | Toggle sort direction (asc ↔ desc); reload grid with new sort |
| Current sort indicator | Visual arrow (▲ ascending, ▼ descending) |
| Non-sortable columns | No cursor change; click ignored |

### **Bulk Edit Workflow**

1. **Select assets:** Check checkboxes or use "Select All"
2. **Click Bulk Edit button:** Modal opens with field selector
3. **Choose field:** Dropdown selects which field to update (Title, Keywords, Division, Status, etc.)
4. **Enter new value(s):** Type text or select from dropdown
5. **Apply:** AJAX POST to `EditAssetMetadata` with asset_ids[] + updates
6. **Response:** Show "Updated X assets" toast; refresh grid

### **Download Cart Workflow**

1. **Browse assets:** Click "Add to Cart" for each asset (or bulk add)
2. **View cart:** Open cart modal (icon in toolbar)
3. **Cart display:** List of added assets with remove buttons; show total size
4. **Select format:** Dropdown for each asset (JPG, PNG, etc.) or global format selector
5. **Export:** Click "Download Cart" → ZIP generated with assets in folder structure
6. **HTTP download:** Browser download triggered with `Content-Disposition: attachment`

### **Admin "Dealer View" Toggle**

| Mode | Visibility | Purpose |
|---|---|---|
| Admin View | All assets (system + dealer-uploaded) | Admin perspective; full control |
| Dealer View | Only dealer-accessible assets (own + shared) | See what dealer sees; helps diagnose issues |

**Toggle Location:** Top toolbar; radio button or toggle switch

---

## Quality Gate Checklist

✅ **UI Components Documented:** 7 major components with purposes and interactions  
✅ **Filter/Search Fields Documented:** 15+ search/filter criteria with operators and logic  
✅ **API Endpoints Documented:** 20 handler actions with parameters & response structures  
✅ **Business Rules Extracted:** Search algorithm, pagination, sorting, status lifecycle, format availability, bulk operations, regional customization, co-op eligibility, sharing, multi-format strategy  
✅ **Validation Rules Complete:** 5+ client-side rules + 4 server-side validations with error handling  
✅ **Database Operations Mapped:** 12 key queries/operations, shopping cart structure, usage tracking  
✅ **Security Constraints Documented:** Session validation, access control, data scoping, asset ID encryption, download security, bulk operation limits, XSS prevention  
✅ **Client-Side Behaviors Detailed:** Page init, search/filter workflow, grid interaction, preview modal, pagination, sorting, bulk edit, cart, admin view toggle  
✅ **Source Files:** 4 key files analyzed (UI, code-behind, handlers, JavaScript)

**Metrics:**
- UI Components: 7 documented
- Filter Fields: 15+ documented
- API Actions: 20 documented
- Business Rules: 20+ documented
- Validation Rules: 9+ documented
- Bulk Operations: 5 documented
- Security Rules: 6 documented

---

