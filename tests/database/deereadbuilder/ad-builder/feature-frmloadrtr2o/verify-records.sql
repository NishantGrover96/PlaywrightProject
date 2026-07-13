-- ============================================================
-- Module  : Ad-Builder
-- Feature : Load RTR
-- Purpose : Verify database records match expected state
--           after Load RTR operations
-- ============================================================

-- TODO: Replace with actual table names and columns

-- 1. Verify record was created / updated
SELECT
    Id,
    Status,
    CreatedDate,
    ModifiedDate
FROM dbo.TableName
WHERE Id = @RecordId;

-- 2. Compare legacy vs modern output
-- Run against both environments and diff the results
SELECT
    l.Id         AS LegacyId,
    m.Id         AS ModernId,
    l.Status     AS LegacyStatus,
    m.Status     AS ModernStatus,
    CASE WHEN l.Status = m.Status THEN 'MATCH' ELSE 'MISMATCH' END AS Result
FROM LegacyDB.dbo.TableName l
FULL OUTER JOIN ModernDB.dbo.TableName m ON l.Id = m.Id
WHERE l.Id = @RecordId OR m.Id = @RecordId;

