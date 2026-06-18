-- ============================================================
-- Module  : {{MODULE_LABEL}}
-- Feature : {{FEATURE_LABEL}}
-- Purpose : Verify database records match expected state
--           after {{FEATURE_LABEL}} operations
-- ============================================================

-- TODO: Replace with actual table names and columns

-- 1. Verify record was created / updated
SELECT
    Id,
    Status,
    CreatedDate,
    ModifiedDate
FROM dbo.{{TABLE_NAME}}
WHERE Id = @RecordId;

-- 2. Compare legacy vs modern output
-- Run against both environments and diff the results
SELECT
    l.Id         AS LegacyId,
    m.Id         AS ModernId,
    l.Status     AS LegacyStatus,
    m.Status     AS ModernStatus,
    CASE WHEN l.Status = m.Status THEN 'MATCH' ELSE 'MISMATCH' END AS Result
FROM LegacyDB.dbo.{{TABLE_NAME}} l
FULL OUTER JOIN ModernDB.dbo.{{TABLE_NAME}} m ON l.Id = m.Id
WHERE l.Id = @RecordId OR m.Id = @RecordId;
