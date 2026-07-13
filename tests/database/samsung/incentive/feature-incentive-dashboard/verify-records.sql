-- ============================================================
-- Module  : Incentive
-- Feature : Incentive Dashboard
-- Purpose : Verify database records match expected state
--           for Incentive Dashboard operations.
-- Usage   : Run against target environment DB after test
--           execution. Replace @DealerNumberSeq, @ProgramSeq,
--           @FiscalYear, @PeriodNumber with test-data values.
-- ============================================================

-- ── 1. Verify dealer exists and is primary ───────────────────────────────────
SELECT
    d.dealer_number_seq,
    d.dealer_name,
    d.dealer_number,
    d.primary_flag
FROM dbo.Dealer d
WHERE d.dealer_number_seq = @DealerNumberSeq
  AND d.primary_flag = 'Y';

-- ── 2. Verify fiscal year data exists for given division ─────────────────────
SELECT
    fy.fiscal_year,
    fy.division_seq,
    fy.start_date,
    fy.end_date
FROM dbo.FiscalYear fy
WHERE fy.division_seq = @DivisionSeq
ORDER BY fy.fiscal_year DESC;

-- ── 3. Verify program config (ConvertToRewards, IsShowPurchase) ──────────────
SELECT
    p.program_seq,
    p.program_name,
    p.ConvertToRewards,
    p.IsShowPurchase,
    p.active_flag
FROM dbo.Program p
WHERE p.program_seq = @ProgramSeq;

-- ── 4. Verify unit purchase data for a dealer / period ───────────────────────
SELECT
    upd.dealer_number_seq,
    upd.program_seq,
    upd.fiscal_year,
    upd.period_number,
    upd.group_period_unit_purchase,
    upd.program_tier_max,
    CASE
        WHEN upd.program_tier_max = 9999999         THEN 100
        WHEN upd.group_period_unit_purchase = 0     THEN 0
        WHEN upd.group_period_unit_purchase >= upd.program_tier_max THEN 100
        ELSE upd.group_period_unit_purchase * 100 / upd.program_tier_max
    END AS expected_unit_percentage
FROM dbo.UnitPurchaseDetail upd
WHERE upd.dealer_number_seq = @DealerNumberSeq
  AND upd.program_seq       = @ProgramSeq
  AND upd.fiscal_year       = @FiscalYear
  AND upd.period_number     = @PeriodNumber;

-- ── 5. Verify reward redemption status ──────────────────────────────────────
SELECT
    rr.dealer_number_seq,
    rr.fiscal_year,
    rr.period_number,
    rr.redeemed_date,
    rr.already_redeemed
FROM dbo.RewardRedemption rr
WHERE rr.dealer_number_seq = @DealerNumberSeq
  AND rr.fiscal_year       = @FiscalYear
  AND rr.period_number     = @PeriodNumber;

-- ── 6. Verify territory manager (TBM) assignment ────────────────────────────
SELECT
    tm.owner_table_seq,
    tm.user_type,
    tm.organization_structure_seq,
    tm.active_flag
FROM dbo.TerritoryManager tm
WHERE tm.owner_table_seq = @TerritoryManagerSeq
  AND tm.active_flag     = 'Y';

-- ── 7. Verify distributor by program ────────────────────────────────────────
SELECT
    dist.dealer_number_seq,
    dist.dealer_name,
    dist.dealer_number,
    dist.primary_flag,
    dist.organization_structure_seq
FROM dbo.Dealer dist
WHERE dist.organization_structure_seq = @OrgStructureSeq
  AND dist.active_flag                = 'Y'
ORDER BY dist.dealer_name;

-- ── 8. Spot-check: dealer_number_seq never appears as plain int in API view ──
-- (Verify the encrypt function is applied via a view or SP)
SELECT TOP 5
    d.dealer_number_seq,
    LEN(CAST(d.dealer_number_seq AS NVARCHAR)) AS raw_length
FROM dbo.Dealer d
WHERE d.primary_flag = 'Y'
ORDER BY d.dealer_number_seq;
-- Expected: these are raw DB values; the API layer must encrypt them before returning
