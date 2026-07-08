-- Asset Upload — Database Verification Queries
-- Purpose: Verify asset records, file conversions, notifications, and data integrity
-- Client: deereadbuilder
-- Database: DeerAdBuilder

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Verify Asset Record Inserted
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 
  asset_id,
  title,
  asset_type,
  status,
  created_by,
  created_date,
  uploaded_file_name,
  thumbnail_file_name,
  low_res_file_name,
  program_fk,
  tracking_number,
  color,
  setting
FROM Asset
WHERE title = @displayName
  AND created_date >= DATEADD(MINUTE, -5, GETDATE())
ORDER BY created_date DESC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Verify Asset Metadata (Locales, Divisions, Keywords)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Locales
SELECT DISTINCT
  al.locale_id,
  al.asset_id,
  l.locale_name
FROM Asset_Locale al
INNER JOIN Locale l ON al.locale_id = l.locale_id
WHERE al.asset_id = @assetId
ORDER BY l.locale_name;

-- Divisions
SELECT DISTINCT
  ad.division_id,
  ad.asset_id,
  d.division_name
FROM Asset_Division ad
INNER JOIN Division d ON ad.division_id = d.division_id
WHERE ad.asset_id = @assetId
ORDER BY d.division_name;

-- Keywords
SELECT
  keyword_id,
  asset_id,
  keyword_text,
  created_date
FROM Asset_Keyword
WHERE asset_id = @assetId
ORDER BY created_date;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Verify Asset Status Lifecycle
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  asset_id,
  title,
  status,
  posting_date,
  expiration_date,
  CASE 
    WHEN status = 1 THEN 'Active'
    WHEN status = 0 THEN 'Inactive'
    WHEN status = 2 THEN 'Date Range'
    ELSE 'Unknown'
  END as status_name,
  CASE
    WHEN status = 2 AND posting_date > GETDATE() THEN 'Not Yet Published'
    WHEN status = 2 AND posting_date <= GETDATE() AND expiration_date >= GETDATE() THEN 'Published'
    WHEN status = 2 AND expiration_date < GETDATE() THEN 'Expired'
    WHEN status = 1 THEN 'Active'
    ELSE 'Inactive'
  END as current_visibility
FROM Asset
WHERE asset_id = @assetId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Verify File Conversions
-- ═══════════════════════════════════════════════════════════════════════════════

-- For video: Check low-res conversion
SELECT
  asset_id,
  title,
  asset_type,
  uploaded_file_name,
  low_res_file_name,
  CASE
    WHEN asset_type = 'Video' AND low_res_file_name IS NOT NULL THEN 'Video conversion completed'
    WHEN asset_type = 'Video' AND low_res_file_name IS NULL THEN 'Video conversion MISSING'
    WHEN asset_type IN ('Image', 'PDF') THEN 'No conversion needed'
  END as conversion_status
FROM Asset
WHERE asset_id = @assetId;

-- For image: Check thumbnail
SELECT
  asset_id,
  title,
  thumbnail_file_name,
  CASE
    WHEN thumbnail_file_name IS NOT NULL THEN 'Thumbnail generated'
    ELSE 'Thumbnail MISSING'
  END as thumbnail_status
FROM Asset
WHERE asset_id = @assetId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Verify Notification Records
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT TOP 10
  notification_id,
  asset_id,
  notification_type,
  recipient_email,
  notification_date,
  sent_date,
  status,
  error_message
FROM AssetNotification
WHERE asset_id = @assetId
ORDER BY notification_date DESC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Verify Admin-Only Flag
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  asset_id,
  title,
  admin_only,
  CASE
    WHEN admin_only = 1 THEN 'Dealer access: DENIED'
    WHEN admin_only = 0 THEN 'Dealer access: ALLOWED'
  END as visibility
FROM Asset
WHERE asset_id = @assetId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Verify AI-Generated Keywords (Region 1)
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  ak.keyword_id,
  ak.asset_id,
  ak.keyword_text,
  ak.confidence_score,
  ak.ai_generated,
  ak.created_date
FROM Asset_Keyword ak
WHERE ak.asset_id = @assetId
  AND ak.ai_generated = 1
ORDER BY ak.confidence_score DESC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Verify Program-Based Scoping
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  a.asset_id,
  a.title,
  a.program_fk,
  p.program_name,
  u.user_id,
  u.email,
  u.program_fk as user_program
FROM Asset a
INNER JOIN Program p ON a.program_fk = p.program_id
INNER JOIN [User] u ON a.created_by = u.user_id
WHERE a.asset_id = @assetId;

-- Verify user cannot see asset from different program
SELECT COUNT(*) as unauthorized_access_count
FROM Asset a
WHERE a.asset_id = @assetId
  AND a.program_fk <> @userProgramId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. Verify Edit History
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  audit_id,
  asset_id,
  action,
  old_value,
  new_value,
  modified_by,
  modified_date
FROM Asset_Audit
WHERE asset_id = @assetId
ORDER BY modified_date;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. Verify File Storage Integrity
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify uploaded file path follows naming convention: Adbuilderfile_{dd_MM_yy_HHmmss}.{ext}
SELECT
  asset_id,
  title,
  uploaded_file_name,
  CASE
    WHEN uploaded_file_name LIKE 'Adbuilderfile[_]%' THEN 'Valid naming convention'
    ELSE 'INVALID naming convention'
  END as file_name_check,
  CASE
    WHEN uploaded_file_name NOT LIKE '%/%' 
      AND uploaded_file_name NOT LIKE '%\%'
      AND uploaded_file_name NOT LIKE '../%' THEN 'Path traversal: SAFE'
    ELSE 'Path traversal: VULNERABLE'
  END as path_safety_check
FROM Asset
WHERE asset_id = @assetId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. Verify Cross-Feature Dependencies
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check if asset is referenced in other features (RTR2o, Libraries, etc.)
SELECT
  'RTR2o' as feature,
  COUNT(*) as reference_count
FROM [RTR2o_Asset] rta
WHERE rta.asset_id = @assetId
UNION ALL
SELECT
  'Cart' as feature,
  COUNT(*) as reference_count
FROM AssetCart ac
WHERE ac.asset_id = @assetId
UNION ALL
SELECT
  'Shared' as feature,
  COUNT(*) as reference_count
FROM AssetSharing ash
WHERE ash.asset_id = @assetId;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. Bulk Verification: Recent Assets
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT TOP 20
  asset_id,
  title,
  asset_type,
  status,
  created_by,
  created_date,
  thumbnail_file_name,
  CASE WHEN low_res_file_name IS NOT NULL THEN 'Yes' ELSE 'No' END as has_low_res,
  (SELECT COUNT(*) FROM Asset_Keyword WHERE asset_id = Asset.asset_id) as keyword_count,
  (SELECT COUNT(*) FROM Asset_Division WHERE asset_id = Asset.asset_id) as division_count
FROM Asset
WHERE created_date >= DATEADD(DAY, -7, GETDATE())
ORDER BY created_date DESC;
