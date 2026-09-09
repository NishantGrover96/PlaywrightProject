-- ============================================================
-- Module  : SPIFF
-- Feature : SPIFF (Flip to Samsung claim submission)
-- Purpose : Verify database records match expected state
--           for SPIFF claim submission / processing / payment.
-- Usage   : Run against target environment DB after test
--           execution. Replace @RebateSeq, @CrcUserSeq,
--           @ProgramSeq, @ContactSeq with test-data values.
--
-- NOTE ON TABLE NAMES: CRC_USER, SPIFF_CLAIM, SPIFF_PAYMENT and
-- SPIFF_PROGRAM are the table names documented in
-- docs/modules/SPIFF.instructions.md ("Key Tables"). The actual
-- claim/search output observed in code (CommonEntity.Claim,
-- CommonEntity.SPIFF.SearchClaimModel) is shaped by stored
-- procedures / views (e.g. a proc backing
-- IRebateService.fetchRebateSpiff / getSearchClaimDetail), not
-- raw table selects - column names below follow those DTOs.
-- CONFIRM real table/column names against the live schema before
-- relying on this script; assumptions are called out inline.
-- ============================================================

-- ── 1. Verify CRC_USER approval flags required before payment (BR: "Full Approval Required for Payment") ──
-- access_flag, taxation_flag, store_owner_approval_flag, admin_approval_flag must ALL = 'Y'.
SELECT
    u.crc_user_seq,
    u.access_flag,
    u.taxation_flag,
    u.store_owner_approval_flag,
    u.admin_approval_flag,
    u.training_flag,
    u.active_Flag,
    u.locked_Flag,
    CASE
        WHEN u.access_flag = 'Y' AND u.taxation_flag = 'Y'
         AND u.store_owner_approval_flag = 'Y' AND u.admin_approval_flag = 'Y'
        THEN 'ELIGIBLE_FOR_PAYMENT'
        ELSE 'NOT_YET_ELIGIBLE'
    END AS payment_eligibility
FROM dbo.CRC_USER u
WHERE u.crc_user_seq = @CrcUserSeq;

-- ── 2. Verify claim exists and its current status ────────────────────────────
-- rebate_status_seq values per docs/modules/SPIFF.instructions.md Config Values:
--   4 = Approved, 18 = ApproveForPayment, 12 = Paid.
SELECT
    c.rebate_seq,
    c.crc_user_seq,
    c.program_seq,
    c.rebate_status_seq,
    c.invoice_number       AS quote_number,
    c.DOS                  AS date_of_sale,
    c.ProjectName,
    c.ProjectCity,
    c.ProjectState,
    c.OriginalBOD,
    c.EngineeringFirmName,
    c.EngineeringContact,
    c.EngineeringPhone,
    c.EngineeringEmail,
    c.SubmissionComments
FROM dbo.SPIFF_CLAIM c
WHERE c.rebate_seq = @RebateSeq;

-- ── 3. Verify claim line status transitions (submit -> approve/deny) ─────────
-- rebateLineStatus per AddClaim.cshtml.cs: 1 = submitted (new), 6 = in-progress
-- (OnPostSaveClaim, new), 7 = re-submit (edit). Approve/Deny selectStatus values
-- confirmed from ProcessClaims UI: 4 = Approve, 5 = Deny.
SELECT
    cl.rebate_product_reference_seq,
    cl.rebate_seq,
    cl.LineStatus,
    cl.Quantity,
    cl.Submit_Quantity,
    cl.ApprovedAmount,
    cl.Comments,
    cl.DenialReasons
FROM dbo.SPIFF_CLAIM_LINE cl
WHERE cl.rebate_seq = @RebateSeq;

-- ── 4. Verify payment record and status progression (Approved -> ApproveForPayment -> Paid) ──
SELECT
    p.rebate_seq,
    p.rebate_status_seq,
    p.PhysicalPaymentTypeSeq,
    p.paid_amount,
    p.paid_date
FROM dbo.SPIFF_PAYMENT p
WHERE p.rebate_seq = @RebateSeq
ORDER BY p.paid_date DESC;

-- ── 5. Verify SPIFF program config (active window, payout, eligible products) ──
SELECT
    pr.program_seq,
    pr.rebate_campaign_seq,
    pr.name,
    pr.start_date,
    pr.end_date,
    pr.cut_off_date,
    pr.active_flag
FROM dbo.SPIFF_PROGRAM pr
WHERE pr.program_seq = @ProgramSeq;

-- ── 6. Verify a claim's contact/engineering fields were persisted (2026-06-24 fix regression check) ──
-- Root-cause bug: these 8 fields previously saved as blank for single-line-item
-- claims (see docs/modules/SPIFF.instructions.md Change Log, 2026-06-24). This
-- check exists specifically to guard against a regression of that fix.
SELECT
    c.rebate_seq,
    c.ProjectName,
    c.ProjectCity,
    c.ProjectState,
    c.OriginalBOD,
    c.EngineeringFirmName,
    c.EngineeringContact,
    c.EngineeringPhone,
    c.EngineeringEmail,
    CASE
        WHEN c.ProjectName IS NULL OR c.ProjectName = '' THEN 'MISSING'
        WHEN c.EngineeringFirmName IS NULL OR c.EngineeringFirmName = '' THEN 'MISSING'
        ELSE 'PRESENT'
    END AS engineering_fields_status
FROM dbo.SPIFF_CLAIM c
WHERE c.rebate_seq = @RebateSeq;

-- ── 7. Verify claim search scoping: SA sees only own claims (SPIFF-06) ────────
SELECT
    c.rebate_seq,
    c.crc_user_seq,
    c.contact_seq
FROM dbo.SPIFF_CLAIM c
WHERE c.contact_seq = @ContactSeq;
-- Expected: every row's contact_seq matches @ContactSeq - no cross-SA leakage.
