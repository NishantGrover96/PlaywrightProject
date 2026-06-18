-- Coop — Submit Pre-Approval — Database Verification Queries
-- Module: coop | Feature: submit-preapproval
-- Generated: 2026-06-17 | Pipeline: Step 3 (Database Verification)
--
-- Replace :preapproval_number and :preapproval_seq with the actual values
-- from the confirmation number displayed after submission.
--
-- Usage: Run against the MODERN database after a test submission.
--        Compare results with compare-legacy-vs-modern.sql for parity checks.

-- ── 1. Verify preapproval header record created ──────────────────────────────
-- FU-039: Preapproval header exists with correct fields
SELECT
    pa.preapproval_seq,
    pa.preapproval_number,
    pa.status,
    pa.received_date,
    pa.start_date,
    pa.end_date,
    pa.program_seq,
    pa.media_type_seq,
    pa.amount,
    pa.advertised_amount,
    pa.percent,
    pa.online_submission_source,
    pa.submitter_name,
    pa.fiscal_year
FROM preapproval pa
WHERE pa.preapproval_number = :preapproval_number
ORDER BY pa.preapproval_seq DESC;


-- ── 2. Verify dealer linked to preapproval ───────────────────────────────────
-- FU-034: preapproval_dealer record exists
SELECT
    pad.preapproval_dealer_seq,
    pad.preapproval_seq,
    pad.dealer_number_seq,
    d.dealer_number,
    d.name AS dealer_name
FROM preapproval_dealer pad
INNER JOIN dealer_number d ON d.dealer_number_seq = pad.dealer_number_seq
WHERE pad.preapproval_seq = :preapproval_seq;


-- ── 3. Verify document linked ────────────────────────────────────────────────
-- FU-040: document_image record exists with owner = preapproval
SELECT
    di.document_image_seq,
    di.document_type_seq,
    di.owner_table,
    di.owner_table_seq,
    di.name AS file_name,
    di.created_date
FROM document_image di
WHERE di.owner_table = 'Preapproval'
  AND di.owner_table_seq = :preapproval_seq;


-- ── 4. Verify product linked ─────────────────────────────────────────────────
-- FU-041: preapproval_product record exists (when DisplayProductBlock != "Y")
SELECT
    pp.preapproval_product_seq,
    pp.preapproval_seq,
    pp.product_seq,
    pp.fiscal_year,
    pp.division_seq
FROM preapproval_product pp
WHERE pp.preapproval_seq = :preapproval_seq;


-- ── 5. Verify email contacts saved ───────────────────────────────────────────
-- FU-042: contact records with owner = Preapproval
SELECT
    c.contact_seq,
    c.owner_table,
    c.owner_table_seq,
    c.email,
    c.position,
    c.name
FROM contact c
WHERE c.owner_table = 'Preapproval'
  AND c.owner_table_seq = :preapproval_seq;


-- ── 6. Verify comment saved (when comment was entered) ───────────────────────
-- FU-038: comment record exists
SELECT
    cm.comment_seq,
    cm.owner_table_seq,
    cm.owner_table,
    cm.comment_type,
    cm.comment_source,
    cm.comment,
    cm.submitter_name,
    cm.active_flag,
    cm.created_date
FROM comment cm
WHERE cm.owner_table = 'Preapproval'
  AND cm.owner_table_seq = :preapproval_seq
  AND cm.comment_type = 'EXTERNAL';


-- ── 7. Verify additional info saved (URL) ────────────────────────────────────
-- FU-037: additional_info record exists when URL was provided
SELECT
    ai.additional_info_seq,
    ai.owner_table_seq,
    ai.info_type,
    ai.info_value
FROM preapproval_additional_info ai
WHERE ai.owner_table_seq = :preapproval_seq
  AND ai.info_type = 'URL';


-- ── 8. Verify Shows & Events record (FU-036 gap verification) ────────────────
-- COOP-PA-FU-036 MEDIUM GAP: equipment_list, dealers, cost may be missing in modern
-- Run this for IndvShow/GrpShow branch preapprovals to document gap
SELECT
    ds.dealer_show_seq,
    ds.preapproval_seq,
    ds.show_name,
    ds.show_location,
    ds.show_type,
    ds.cost,              -- EXPECTED: populated; may be NULL in modern (gap)
    ds.equipment_list,    -- EXPECTED: populated; may be NULL in modern (gap)
    ds.dealers,           -- EXPECTED: populated for group shows; may be NULL in modern (gap)
    ds.dlr_racf,          -- EXPECTED: submitter RACF; may be NULL in modern (gap)
    ds.email,             -- EXPECTED: TO email; may be NULL in modern (gap)
    ds.dlr_form_status,   -- EXPECTED: "SUBMITTED"; may be NULL in modern (gap)
    ds.start_date,
    ds.end_date,
    ds.fiscal_year
FROM dealer_shows ds
WHERE ds.preapproval_seq = :preapproval_seq;
-- GAP NOTE: If cost, equipment_list, dealers, dlr_racf, email are NULL,
--           this confirms COOP-PA-FU-036 gap in modern backend API.
--           Report to backend team: IPreapprovalSubmissionApiService.LinkShowToPreapprovalAsync
--           must be extended to accept and persist these fields.


-- ── 9. Status verification ───────────────────────────────────────────────────
-- FU-026: Verify correct status assigned by branch
SELECT
    pa.preapproval_number,
    pa.status,
    mt.media_type,
    mt.path_name AS branch
FROM preapproval pa
INNER JOIN media_type mt ON mt.media_type_seq = pa.media_type_seq
WHERE pa.preapproval_number = :preapproval_number;
-- EXPECTED:
--   branch = indvshow / sponsor         → status = 'Awaiting CSR'
--   branch = mainbranch + websites&seo  → status = 'Awaiting CSR'
--   all others                          → status = 'Submitted'
