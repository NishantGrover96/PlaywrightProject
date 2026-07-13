# Rebate Dashboard - Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-DASH-01 | Authenticated access required | Security | `BasePageModel` session auth | Unauthenticated user redirected to `/Account/Login` | Critical |
| BR-DASH-02 | Admin / RebateAdmin role required | Security | `IsAuthorize()` role switch: Admin, AdminLevel1/2, RebateAdmin, ChannelFusionAdmin | Page inaccessible for Dealer role (no dashboard) | Critical |
| BR-DASH-03 | Division-scoped stats | Business Logic | `_webHelper.GetActiveDivision()` passed to all API calls | All tiles reflect only the user's active division | High |
| BR-DASH-04 | Year defaults to current year | Business Logic | `OnGetCampaignAsync`: `if (yearVal == 0) Year = DateTime.Now.Year` | Year dropdown defaults to current year on load | High |
| BR-DASH-05 | Promotions dropdown populated on load | UI | `OnGetCampaignAsync` -> `GetCampaignsByYearAsync` | `#ddrebates` populated with current-year campaigns | High |
| BR-DASH-06 | Stats update on year change | UI/Workflow | `OnGetDashBoard01DetailAsync` called with new year | All 17 tiles refresh when year dropdown changes | High |
| BR-DASH-07 | Stats update on campaign filter | UI/Workflow | `rebate_campaign_seq` param on stats AJAX call | All tiles narrow to selected campaign | High |
| BR-DASH-08 | Campaign seq=0 returns all campaigns | Business Logic | `rebate_campaign_seq = 0` -> no campaign filter | Stats show program-wide totals when "All" selected | Medium |
| BR-DASH-09 | Deny vs Incomplete reason split | Business Logic | `_RebatesByReason`: `.Where(r => !Status=="Incomplete")` vs `.Where(r => Status=="Incomplete")` | Two separate reason breakdown sections rendered | Medium |
| BR-DASH-10 | Participating Stores count | Business Logic | `stats.ParticipatingStore` | Card tile shows unique dealer count for year/campaign | Medium |
| BR-DASH-11 | Total Paid tile (currency formatted) | UI | `paid_Amt` with culture-specific formatting | Dollar amount uses `CurrencySymbol`, `DecimalSeparator`, `GroupSeparator` | Medium |
| BR-DASH-12 | Chart/Table toggle on Promotion By Status | UI | `.e_List-Tabs a` click | Chart view and table view toggle without page reload | Low |
| BR-DASH-13 | Heatmap loaded separately | Business Logic | `GetHeatmapDataAsync` - separate AJAX call | Heatmap renders after main stats tiles | Low |
| BR-DASH-14 | Promotions dropdown filters to selected year | Business Logic | `GetCampaignsByYearAsync(divisionSeq, year)` | Selecting 2024 in year dropdown reloads `#ddrebates` with 2024 campaigns | High |
