-- Coop — Submit Pre-Approval — Legacy vs Modern Comparison Queries
-- Module: coop | Feature: submit-preapproval
-- Generated: 2026-06-19 | Pipeline: Step 3 (Database Comparison — Re-run)
--
-- Run against BOTH legacy and modern databases with the same preapproval_number.
-- Compare results to verify data parity between the two implementations.
--
-- Parameters: :preapproval_number — from confirmation panel after test submission

-- ============================================================================
-- SECTION 1 — PREAPPROVAL HEADER RECORD PARITY
-- Expected: All fields identical except any implementation-level differences
-- ============================================================================

SELECT
    'preapproval_header' AS record_type,
    pa.preapproval_number,
    pa.status,
    pa.program_seq,
    pa.media_type_seq,
    pa.fiscal_year,
    pa.amount,
    pa.advertised_amount,
    pa.percent,
    pa.online_submission_source,
    pa.submitter_name,
    pa.received_date,
    pa.start_date,
    pa.end_date
FROM preapproval pa
WHERE pa.preapproval_number = :preapproval_number;

-- PARITY CHECK: Should be identical between legacy and modern.


-- ============================================================================
-- SECTION 2 — PREAPPROVAL DEALER RECORD PARITY
-- Expected: Dealer(s) linked, parent dealer included when applicable
-- ============================================================================

SELECT
    'preapproval_dealer' AS record_type,
    pad.preapproval_dealer_seq,
    pad.dealer_number_seq,
    d.dealer_number,
    d.name AS dealer_name
FROM preapproval_dealer pad
INNER JOIN preapproval pa ON pa.preapproval_seq = pad.preapproval_seq
INNER JOIN dealer_number d ON d.dealer_number_seq = pad.dealer_number_seq
WHERE pa.preapproval_number = :preapproval_number
ORDER BY pad.dealer_number_seq;

-- PARITY CHECK: Same dealer_number_seq(s) in both legacy and modern.


-- ============================================================================
-- SECTION 3 — DOCUMENT IMAGE RECORD PARITY
-- Expected: At least one document linked with type = Preapproval
-- ============================================================================

SELECT
    'document_image' AS record_type,
    di.document_type_seq,
    di.owner_table,
    -- File name includes preapproval_number + dealer_number + unique_id
    -- Exact name will differ between legacy and modern; check pattern
    CASE WHEN di.name LIKE CONCAT(:preapproval_number, '%') THEN 'name_ok' ELSE 'name_check' END AS name_check,
    di.created_date
FROM document_image di
INNER JOIN preapproval pa ON pa.preapproval_seq = di.owner_table_seq
WHERE di.owner_table = 'Preapproval'
  AND pa.preapproval_number = :preapproval_number;

-- PARITY CHECK: Document record exists in both.


-- ============================================================================
-- SECTION 4 — CONTACT (EMAIL) RECORD PARITY
-- Expected: TO and CC contacts saved for submitter and selected contacts
-- ============================================================================

SELECT
    'contact' AS record_type,
    c.email,
    c.position,
    c.name
FROM contact c
INNER JOIN preapproval pa ON pa.preapproval_seq = c.owner_table_seq
WHERE c.owner_table = 'Preapproval'
  AND pa.preapproval_number = :preapproval_number
ORDER BY c.position, c.email;

-- PARITY CHECK: Same email addresses and positions in both.


-- ============================================================================
-- SECTION 5 — DEALER SHOWS RECORD PARITY (FU-036 GAP)
-- Expected: For IndvShow/GrpShow — all fields populated
-- MODERN GAP: equipment_list, dealers, cost, dlr_racf, email may be NULL
-- ============================================================================

SELECT
    'dealer_shows' AS record_type,
    ds.show_name,
    ds.show_location,
    ds.show_type,
    ds.start_date,
    ds.end_date,
    -- FU-036 gap fields:
    ds.cost,
    ds.equipment_list,
    ds.dealers,
    ds.dlr_racf,
    ds.email,
    ds.dlr_form_status
FROM dealer_shows ds
INNER JOIN preapproval pa ON pa.preapproval_seq = ds.preapproval_seq
WHERE pa.preapproval_number = :preapproval_number;

-- LEGACY: All columns populated.
-- MODERN: cost/equipment_list/dealers/dlr_racf/email may be NULL.
-- If NULL in modern → confirms COOP-PA-FU-036 gap.
-- ACTION REQUIRED: Backend team must extend LinkShowToPreapprovalAsync
--   in IPreapprovalSubmissionApiService to accept and persist these fields.


-- ============================================================================
-- SECTION 6 — COMMENT RECORD PARITY
-- Expected: EXTERNAL comment with source=Submitter when comment was entered
-- ============================================================================

SELECT
    'comment' AS record_type,
    cm.comment_type,
    cm.comment_source,
    cm.comment,
    cm.submitter_name,
    cm.active_flag,
    cm.print_flag
FROM comment cm
INNER JOIN preapproval pa ON pa.preapproval_seq = cm.owner_table_seq
WHERE cm.owner_table = 'Preapproval'
  AND pa.preapproval_number = :preapproval_number
  AND cm.comment_type = 'EXTERNAL';

-- PARITY CHECK: Comment text, source, active/print flags identical.


-- ============================================================================
-- SECTION 7 — SUMMARY PARITY SCORECARD
-- Run this last to get a quick parity overview
-- ============================================================================

SELECT
    'preapproval'         AS table_name,
    COUNT(*)              AS record_count,
    MIN(pa.status)        AS status
FROM preapproval pa
WHERE pa.preapproval_number = :preapproval_number

UNION ALL

SELECT 'preapproval_dealer', COUNT(*), NULL
FROM preapproval_dealer pad
INNER JOIN preapproval pa ON pa.preapproval_seq = pad.preapproval_seq
WHERE pa.preapproval_number = :preapproval_number

UNION ALL

SELECT 'document_image', COUNT(*), NULL
FROM document_image di
INNER JOIN preapproval pa ON pa.preapproval_seq = di.owner_table_seq
WHERE di.owner_table = 'Preapproval' AND pa.preapproval_number = :preapproval_number

UNION ALL

SELECT 'contact', COUNT(*), NULL
FROM contact c
INNER JOIN preapproval pa ON pa.preapproval_seq = c.owner_table_seq
WHERE c.owner_table = 'Preapproval' AND pa.preapproval_number = :preapproval_number

UNION ALL

SELECT 'dealer_shows', COUNT(*), NULL
FROM dealer_shows ds
INNER JOIN preapproval pa ON pa.preapproval_seq = ds.preapproval_seq
WHERE pa.preapproval_number = :preapproval_number;

-- EXPECTED for a standard mainbranch submission:
--   preapproval          = 1 (status = Submitted)
--   preapproval_dealer   ≥ 1 (submitter dealer + optional parent)
--   document_image       ≥ 1
--   contact              ≥ 1 (TO email)
--   dealer_shows         = 0 (mainbranch has no shows record)
--
-- For IndvShow/GrpShow:
--   dealer_shows = 1 (may have gap fields NULL in modern)
