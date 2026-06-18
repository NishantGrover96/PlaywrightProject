-- =============================================
-- Dealer Dashboard - Database Verification Queries
-- =============================================
-- Purpose: Verify session storage, relationships, and data integrity
-- Feature: Coop Management / Dealer Dashboard
-- Date: 2026-06-18
-- =============================================

-- =============================================
-- Query 1: Verify 16 Session Keys Populated
-- =============================================
-- Verifies: COOP-FU-DD-034, COOP-FU-DD-037
-- Description: After dealer search, verify all 16 session keys are populated
-- Expected: All keys present with non-null values

-- Simulated session storage check (adjust based on actual session storage mechanism)
-- If using SQL Server session state, query aspnet_Session table
-- If using in-memory session, this would be verified via application logs or direct session inspection

/*
SELECT 
    'dealerSeq' AS session_key,
    CASE WHEN session_data LIKE '%dealerSeq%' THEN 'POPULATED' ELSE 'MISSING' END AS status
UNION ALL
SELECT 
    'dealerNumber' AS session_key,
    CASE WHEN session_data LIKE '%dealerNumber%' THEN 'POPULATED' ELSE 'MISSING' END AS status
-- ... repeat for all 16 keys
FROM aspnet_SessionState
WHERE session_id = @sessionId;
*/

-- Alternative: Query application audit log for session key population events
SELECT 
    event_type,
    event_data,
    event_timestamp,
    user_id,
    dealer_seq
FROM audit_log
WHERE event_type = 'SESSION_KEY_POPULATED'
  AND dealer_seq = @dealerSeq
  AND event_timestamp >= DATEADD(MINUTE, -5, GETDATE())
ORDER BY event_timestamp DESC;

-- =============================================
-- Query 2: Verify Agency-Dealer Relationship
-- =============================================
-- Verifies: COOP-FU-DD-043
-- Description: Check agency-dealer relationship records exist
-- Expected: Active relationship record for agency and dealer

SELECT 
    adr.agency_dealer_relationship_seq,
    adr.agency_seq,
    a.agency_name,
    adr.dealer_seq,
    d.dealer_number,
    d.dealer_name,
    adr.active_flag,
    adr.start_date,
    adr.end_date,
    adr.created_date,
    adr.created_by,
    adr.updated_date,
    adr.updated_by
FROM agency_dealer_relationship adr
INNER JOIN agency a ON adr.agency_seq = a.agency_seq
INNER JOIN dealer d ON adr.dealer_seq = d.dealer_seq
WHERE adr.agency_seq = @agencySeq
  AND adr.dealer_seq = @dealerSeq
  AND adr.active_flag = 'Y';

-- Count of all active agency-dealer relationships for an agency
SELECT 
    a.agency_seq,
    a.agency_name,
    COUNT(adr.dealer_seq) AS active_dealer_count
FROM agency a
LEFT JOIN agency_dealer_relationship adr 
    ON a.agency_seq = adr.agency_seq 
    AND adr.active_flag = 'Y'
WHERE a.agency_seq = @agencySeq
GROUP BY a.agency_seq, a.agency_name;

-- =============================================
-- Query 3: Verify Dealer Lookup by Dealer Number
-- =============================================
-- Verifies: COOP-FU-DD-019, COOP-FU-DD-020
-- Description: Lookup dealer by exact dealer number
-- Expected: Single matching dealer record

SELECT 
    d.dealer_seq,
    d.dealer_number,
    d.dealer_name,
    d.dealer_type_seq,
    dt.dealer_type_name,
    d.address1,
    d.address2,
    d.city,
    d.state_seq,
    s.state_code,
    s.state_name,
    d.zip,
    d.country_seq,
    c.country_code,
    c.country_name,
    d.contract_type,
    d.active_flag,
    d.dealer_termination_date,
    d.valid_coop_flag,
    d.created_date,
    d.updated_date
FROM dealer d
LEFT JOIN dealer_type dt ON d.dealer_type_seq = dt.dealer_type_seq
LEFT JOIN state s ON d.state_seq = s.state_seq
LEFT JOIN country c ON d.country_seq = c.country_seq
WHERE d.dealer_number = @dealerNumber
  AND d.active_flag = 'Y';

-- Verify dealer does not exist (for negative test cases)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'DEALER_NOT_FOUND'
        ELSE 'DEALER_EXISTS'
    END AS validation_result
FROM dealer
WHERE dealer_number = @dealerNumber;

-- =============================================
-- Query 4: Verify Dealer Authorization
-- =============================================
-- Verifies: COOP-FU-DD-042
-- Description: Check if user is authorized to access dealer data
-- Expected: Dealer can only access own dealer_seq

SELECT 
    u.user_id,
    u.username,
    u.dealer_seq AS user_dealer_seq,
    d.dealer_seq AS requested_dealer_seq,
    CASE 
        WHEN u.dealer_seq = d.dealer_seq THEN 'AUTHORIZED'
        WHEN u.role_seq IN (SELECT role_seq FROM role WHERE role_name = 'Admin') THEN 'AUTHORIZED'
        ELSE 'UNAUTHORIZED'
    END AS authorization_status
FROM [user] u
CROSS JOIN dealer d
WHERE u.user_id = @userId
  AND d.dealer_seq = @requestedDealerSeq;

-- =============================================
-- Query 5: Verify Multi-Field Search Results
-- =============================================
-- Verifies: COOP-FU-DD-024
-- Description: Admin search with multiple filters
-- Expected: Results match all provided criteria

SELECT 
    d.dealer_seq,
    d.dealer_number,
    d.dealer_name,
    d.address1,
    d.city,
    s.state_code,
    d.zip,
    c.country_code,
    dt.dealer_type_name,
    d.contract_type,
    d.valid_coop_flag
FROM dealer d
LEFT JOIN dealer_type dt ON d.dealer_type_seq = dt.dealer_type_seq
LEFT JOIN state s ON d.state_seq = s.state_seq
LEFT JOIN country c ON d.country_seq = c.country_seq
WHERE 1=1
  AND (@dealerNumber IS NULL OR d.dealer_number LIKE '%' + @dealerNumber + '%')
  AND (@dealerName IS NULL OR d.dealer_name LIKE '%' + @dealerName + '%')
  AND (@city IS NULL OR d.city LIKE '%' + @city + '%')
  AND (@stateSeq IS NULL OR d.state_seq = @stateSeq)
  AND (@countrySeq IS NULL OR d.country_seq = @countrySeq)
  AND d.active_flag = 'Y'
ORDER BY d.dealer_name;

-- =============================================
-- Query 6: Verify Fiscal Year Context
-- =============================================
-- Verifies: COOP-FU-DD-035
-- Description: Check fiscal year data for dealer
-- Expected: Valid fiscal year records exist

SELECT 
    fy.fiscal_year_seq,
    fy.fiscal_year,
    fy.start_date,
    fy.end_date,
    fy.active_flag,
    CASE 
        WHEN GETDATE() BETWEEN fy.start_date AND fy.end_date THEN 'CURRENT'
        WHEN GETDATE() < fy.start_date THEN 'FUTURE'
        ELSE 'PAST'
    END AS fiscal_year_status
FROM fiscal_year fy
WHERE fy.fiscal_year = @fiscalYear
  AND fy.active_flag = 'Y';

-- Get available fiscal years for dropdown
SELECT 
    fiscal_year_seq,
    fiscal_year,
    start_date,
    end_date
FROM fiscal_year
WHERE active_flag = 'Y'
ORDER BY fiscal_year DESC;

-- =============================================
-- Query 7: Verify Country and State Data
-- =============================================
-- Verifies: COOP-FU-DD-004, COOP-FU-DD-007
-- Description: Check country and state dropdown data
-- Expected: Active countries and states available

-- Countries for dropdown
SELECT 
    country_seq,
    country_code,
    country_name,
    active_flag
FROM country
WHERE active_flag = 'Y'
ORDER BY country_name;

-- States for specific country (cascading dropdown)
SELECT 
    s.state_seq,
    s.state_code,
    s.state_name,
    s.country_seq,
    c.country_name
FROM state s
INNER JOIN country c ON s.country_seq = c.country_seq
WHERE s.country_seq = @countrySeq
  AND s.active_flag = 'Y'
ORDER BY s.state_name;

-- =============================================
-- Query 8: Verify Data Persistence After Search
-- =============================================
-- Verifies: COOP-FU-DD-037
-- Description: Check that session keys match dealer record
-- Expected: Session data aligns with database records

SELECT 
    d.dealer_seq,
    d.dealer_number,
    d.dealer_name,
    d.dealer_type_seq,
    dt.dealer_type_name,
    d.country_seq,
    d.state_seq,
    d.contract_type,
    d.active_flag,
    -- Verify these values would be stored in session
    CAST(d.dealer_seq AS VARCHAR(20)) AS session_dealerSeq,
    d.dealer_number AS session_dealerNumber,
    d.dealer_name AS session_dealerName,
    CAST(d.dealer_type_seq AS VARCHAR(20)) AS session_dealerTypeSeq,
    dt.dealer_type_name AS session_dealerType,
    CAST(d.country_seq AS VARCHAR(20)) AS session_countrySeq,
    CAST(d.state_seq AS VARCHAR(20)) AS session_stateSeq,
    d.contract_type AS session_contractType,
    d.active_flag AS session_activeFlag
FROM dealer d
LEFT JOIN dealer_type dt ON d.dealer_type_seq = dt.dealer_type_seq
WHERE d.dealer_number = @dealerNumber;

-- =============================================
-- Query 9: Verify Parameter Encryption
-- =============================================
-- Verifies: COOP-FU-DD-044
-- Description: Check audit log for encrypted parameter usage
-- Expected: Parameters are encrypted when passed in URLs

SELECT 
    al.event_type,
    al.event_data,
    al.event_timestamp,
    al.user_id,
    al.dealer_seq,
    CASE 
        WHEN al.event_data LIKE '%encrypted=true%' THEN 'ENCRYPTED'
        WHEN al.event_data LIKE '%encrypted=false%' THEN 'NOT_ENCRYPTED'
        ELSE 'UNKNOWN'
    END AS encryption_status
FROM audit_log al
WHERE al.event_type IN ('DEALER_DETAIL_REDIRECT', 'PARAMETER_PASS')
  AND al.dealer_seq = @dealerSeq
  AND al.event_timestamp >= DATEADD(MINUTE, -10, GETDATE())
ORDER BY al.event_timestamp DESC;

-- =============================================
-- Query 10: Test Data Setup - Insert Agency-Dealer Relationship
-- =============================================
-- Description: Insert test relationship for automation tests
-- Use this for test data setup before running tests

/*
INSERT INTO agency_dealer_relationship (
    agency_seq,
    dealer_seq,
    active_flag,
    start_date,
    created_date,
    created_by
)
VALUES (
    @agencySeq,
    @dealerSeq,
    'Y',
    GETDATE(),
    GETDATE(),
    'TEST_AUTOMATION'
);
*/

-- =============================================
-- Query 11: Test Data Cleanup
-- =============================================
-- Description: Clean up test data after test execution

/*
DELETE FROM agency_dealer_relationship
WHERE created_by = 'TEST_AUTOMATION'
  AND created_date >= DATEADD(HOUR, -1, GETDATE());

-- Clear test session data
DELETE FROM audit_log
WHERE event_data LIKE '%TEST_AUTOMATION%'
  AND event_timestamp >= DATEADD(HOUR, -1, GETDATE());
*/
