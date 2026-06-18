-- ============================================================
-- Database Verification: Coop — Submit Claim
-- Generated: 2026-06-17 | Pipeline: Step 3 (Database Verification)
--
-- Source: SubmitClaim.cshtml.cs service calls + FU catalog
-- FUs verified: FU-056, FU-057, FU-058, FU-060, FU-062, FU-063, FU-064, FU-065, FU-067
-- Exceptions:   FU-061 (activity dates) — NOT verified here (missing in modern)
--
-- Usage:
--   1. Run the Submit Claim flow in the modern app
--   2. Get the claim_seq from the returned process_number (4-digit number)
--   3. Set @ClaimSeq to the claim_seq value (decrypt from encrypted param if needed)
--   4. Run this script on the modern database
--
-- Table names sourced from:
--   IOnlineClaimService.CreateClaimAndActivityRecords
--   IDocumentService.UpdateDocumentImage
--   IAddressService.UpdateContact
--   ICommentService.updateComment
-- ============================================================

DECLARE @ClaimSeq        BIGINT        = 0;   -- claim_seq from CLAIM table (not process_number)
DECLARE @TempClaimSeq    BIGINT        = 0;   -- online_claim_temp_seq (for draft verification)
DECLARE @ProcessNumber   NVARCHAR(20)  = '';  -- 4-digit process_number returned on submit
DECLARE @ExpectedStatus  NVARCHAR(50)  = N'Submitted';
DECLARE @ExpectedAction  NVARCHAR(50)  = N'Submit';

PRINT '============================================================';
PRINT 'Coop Submit Claim — DB Verification  |  claim_seq = ' + CAST(@ClaimSeq AS VARCHAR);
PRINT 'Run Date: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================';

-- ============================================================
-- PART A: TEMP CLAIM VERIFICATION (Draft Save — FU-056, FU-057, FU-058, FU-060, FU-062)
-- Set @TempClaimSeq before running Part A
-- ============================================================

PRINT '';
PRINT '=== PART A: TEMP CLAIM (Draft Save) ===';

-- A1. TempClaim header (FU-056)
-- Source: IOnlineClaimService.UpdateOnlineClaimTemp
PRINT '';
PRINT '--- A1. ONLINE_CLAIM_TEMP header (FU-056) ---';
SELECT
    oct.online_claim_temp_seq,
    oct.dealer_number_seq,
    oct.claim_seq,
    oct.crc_user_seq,
    oct.fiscal_year,
    oct.created_date,
    CASE WHEN oct.online_claim_temp_seq > 0 THEN 'PASS' ELSE 'FAIL' END AS HeaderCheck
FROM dbo.online_claim_temp oct
WHERE oct.online_claim_temp_seq = @TempClaimSeq;

-- A2. TempClaim activities (FU-057)
-- Source: IOnlineClaimService.UpdateOnlineActivityTemp
PRINT '';
PRINT '--- A2. ONLINE_ACTIVITY_TEMP activities (FU-057) ---';
SELECT
    oat.online_activity_temp_seq,
    oat.online_claim_temp_seq,
    oat.media_type_seq,
    oat.media_other          AS media_name,
    oat.invoice_amount,
    oat.invoice_number,
    oat.preapproval_seq,
    oat.invoice_submission_type AS ocr_usage,
    oat.currency_conversion_seq
FROM dbo.online_activity_temp oat
WHERE oat.online_claim_temp_seq = @TempClaimSeq
ORDER BY oat.online_activity_temp_seq;

SELECT
    COUNT(*) AS ActivityCount,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL — No activity records found' END AS ActivityCheck
FROM dbo.online_activity_temp
WHERE online_claim_temp_seq = @TempClaimSeq;

-- A3. TempClaim documents (FU-058)
-- Source: IDocumentService.UpdateDocumentImage (owner_table = ONLINE_ACTIVITY_TEMP)
PRINT '';
PRINT '--- A3. DOCUMENT_IMAGE — invoice + supporting docs (FU-058) ---';
SELECT
    di.document_image_seq,
    di.owner_table,
    di.owner_table_seq,
    di.name                  AS file_name,
    di.document_type_seq,
    di.created_date
FROM dbo.document_image di
INNER JOIN dbo.online_activity_temp oat ON oat.online_activity_temp_seq = di.owner_table_seq
WHERE di.owner_table = 'ONLINE_ACTIVITY_TEMP'
  AND oat.online_claim_temp_seq = @TempClaimSeq
ORDER BY di.document_image_seq;

SELECT
    COUNT(*) AS DocumentCount,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN — No documents found (invoice required for submit)' END AS DocumentCheck
FROM dbo.document_image di
INNER JOIN dbo.online_activity_temp oat ON oat.online_activity_temp_seq = di.owner_table_seq
WHERE di.owner_table = 'ONLINE_ACTIVITY_TEMP'
  AND oat.online_claim_temp_seq = @TempClaimSeq;

-- A4. Activity product lines (FU-060)
-- Source: IActivityService.UpdateOnlineActivityProduct (owner_table = ONLINE_ACTIVITY_TEMP)
PRINT '';
PRINT '--- A4. Activity product lines (FU-060) ---';
SELECT
    oap.online_activity_product_seq,
    oap.owner_table,
    oap.owner_table_seq,
    oap.product_seq,
    oap.measurement          AS percent_value,
    oap.program_percent      AS reimbursement_pct
FROM dbo.online_activity_product oap
INNER JOIN dbo.online_activity_temp oat ON oat.online_activity_temp_seq = oap.owner_table_seq
WHERE oap.owner_table = 'ONLINE_ACTIVITY_TEMP'
  AND oat.online_claim_temp_seq = @TempClaimSeq;

-- A5. TempClaim comment (FU-062)
-- Source: ICommentService.updateComment (owner_table = TEMP_CLAIM)
PRINT '';
PRINT '--- A5. TempClaim comment (FU-062) ---';
SELECT
    c.comment_seq,
    c.owner_table,
    c.owner_table_seq,
    c.comment,
    c.comment_type,
    c.active_flag,
    c.created_date
FROM dbo.comment c
WHERE c.owner_table = 'TEMP_CLAIM'
  AND c.owner_table_seq = @TempClaimSeq
  AND c.comment_type = 'EXTERNAL';

-- A6. ACCEPTED EXCEPTION — Activity dates NOT persisted (FU-061)
-- These records should exist in legacy but will be ABSENT in modern
PRINT '';
PRINT '--- A6. ACCEPTED EXCEPTION: Activity dates — FU-061 ---';
PRINT '    Expected count in MODERN: 0 (dates removed from UpdateTempActivities)';
PRINT '    Expected count in LEGACY:  > 0 (for claims with activity dates)';
SELECT
    COUNT(*) AS ActivityDateCount,
    CASE
        WHEN COUNT(*) = 0 THEN 'CONFIRMED EXCEPTION: No activity date records (matches accepted exception FU-061)'
        ELSE 'NOTE: Activity dates ARE persisted (' + CAST(COUNT(*) AS VARCHAR) + ' rows) — exception may have been resolved'
    END AS ExceptionStatus
FROM dbo.online_activity_date oad
INNER JOIN dbo.online_activity_temp oat ON oat.online_activity_temp_seq = oad.owner_table_seq
WHERE oad.owner_table = 'ONLINE_ACTIVITY_TEMP'
  AND oat.online_claim_temp_seq = @TempClaimSeq;


-- ============================================================
-- PART B: FINAL CLAIM VERIFICATION (Submit — FU-063, FU-064, FU-065, FU-067)
-- Set @ClaimSeq before running Part B
-- ============================================================

PRINT '';
PRINT '=== PART B: FINAL CLAIM (Submit) ===';

-- B1. Claim header and process number (FU-063)
-- Source: IOnlineClaimService.CreateClaimAndActivityRecords → CLAIM table
PRINT '';
PRINT '--- B1. CLAIM header + process_number (FU-063) ---';
SELECT
    cl.claim_seq,
    cl.process_number,
    cl.dealer_number_seq,
    cl.online_claim_temp_seq,
    cl.fiscal_year,
    cl.status,
    cl.created_date,
    cl.created_by,
    CASE WHEN cl.claim_seq > 0 THEN 'PASS' ELSE 'FAIL' END AS ClaimHeaderCheck
FROM dbo.claim cl
WHERE cl.claim_seq = @ClaimSeq;

-- B2. Claim activities (FU-063 continued)
PRINT '';
PRINT '--- B2. ONLINE_ACTIVITY linked to claim (FU-063) ---';
SELECT
    oa.online_activity_seq,
    oa.claim_seq,
    oa.media_type_seq,
    oa.media_other    AS media_name,
    oa.invoice_amount,
    oa.invoice_number,
    oa.preapproval_seq
FROM dbo.online_activity oa
WHERE oa.claim_seq = @ClaimSeq
ORDER BY oa.online_activity_seq;

SELECT
    COUNT(*) AS ClaimActivityCount,
    SUM(invoice_amount) AS TotalInvoiceAmount,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL — No activity records on claim' END AS ClaimActivityCheck
FROM dbo.online_activity
WHERE claim_seq = @ClaimSeq;

-- B3. Claim activity products — SaaS (FU-064)
-- Source: IOnlineClaimService.InsertActivityProduct_SaaS
-- Note: Extra param vs legacy — verify field population here
PRINT '';
PRINT '--- B3. Activity products on claim (FU-064) ---';
SELECT
    ap.activity_product_seq,
    ap.owner_table,
    ap.owner_table_seq,
    ap.product_seq,
    ap.measurement    AS percent_value,
    ap.program_percent
FROM dbo.online_activity_product ap
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = ap.owner_table_seq
WHERE ap.owner_table = 'ONLINE_ACTIVITY'
  AND oa.claim_seq = @ClaimSeq;

-- B4. Claim email contacts (FU-065)
-- Source: SaveEmailsToClaim → IAddressService.UpdateContact (owner_table = CLAIM)
PRINT '';
PRINT '--- B4. CONTACT records on claim (FU-065) ---';
SELECT
    ct.contact_seq,
    ct.owner_table,
    ct.owner_table_seq,
    ct.name,
    ct.email,
    ct.position   AS email_type,
    ct.created_date
FROM dbo.contact ct
WHERE ct.owner_table = 'CLAIM'
  AND ct.owner_table_seq = @ClaimSeq;

SELECT
    COUNT(*) AS EmailContactCount,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN — No email contacts saved on claim' END AS EmailContactCheck
FROM dbo.contact
WHERE owner_table = 'CLAIM'
  AND owner_table_seq = @ClaimSeq;

-- B5. Activity creative type requirement (FU-067)
-- Source: IOnlineClaimService.InsertActivityMediaTypeRequirement (owner_table = ONLINE_ACTIVITY)
PRINT '';
PRINT '--- B5. Activity creative type records (FU-067) ---';
SELECT
    amtr.activity_media_type_requirement_seq,
    amtr.owner_table,
    amtr.owner_table_seq,
    amtr.program_media_type_requirements_seq
FROM dbo.activity_media_type_requirement amtr
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = amtr.owner_table_seq
WHERE amtr.owner_table = 'ONLINE_ACTIVITY'
  AND oa.claim_seq = @ClaimSeq;

-- B6. Comment moved to Claim on submit (FU-062)
PRINT '';
PRINT '--- B6. Comment on CLAIM (moved from TEMP_CLAIM on submit) (FU-062) ---';
SELECT
    c.comment_seq,
    c.owner_table,
    c.owner_table_seq,
    c.comment,
    c.comment_type,
    c.active_flag,
    c.created_date
FROM dbo.comment c
WHERE c.owner_table = 'CLAIM'
  AND c.owner_table_seq = @ClaimSeq
  AND c.comment_type = 'EXTERNAL';


-- ============================================================
-- SUMMARY REPORT
-- ============================================================
PRINT '';
PRINT '=== SUMMARY ===';
SELECT
    cl.claim_seq,
    cl.process_number                                                                   AS [Process Number (4-digit)],
    cl.status,
    (SELECT COUNT(*) FROM dbo.online_activity       WHERE claim_seq     = cl.claim_seq)           AS [Activity Count],
    (SELECT COUNT(*) FROM dbo.document_image di
     INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = di.owner_table_seq
     WHERE di.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = cl.claim_seq)                     AS [Document Count],
    (SELECT COUNT(*) FROM dbo.contact               WHERE owner_table   = 'CLAIM'
                                                      AND owner_table_seq = cl.claim_seq)          AS [Email Contact Count],
    CASE
        WHEN cl.claim_seq > 0
         AND (SELECT COUNT(*) FROM dbo.online_activity WHERE claim_seq = cl.claim_seq) > 0
        THEN 'CORE CHECKS PASSED — review individual sections above for detail'
        ELSE 'FAILED — claim or activity records missing'
    END AS OverallResult
FROM dbo.claim cl
WHERE cl.claim_seq = @ClaimSeq;
