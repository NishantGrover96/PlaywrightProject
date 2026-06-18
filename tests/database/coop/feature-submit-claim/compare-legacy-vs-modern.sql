-- ============================================================
-- Legacy vs Modern Database Comparison: Coop — Submit Claim
-- Generated: 2026-06-17 | Pipeline: Step 3 (Migration Comparison)
--
-- Source: FU catalog + mapping.md
-- Key gaps documented: FU-061 (activity dates), FU-059 (vendor contact), FU-064 (product SaaS)
--
-- Usage:
--   @LegacyClaimSeq  = claim_seq from legacy platform test run
--   @ModernClaimSeq  = claim_seq from modern platform test run
--   @LegacyTempSeq   = online_claim_temp_seq from legacy draft
--   @ModernTempSeq   = online_claim_temp_seq from modern draft
--
--   Both databases must be accessible — use linked server or run separately,
--   then merge into #temp tables for the final comparison section.
-- ============================================================

DECLARE @LegacyClaimSeq   BIGINT = 0;
DECLARE @ModernClaimSeq   BIGINT = 0;
DECLARE @LegacyTempSeq    BIGINT = 0;
DECLARE @ModernTempSeq    BIGINT = 0;

PRINT '============================================================';
PRINT 'Coop Submit Claim — Legacy vs Modern DB Comparison';
PRINT 'Legacy claim_seq:  ' + CAST(@LegacyClaimSeq AS VARCHAR);
PRINT 'Modern claim_seq:  ' + CAST(@ModernClaimSeq AS VARCHAR);
PRINT 'Run Date: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================';

-- ============================================================
-- 1. Claim Header Comparison (FU-063)
-- Expected: dealer_number_seq, fiscal_year, status identical
-- ============================================================
PRINT '';
PRINT '--- 1. CLAIM header comparison (FU-063) ---';
-- Run on legacy DB:
SELECT 'Legacy' AS env, claim_seq, dealer_number_seq, fiscal_year, status, created_date
FROM dbo.claim WHERE claim_seq = @LegacyClaimSeq;
-- Run on modern DB:
SELECT 'Modern' AS env, claim_seq, dealer_number_seq, fiscal_year, status, created_date
FROM dbo.claim WHERE claim_seq = @ModernClaimSeq;

-- ============================================================
-- 2. Activity Count and Amounts (FU-063)
-- Expected: COUNT(*) equal, SUM(invoice_amount) equal
-- ============================================================
PRINT '';
PRINT '--- 2. ONLINE_ACTIVITY count and totals (FU-063) ---';
SELECT 'Legacy' AS env, COUNT(*) AS activity_count, SUM(invoice_amount) AS total_invoice_amount
FROM dbo.online_activity WHERE claim_seq = @LegacyClaimSeq;
SELECT 'Modern' AS env, COUNT(*) AS activity_count, SUM(invoice_amount) AS total_invoice_amount
FROM dbo.online_activity WHERE claim_seq = @ModernClaimSeq;

-- ============================================================
-- 3. Document Records (FU-058)
-- Expected: COUNT(*) equal per activity
-- ============================================================
PRINT '';
PRINT '--- 3. DOCUMENT_IMAGE count (FU-058) ---';
SELECT 'Legacy' AS env, COUNT(*) AS doc_count
FROM dbo.document_image di
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = di.owner_table_seq
WHERE di.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @LegacyClaimSeq;

SELECT 'Modern' AS env, COUNT(*) AS doc_count
FROM dbo.document_image di
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = di.owner_table_seq
WHERE di.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @ModernClaimSeq;

-- ============================================================
-- 4. Product Lines (FU-064)
-- Expected: COUNT(*) and sum of measurement = 100 in both
-- Note: modern InsertActivityProductSaaSAsync has extra param — verify field match
-- ============================================================
PRINT '';
PRINT '--- 4. Activity product lines (FU-064) ---';
SELECT 'Legacy' AS env, COUNT(*) AS product_count,
       SUM(CAST(measurement AS DECIMAL(10,2))) AS total_measurement
FROM dbo.online_activity_product ap
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = ap.owner_table_seq
WHERE ap.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @LegacyClaimSeq;

SELECT 'Modern' AS env, COUNT(*) AS product_count,
       SUM(CAST(measurement AS DECIMAL(10,2))) AS total_measurement
FROM dbo.online_activity_product ap
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = ap.owner_table_seq
WHERE ap.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @ModernClaimSeq;

-- ============================================================
-- 5. Vendor Contact Comparison (FU-059 — ACCEPTED EXCEPTION)
-- Fields at risk: last_name, company_name (vendor name), phone_number (formatted vs raw)
-- ============================================================
PRINT '';
PRINT '--- 5. Vendor CONTACT fields (FU-059 — ACCEPTED EXCEPTION) ---';
PRINT '    Compare field-by-field for the fields changed by UpdateContactU01RequestModel';
SELECT 'Legacy' AS env,
       ct.name, ct.last_name, ct.company_name, ct.phone_number, ct.email
FROM dbo.contact ct
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = ct.owner_table_seq
WHERE ct.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @LegacyClaimSeq;

SELECT 'Modern' AS env,
       ct.name, ct.last_name, ct.company_name, ct.phone_number, ct.email
FROM dbo.contact ct
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = ct.owner_table_seq
WHERE ct.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @ModernClaimSeq;

-- ============================================================
-- 6. ACCEPTED EXCEPTION — Activity Dates (FU-061)
-- Expected (legacy): > 0 rows in ONLINE_ACTIVITY_DATE
-- Expected (modern): 0 rows (exception accepted 2026-06-17)
-- ============================================================
PRINT '';
PRINT '--- 6. ONLINE_ACTIVITY_DATE — FU-061 ACCEPTED EXCEPTION ---';

-- On legacy DB:
SELECT 'Legacy' AS env, COUNT(*) AS activity_date_count
FROM dbo.online_activity_date oad
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = oad.owner_table_seq
WHERE oad.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @LegacyClaimSeq;

-- On modern DB (expected 0):
SELECT 'Modern' AS env, COUNT(*) AS activity_date_count,
       CASE
           WHEN COUNT(*) = 0 THEN 'CONFIRMED EXCEPTION (FU-061 accepted 2026-06-17)'
           ELSE 'NOTE: Dates ARE present — exception may be resolved'
       END AS ExceptionStatus
FROM dbo.online_activity_date oad
INNER JOIN dbo.online_activity oa ON oa.online_activity_seq = oad.owner_table_seq
WHERE oad.owner_table = 'ONLINE_ACTIVITY' AND oa.claim_seq = @ModernClaimSeq;

-- ============================================================
-- 7. Email Contacts (FU-065)
-- Expected: At least submitter email in both
-- ============================================================
PRINT '';
PRINT '--- 7. Claim email contacts (FU-065) ---';
SELECT 'Legacy' AS env, COUNT(*) AS contact_count
FROM dbo.contact WHERE owner_table = 'CLAIM' AND owner_table_seq = @LegacyClaimSeq;
SELECT 'Modern' AS env, COUNT(*) AS contact_count
FROM dbo.contact WHERE owner_table = 'CLAIM' AND owner_table_seq = @ModernClaimSeq;

-- ============================================================
-- 8. Summary Discrepancy Table
-- ============================================================
PRINT '';
PRINT '--- 8. Summary discrepancy table ---';
PRINT '    Populate from results above:';
PRINT '';
PRINT '    Field                     | Legacy | Modern | Match?';
PRINT '    --------------------------|--------|--------|-------';
PRINT '    claim header exists       |        |        |';
PRINT '    activity_count            |        |        |';
PRINT '    total_invoice_amount      |        |        |';
PRINT '    doc_count                 |        |        |';
PRINT '    product_count             |        |        |';
PRINT '    vendor last_name          |        |        | (FU-059 risk)';
PRINT '    vendor company_name       |        |        | (FU-059 risk)';
PRINT '    vendor phone_number       |        |        | (FU-059 risk)';
PRINT '    activity_date_count       |        |  0     | FU-061 accepted';
PRINT '    email_contact_count       |        |        |';
