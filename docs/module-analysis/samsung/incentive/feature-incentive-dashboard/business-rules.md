# Incentive - Incentive Dashboard - Business Rule Catalog
Generated: 2026-07-09

---

## Business Rule Catalog

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-001 | Dashboard view scoped by User_Type | Security / Data Scope | `IncentiveDashboard.OnGet` - `User_Type` from `UserSession` | Different filter sets visible per user type | Critical |
| BR-002 | DIST/RDIST/OAM/DARO auto-set distributor context | Initialization | `OnGet` - `DistributorDealerNumberSeq = UserSession.dealer_number_seq` | Distributor dropdown pre-populated on page load | High |
| BR-003 | BMNM users see dealer list for their org | Initialization | `getDealerByDistributor` with `UserSession.organization_structure_seq` | Dealer dropdown visible with org-scoped dealers | High |
| BR-004 | FAST users see dealers for their district + territory | Initialization | `getDealerByOrganizationStructure` with `falken_district_seq`; `BindTerritory` called | Territory selector + dealer list shown | High |
| BR-005 | BMMGT/BMTMGT/default users see territory selector | Initialization | `BindTerritory` -> `GetAllTerritory` | Territory dropdown rendered; prepended with "-- Select Territory --" (value=0) | High |
| BR-006 | BMDM users auto-set Territory Manager | Initialization | `TerritoryManager = UserSession.OwnerTableSeq` | TM field pre-populated; no selection required | High |
| BR-007 | Dashboard KPI data route determined by User_Type + rule_mode | Business Logic | `OnGetCorporateDashboardDataByType` - `searchType` + `seq` + `rule_mode` routing | KPI tiles populated from correct SP per user type | Critical |
| BR-008 | dealer_number_seq AES-encrypted in API responses | Security | `IEncryptDecrypt.Encrypt(value)` applied to every `dealer_number_seq` in result | Response JSON contains encrypted strings, not integers | Critical |
| BR-009 | DealerDashboard decrypts dealer_number URL param | Security | `_encrypt.Decrypt(dealer_number)` - fallback to `dnSeq` int param | Dealer context loaded from encrypted URL param | Critical |
| BR-010 | LandingDashboard decodes Base64 dn URL param | Security | `Base64.Decode(dn)` in `OnGet` | Dealer pre-selected when `dn` present in URL | High |
| BR-011 | ConvertToRewards flag controls UI mode | UI Conditional | `hdnProgramValue` hidden field; JS reads flag on page load | Rewards mode: Brand tab hidden, In-house active, TBM/Distributor shown, Branding Points tile visible | Critical |
| BR-012 | Purchase tiles hidden when IsShowPurchase=true | UI Conditional | `hdnShowPurchase` hidden field; JS conditionally shows/hides | "Total Purchases", "Unqualified", "Returned Cost" tiles hidden when flag=true | High |
| BR-013 | Only primary_flag="Y" dealers returned | Business Logic | `OnGetDealerByDistributor` -> `.Where(w => w.primary_flag == "Y")` | Non-primary dealer locations excluded from dropdown | High |
| BR-014 | DashboardTab SP determines default tab | Business Logic | `GetDashboardTab` SP -> `tab` value; override to `pp-tab` if `partnerprogram=true` | Correct tab active on DealerDashboard load | High |
| BR-015 | pt-tab returns adjustment data (not tier data) | Business Logic | `OnGetTabInformation`: `selectTab == "pt-tab"` -> `program_code`, `adjustment_amount`, `adjustment_date` | Adjustment tab shows amount and date columns | Medium |
| BR-016 | unitPercentage capped at 100% | Calculation | `program_tier_max == 9999999` -> 100%; actual >= max -> 100%; 0 units -> 0% | Progress bar / percentage never exceeds 100 | High |
| BR-017 | Fiscal year list from active division | Initialization | `GetFiscalYearByDivisionSeq(DivisionSeq)` | Fiscal year dropdown populated with valid years only | Medium |
| BR-018 | Territory Manager list scoped by role | Business Logic | `BindTerritoryManager` / `OnGetSalesManager`: BMRM->own org; DIST/RDIST->type="DIST"; BMADMIN->seq=0 | TM dropdown contains role-appropriate records only | High |
| BR-019 | totalAmountSummary=true triggers 8-result-set response | Business Logic | `OnGetTabInformation` - `totalAmountSummary=true` -> extended dataset including dealer Name, Address, Account_Number, DBA_Name and 6 amount categories | All extended fields rendered when flag is set | Medium |
| BR-020 | _OnlyPrimaryUnitsDisplayed note displayed in footer | UI | `ViewResource.en-US.resx` key `_OnlyPrimaryUnitsDisplayed` = "Single-phase ODU count are considered qualified units" | Note visible in dashboard footer | Low |
| BR-021 | Session required - redirect to login when unauthenticated | Security | `SessionTimeoutAttribute` - `UserSession.UserID == null` -> redirect to `~/Account/Login` | Unauthenticated request -> HTTP 302 to `/Account/Login` | Critical |
| BR-022 | BMADMIN sees all data (no org filter) | Business Logic | `UserSession.Role.ToUpper() == "BMADMIN"` -> `seq = 0` in `BindTerritoryManager` | BMADMIN dropdown shows all territory managers | High |
| BR-023 | Fiscal year change triggers full dashboard reload | UI Behavior | `#ddlFiscalYear` change -> `LoadDashbord()` (JS) | All KPI tiles and charts refresh after year change | High |
| BR-024 | Quarter change triggers full dashboard reload | UI Behavior | `#ddlQuarterly` change -> `LoadDashbord()` (JS) | All KPI tiles and charts refresh after quarter change | High |
| BR-025 | BMNM/FAST/OAM (seq>0) -> GetOrganizationDashboardDataByType | Business Logic | `OnGetCorporateDashboardDataByType` SP routing logic | KPI data loaded from correct org-scoped SP | High |
| BR-026 | BMDM/BMRM (RSM/PRSM) -> GetDemoCorporateDashboardDataByType | Business Logic | `OnGetCorporateDashboardDataByType` routing | KPI data from corporate SP with optional `sm` param | High |
| BR-027 | DIST/RDIST/DARO -> GetDemoCorporateDashboardDataByType2 | Business Logic | `OnGetCorporateDashboardDataByType` routing (DIST scope) | Distributor-scoped KPI data | High |
| BR-028 | BMRM with sm (PRSM mode) passes sm param to SP | Business Logic | `sm` passed as `UserSession.OwnerTableSeq` for BMRM/PRSM | Corporate SP receives sm parameter for filtering | Medium |
| BR-029 | Promotion carousels load per active Rewards mode | UI Conditional | `ConvertToRewards` flag -> renders Brand (`#PromotionEarned_Brand`) or In-house (`#PromotionEarned`) carousel | Correct promotion carousel section visible | Medium |
| BR-030 | BMRM/PRSM Territory Manager list scoped to own org | Business Logic | `BindTerritoryManager` for BMRM -> own `organization_structure_seq` | TM dropdown filtered to BMRM's territory | Medium |
