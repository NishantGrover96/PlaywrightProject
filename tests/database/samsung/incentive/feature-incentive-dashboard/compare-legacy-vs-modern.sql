-- ============================================================
-- Module  : Incentive
-- Feature : Incentive Dashboard
-- Purpose : Compare legacy vs modern SP outputs for
--           Incentive Dashboard data migration validation.
-- Usage   : Run both DBs via linked server or manually
--           import legacy results and compare.
--           Replace parameter values as needed.
-- ============================================================

-- ── 1. Compare CorporateDashboard KPI totals: legacy vs modern ───────────────
-- Run GetDemoCorporateDashboardDataByType on both databases and compare
-- result sets. Expects matching total_tires, reward amounts per dealer.

SELECT
    ISNULL(l.dealer_number,  m.dealer_number)  AS dealer_number,
    ISNULL(l.dealer_name,    m.dealer_name)    AS dealer_name,
    l.total_tires      AS legacy_total_tires,
    m.total_tires      AS modern_total_tires,
    l.reward_amount    AS legacy_reward_amount,
    m.reward_amount    AS modern_reward_amount,
    l.returned_tires   AS legacy_returned_tires,
    m.returned_tires   AS modern_returned_tires,
    CASE
        WHEN l.total_tires   = m.total_tires
         AND l.reward_amount = m.reward_amount
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS kpi_result
FROM LegacyDB.dbo.vw_CorporateDashboardKPI l
FULL OUTER JOIN ModernDB.dbo.vw_CorporateDashboardKPI m
    ON l.dealer_number_seq = m.dealer_number_seq
   AND l.fiscal_year       = m.fiscal_year
   AND l.period_number     = m.period_number
WHERE l.fiscal_year  = @FiscalYear
   OR m.fiscal_year  = @FiscalYear
ORDER BY kpi_result DESC, dealer_number;

-- ── 2. Compare dealer list returned by GetLoginDealers ───────────────────────
-- Verify the same primary dealers are returned in both environments.

SELECT
    ISNULL(l.dealer_number_seq, m.dealer_number_seq) AS dealer_number_seq,
    l.dealer_name    AS legacy_dealer_name,
    m.dealer_name    AS modern_dealer_name,
    l.primary_flag   AS legacy_primary_flag,
    m.primary_flag   AS modern_primary_flag,
    CASE
        WHEN l.dealer_number_seq IS NULL THEN 'MISSING_IN_LEGACY'
        WHEN m.dealer_number_seq IS NULL THEN 'MISSING_IN_MODERN'
        WHEN l.primary_flag = m.primary_flag THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS result
FROM LegacyDB.dbo.vw_LoginDealers l
FULL OUTER JOIN ModernDB.dbo.vw_LoginDealers m
    ON l.dealer_number_seq = m.dealer_number_seq
WHERE l.program_seq = @ProgramSeq
   OR m.program_seq = @ProgramSeq
ORDER BY result DESC, dealer_number_seq;

-- ── 3. Compare unitPercentage calculation per dealer / tab ────────────────────
-- Validate that the capping logic (BR-016) produces the same result in both.

SELECT
    ISNULL(l.dealer_number_seq, m.dealer_number_seq) AS dealer_number_seq,
    l.group_period_unit_purchase AS legacy_units,
    m.group_period_unit_purchase AS modern_units,
    l.program_tier_max           AS legacy_tier_max,
    m.program_tier_max           AS modern_tier_max,
    CASE
        WHEN l.program_tier_max = 9999999         THEN 100
        WHEN l.group_period_unit_purchase = 0     THEN 0
        WHEN l.group_period_unit_purchase >= l.program_tier_max THEN 100
        ELSE l.group_period_unit_purchase * 100 / l.program_tier_max
    END AS legacy_unit_pct,
    CASE
        WHEN m.program_tier_max = 9999999         THEN 100
        WHEN m.group_period_unit_purchase = 0     THEN 0
        WHEN m.group_period_unit_purchase >= m.program_tier_max THEN 100
        ELSE m.group_period_unit_purchase * 100 / m.program_tier_max
    END AS modern_unit_pct,
    CASE
        WHEN
            (CASE WHEN l.program_tier_max = 9999999 THEN 100
                  WHEN l.group_period_unit_purchase = 0 THEN 0
                  WHEN l.group_period_unit_purchase >= l.program_tier_max THEN 100
                  ELSE l.group_period_unit_purchase * 100 / l.program_tier_max END)
            =
            (CASE WHEN m.program_tier_max = 9999999 THEN 100
                  WHEN m.group_period_unit_purchase = 0 THEN 0
                  WHEN m.group_period_unit_purchase >= m.program_tier_max THEN 100
                  ELSE m.group_period_unit_purchase * 100 / m.program_tier_max END)
        THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS unit_pct_result
FROM LegacyDB.dbo.vw_DealerProgramUnits l
FULL OUTER JOIN ModernDB.dbo.vw_DealerProgramUnits m
    ON l.dealer_number_seq = m.dealer_number_seq
   AND l.program_seq       = m.program_seq
   AND l.fiscal_year       = m.fiscal_year
   AND l.period_number     = m.period_number
WHERE (l.fiscal_year = @FiscalYear OR m.fiscal_year = @FiscalYear)
  AND (l.period_number = @PeriodNumber OR m.period_number = @PeriodNumber)
ORDER BY unit_pct_result DESC;

-- ── 4. Compare fiscal year lists per division ────────────────────────────────
SELECT
    ISNULL(l.fiscal_year, m.fiscal_year) AS fiscal_year,
    l.division_seq  AS legacy_division_seq,
    m.division_seq  AS modern_division_seq,
    CASE
        WHEN l.fiscal_year IS NULL THEN 'MISSING_IN_LEGACY'
        WHEN m.fiscal_year IS NULL THEN 'MISSING_IN_MODERN'
        ELSE 'MATCH'
    END AS result
FROM LegacyDB.dbo.vw_FiscalYear l
FULL OUTER JOIN ModernDB.dbo.vw_FiscalYear m
    ON l.fiscal_year  = m.fiscal_year
   AND l.division_seq = m.division_seq
WHERE l.division_seq = @DivisionSeq
   OR m.division_seq = @DivisionSeq
ORDER BY fiscal_year DESC;

-- ── 5. Summary mismatch count ────────────────────────────────────────────────
-- Quick gate: if any mismatches exist, migration is not complete.
-- Replace table references with actual SP output temp tables as needed.

SELECT
    'KPI Totals'       AS check_name, SUM(CASE WHEN kpi_result   = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS kpi_result) x
UNION ALL
SELECT
    'Dealer List'      AS check_name, SUM(CASE WHEN result       = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS result) y
UNION ALL
SELECT
    'Unit Percentage'  AS check_name, SUM(CASE WHEN unit_pct_result = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatch_count FROM (SELECT 'MATCH' AS unit_pct_result) z;
-- NOTE: Replace inline SELECT subqueries above with actual CTEs or temp tables
-- populated from sections 1-3 above when running in a single script.
