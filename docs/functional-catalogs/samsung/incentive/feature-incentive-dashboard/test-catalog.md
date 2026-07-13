# Incentive - Incentive Dashboard - Functional Test Catalog
Generated: 2026-07-09
Total Test Cases: 65 (Smoke: 5 | Regression: 55 | E2E: 5)

---

## Business Rules Covered: 30 (BR-001 - BR-030)

---

## Test Cases

### Smoke Suite (5 tests)

#### INC-SMOKE-005 - Dealer dashboard page loads with dealer dropdown
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-001
- **Precondition**: User authenticated as Dealer role
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/DealerDashboard`
- **Expected**: Page renders; dealer dropdown (`DealerList`) populated; default tab active
- **Assertions**:
  - Dealer select element visible and has ≥ 1 option
  - Active tab content area visible

#### INC-SMOKE-004 - KPI tiles load data on page ready
- **Tier**: Smoke
- **Category**: UI
- **Priority**: P1-Critical
- **BR Covered**: BR-007, BR-011
- **Precondition**: User authenticated as BMDM; program active
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard`
  2. Wait for loading spinner to hide
- **Expected**: All Units, Unqualified Units, Returned Units, and Reward Amount tiles display numeric values (not empty/zero)
- **Assertions**:
  - `#spnTotalTires` not empty
  - `#spnUnqualifiedTires` not empty
  - `promoTotalAmount` not empty

#### INC-SMOKE-003 - Dealer landing dashboard loads for authenticated dealer
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-010
- **Precondition**: User authenticated as Dealer
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/LandingDashboard`
- **Expected**: Page renders with dealer name; program tiles visible; fiscal year/quarter controls present
- **Assertions**:
  - Page heading or dealer name element visible
  - `#ddlFiscalYear` visible with at least 1 option

#### INC-SMOKE-002 - Unauthenticated user redirected to login
- **Tier**: Smoke
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-021
- **Precondition**: No active session cookie
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard` without authentication
- **Expected**: HTTP 302 redirect to `/Account/Login`
- **Assertions**:
  - Final URL contains `/Account/Login`
  - Dashboard content not rendered

#### INC-SMOKE-001 - Admin dashboard page loads for authenticated admin (BMDM)
- **Tier**: Smoke
- **Category**: Navigation
- **Priority**: P1-Critical
- **BR Covered**: BR-021, BR-001, BR-006
- **Precondition**: User authenticated as BMDM role
- **Steps**:
  1. Navigate to `/Rewards/Incentives/Dashboard/IncentiveDashboard`
- **Expected**: Page renders; fiscal year and quarter dropdowns visible; TM pre-populated; KPI tiles area visible
- **Assertions**:
  - `#ddlFiscalYear` visible
  - `#ddlQuarterly` visible with 4 options
  - `#hdUserType` value equals "BMDM"

---

### Regression Suite (55 tests)

#### INC-TC-055 - BMRM with PRSM sm param passes sm to corporate SP
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-026, BR-028
- **Precondition**: User authenticated as BMRM role; PRSM mode active
- **Steps**:
  1. Navigate to IncentiveDashboard as BMRM user
  2. Monitor network calls to `CorporateDashboardDataByType`
- **Expected**: API call includes `sm` parameter matching `UserSession.OwnerTableSeq`
- **Assertions**:
  - Network request contains `sm` query parameter with non-zero value
  - KPI tiles display territory-manager-scoped data

#### INC-TC-054 - DIST/RDIST/DARO users route to GetDemoCorporateDashboardDataByType2
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-027, BR-001
- **Precondition**: User authenticated as DIST role
- **Steps**:
  1. Navigate to IncentiveDashboard as DIST user
  2. Capture network request for `CorporateDashboardDataByType`
- **Expected**: Data loaded from distributor-scoped SP (`GetDemoCorporateDashboardDataByType2`)
- **Assertions**:
  - `searchType` / `rule_mode` in request matches DIST routing path
  - KPI tiles display data scoped to distributor's dealers

#### INC-TC-053 - BMDM/BMRM users route to GetDemoCorporateDashboardDataByType
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-026, BR-001
- **Precondition**: User authenticated as BMDM
- **Steps**:
  1. Navigate to IncentiveDashboard as BMDM
  2. Monitor KPI data request
- **Expected**: Corporate SP called with correct `rule_mode` for corporate view
- **Assertions**:
  - Network call to `CorporateDashboardDataByType` returns 200 with data

#### INC-TC-052 - BMNM/FAST/OAM users route to GetOrganizationDashboardDataByType
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-025, BR-001
- **Precondition**: User authenticated as BMNM role
- **Steps**:
  1. Navigate to IncentiveDashboard as BMNM
  2. Monitor KPI data request
- **Expected**: Org-scoped SP called
- **Assertions**:
  - Network call returns 200; KPI tiles show org-scoped values

#### INC-TC-051 - _OnlyPrimaryUnitsDisplayed note shown in dashboard footer
- **Tier**: Regression
- **Category**: UI
- **Priority**: P4-Low
- **BR Covered**: BR-020
- **Precondition**: User authenticated on IncentiveDashboard
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Scroll to bottom/footer area
- **Expected**: Note "Single-phase ODU count are considered qualified units" visible
- **Assertions**:
  - Element containing resource string text visible on page

#### INC-TC-050 - Redeem Cash Rewards button triggers OnGetRedeemCashRewards
- **Tier**: Regression
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-001 (write action)
- **Precondition**: User authenticated as dealer; cash rewards available; `AlreadyRedeemed=false`
- **Steps**:
  1. Navigate to LandingDashboard
  2. Click "Redeem" button
  3. Monitor network call to `RedeemCashRewards`
- **Expected**: GET request to `OnGetRedeemCashRewards` with `dealerNumberSeq` parameter; success response
- **Assertions**:
  - Network request to `RedeemCashRewards` returns 200
  - Button state changes to redeemed / disabled

#### INC-TC-049 - Dealer locations list populated on LandingDashboard
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-010
- **Precondition**: Dealer user with multiple locations
- **Steps**:
  1. Navigate to LandingDashboard
- **Expected**: Dealer locations dropdown/list visible with ≥ 1 location
- **Assertions**:
  - `DealerLocationsList` control visible
  - At least 1 option available

#### INC-TC-048 - Sales rep reward data loads for dealer
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-010
- **Precondition**: Dealer user on LandingDashboard
- **Steps**:
  1. Navigate to LandingDashboard
  2. Wait for sales rep section to load
- **Expected**: Sales rep reward data section rendered
- **Assertions**:
  - Sales rep rewards area visible (not empty/loading)

#### INC-TC-047 - unitPercentage = 0 when no units purchased
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P3-Medium
- **BR Covered**: BR-016
- **Precondition**: Dealer with 0 group_period_unit_purchase; program with valid tier max
- **Steps**:
  1. Navigate to DealerDashboard
  2. Select dealer with zero unit purchases
  3. Wait for tab information to load
- **Expected**: Unit progress indicator shows 0%
- **Assertions**:
  - `unitPercentage` rendered value equals 0 or "0%"

#### INC-TC-046 - unitPercentage = 100 when program_tier_max = 9999999
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-016
- **Precondition**: Program with `program_tier_max = 9999999`
- **Steps**:
  1. Navigate to DealerDashboard for qualifying dealer
  2. Load tab with open-ended tier program
- **Expected**: Unit percentage shows 100%
- **Assertions**:
  - `unitPercentage` rendered value equals 100 or "100%"

#### INC-TC-045 - unitPercentage capped at 100 when actual units ≥ tier max
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-016
- **Precondition**: Dealer whose `group_period_unit_purchase ≥ program_tier_max` (finite non-9999999 max)
- **Steps**:
  1. Navigate to DealerDashboard for over-achieving dealer
  2. Load program tab information
- **Expected**: Unit percentage shows exactly 100%, never > 100%
- **Assertions**:
  - `unitPercentage` rendered value ≤ 100

#### INC-TC-044 - totalAmountSummary=true returns dealer name, address, account number
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P3-Medium
- **BR Covered**: BR-019
- **Precondition**: Dealer user on DealerDashboard; program with summary data
- **Steps**:
  1. Navigate to DealerDashboard
  2. Request tab information with `totalAmountSummary=true`
- **Expected**: Response includes `Name`, `Address`, `Account_Number`, `DBA_Name` fields plus 6 amount categories
- **Assertions**:
  - Dealer name and address rendered in UI
  - All 6 amount breakdown categories visible (manufacturer, program, rebate, partner, pass-through, totals)

#### INC-TC-043 - partnerprogram queryParam overrides active tab to pp-tab
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P3-Medium
- **BR Covered**: BR-014
- **Precondition**: Dealer has partner program; `isPartnerProgram=true` in SP result
- **Steps**:
  1. Navigate to DealerDashboard with `queryParam=partnerprogram`
- **Expected**: `pp-tab` is the active tab regardless of SP default tab value
- **Assertions**:
  - Partner program tab is active

#### INC-TC-042 - Non-pt-tab displays tiered program data
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P3-Medium
- **BR Covered**: BR-015
- **Precondition**: Dealer on DealerDashboard; default tab is not pt-tab
- **Steps**:
  1. Navigate to DealerDashboard
  2. Load tab information for non-pt-tab
- **Expected**: Program tier data visible (period_goal, period_unit_purchase, PotentialEarning)
- **Assertions**:
  - Tier program fields visible; adjustment_amount/date columns not present

#### INC-TC-041 - pt-tab displays adjustment amount and date
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P3-Medium
- **BR Covered**: BR-015
- **Precondition**: Dealer on DealerDashboard; pt-tab available
- **Steps**:
  1. Navigate to DealerDashboard
  2. Click pt-tab
  3. Wait for tab content to load
- **Expected**: `adjustment_amount` and `adjustment_date` fields displayed
- **Assertions**:
  - Adjustment amount visible and formatted as currency/number
  - Adjustment date visible and formatted as date

#### INC-TC-040 - Default tab determined by GetDashboardTab SP result
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-014
- **Precondition**: Dealer with known default tab value in SP
- **Steps**:
  1. Navigate to DealerDashboard for dealer
- **Expected**: Tab matching SP `tab` value is active on load
- **Assertions**:
  - Active tab element has expected tab ID

#### INC-TC-039 - LandingDashboard Base64-decodes dn param for dealer context
- **Tier**: Regression
- **Category**: Security
- **Priority**: P2-High
- **BR Covered**: BR-010
- **Precondition**: Valid Base64-encoded dealer number
- **Steps**:
  1. Navigate to LandingDashboard with `?dn={base64DealerNumber}`
- **Expected**: Dealer context loaded for the decoded dealer number
- **Assertions**:
  - Dashboard displays data for the correct dealer
  - No error rendered for valid Base64 value

#### INC-TC-038 - DealerDashboard decrypts encrypted dealer_number URL param
- **Tier**: Regression
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-009
- **Precondition**: Valid AES-encrypted dealer_number string
- **Steps**:
  1. Navigate to DealerDashboard with `?dealer_number={encryptedValue}`
- **Expected**: Dashboard loads data for the correct dealer; decryption succeeds
- **Assertions**:
  - Correct dealer's program data displayed
  - Page does not display error/exception

#### INC-TC-037 - API response dealer_number_seq values are AES-encrypted
- **Tier**: Regression
- **Category**: Security
- **Priority**: P1-Critical
- **BR Covered**: BR-008
- **Precondition**: Admin user; dealer data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Capture `CorporateDashboardDataByType` response JSON
- **Expected**: `dealer_number_seq` values in response are encrypted strings (not raw integers)
- **Assertions**:
  - Response JSON `dealer_number_seq` field is not a plain integer
  - Value starts with expected encryption prefix or matches non-numeric pattern

#### INC-TC-036 - Selecting brand filter triggers dashboard reload
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-011 (Non-Rewards mode)
- **Precondition**: Non-Rewards mode; brand filter visible; brands available
- **Steps**:
  1. Navigate to IncentiveDashboard in Non-Rewards mode
  2. Select a specific brand from the brand filter
- **Expected**: Dashboard data refreshes with brand-filtered KPI values
- **Assertions**:
  - Network call to `CorporateDashboardDataByType` with `rebate_product_category_seq` parameter

#### INC-TC-035 - Brand filter dropdown populated via GetTreadPattern
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-011
- **Precondition**: Non-Rewards mode; brands configured in program
- **Steps**:
  1. Navigate to IncentiveDashboard in Non-Rewards mode
  2. Wait for brand filter to populate
- **Expected**: Brand filter dropdown shows available brands
- **Assertions**:
  - Brand filter dropdown has ≥ 1 option
  - Network call to `Brand` endpoint returns 200

#### INC-TC-034 - Dealer dropdown only shows primary_flag="Y" dealers
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-013
- **Precondition**: Admin user; distributor with primary and non-primary dealer locations
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Select distributor that has both primary and non-primary dealers
  3. Inspect dealer dropdown options
- **Expected**: Only primary-flagged dealer locations appear; non-primary locations excluded
- **Assertions**:
  - All rendered dealer options correspond to `primary_flag="Y"` records
  - Known non-primary location not present in dropdown

#### INC-TC-033 - Least Rewarded Dealers table populates
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user; dealer reward data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for dashboard data to load
- **Expected**: Least Rewarded Dealers table (`tblLeastFanticDealer`) shows dealer number, name, and reward amount rows
- **Assertions**:
  - `#tblLeastFanticDealer` has ≥ 1 data row
  - Each row displays dealer number and name

#### INC-TC-032 - Most Rewarded Dealers table populates
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user; dealer reward data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for dashboard data to load
- **Expected**: Most Rewarded Dealers table (`tblTrueFanticDealer`) shows dealer number, name, and reward amount rows
- **Assertions**:
  - `#tblTrueFanticDealer` has ≥ 1 data row
  - Each row displays dealer number, name, and reward amount

#### INC-TC-031 - Non-Rewards mode shows SalesPerson and Dealer filters
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Non-Rewards mode program (ConvertToRewards=false)
- **Steps**:
  1. Navigate to IncentiveDashboard for Non-Rewards program
- **Expected**: Sales person dropdown (`#dvsalesperson`) visible; Dealer dropdown (`#ddDealer`) visible; TBM filter hidden
- **Assertions**:
  - `#dvsalesperson` or `#ddDealerSalesPerson` visible
  - `#ddDealer` visible
  - `#ddlTM` hidden or not present

#### INC-TC-030 - Non-Rewards mode shows Brand Promotion tab
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011, BR-029
- **Precondition**: Non-Rewards mode program (ConvertToRewards=false)
- **Steps**:
  1. Navigate to IncentiveDashboard for Non-Rewards program
- **Expected**: Brand Promotion tab (`#Brand`) visible
- **Assertions**:
  - `#PromotionEarned_Brand` section visible

#### INC-TC-029 - Rewards mode shows TBM and Distributor filter controls
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Rewards mode program (ConvertToRewards=true)
- **Steps**:
  1. Navigate to IncentiveDashboard for Rewards program
- **Expected**: TBM dropdown (`#ddlTM`) visible; `#ddlDistributor` visible
- **Assertions**:
  - `#ddlTM` visible
  - `#ddlDistributor` visible

#### INC-TC-028 - Rewards mode hides Brand Promotion tab
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011, BR-029
- **Precondition**: Rewards mode program (ConvertToRewards=true)
- **Steps**:
  1. Navigate to IncentiveDashboard for Rewards program
- **Expected**: Brand Promotion tab (`#Brand`) is not visible; In-house tab is the default active tab
- **Assertions**:
  - `#Brand` tab element hidden or not rendered
  - `#PromotionEarned` section visible

#### INC-TC-027 - Earned Branding Points tile hidden in Non-Rewards mode
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011, BR-012
- **Precondition**: Non-Rewards mode program
- **Steps**:
  1. Navigate to IncentiveDashboard in Non-Rewards mode
- **Expected**: `#spnTentative` (Branding Points tile) not visible
- **Assertions**:
  - Branding Points tile hidden

#### INC-TC-026 - Earned Branding Points tile visible in Rewards mode
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Rewards mode program
- **Steps**:
  1. Navigate to IncentiveDashboard in Rewards mode
  2. Wait for KPI tiles to load
- **Expected**: "Earned Branding Points" tile (`#spnTentative`) visible and shows numeric value
- **Assertions**:
  - `#spnTentative` visible
  - Value not empty

#### INC-TC-025 - Total Purchases tile visible when IsShowPurchase=false
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-012
- **Precondition**: Program with `IsShowPurchase=false`
- **Steps**:
  1. Navigate to IncentiveDashboard for such a program
- **Expected**: Total Purchases tile (`#spnTotalpurchase`) visible
- **Assertions**:
  - `#spnTotalpurchase` visible

#### INC-TC-024 - Total Purchases tile hidden when IsShowPurchase=true
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-012
- **Precondition**: Program with `IsShowPurchase=true` (`hdnShowPurchase=1`)
- **Steps**:
  1. Navigate to IncentiveDashboard for such a program
- **Expected**: Total Purchases tile (`#spnTotalpurchase`), Unqualified Purchase tile, and Returned Cost tile are all hidden
- **Assertions**:
  - `#spnTotalpurchase` hidden or not rendered
  - Unqualified purchase tile hidden
  - Returned cost tile hidden

#### INC-TC-023 - Reward Amount tile displays value
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: Admin user; reward data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for loading spinner to disappear
- **Expected**: `promoTotalAmount` tile shows a non-empty reward value
- **Assertions**:
  - `#promoTotalAmount` not empty

#### INC-TC-022 - Returned Units tile displays value
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user with returned units data
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for data load
- **Expected**: Returned Units tile (`#spnReturnedTires`) shows value
- **Assertions**:
  - `#spnReturnedTires` not empty

#### INC-TC-021 - Unqualified Units tile displays value
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user; unqualified unit data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for data load
- **Expected**: Unqualified Units tile (`#spnUnqualifiedTires`) shows value
- **Assertions**:
  - `#spnUnqualifiedTires` not empty

#### INC-TC-020 - All Units tile displays value from CorporateDashboardDataByType
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: Admin user; unit data exists
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for spinner `#dvTierPurchasePannel` to hide
- **Expected**: All Units tile (`#spnTotalTires`) shows non-empty numeric value
- **Assertions**:
  - `#spnTotalTires` content is a number > 0

#### INC-TC-019 - BMNM user distributor cascade populates correct dealer list
- **Tier**: Regression
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-003, BR-013
- **Precondition**: BMNM user; distributor with assigned dealers
- **Steps**:
  1. Navigate to IncentiveDashboard as BMNM
  2. Select distributor from `#ddDistributor`
  3. Wait for dealer dropdown to populate
- **Expected**: Dealer dropdown shows dealers belonging to BMNM's org; all primary_flag="Y"
- **Assertions**:
  - `#ddDealer` has ≥ 1 option
  - Options match org-scoped dealer data

#### INC-TC-018 - TBM dropdown populated via GetSalesManager in Rewards mode
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-018, BR-011
- **Precondition**: Rewards mode; BMMGT or admin user
- **Steps**:
  1. Navigate to IncentiveDashboard in Rewards mode
  2. Wait for TBM dropdown to populate
- **Expected**: `#ddlTM` dropdown has ≥ 1 Territory Manager option
- **Assertions**:
  - `#ddlTM` has options count ≥ 1
  - Network call to `SalesManager` endpoint returns 200

#### INC-TC-017 - Distributor center dropdown shows for DCWH distributor type
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Admin user; DCWH-type distributor selected
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Select a DCWH distributor
- **Expected**: Distributor center dropdown (`#ddDistributorCenter`) becomes visible and populated
- **Assertions**:
  - `#ddDistributorCenter` visible after DCWH selection
  - Options available from `DistributorCenterByDistributor` endpoint

#### INC-TC-016 - Distributor cascades to sales person dropdown
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Non-Rewards mode; distributor with sales persons
- **Steps**:
  1. Navigate to IncentiveDashboard as DIST user
  2. Distributor is pre-selected
  3. Wait for sales person dropdown to populate
- **Expected**: Sales person dropdown populated with persons for the distributor
- **Assertions**:
  - `#ddDealerSalesPerson` has ≥ 1 option
  - Network call to `SalesPersonByDistributor` returns 200

#### INC-TC-015 - Selecting distributor cascades to dealer dropdown
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-001, BR-013
- **Precondition**: BMMGT user; territory and distributor available
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
  2. Select territory from `#ddTerritory`
  3. Select distributor from populated `#ddDistributor`
  4. Wait for dealer dropdown
- **Expected**: Dealer dropdown populated with primary dealers for selected distributor
- **Assertions**:
  - `#ddDealer` visible with ≥ 1 option

#### INC-TC-014 - Selecting territory cascades distributor dropdown
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: BMMGT user; territory and distributor data exists
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
  2. Select a territory from `#ddTerritory`
- **Expected**: Distributor dropdown populated with distributors for that territory
- **Assertions**:
  - `#ddDistributor` has ≥ 1 option after territory selection
  - Network call to `DistributorByTerritory` returns 200

#### INC-TC-013 - Territory dropdown populated for BMMGT user
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: User authenticated as BMMGT role
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
  2. Wait for page to load
- **Expected**: Territory dropdown (`#ddTerritory`) visible with options; first option is "-- Select Territory --" (value=0)
- **Assertions**:
  - `#ddTerritory` has ≥ 2 options (placeholder + territories)
  - First option value equals "0"

#### INC-TC-012 - Changing quarter triggers KPI tile refresh
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-024
- **Precondition**: Admin user on IncentiveDashboard; multiple quarters with data
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for initial data to load
  3. Change `#ddlQuarterly` to a different quarter value
  4. Wait for reload (spinner hide)
- **Expected**: KPI tiles update with data for the selected quarter
- **Assertions**:
  - Network call to `CorporateDashboardDataByType` made with new `period_number` value

#### INC-TC-011 - Changing fiscal year triggers KPI tile refresh
- **Tier**: Regression
- **Category**: UI
- **Priority**: P2-High
- **BR Covered**: BR-023
- **Precondition**: Admin user on IncentiveDashboard; multiple fiscal years available
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Wait for initial data to load
  3. Change `#ddlFiscalYear` to a prior year
  4. Wait for reload (spinner hide)
- **Expected**: KPI tiles update with data for selected fiscal year
- **Assertions**:
  - Network call to `CorporateDashboardDataByType` made with updated `fiscal_year` value

#### INC-TC-010 - Quarter dropdown has exactly 4 options (Q1-Q4)
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Any authenticated user on IncentiveDashboard
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Inspect `#ddlQuarterly` options
- **Expected**: Exactly 4 options: Q1 (value=1), Q2 (value=2), Q3 (value=3), Q4 (value=4)
- **Assertions**:
  - `#ddlQuarterly` has exactly 4 options
  - Values are 1, 2, 3, 4

#### INC-TC-009 - Fiscal year dropdown populated from GetFiscalYearByDivisionSeq
- **Tier**: Regression
- **Category**: UI
- **Priority**: P3-Medium
- **BR Covered**: BR-017
- **Precondition**: Active division with fiscal year data
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Inspect `#ddlFiscalYear` options
- **Expected**: Fiscal year dropdown has ≥ 1 option; current year is selected by default
- **Assertions**:
  - `#ddlFiscalYear` has ≥ 1 option
  - Default selected value equals current fiscal year

#### INC-TC-008 - Dashboard loads for OAM user - org-scoped data shown
- **Tier**: Regression
- **Category**: Authorization
- **Priority**: P2-High
- **BR Covered**: BR-001, BR-025
- **Precondition**: User authenticated as OAM role
- **Steps**:
  1. Navigate to IncentiveDashboard as OAM
- **Expected**: Page loads; distributor pre-populated with OAM's dealer_number_seq; org-scoped SP called
- **Assertions**:
  - `#hdUserType` value is "OAM"
  - Distributor filter visible and pre-populated

#### INC-TC-007 - Dashboard loads for BMDM user - TM auto-selected from session
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-006, BR-001
- **Precondition**: User authenticated as BMDM
- **Steps**:
  1. Navigate to IncentiveDashboard as BMDM
- **Expected**: TM filter pre-populated with `UserSession.OwnerTableSeq` value; no manual selection required for initial data load
- **Assertions**:
  - `#hdTerritoryManager` value equals expected TM seq from session
  - KPI tiles load without requiring TM selection

#### INC-TC-006 - Dashboard loads for FAST user - territory + dealers shown
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-004
- **Precondition**: User authenticated as FAST role; district dealers exist
- **Steps**:
  1. Navigate to IncentiveDashboard as FAST user
- **Expected**: Territory selector visible; dealer list pre-populated for Falken district
- **Assertions**:
  - Territory dropdown visible
  - Dealer dropdown visible with ≥ 1 option

#### INC-TC-005 - Dashboard loads for BMMGT user - territory selector shown
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: User authenticated as BMMGT
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
- **Expected**: Territory dropdown visible; first item is "-- Select Territory --" (value=0)
- **Assertions**:
  - `#ddTerritory` visible
  - Default option text contains "Select Territory"

#### INC-TC-004 - Dashboard loads for BMNM user - dealer list for org shown
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-003
- **Precondition**: User authenticated as BMNM
- **Steps**:
  1. Navigate to IncentiveDashboard as BMNM
- **Expected**: Dealer dropdown visible and populated with org-scoped dealers; sorted A->Z
- **Assertions**:
  - Dealer dropdown has ≥ 1 option
  - Options are ordered alphabetically

#### INC-TC-003 - Dashboard loads for RDIST user - distributor pre-populated
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: User authenticated as RDIST
- **Steps**:
  1. Navigate to IncentiveDashboard as RDIST user
- **Expected**: Distributor dropdown pre-populated with RDIST's own dealer_number_seq
- **Assertions**:
  - Distributor dropdown shows RDIST's own account as selected
  - No distributor selection required

#### INC-TC-002 - BMADMIN user sees all territory managers (seq=0, no filter)
- **Tier**: Regression
- **Category**: Authorization
- **Priority**: P2-High
- **BR Covered**: BR-022, BR-018
- **Precondition**: User authenticated as BMADMIN role
- **Steps**:
  1. Navigate to IncentiveDashboard as BMADMIN
  2. Inspect TM dropdown
- **Expected**: TM dropdown contains all territory managers (unfiltered); `seq=0` passed to GetSalesManager
- **Assertions**:
  - TM dropdown option count is highest compared to role-scoped users
  - Network call `SalesManager` has `seq=0`

#### INC-TC-001 - Dashboard loads for DIST user - distributor pre-populated
- **Tier**: Regression
- **Category**: Initialization
- **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: User authenticated as DIST
- **Steps**:
  1. Navigate to IncentiveDashboard as DIST user
- **Expected**: `DistributorDealerNumberSeq` = `UserSession.dealer_number_seq`; distributor control pre-populated
- **Assertions**:
  - `#hdDistributor_dealer_number_seq` value equals expected seq
  - Distributor shown without user interaction

---

### E2E Suite (5 tests)

#### INC-E2E-005 - BMRM filters by territory manager, verifies scoped data loads
- **Tier**: E2E
- **Category**: BusinessLogic
- **Priority**: P2-High
- **BR Covered**: BR-026, BR-028, BR-030
- **Precondition**: BMRM user with assigned territory; dealer data exists
- **Steps**:
  1. Navigate to IncentiveDashboard as BMRM
  2. Verify TM dropdown pre-populated with BMRM's own org
  3. Change fiscal year to prior year
  4. Change quarter
  5. Wait for KPI tiles to reflect new selection
- **Expected**: Full refresh cycle completes; KPI tiles show data scoped to BMRM's territory for the selected period
- **Assertions**:
  - All KPI tiles display non-empty values
  - Network calls include BMRM-scoped `searchType` / `rule_mode`

#### INC-E2E-004 - Dealer opens DealerDashboard, selects tabs, views tier and adjustment data
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-014, BR-015, BR-016, BR-019, BR-009
- **Precondition**: Dealer user with multiple program tabs including pt-tab
- **Steps**:
  1. Navigate to DealerDashboard with encrypted dealer_number
  2. Verify default tab active per GetDashboardTab result
  3. Click each program tab and wait for program data to load
  4. Click pt-tab, verify adjustment_amount and adjustment_date fields
  5. Verify unitPercentage never exceeds 100 across all tabs
- **Expected**: Tab navigation works end-to-end; data unique per tab; adjustment tab shows correct fields
- **Assertions**:
  - Each tab click triggers `TabInformation` network call
  - pt-tab shows adjustment fields
  - No unitPercentage > 100

#### INC-E2E-003 - Admin changes fiscal year and quarter - full dashboard refreshes
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P2-High
- **BR Covered**: BR-023, BR-024, BR-007
- **Precondition**: Admin user (BMDM); data exists for multiple fiscal years
- **Steps**:
  1. Navigate to IncentiveDashboard
  2. Note initial KPI tile values
  3. Change `#ddlFiscalYear` to prior year
  4. Wait for data reload
  5. Note updated KPI values
  6. Change `#ddlQuarterly` to Q1
  7. Wait for data reload
  8. Note Q1 KPI values
- **Expected**: Each filter change triggers full dashboard refresh; tile values differ per period; no stale data
- **Assertions**:
  - 2 additional `CorporateDashboardDataByType` network calls made (one per filter change)
  - KPI values change after each filter

#### INC-E2E-002 - Dealer navigates landing dashboard and redeems cash rewards
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-010, BR-021 (write path)
- **Precondition**: Dealer with unredeemed cash rewards; `AlreadyRedeemed=false`
- **Steps**:
  1. Navigate to LandingDashboard as dealer
  2. Verify dealer name and program promotions visible
  3. Verify fiscal year and quarter controls present
  4. Click Redeem button
  5. Monitor `RedeemCashRewards` network call
- **Expected**: Redemption request sent successfully; button state updates to indicate redemption complete
- **Assertions**:
  - `RedeemCashRewards` endpoint called with correct `dealerNumberSeq`
  - Redeem button disabled/hidden after redemption

#### INC-E2E-001 - Admin drills from territory -> distributor -> dealer -> KPI tiles refresh
- **Tier**: E2E
- **Category**: Workflow
- **Priority**: P1-Critical
- **BR Covered**: BR-005, BR-013, BR-007, BR-001
- **Precondition**: BMMGT user; territory with distributor with primary dealers
- **Steps**:
  1. Navigate to IncentiveDashboard as BMMGT
  2. Select territory from `#ddTerritory` - wait for distributor cascade
  3. Select distributor from `#ddDistributor` - wait for dealer cascade
  4. Select dealer from `#ddDealer`
  5. Wait for KPI tiles to load
  6. Verify Most/Least Rewarded Dealers tables populated
- **Expected**: Full filter drill-down completes; KPI tiles and dealer tables show data for selected dealer
- **Assertions**:
  - `#spnTotalTires`, `#spnUnqualifiedTires`, `#spnReturnedTires`, `promoTotalAmount` all non-empty
  - `#tblTrueFanticDealer` and `#tblLeastFanticDealer` have rows
  - `dealer_number_seq` in API response is encrypted (not plain integer)
