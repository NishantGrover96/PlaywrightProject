# Incentive - Incentive Dashboard - Repository Analysis Report
Generated: 2026-07-09

---

## Source Files Analyzed

| File | Layer | Purpose |
|---|---|---|
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\IncentiveDashboard.cshtml` | UI | Admin/Corporate incentive dashboard - filter controls, summary tiles, promotion carousels, unit/purchase tracking graph, most/least rewarded dealer tables |
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\IncentiveDashboard.cshtml.cs` | Handler | GET (initialise filters, fiscal year, quarter); AJAX handlers for all dashboard data calls |
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\LandingDashboard.cshtml.cs` | Handler | Dealer landing dashboard GET + AJAX handlers (sales rep rewards, dealer sales reward detail, corporate data by type, redeem cash rewards) |
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\DealerDashboard.cshtml.cs` | Handler | Dealer-specific dashboard GET + AJAX handlers for tab selection and tab program information |
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\ProgramSummary.cshtml.cs` | Handler | Program-level summary page |
| `Presentation\Web\Pages\Rewards\Incentives\Dashboard\AdminSellerDashboard.cshtml.cs` | Handler | Admin seller view of dealer dashboard |
| `Libraries\BusinessLogic\Services\Program\IProgramService.cs` | Service Interface | `GetLoginDealers`, `GetDashboardTab`, `GetDealerDashboardPrograms`, `GetTreadPattern` |
| `Libraries\BusinessLogic\Services\Program\ProgramService.cs` | Service | Implements IProgramService; delegates to RebateAccessor for dashboard SP calls |
| `Libraries\BusinessLogic\Services\Dealer\IDealerService.cs` | Service Interface | `getDealerByDistributor`, `getDealerByOrganizationStructure`, `getDistributorByProgramseq`, `getDistributorByOrganizationStructureSeq2`, `getDistributorCenterByDistributor`, `getSalesPerson_Atlantic`, `GetAllTerritory` |
| `Libraries\BusinessLogic\Services\Dealer\DealerService.cs` | Service | Implements IDealerService |
| `Libraries\BusinessLogic\Services\Fiscal\IFiscalService.cs` | Service Interface | `GetFiscalYearByDivisionSeq` |
| `Libraries\BusinessLogic\Services\Organization\IOrganizationService.cs` | Service Interface | `GetCorporateByProgramSeq` |
| `Libraries\BusinessLogic\Services\Sale\SaleService.cs` | Service | `GetDashboardDetails` -> delegates to `clsSale` SaleAccessor |
| `Libraries\BusinessLogic\Services\Report\IReportService.cs` | Service Interface | Used by DealerDashboard |
| `RAL\Resources\Samsung\ViewResource.en-US.resx` | Resources | UI label strings and localised messages |
| `Presentation\Web\wwwroot\WebScripts\Rewards\Brand\Dashboard\IncentiveDashboard.js` | Client-Side | AJAX calls for corporate dashboard data, filter cascading, chart rendering |
| `Presentation\Web\wwwroot\WebScripts\Rewards\Dashboard\LandingDashboard.js` | Client-Side | Dealer landing dashboard AJAX and UI behaviours |
| `Presentation\Web\wwwroot\WebScripts\Rewards\Dashboard\DealerDashboard.js` | Client-Side | Dealer dashboard tab and program data AJAX |
| `Presentation\Web\Infrastructure\BasePageModel.cs` | Infrastructure | Base class for all page models; provides `UserSession`, `_programConfig`, session-based access control |
| `Presentation\Web\Filters\SessionTimeoutAttribute.cs` | Security Filter | Redirects to `~/Account/Login` when `UserSession.UserID == null` |

---

## UI / Filter Controls (IncentiveDashboard - Admin/Corporate View)

| Field / Control | Type | Label (Resource Key) | Role Visibility Condition | Notes |
|---|---|---|---|---|
| `hdCurrentQuarter` | hidden | - | All | Bound to `CurrentQuarter` |
| `hdCurrentYear` | hidden | - | All | Bound to `CurrentYear` |
| `hdUserType` | hidden | - | All | Bound to `UserType` |
| `hdTerritoryManager` | hidden | - | All | Bound to `TerritoryManager` |
| `hdDistributor_dealer_number_seq` | hidden | - | All | Bound to `DistributorDealerNumberSeq` |
| `hdnDocUploadPath` | hidden | - | All | Doc upload path from `WebHelper` |
| `hdnProgramValue` | hidden | - | All | `ConvertToRewards` flag value |
| `hdnShowPurchase` | hidden | - | All | `IsShowPurchase` flag value |
| `hdnProgramName` | hidden | - | All | `T["PromotionDetails"]` resource value |
| `ddTerritory` | select | "Territory" | Non-Rewards mode | AJAX-populated territory list |
| `ddlTM` (TerritoryManager) | select | `T["TBM"]` | Rewards mode (`ConvertToRewards=true`) | AJAX-populated via `BindRSM` / `OnGetSalesManager` |
| `ddlDistributor` | select | `T["DistributorWarehouse"]` | Rewards mode | AJAX-populated |
| `ddDealer2` | select | "Dealer" | Rewards mode | AJAX-populated; initially hidden |
| `ddDistributor` | select | `T["DistributorWarehouse"]` | Non-Rewards mode | AJAX-populated |
| `dvsalesperson` / `ddDealerSalesPerson` | select | `T["SalesPerson"]` | Non-Rewards mode | AJAX-populated |
| `ddDealer` | select | "Dealer" | Non-Rewards mode | AJAX-populated; initially hidden |
| `ddDistributorCenter` | select | "Distributor Warehouse" | Conditional | AJAX-populated; initially hidden |
| `ddlFiscalYear` | select | "Year" | All | Bound to `CurrentYear`; items from `GetFiscalYearByDivisionSeq` |
| `ddlQuarterly` | select | "Quarter" | All | Fixed options: Q1=1, Q2=2, Q3=3, Q4=4; bound to `CurrentQuarter` |

### Summary Tiles (AJAX-populated, read-only)

| Tile | Element ID | Mode | Data Source |
|---|---|---|---|
| All Units | `spnTotalTires` | All | `CorporateDashboardDataByType` |
| Unqualified Units | `spnUnqualifiedTires` | All | Same |
| Returned Units | `spnReturnedTires` | All | Same |
| Total Purchases | `spnTotalpurchase` | `IsShowPurchase=false` only | Same |
| Unqualified Purchase | `spnUnqualifiedpurchase` | `IsShowPurchase=false` only | Same |
| Returned Cost | `spnReturnpurchase` | `IsShowPurchase=false` only | Same |
| Reward Amount / Earned Cash Rewards | `promoTotalAmount` | All | Same |
| Earned Branding Points | `spnTentative` | Rewards mode only | Same |

### Promotion Carousels (AJAX-populated)

| Section | Tab Selector | Container ID | Mode |
|---|---|---|---|
| Brand Promotion | `#Brand` | `div_NewPromo_Brand` (inside `#PromotionEarned_Brand`) | Non-Rewards mode |
| In-house Promotion | `#Inhouse` | `div_NewPromo` (inside `#PromotionEarned`) | Both modes; active/default in Rewards mode |

### Charts & Tables (AJAX-populated)

| Widget | Element ID | Data Source | Notes |
|---|---|---|---|
| Unit & Purchase Tracking Graph | `dvPurchaseDetailGraph` | `CorporateDashboardDataByType` | Chart rendered client-side |
| Loading spinner (purchase) | `dvTierPurchasePannel` | - | Hidden when data loads |
| Most Rewarded Dealers | `tblTrueFanticDealer` | `CorporateDashboardDataByType` | Cols: Dealer Number, Dealer Name, Amount |
| Least Rewarded Dealers | `tblLeastFanticDealer` | `CorporateDashboardDataByType` | Cols: Dealer Number, Dealer Name, Amount |
| Manufacture Tracking (Quarterly) | `dvBrandDetailGraph` | `CorporateDashboardDataByType` | 500×350 px; Non-Rewards mode only |

---

## LandingDashboard - Dealer View Bound Properties

| Property | Type | Default / Source | Notes |
|---|---|---|---|
| `CurrentQuarter` | int | `DateTime.Now.GetQuarter(0)` or query param `qno` | Overridable via URL |
| `CurrentYear` | int | `_webHelper.GetCurrentYear()` or query param `qyear` | Overridable via URL |
| `DivisionSeq` | int | `_webHelper.GetActiveDivision()` | - |
| `DealerLocationsList` | `List<SelectListItem>` | AJAX | Dealer locations |
| `DdlFiscalYear` | string | Selected year | - |
| `SubDivisionSeq` | string | `_webHelper.GetActiveSubDivision()` | - |
| `hdDealerNumberSeq` | string | `UserSession.dealer_number_seq` | - |
| `hdParentDealerNumberSeq` | string | `UserSession.dealer_number_seq` | - |
| `DealerName` | string | - | Display name |
| `DealerNumber` | string | - | Display number |
| `hdDealerNumber` | string | Decoded from query param `dn` (Base64) | Dealer number from URL |
| `ShowSendButton` | bool | `false` | Controls payment approval button visibility |
| `AlreadyRedeemed` | bool | `false` | Controls redeem button state |

---

## DealerDashboard - Dealer View Bound Properties

| Property | Type | Notes |
|---|---|---|
| `DealerList` | `List<SelectListItem>` | Dealers available to current user; populated by `GetLoginDealers` |
| `dealer_Number_Seq` | int | Selected dealer; decrypted from `dealer_number` query param |

---

## API / Handler Endpoints

### IncentiveDashboard (Admin/Corporate)

| Handler Method | Route | Parameters | Purpose |
|---|---|---|---|
| `OnGet` | GET `/Rewards/Incentives/Dashboard/IncentiveDashboard` | - | Initialise filters, fiscal year, quarter based on `User_Type` |
| `OnGetDistributorByTerritory` | GET `.../DistributorByTerritory` | `organization_structure_seq` | Load distributor list by territory |
| `OnGetDistributorCenterByDistributor` | GET `.../DistributorCenterByDistributor` | `DealerNumberSeq`, `organization_structure_seq` | Load distributor centers for a distributor |
| `OnGetCorporateDashboardDataByType` | GET `.../CorporateDashboardDataByType` | `DealerNumberSeq`, `OrganizationStructureSeq`, `DistributorWareHouse`, `fiscal_year`, `period_number`, `type`, `rebate_product_category_seq`, `rebate_campaign_seq`, `rule_mode`, `sm` | Primary KPI data endpoint; **encrypts `dealer_number_seq` in response** |
| `OnGetCorporateDashboardData` | GET `.../CorporateDashboardData` | - | Returns multi-result set: ComplianceScore, TirePurchaseDetail, TotalPayouts, QuarterlyRewardsTotal, YTDReward |
| `OnGetAllDistributor` | GET `.../allDistributor` | `corporate_Seq`, `period_number`, `fiscal_year` | List all distributors |
| `OnGetByTerritory` | GET `.../ByTerritory` | `OrganizationStructureSeq` | Dealers by territory org structure |
| `OnGetDealerByDistributor` | GET `.../DealerByDistributor` | `DealerNumberSeq`, `DistributorWareHouse`, `organization_structure_seq`, `quarter`, `period_number`, `fiscal_year`, `Corporate_Seq` | Returns only `primary_flag="Y"` dealers |
| `OnGetSalesPersonByDistributor` | GET `.../SalesPersonByDistributor` | `DealerNumberSeq`, `period_number`, `fiscal_year` | Sales persons for a distributor |
| `OnGetBrand` | GET `.../Brand` | `active_flag` | Brand/manufacturer list for filter |
| `OnGetSalesManager` | GET `.../SalesManager` | - | Territory managers scoped by `User_Type` |

### LandingDashboard (Dealer)

| Handler Method | Route | Parameters | Purpose |
|---|---|---|---|
| `OnGet` | GET `/Rewards/Incentives/Dashboard/LandingDashboard` | `qno`, `qyear`, `dn` (Base64 dealer number) | Initialise dealer landing dashboard |
| `OnGetSalesRepRewardData` | GET `.../SalesRepRewardData` | `type` | Sales rep reward data |
| `OnGetDealerSalesRewardDetailData` | GET `.../DealerSalesRewardDetailData` | `dealer_number_seq`, `group_data`, `period_number`, `fiscal_year` | Dealer sales reward detail |
| `OnGetCorporateDashboardDataByType` | GET `.../CorporateDashboardDataByType` | `DealerNumberSeq`, `OrganizationStructureSeq`, `DistributorWareHouse`, `fiscal_year`, `period_number`, `type`, `rebate_product_category_seq`, `rebate_campaign_seq`, `rule_mode` | KPI data endpoint scoped to dealer context |
| `OnGetRedeemCashRewards` | GET `.../RedeemCashRewards` | `dealerNumberSeq` | Trigger cash reward redemption |

### DealerDashboard

| Handler Method | Route | Parameters | Purpose |
|---|---|---|---|
| `OnGet` | GET `/Rewards/Incentives/Dashboard/DealerDashboard` | `dealer_number` (encrypted) | Load dealer dashboard; bind dealer dropdown when no `dealer_number` provided |
| `OnGetTab` | GET `.../Tab` | `dealer_number` (encrypted), `dnSeq`, `queryParam` | Determine active tab; `partnerprogram` param -> override to `pp-tab` |
| `OnGetTabInformation` | GET `.../TabInformation` | `selectTab`, `dealer_number` (encrypted), `dnSeq`, `totalAmountSummary` | Program data for selected tab; `totalAmountSummary=true` returns extended 8-result-set |

---

## Business Rules

| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-001 | Dashboard view scoped by `User_Type` | `IncentiveDashboard.OnGet` | `User_Type` controls which filters render and which data scope is applied at every AJAX call |
| BR-002 | DIST/RDIST/OAM/DARO users auto-set distributor context | `OnGet` | `DistributorDealerNumberSeq` = `UserSession.dealer_number_seq`; dropdown pre-populated with logged-in user |
| BR-003 | BMNM users see dealer list for their org | `OnGet` | `getDealerByDistributor` called with `UserSession.organization_structure_seq`; sorted A->Z |
| BR-004 | FAST users see dealers for their district | `OnGet` | `getDealerByOrganizationStructure` called with `falken_district_seq`; `BindTerritory` also called |
| BR-005 | BMMGT / BMTMGT / default users see territory selector | `OnGet` -> `BindTerritory` | `GetAllTerritory` called; prepended with `-- Select Territory --` (value=0) |
| BR-006 | BMDM users auto-set Territory Manager | `OnGet` | `TerritoryManager = UserSession.OwnerTableSeq` |
| BR-007 | Dashboard data route determined by `searchType` + `rule_mode` | `OnGetCorporateDashboardDataByType` | BMNM/FAST/OAM (seq>0) -> `GetOrganizationDashboardDataByType`; BMDM/BMRM (RSM/PRSM) -> `GetDemoCorporateDashboardDataByType`; DIST/RDIST/DARO -> `GetDemoCorporateDashboardDataByType2`; DCWH/BMNM org-level -> `GetOrganizationDashboardDataByType`; default -> `GetDemoCorporateDashboardDataByType` |
| BR-008 | `dealer_number_seq` encrypted in all API responses | `OnGetCorporateDashboardDataByType` | Every `dealer_number_seq` value in result set replaced with `IEncryptDecrypt.Encrypt(value)` before JSON serialisation |
| BR-009 | Dealer number decrypted on DealerDashboard | `DealerDashboard.OnGet`, `OnGetTab`, `OnGetTabInformation` | `_encrypt.Decrypt(dealer_number)` called; empty/null result falls back to `dnSeq` integer parameter |
| BR-010 | Dealer number decoded on LandingDashboard | `LandingDashboard.OnGet` | `dn` query param is Base64-decoded to resolve dealer context |
| BR-011 | `ConvertToRewards` program flag controls UI mode | `IncentiveDashboard.cshtml` | `true` -> hides Brand Promotion tab, activates In-house only, shows TBM/Distributor filters, shows Branding Points tile; `false` -> Brand Promotion tab visible, SalesPerson/Dealer filters shown |
| BR-012 | Purchase tiles hidden when `IsShowPurchase=true` | `IncentiveDashboard.cshtml` | "Total Purchases", "Unqualified", "Returned Cost" tiles and "Unit & Purchase Tracking" label only shown when `IsShowPurchase=false` |
| BR-013 | Only primary-flagged dealers returned | `OnGetDealerByDistributor` | `.Where(w => w.primary_flag == "Y")` applied after SP result; non-primary locations excluded |
| BR-014 | DashboardTab SP determines active tab | `DealerDashboard.OnGetTab` | `GetDashboardTab` SP returns `tab` value; if `queryParam == "partnerprogram"` and `isPartnerProgram == true`, override to `"pp-tab"` |
| BR-015 | `pt-tab` returns adjustment data | `DealerDashboard.OnGetTabInformation` | `selectTab == "pt-tab"` -> returns `program_code`, `adjustment_amount`, `adjustment_date`; all other tabs -> tiered program data |
| BR-016 | `unitPercentage` capped at 100% | `OnGetTabInformation` | `program_tier_max == 9999999` -> 100%; actual units ≥ tier max -> 100%; zero units -> 0%; otherwise `group_period_unit_purchase * 100 / program_tier_max` |
| BR-017 | Fiscal year list derived from active division | `IncentiveDashboard.bindFiscalYearList` | `GetFiscalYearByDivisionSeq(DivisionSeq)` |
| BR-018 | Territory Manager list scoped by role | `BindTerritoryManager` / `OnGetSalesManager` | BMRM -> own org; DIST/RDIST -> dealer number (type="DIST"); all others -> BMDM scope; BMADMIN -> `seq=0` (all records) |
| BR-019 | `totalAmountSummary=true` triggers extended data response | `OnGetTabInformation` | 8 result sets returned: program list, counts, manufacturer/program/rebate/partner/pass-through amounts, totals, dealer info (Name, Address, Account_Number, DBA_Name) |
| BR-020 | `_OnlyPrimaryUnitsDisplayed` shown in dashboard footer | `IncentiveDashboard.cshtml` | Resource string: "Single-phase ODU count are considered qualified units" |

---

## Validation Rules

> The Incentive Dashboard is a read-only analytics/reporting feature with no form submission.
> Server-side field validation (Required, Range, etc.) does not apply.
> The following parameter constraints are enforced in handler logic:

| Parameter | Handler | Constraint | Behaviour on Violation |
|---|---|---|---|
| `dealer_number` (AES encrypted) | `DealerDashboard.OnGetTab`, `OnGetTabInformation` | Must decrypt to a valid non-empty string | Falls back to `dnSeq` parameter (integer) |
| `dn` (Base64 encoded) | `LandingDashboard.OnGet` | Must be valid Base64 | Exception caught; page loads without pre-selected dealer |
| `fiscal_year`, `period_number` | All AJAX handlers | Must parse as integer | `Convert.ToInt32` - exception thrown on non-integer |
| `organization_structure_seq` | Multiple handlers | Treated as 0 when empty string | `Convert.ToInt32` with empty-string guard |
| `rule_mode` | `OnGetCorporateDashboardDataByType` | Drives routing logic | Invalid value falls through to default `GetDemoCorporateDashboardDataByType` path |

---

## Workflow / Status Transitions

> The Incentive Dashboard is a read-only reporting page. No status workflow exists within this feature.
> The single write-adjacent action is reward redemption:

| Action | Handler | Trigger | Effect |
|---|---|---|---|
| Redeem Cash Rewards | `LandingDashboard.OnGetRedeemCashRewards` | "Redeem" button click (JS) | Initiates reward redemption for `dealerNumberSeq` |

---

## Database Operations

| Operation | Method | Service / Layer | SP / Accessor | Key Parameters |
|---|---|---|---|---|
| READ | `GetFiscalYearByDivisionSeq` | `FiscalService` -> `FiscalAccessor` | Fiscal year SP | `DivisionSeq` |
| READ | `getDealerByDistributor` | `DealerService` -> `DealerAccessor` | Dealer list SP | `programSeq`, `dealer_number_seq`, `IncludeChild`, `Distributor_Warehouse_Seq`, `OrganizationStructureSeq`, `quarter`, `FiscalYear`, `contact_Seq`, `active_flag`, `corporate_seq` |
| READ | `getDealerByOrganizationStructure` | `DealerService` | SP | `programSeq`, `OrganizationStructureSeq`, `User_Type`, `IncludeChild` |
| READ | `getDistributorByProgramseq` | `DealerService` | SP | `Program_seq`, `corporate_Seq`, `period_number`, `fiscal_year` |
| READ | `getDistributorByOrganizationStructureSeq2` | `DealerService` | SP | `programSeq`, `organization_structure_seq` |
| READ | `getDistributorCenterByDistributor` | `DealerService` | SP | `DealerNumberSeq`, `distributor_warehouse_seq`, `organization_structure_seq`, `contact_Seq` |
| READ | `getSalesPerson_Atlantic` | `DealerService` | SP | `programSeq`, `dealer_number_seq`, `quarter`, `FiscalYear` |
| READ | `GetAllTerritory` | `DealerService` | SP -> returns `Name`, `organization_structure_seq` | `programSeq` |
| READ | `GetOrganizationDashboardDataByType` | `SaleBIZ` (direct instantiation) | SP - org-level dashboard KPI | `ProgramSeq`, `fiscal_year`, `type`, `DivisionSeq`, `SubDivisionSeq`, `period_number`, `searchType`, `seq`, `rebate_product_category_seq`, `rebate_campaign_seq`, `rule_mode` |
| READ | `GetDemoCorporateDashboardDataByType` | `SaleBIZ` (direct) | SP - corporate dashboard (BMDM/BMRM) | Same + `sm` (sales manager seq for PRSM mode) |
| READ | `GetDemoCorporateDashboardDataByType2` | `SaleBIZ` (direct) | SP - corporate dashboard (DIST scope) | Same set without `sm` |
| READ | `GetAtlanticCorporateDashboardData` | `SaleBIZ` (direct) | SP - multi-result corporate data | `ProgramSeq`, `CurrentYear`, `DivisionSeq`, `SubDivisionSeq`, `CurrentQuarter` - returns ComplianceScore, TirePurchaseDetail, TotalPayouts, QuarterlyRewardsTotal, YTDReward |
| READ | `GetLoginDealers` | `ProgramService` -> `RebateAccessor` | SP - dealer list for logged-in context | `intProgramSeq`, `divisionSeq`, `seq`, `type` |
| READ | `GetDashboardTab` | `ProgramService` -> `RebateAccessor` | SP - default tab for dealer | `intProgramSeq`, `divisionSeq`, `dealerNumber`, `dealer_number_Seq` -> returns `tab`, `isPartnerProgram` |
| READ | `GetDealerDashboardPrograms` | `ProgramService` -> `RebateAccessor` | SP - program cards for tab | `intProgramSeq`, `divisionSeq`, `tabId`, `dealerNumberSeq`, `dealerNumber`, `totalAmountSummary` |
| READ | `GetTreadPattern` | `ProgramService` | SP - brand/manufacturer list | `mode="brand"`, `ProgramSeq`, `active_flag` -> returns `Brand`, `rebate_product_category_seq` |
| READ | `GetCorporateByProgramSeq` | `OrganizationService` | SP - territory manager / corporate list | `ProgramSeq`, `divisionSeq`, `osseq`, `user_type` |
| WRITE | `RedeemCashRewards` | `LandingDashboard` | Redemption SP/service | `dealerNumberSeq` |

---

## Security Rules

| Rule | Enforcement | Details |
|---|---|---|
| Session authentication required | `SessionTimeoutAttribute` | Redirects to `~/Account/Login` when `UserSession.UserID == null` |
| Data scoped by `User_Type` | All AJAX handlers | 9 user types: `DIST`, `BMNM`, `BMDM`, `BMRM`, `FAST`, `BMMGT`, `OAM`, `DARO`, `RDIST` - each gets a distinct SP call or `seq`/`searchType` |
| `dealer_number_seq` encrypted in API responses | `OnGetCorporateDashboardDataByType` | All `dealer_number_seq` values replaced with `IEncryptDecrypt.Encrypt()` before JSON serialisation - prevents IDOR |
| `dealer_number` param must be decrypted client-to-server | `DealerDashboard.OnGetTab`, `OnGetTabInformation` | `_encrypt.Decrypt(dealer_number)` called; unrecognised value -> fall back to `dnSeq` |
| Dealer number via Base64 on landing page | `LandingDashboard.OnGet` | `dn` query param decoded with Base64 |
| BMADMIN sees all data | `BindTerritoryManager`, `OnGetSalesManager` | `UserSession.Role.ToUpper() == "BMADMIN"` -> `seq = 0` (no org filter) |
| Primary-only dealers | `OnGetDealerByDistributor` | `.Where(primary_flag == "Y")` - non-primary locations not returned |
| Anti-forgery token | ASP.NET Core Razor Pages default | Applied globally by framework for all POST requests |

---

## Data Models

| Class | Namespace | Key Fields | Purpose |
|---|---|---|---|
| `IncentiveDashboardModel` | `Web.Pages.Rewards.Incentives.Dashboard` | `CurrentQuarter`, `CurrentYear`, `UserType`, `TerritoryManager`, `DistributorDealerNumberSeq`, `DdlFiscalYearItems`, `TerritoryManagerList`, `ddlTM` | Page model - admin/corporate dashboard |
| `LandingDashboardModel` | Same | `CurrentQuarter`, `CurrentYear`, `DivisionSeq`, `hdDealerNumberSeq`, `hdParentDealerNumberSeq`, `DealerLocationsList`, `ShowSendButton`, `AlreadyRedeemed`, `HdnMultiLocation`, `HdCOGDealer`, `HdnRewardType` | Page model - dealer landing dashboard |
| `DealerDashboardModel` | Same | `DealerList`, `dealer_Number_Seq` | Page model - dealer dashboard |
| `DealerDashboardViewModel` | `Web.Models.Dashboard` | `programName`, `PeriodDateRange`, `program_code`, `period_goal`, `period_unit_purchase`, `unitPercentage`, `daysLeft`, `daysPercentage`, `PotentialEarning`, `group_unit_purchase`, `Group_Potentail_Earning`, `ParticipatingLocations`, `Location_Number`, `minCount`, `maxCount`, `PaymentTypeSeq`, `is_payout_exist`, `payment_type`, `item_name`, `item_next`, `manufacturerProgramAmount`, `manufacturerPotentialEarning`, `programAmount`, `programPotentialEarning`, `rebateAmount`, `rebatePotentialEarning`, `partnerProgramAmount`, `partnerProgramPotentialEarning`, `passThroughAmount`, `passThroughPotentialEarning`, `totalValueSummary`, `totalPotentialEarning`, `Name`, `Address`, `Account_Number`, `DBA_Name`, `ManufacturerCount`, `ProgramCount`, `RebateCount`, `ParterProgramCount`, `CoopCount`, `PassThroughCount`, `Adjustment_Amount`, `Adjustment_date`, `totalAmountSummary` | Full program/reward data for dealer tab view |
| `IncentiveDashboardModel.Dealer` (inner) | Same | `Dealer_Number_Seq`, `Name`, `primary_flag`, `OS_Seq` | Dealer dropdown item |
| `IncentiveDashboardModel.SalesPerson` (inner) | Same | `Name`, `OS_Seq` | Sales person dropdown item |
| `IncentiveDashboardModel.Brand` (inner) | Same | `Name`, `rebate_product_category_seq` | Brand/manufacturer filter item |
| `LandingDashboard.DealerLocation` (inner) | Same | (shape from `OnGetCorporateDashboardDataByType`) | Dealer location context |

---

## Client-Side Behaviours (IncentiveDashboard.js)

| Behaviour | Trigger | Logic |
|---|---|---|
| Reload dashboard on fiscal year change | `#ddlFiscalYear` change | `setTimeout` -> `LoadDashbord()` |
| Reload dashboard on quarter change | `#ddlQuarterly` change | `setTimeout` -> `LoadDashbord()` |
| Cascade distributor on `#ddDistributor` change | `#ddDistributor` change | `setTimeout` -> refresh dependent dropdowns |
| Cascade on `#ddlDistributor` change | `#ddlDistributor` change | Same |
| Cascade dealers on sales person change | `#ddDealerSalesPerson` change | `setTimeout` -> refresh dealer list |
| Reload on TM change | `#ddTerritoryManager` change | `setTimeout` -> `LoadDashbord()` |
| Filter by brand | `#lstBrands` change | `setTimeout` -> `LoadDashbord()` |
| Dealer select (Non-Rewards) | `#ddDealer` change | Reload dashboard |
| Dealer select (Rewards mode) | `#ddDealer2` change | Reload dashboard |
| Fetch brand list | `getBrand()` | GET `.../Brand` -> populates brand filter dropdown |
| Fetch KPI tiles | `DealerLocationCount()` | GET `.../CorporateDashboardDataByType` with `type` param |
| Fetch distributor units | `DistributorsUnits()` | GET `.../CorporateDashboardDataByType` |
| Fetch dealers enrolled | `DealersEnrolled()` | GET `.../CorporateDashboardDataByType` |
| Render dealer enrolled graph | `renderDealerEnrollGraph()` | Called after `bindDealersEnrolledData()` - chart rendering |
| Bind distributor dropdown | `BindDistrbutor()` | GET `.../allDistributor` |
| Load RSM / TBM list | `BindRSM()` | GET `.../SalesManager` |
| Load dealers by distributor | `GetDealerByDist()` / `GetDealerByDist2()` | GET `.../DealerByDistributor` |
| Load sales persons | Sales person cascade | GET `.../SalesPersonByDistributor` |
| Load distributor centers | Distributor center cascade | GET `.../DistributorCenterByDistributor` |
| Load distributors by territory | Territory select cascade | GET `.../DistributorByTerritory` |
| Load dealers by territory | Territory select cascade | GET `.../ByTerritory` |

---

## Resource Strings (Samsung - ViewResource.en-US.resx)

| Key | Value | Used In |
|---|---|---|
| `_OnlyPrimaryUnitsDisplayed` | "Single-phase ODU count are considered qualified units" | Dashboard footer note |
| `TBM` | Territory Business Manager label | `ddlTM` label in Rewards mode |
| `DistributorWarehouse` | Distributor/Warehouse label | Distributor filter label |
| `SalesPerson` | Sales Person label | Sales person filter label |
| `PromotionDetails` | Promotion name label | Hidden field `hdnProgramName` |
| `Fiscal Year` | "Fiscal Year" | Year filter label |

---

## Quality Gate

| Category | Count |
|---|---|
| Source files analysed | 20 |
| UI filter controls / hidden fields | 19 |
| Summary tiles | 8 |
| AJAX / handler endpoints | 17 |
| Business rules | 20 |
| Validation constraints | 5 |
| DB read operations | 17 |
| DB write operations | 1 |
| Security rules | 8 |
| Client-side behaviours | 20 |
| Data models | 8 |
| Resource strings | 6 |

**Status: COMPLETE** - all layers analysed. Ready for `/functional-test-catalog`.
