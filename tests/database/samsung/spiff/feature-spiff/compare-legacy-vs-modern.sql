-- ============================================================
-- Module  : SPIFF
-- Feature : SPIFF (Flip to Samsung claim submission)
-- Purpose : Compare legacy vs modern SPIFF claim/payment data
--           for migration validation.
-- Usage   : Run both DBs via linked server or manually import
--           legacy results and compare. Replace parameter
--           values as needed.
--
-- NOTE: Table/column names follow docs/modules/SPIFF.instructions.md
-- ("Key Tables": CRC_USER, SPIFF_CLAIM, SPIFF_PAYMENT, SPIFF_PROGRAM)
-- and the DTO shapes in CommonEntity.Claim / CommonEntity.SPIFF.
-- SearchClaimModel - not confirmed against a live schema. Verify
-- against the actual legacy/modern DBs before running.
-- ============================================================

-- ── 1. Compare claim header data: legacy vs modern ────────────────────────────
SELECT
    ISNULL(l.rebate_seq, m.rebate_seq)               AS rebate_seq,
    l.rebate_status_seq  AS legacy_status,
    m.rebate_status_seq  AS modern_status,
    l.invoice_number     AS legacy_quote_number,
    m.invoice_number     AS modern_quote_number,
    l.ProjectName        AS legacy_project_name,
    m.ProjectName         AS modern_project_name,
    CASE
        WHEN l.rebate_status_seq = m.rebate_status_seq
         AND l.invoice_number    = m.invoice_number
         AND l.ProjectName       = m.ProjectName
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS claim_header_result
FROM LegacyDB.dbo.SPIFF_CLAIM l
FULL OUTER JOIN ModernDB.dbo.SPIFF_CLAIM m
    ON l.rebate_seq = m.rebate_seq
WHERE l.program_seq = @ProgramSeq
   OR m.program_seq = @ProgramSeq
ORDER BY claim_header_result DESC, rebate_seq;

-- ── 2. Compare claim line status / approved amounts ───────────────────────────
SELECT
    ISNULL(l.rebate_product_reference_seq, m.rebate_product_reference_seq) AS line_seq,
    l.LineStatus       AS legacy_line_status,
    m.LineStatus       AS modern_line_status,
    l.ApprovedAmount   AS legacy_approved_amount,
    m.ApprovedAmount   AS modern_approved_amount,
    CASE
        WHEN l.LineStatus = m.LineStatus AND l.ApprovedAmount = m.ApprovedAmount
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS line_result
FROM LegacyDB.dbo.SPIFF_CLAIM_LINE l
FULL OUTER JOIN ModernDB.dbo.SPIFF_CLAIM_LINE m
    ON l.rebate_product_reference_seq = m.rebate_product_reference_seq
WHERE l.rebate_seq = @RebateSeq
   OR m.rebate_seq = @RebateSeq
ORDER BY line_result DESC;

-- ── 3. Compare CRC_USER approval-flag gating (BR: full approval required for payment) ──
SELECT
    ISNULL(l.crc_user_seq, m.crc_user_seq) AS crc_user_seq,
    l.access_flag              AS legacy_access_flag,
    m.access_flag               AS modern_access_flag,
    l.taxation_flag             AS legacy_taxation_flag,
    m.taxation_flag              AS modern_taxation_flag,
    l.store_owner_approval_flag AS legacy_store_owner_flag,
    m.store_owner_approval_flag  AS modern_store_owner_flag,
    l.admin_approval_flag       AS legacy_admin_flag,
    m.admin_approval_flag        AS modern_admin_flag,
    CASE
        WHEN l.access_flag = m.access_flag
         AND l.taxation_flag = m.taxation_flag
         AND l.store_owner_approval_flag = m.store_owner_approval_flag
         AND l.admin_approval_flag = m.admin_approval_flag
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS approval_flags_result
FROM LegacyDB.dbo.CRC_USER l
FULL OUTER JOIN ModernDB.dbo.CRC_USER m
    ON l.crc_user_seq = m.crc_user_seq
WHERE l.crc_user_seq = @CrcUserSeq
   OR m.crc_user_seq = @CrcUserSeq;

-- ── 4. Compare payment status progression (Approved -> ApproveForPayment -> Paid) ──
SELECT
    ISNULL(l.rebate_seq, m.rebate_seq) AS rebate_seq,
    l.rebate_status_seq  AS legacy_payment_status,
    m.rebate_status_seq  AS modern_payment_status,
    l.paid_amount        AS legacy_paid_amount,
    m.paid_amount         AS modern_paid_amount,
    CASE
        WHEN l.rebate_status_seq = m.rebate_status_seq AND l.paid_amount = m.paid_amount
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS payment_result
FROM LegacyDB.dbo.SPIFF_PAYMENT l
FULL OUTER JOIN ModernDB.dbo.SPIFF_PAYMENT m
    ON l.rebate_seq = m.rebate_seq
WHERE l.rebate_seq = @RebateSeq
   OR m.rebate_seq = @RebateSeq;

-- ── 5. Summary mismatch count ──────────────────────────────────────────────────
-- Quick gate: if any mismatches exist, migration is not complete.
-- Replace inline SELECT subqueries below with actual CTEs/temp tables
-- populated from sections 1-4 above when running as a single script.
SELECT
    'Claim Header'    AS check_name, SUM(CASE WHEN claim_header_result = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS claim_header_result) a
UNION ALL
SELECT
    'Claim Lines'     AS check_name, SUM(CASE WHEN line_result = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS line_result) b
UNION ALL
SELECT
    'Approval Flags'  AS check_name, SUM(CASE WHEN approval_flags_result = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS approval_flags_result) c
UNION ALL
SELECT
    'Payment Status'  AS check_name, SUM(CASE WHEN payment_result = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS payment_result) d;
