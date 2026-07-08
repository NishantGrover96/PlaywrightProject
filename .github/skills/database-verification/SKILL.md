---
name: database-verification
description: Generate SQL verification scripts that confirm correct database state after functional operations across legacy and modern platforms.
---

# Database Verification Skill

## Purpose

Generate SQL verification scripts that confirm the correct database state after functional operations. These scripts prove that both Legacy and Modern platforms write identical data structures for equivalent operations.

## When to Use

Invoke when:
- Running Phase 10 of the migration QA pipeline
- User says "verify database for..." or "generate DB checks for..."
- After a submit/save action has been executed against either platform

## Inputs

- **Module**: e.g., `coop`
- **Feature**: e.g., `submit-claim`
- **Database Name**: Target SQL Server database
- **Known Tables**: Tables involved in the feature

## Output Files

```
tests/database/{client}/{module}/verify-{feature}-records.sql
tests/database/{client}/{module}/compare-{feature}-legacy-vs-modern.sql
```

## Verification Checklist

For each feature, verify:

### Header Record
- [ ] Record created with correct ClaimID / entity ID
- [ ] Status = expected initial status
- [ ] DealerID matches submitting dealer
- [ ] ProgramID / FundID correct
- [ ] Created date populated
- [ ] Created by user populated

### Detail Records
- [ ] All line items present
- [ ] Amounts correct
- [ ] Supporting fields populated

### Attachments (if applicable)
- [ ] Attachment record created
- [ ] File reference stored
- [ ] Attachment linked to header

### Workflow Records
- [ ] Workflow entry created
- [ ] Initial step set correctly
- [ ] Assigned to correct reviewer/queue

### Audit Records
- [ ] Audit entry created
- [ ] Action type = 'Submit' (or appropriate)
- [ ] Old status / new status captured
- [ ] User and timestamp recorded

### Status
- [ ] Status on header matches expected post-action status

## SQL Script Pattern

```sql
-- Verification Script: {Module} {Feature}
-- Run after executing {feature} action
-- Parameterize: @ClaimID = <the created entity ID>

DECLARE @ClaimID INT = <replace>;

-- 1. Header verification
SELECT 
    ClaimID,
    DealerID,
    ProgramID,
    Status,
    CreatedDate,
    CreatedBy
FROM dbo.CoopClaims
WHERE ClaimID = @ClaimID;

-- Expected: 1 row, Status = 'Submitted'

-- 2. Detail records
SELECT COUNT(*) AS DetailCount
FROM dbo.CoopClaimDetails
WHERE ClaimID = @ClaimID;
-- Expected: > 0

-- 3. Audit trail
SELECT AuditAction, OldStatus, NewStatus, AuditDate, AuditUser
FROM dbo.CoopClaimAudit
WHERE ClaimID = @ClaimID
ORDER BY AuditDate;
-- Expected: at least one row with AuditAction = 'Submit'

-- 4. Workflow record
SELECT WorkflowStep, AssignedTo, WorkflowDate
FROM dbo.CoopClaimWorkflow
WHERE ClaimID = @ClaimID;
-- Expected: 1 row with initial approval step
```

## Legacy vs Modern Comparison Script

Generate a comparison script that:
1. Captures legacy result set for a known ClaimID
2. Captures modern result set for equivalent ClaimID
3. Highlights field-level differences
4. Reports: Identical | Different | Missing
