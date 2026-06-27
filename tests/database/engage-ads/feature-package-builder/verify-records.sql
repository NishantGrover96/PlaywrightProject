-- EngageAds Package Builder — DB Verification Queries
-- US141359 | Generated: 2026-06-27
-- Replace :package_seq with the actual sequence from a test run.

-- 1. Confirm package was created with correct flags
SELECT
    package_seq,
    package_name,
    default_billing_term,
    active_flag,
    is_inquiry_only,
    is_deleted,
    created_date
FROM EngageAds.package
WHERE package_seq = :package_seq;
-- Expected: 1 row, active_flag=1, is_deleted=0

-- 2. Confirm package_eligibility rows were auto-seeded
SELECT
    COUNT(*) AS eligibility_count,
    SUM(CASE WHEN allow_flag = 1 THEN 1 ELSE 0 END) AS allow_count,
    SUM(CASE WHEN active_flag = 1 THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) AS not_deleted_count
FROM EngageAds.package_eligibility
WHERE package_seq = :package_seq
  AND owner_table = 'PROGRAM_DEALER_TYPE';
-- Expected: eligibility_count >= 10, all counts equal eligibility_count

-- 3. Confirm no duplicate eligibility rows
SELECT owner_table_seq, COUNT(*) AS cnt
FROM EngageAds.package_eligibility
WHERE package_seq = :package_seq
  AND owner_table = 'PROGRAM_DEALER_TYPE'
  AND is_deleted = 0
GROUP BY owner_table_seq
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- 4. Confirm pricing stored as cents
SELECT
    package_pricing_seq,
    price_cents,
    billing_term,
    is_current,
    coop_eligible_percent
FROM EngageAds.package_pricing
WHERE package_seq = :package_seq;
-- Expected: price_cents = UI_price_dollars * 100

-- 5. Confirm CAMPAIGN_LENGTH feature items save correctly
SELECT
    package_description_item_seq,
    item_type,
    title,
    is_deleted
FROM EngageAds.package_description_items
WHERE package_seq = :package_seq
  AND item_type = 'CAMPAIGN_LENGTH'
  AND is_deleted = 0;
-- Expected: rows present if CAMPAIGN_LENGTH items were added (constraint allows underscore)

-- 6. Confirm all feature items with their section types
SELECT item_type, COUNT(*) AS item_count
FROM EngageAds.package_description_items
WHERE package_seq = :package_seq
  AND is_deleted = 0
GROUP BY item_type;
-- Expected: only CAMPAIGN_LENGTH, WHATS_INCLUDED, BEST_FOR, RECOMMENDATION

-- 7. Confirm edit-save does not duplicate eligibility rows
SELECT COUNT(*) AS total_elig
FROM EngageAds.package_eligibility
WHERE package_seq = :package_seq
  AND is_deleted = 0;
-- Expected: same count before and after an edit-save operation

-- 8. Confirm DB constraint allows CAMPAIGN_LENGTH (underscore)
SELECT name, definition
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('EngageAds.package_description_items')
  AND name = 'CK_pdi_item_type';
-- Expected: definition contains 'CAMPAIGN_LENGTH'
