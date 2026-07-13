# Incentive - Incentive Dashboard - Regression Suite
Generated: 2026-07-09
Tests: 55 | Priorities: P1-Critical, P2-High, P3-Medium, P4-Low

---

## Purpose

Regression tests cover all functional paths: role-based initialization, ConvertToRewards UI modes,
filter cascading, KPI data loading, security parameter handling, and dealer dashboard tab logic.

---

### INC-TC-055 - BMRM with PRSM sm param passes sm to corporate SP
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-026, BR-028
- **Precondition**: Authenticated as BMRM; PRSM mode active
- **Steps**: 1. Navigate to IncentiveDashboard as BMRM. 2. Monitor network calls to `CorporateDashboardDataByType`.
- **Expected**: API call includes `sm` parameter with non-zero value matching `UserSession.OwnerTableSeq`
- **Assertions**: Network request contains `sm` query param with non-zero value; KPI tiles display territory-manager-scoped data

---

### INC-TC-054 - DIST/RDIST/DARO route to GetDemoCorporateDashboardDataByType2
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-027, BR-001
- **Precondition**: Authenticated as DIST
- **Steps**: 1. Navigate to IncentiveDashboard as DIST user. 2. Capture network request for `CorporateDashboardDataByType`.
- **Expected**: Data loaded from distributor-scoped SP; KPI tiles display distributor-scoped data
- **Assertions**: `searchType`/`rule_mode` in request matches DIST routing path; tiles non-empty

---

### INC-TC-053 - BMDM/BMRM users route to GetDemoCorporateDashboardDataByType
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-026, BR-001
- **Precondition**: Authenticated as BMDM
- **Steps**: 1. Navigate to IncentiveDashboard as BMDM. 2. Monitor KPI data request.
- **Expected**: Corporate SP called with correct `rule_mode`; CorporateDashboardDataByType returns 200 with data
- **Assertions**: Network call returns 200; KPI tiles populated

---

### INC-TC-052 - BMNM/FAST/OAM users route to GetOrganizationDashboardDataByType
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-025, BR-001
- **Precondition**: Authenticated as BMNM
- **Steps**: 1. Navigate to IncentiveDashboard as BMNM. 2. Monitor KPI data request.
- **Expected**: Org-scoped SP called; tiles return 200 with org-scoped values
- **Assertions**: Network call includes org-scoped params; tiles populated

---

### INC-TC-051 - _OnlyPrimaryUnitsDisplayed note shown in footer
- **Tier**: Regression | **Category**: UI | **Priority**: P4-Low
- **BR Covered**: BR-020
- **Precondition**: Any authenticated user on IncentiveDashboard
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Scroll to footer.
- **Expected**: Note "Single-phase ODU count are considered qualified units" visible
- **Assertions**: Element containing resource string text visible on page

---

### INC-TC-050 - Redeem Cash Rewards button triggers OnGetRedeemCashRewards
- **Tier**: Regression | **Category**: Workflow | **Priority**: P2-High
- **BR Covered**: BR-001 (write action)
- **Precondition**: Dealer with available cash rewards; `AlreadyRedeemed=false`
- **Steps**: 1. Navigate to LandingDashboard. 2. Click "Redeem" button. 3. Monitor network call.
- **Expected**: GET to `RedeemCashRewards` returns 200; button state updates to redeemed/disabled
- **Assertions**: Network call to `RedeemCashRewards` returns 200; button disabled or hidden after click

---

### INC-TC-049 - Dealer locations list populated on LandingDashboard
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-010
- **Precondition**: Dealer with multiple locations
- **Steps**: 1. Navigate to LandingDashboard.
- **Expected**: Dealer locations control visible with ≥ 1 option
- **Assertions**: `DealerLocationsList` control visible; option count ≥ 1

---

### INC-TC-048 - Sales rep reward data loads for dealer
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-010
- **Precondition**: Dealer user on LandingDashboard
- **Steps**: 1. Navigate to LandingDashboard. 2. Wait for sales rep section.
- **Expected**: Sales rep rewards section rendered and not in loading state
- **Assertions**: Sales rep section visible; no spinner/loading indicator

---

### INC-TC-047 - unitPercentage = 0 when no units purchased
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P3-Medium
- **BR Covered**: BR-016
- **Precondition**: Dealer with `group_period_unit_purchase = 0`; valid program
- **Steps**: 1. Navigate to DealerDashboard. 2. Select dealer with zero unit purchases.
- **Expected**: Unit progress indicator shows 0%
- **Assertions**: `unitPercentage` rendered value equals 0 or "0%"
- **Test Data**: Dealer with zero purchases for current period

---

### INC-TC-046 - unitPercentage = 100 when program_tier_max = 9999999
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-016
- **Precondition**: Program with `program_tier_max = 9999999`
- **Steps**: 1. Navigate to DealerDashboard for qualifying dealer. 2. Load open-ended tier tab.
- **Expected**: Unit percentage displays exactly 100%
- **Assertions**: `unitPercentage` rendered value equals 100 or "100%"
- **Test Data**: Program with tier_max set to 9999999

---

### INC-TC-045 - unitPercentage capped at 100 when actual units ≥ tier max
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-016
- **Precondition**: Dealer whose `group_period_unit_purchase ≥ program_tier_max` (finite non-9999999 max)
- **Steps**: 1. Navigate to DealerDashboard for over-achieving dealer. 2. Load program tab.
- **Expected**: Percentage rendered ≤ 100; never exceeds 100
- **Assertions**: `unitPercentage` ≤ 100
- **Test Data**: Dealer with unit purchases exceeding tier max

---

### INC-TC-044 - totalAmountSummary=true returns dealer name, address, account number
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P3-Medium
- **BR Covered**: BR-019
- **Precondition**: Dealer on DealerDashboard; program with summary data
- **Steps**: 1. Navigate to DealerDashboard. 2. Request tab information with `totalAmountSummary=true`.
- **Expected**: Name, Address, Account_Number, DBA_Name and 6 amount categories rendered
- **Assertions**: Dealer name and address visible; all 6 amount breakdown categories present

---

### INC-TC-043 - partnerprogram queryParam overrides active tab to pp-tab
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P3-Medium
- **BR Covered**: BR-014
- **Precondition**: Dealer with partner program; `isPartnerProgram=true` in SP result
- **Steps**: 1. Navigate to DealerDashboard with `?queryParam=partnerprogram`.
- **Expected**: pp-tab is active regardless of SP default tab value
- **Assertions**: Partner program tab element has active state

---

### INC-TC-042 - Non-pt-tab displays tiered program data
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P3-Medium
- **BR Covered**: BR-015
- **Precondition**: Default tab is not pt-tab
- **Steps**: 1. Navigate to DealerDashboard. 2. Load tab information for default tab.
- **Expected**: Tier program fields visible (period_goal, period_unit_purchase, PotentialEarning); adjustment columns absent
- **Assertions**: Tier data fields visible; `adjustment_amount`/`adjustment_date` columns not present

---

### INC-TC-041 - pt-tab displays adjustment amount and date
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P3-Medium
- **BR Covered**: BR-015
- **Precondition**: Dealer on DealerDashboard; pt-tab available
- **Steps**: 1. Navigate to DealerDashboard. 2. Click pt-tab. 3. Wait for content.
- **Expected**: `adjustment_amount` and `adjustment_date` fields displayed
- **Assertions**: Adjustment amount visible; adjustment date visible and formatted as date

---

### INC-TC-040 - Default tab determined by GetDashboardTab SP result
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-014
- **Precondition**: Dealer with known default tab value in SP
- **Steps**: 1. Navigate to DealerDashboard for dealer.
- **Expected**: Tab matching SP `tab` value is active on load
- **Assertions**: Active tab element has expected tab ID

---

### INC-TC-039 - LandingDashboard Base64-decodes dn param for dealer context
- **Tier**: Regression | **Category**: Security | **Priority**: P2-High
- **BR Covered**: BR-010
- **Precondition**: Valid Base64-encoded dealer number
- **Steps**: 1. Navigate to LandingDashboard with `?dn={base64DealerNumber}`.
- **Expected**: Dealer context loaded for decoded dealer number; no error rendered
- **Assertions**: Dashboard shows data for correct dealer; no exception visible
- **Test Data**: Known dealer number encoded as Base64

---

### INC-TC-038 - DealerDashboard decrypts encrypted dealer_number URL param
- **Tier**: Regression | **Category**: Security | **Priority**: P1-Critical
- **BR Covered**: BR-009
- **Precondition**: Valid AES-encrypted `dealer_number` string
- **Steps**: 1. Navigate to DealerDashboard with `?dealer_number={encryptedValue}`.
- **Expected**: Dashboard loads data for correct dealer; no exception
- **Assertions**: Correct dealer's program data displayed; page does not show error
- **Test Data**: Known dealer with pre-encrypted `dealer_number` value

---

### INC-TC-037 - API response dealer_number_seq values are AES-encrypted
- **Tier**: Regression | **Category**: Security | **Priority**: P1-Critical
- **BR Covered**: BR-008
- **Precondition**: Admin user; dealer data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Capture `CorporateDashboardDataByType` response JSON.
- **Expected**: `dealer_number_seq` values in response are encrypted strings, not raw integers
- **Assertions**: Response JSON `dealer_number_seq` field is not a plain integer; matches encryption pattern (non-numeric string)

---

### INC-TC-036 - Selecting brand filter triggers dashboard reload
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-011
- **Precondition**: Non-Rewards mode; brand filter visible; brands available
- **Steps**: 1. Navigate to IncentiveDashboard in Non-Rewards mode. 2. Select brand from filter. 3. Monitor network.
- **Expected**: `CorporateDashboardDataByType` called with `rebate_product_category_seq` parameter
- **Assertions**: Network call includes brand seq param

---

### INC-TC-035 - Brand filter dropdown populated via GetTreadPattern
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-011
- **Precondition**: Non-Rewards mode; brands configured in program
- **Steps**: 1. Navigate to IncentiveDashboard in Non-Rewards mode. 2. Wait for brand filter.
- **Expected**: Brand filter dropdown has ≥ 1 option; `Brand` endpoint returns 200
- **Assertions**: Brand dropdown option count ≥ 1

---

### INC-TC-034 - Dealer dropdown only shows primary_flag="Y" dealers
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-013
- **Precondition**: Admin user; distributor with both primary and non-primary dealer locations
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Select distributor with mixed primary/non-primary dealers. 3. Inspect dealer dropdown.
- **Expected**: Only primary-flagged locations appear; known non-primary location absent
- **Assertions**: All rendered dealer options correspond to `primary_flag="Y"` records

---

### INC-TC-033 - Least Rewarded Dealers table populates with data
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user; dealer reward data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for data load.
- **Expected**: `tblLeastFanticDealer` has ≥ 1 row; each row shows dealer number, name, amount
- **Assertions**: `#tblLeastFanticDealer tbody tr` count ≥ 1

---

### INC-TC-032 - Most Rewarded Dealers table populates with data
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin user; dealer reward data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for data load.
- **Expected**: `tblTrueFanticDealer` has ≥ 1 row; each row shows dealer number, name, reward amount
- **Assertions**: `#tblTrueFanticDealer tbody tr` count ≥ 1

---

### INC-TC-031 - Non-Rewards mode shows SalesPerson and Dealer filters
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Non-Rewards mode (ConvertToRewards=false)
- **Steps**: 1. Navigate to IncentiveDashboard for Non-Rewards program.
- **Expected**: `#dvsalesperson` visible; `#ddDealer` visible; `#ddlTM` hidden
- **Assertions**: Sales person dropdown visible; Dealer dropdown visible; TBM filter hidden

---

### INC-TC-030 - Non-Rewards mode shows Brand Promotion tab
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011, BR-029
- **Precondition**: Non-Rewards mode (ConvertToRewards=false)
- **Steps**: 1. Navigate to IncentiveDashboard for Non-Rewards program.
- **Expected**: `#Brand` tab visible; `#PromotionEarned_Brand` section visible
- **Assertions**: Brand tab element visible; Brand carousel section rendered

---

### INC-TC-029 - Rewards mode shows TBM and Distributor filter controls
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Rewards mode (ConvertToRewards=true)
- **Steps**: 1. Navigate to IncentiveDashboard for Rewards program.
- **Expected**: `#ddlTM` visible; `#ddlDistributor` visible
- **Assertions**: TBM dropdown visible; Rewards distributor dropdown visible

---

### INC-TC-028 - Rewards mode hides Brand Promotion tab
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011, BR-029
- **Precondition**: Rewards mode (ConvertToRewards=true)
- **Steps**: 1. Navigate to IncentiveDashboard for Rewards program.
- **Expected**: `#Brand` tab hidden; In-house tab (`#PromotionEarned`) is default active
- **Assertions**: `#Brand` tab element hidden or not rendered; `#PromotionEarned` visible

---

### INC-TC-027 - Earned Branding Points tile hidden in Non-Rewards mode
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011, BR-012
- **Precondition**: Non-Rewards mode program
- **Steps**: 1. Navigate to IncentiveDashboard in Non-Rewards mode.
- **Expected**: `#spnTentative` tile not visible
- **Assertions**: Branding Points tile hidden

---

### INC-TC-026 - Earned Branding Points tile visible in Rewards mode
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-011
- **Precondition**: Rewards mode program
- **Steps**: 1. Navigate to IncentiveDashboard in Rewards mode. 2. Wait for tiles to load.
- **Expected**: `#spnTentative` visible and shows numeric value
- **Assertions**: `#spnTentative` visible; content not empty

---

### INC-TC-025 - Total Purchases tile visible when IsShowPurchase=false
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-012
- **Precondition**: Program with `IsShowPurchase=false`
- **Steps**: 1. Navigate to IncentiveDashboard.
- **Expected**: `#spnTotalpurchase` visible
- **Assertions**: Purchase tile rendered and visible

---

### INC-TC-024 - Total Purchases tile hidden when IsShowPurchase=true
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-012
- **Precondition**: Program with `IsShowPurchase=true`
- **Steps**: 1. Navigate to IncentiveDashboard.
- **Expected**: `#spnTotalpurchase`, unqualified purchase tile, and returned cost tile all hidden
- **Assertions**: All three purchase-related tiles hidden

---

### INC-TC-023 - Reward Amount tile displays value
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: Admin user; reward data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for tiles to load.
- **Expected**: `#promoTotalAmount` not empty
- **Assertions**: `#promoTotalAmount` content is non-empty

---

### INC-TC-022 - Returned Units tile displays value
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin; returned units data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for data load.
- **Expected**: `#spnReturnedTires` not empty
- **Assertions**: `#spnReturnedTires` content non-empty

---

### INC-TC-021 - Unqualified Units tile displays value
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-007
- **Precondition**: Admin; unqualified unit data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for data load.
- **Expected**: `#spnUnqualifiedTires` not empty
- **Assertions**: `#spnUnqualifiedTires` content non-empty

---

### INC-TC-020 - All Units tile displays value from CorporateDashboardDataByType
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-007
- **Precondition**: Admin; unit data exists
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for `#dvTierPurchasePannel` spinner to hide.
- **Expected**: `#spnTotalTires` shows non-empty numeric value
- **Assertions**: `#spnTotalTires` content is a number > 0

---

### INC-TC-019 - BMNM user distributor cascade populates correct dealer list
- **Tier**: Regression | **Category**: BusinessLogic | **Priority**: P2-High
- **BR Covered**: BR-003, BR-013
- **Precondition**: BMNM user; distributor with assigned primary dealers
- **Steps**: 1. Navigate as BMNM. 2. Select distributor from `#ddDistributor`. 3. Wait for dealer dropdown.
- **Expected**: Dealer dropdown shows dealers belonging to BMNM's org; all `primary_flag="Y"`
- **Assertions**: `#ddDealer` has ≥ 1 option; options match org-scoped data

---

### INC-TC-018 - TBM dropdown populated via GetSalesManager in Rewards mode
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-018, BR-011
- **Precondition**: Rewards mode; BMMGT or admin user
- **Steps**: 1. Navigate to IncentiveDashboard in Rewards mode. 2. Wait for TBM dropdown.
- **Expected**: `#ddlTM` has ≥ 1 Territory Manager option; `SalesManager` endpoint returns 200
- **Assertions**: TBM dropdown option count ≥ 1

---

### INC-TC-017 - Distributor center dropdown shows for DCWH distributor type
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Admin; DCWH-type distributor selected
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Select DCWH distributor.
- **Expected**: `#ddDistributorCenter` becomes visible and populated
- **Assertions**: Distributor center dropdown visible; ≥ 1 option loaded

---

### INC-TC-016 - Distributor cascades to sales person dropdown
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Non-Rewards mode; DIST user; sales persons exist
- **Steps**: 1. Navigate as DIST user. 2. Wait for sales person dropdown to populate.
- **Expected**: `#ddDealerSalesPerson` has ≥ 1 option; `SalesPersonByDistributor` returns 200
- **Assertions**: Sales person dropdown populated

---

### INC-TC-015 - Selecting distributor cascades to dealer dropdown
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-001, BR-013
- **Precondition**: BMMGT user; territory and distributor available
- **Steps**: 1. Navigate as BMMGT. 2. Select territory. 3. Select distributor from `#ddDistributor`. 4. Wait for dealer dropdown.
- **Expected**: Dealer dropdown visible with ≥ 1 primary dealer
- **Assertions**: `#ddDealer` has ≥ 1 option after distributor selection

---

### INC-TC-014 - Selecting territory cascades distributor dropdown
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: BMMGT user; territory and distributor data exists
- **Steps**: 1. Navigate as BMMGT. 2. Select territory from `#ddTerritory`.
- **Expected**: `#ddDistributor` has ≥ 1 option; `DistributorByTerritory` returns 200
- **Assertions**: Distributor dropdown populated after territory selection

---

### INC-TC-013 - Territory dropdown populated for BMMGT user
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: Authenticated as BMMGT
- **Steps**: 1. Navigate to IncentiveDashboard as BMMGT.
- **Expected**: `#ddTerritory` has ≥ 2 options; first option value = "0" (placeholder)
- **Assertions**: Territory dropdown option count ≥ 2; first option value = "0"

---

### INC-TC-012 - Changing quarter triggers KPI tile refresh
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-024
- **Precondition**: Admin user; multiple quarters with data
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for initial load. 3. Change `#ddlQuarterly` to different quarter. 4. Wait for reload.
- **Expected**: `CorporateDashboardDataByType` called with new `period_number` value
- **Assertions**: Network call made with updated period_number after quarter change

---

### INC-TC-011 - Changing fiscal year triggers KPI tile refresh
- **Tier**: Regression | **Category**: UI | **Priority**: P2-High
- **BR Covered**: BR-023
- **Precondition**: Admin user; multiple fiscal years available
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Wait for initial load. 3. Change `#ddlFiscalYear` to prior year. 4. Wait for reload.
- **Expected**: `CorporateDashboardDataByType` called with updated `fiscal_year` value
- **Assertions**: Network call made with updated fiscal_year after year change

---

### INC-TC-010 - Quarter dropdown has exactly 4 options (Q1-Q4)
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-001
- **Precondition**: Any authenticated user on IncentiveDashboard
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Inspect `#ddlQuarterly`.
- **Expected**: Exactly 4 options with values 1, 2, 3, 4
- **Assertions**: `#ddlQuarterly` has exactly 4 `<option>` elements; values are 1, 2, 3, 4

---

### INC-TC-009 - Fiscal year dropdown populated from GetFiscalYearByDivisionSeq
- **Tier**: Regression | **Category**: UI | **Priority**: P3-Medium
- **BR Covered**: BR-017
- **Precondition**: Active division with fiscal year data
- **Steps**: 1. Navigate to IncentiveDashboard. 2. Inspect `#ddlFiscalYear`.
- **Expected**: ≥ 1 option; current year selected by default
- **Assertions**: Fiscal year dropdown has ≥ 1 option; default selected value = current fiscal year

---

### INC-TC-008 - Dashboard loads for OAM user - org-scoped data shown
- **Tier**: Regression | **Category**: Authorization | **Priority**: P2-High
- **BR Covered**: BR-001, BR-025
- **Precondition**: Authenticated as OAM
- **Steps**: 1. Navigate to IncentiveDashboard as OAM.
- **Expected**: Page loads; distributor pre-populated with OAM's `dealer_number_seq`; org SP called
- **Assertions**: `#hdUserType` value = "OAM"; distributor filter pre-populated

---

### INC-TC-007 - Dashboard loads for BMDM user - TM auto-selected from session
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-006, BR-001
- **Precondition**: Authenticated as BMDM
- **Steps**: 1. Navigate to IncentiveDashboard as BMDM.
- **Expected**: TM pre-populated from `UserSession.OwnerTableSeq`; KPI tiles load without manual TM selection
- **Assertions**: `#hdTerritoryManager` value = expected TM seq; tiles load automatically

---

### INC-TC-006 - Dashboard loads for FAST user - territory + dealers shown
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-004
- **Precondition**: Authenticated as FAST; district dealers exist
- **Steps**: 1. Navigate to IncentiveDashboard as FAST user.
- **Expected**: Territory selector visible; dealer list pre-populated for Falken district
- **Assertions**: Territory dropdown visible; dealer dropdown has ≥ 1 option

---

### INC-TC-005 - Dashboard loads for BMMGT user - territory selector shown
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-005
- **Precondition**: Authenticated as BMMGT
- **Steps**: 1. Navigate to IncentiveDashboard as BMMGT.
- **Expected**: `#ddTerritory` visible; first option contains "Select Territory"
- **Assertions**: Territory dropdown visible; default option text matches placeholder text

---

### INC-TC-004 - Dashboard loads for BMNM user - dealer list for org shown
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-003
- **Precondition**: Authenticated as BMNM
- **Steps**: 1. Navigate to IncentiveDashboard as BMNM.
- **Expected**: Dealer dropdown visible and populated with org-scoped dealers sorted A-Z
- **Assertions**: Dealer dropdown has ≥ 1 option; options are alphabetically ordered

---

### INC-TC-003 - Dashboard loads for RDIST user - distributor pre-populated
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: Authenticated as RDIST
- **Steps**: 1. Navigate to IncentiveDashboard as RDIST.
- **Expected**: Distributor dropdown shows RDIST's own account as pre-selected; no user action required
- **Assertions**: Distributor dropdown selected value matches RDIST's `dealer_number_seq`

---

### INC-TC-002 - BMADMIN user sees all territory managers (seq=0, no org filter)
- **Tier**: Regression | **Category**: Authorization | **Priority**: P2-High
- **BR Covered**: BR-022, BR-018
- **Precondition**: Authenticated as BMADMIN
- **Steps**: 1. Navigate to IncentiveDashboard as BMADMIN. 2. Inspect TM dropdown.
- **Expected**: TM dropdown contains all TMs (unfiltered); `SalesManager` called with `seq=0`
- **Assertions**: Network call to `SalesManager` has `seq=0`; TM count is unfiltered maximum

---

### INC-TC-001 - Dashboard loads for DIST user - distributor pre-populated
- **Tier**: Regression | **Category**: Initialization | **Priority**: P2-High
- **BR Covered**: BR-002
- **Precondition**: Authenticated as DIST
- **Steps**: 1. Navigate to IncentiveDashboard as DIST user.
- **Expected**: `hdDistributor_dealer_number_seq` = `UserSession.dealer_number_seq`; distributor shown without user interaction
- **Assertions**: `#hdDistributor_dealer_number_seq` value = expected seq; distributor filter pre-populated

---

## Automation Notes

```ts
// Example: verify encrypted dealer_number_seq in API response
test('INC-TC-037 - dealer_number_seq is AES-encrypted', async ({ page, bmdmUser }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  const response = await page.waitForResponse(r => r.url().includes('CorporateDashboardDataByType'));
  const json = await response.json();
  const seq = json?.[0]?.dealer_number_seq;
  expect(typeof seq).toBe('string');
  expect(/^\d+$/.test(seq)).toBeFalsy(); // must not be a plain integer string
});

// Example: verify ConvertToRewards mode hides brand tab
test('INC-TC-028 - rewards mode hides brand tab', async ({ page, rewardsModeUser }) => {
  await page.goto('/Rewards/Incentives/Dashboard/IncentiveDashboard');
  await expect(page.locator('#Brand')).toBeHidden();
  await expect(page.locator('#PromotionEarned')).toBeVisible();
});
```
