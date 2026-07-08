# Rebate Dashboard — Repository Analysis Report
Generated: 2026-07-07

## Source Files Analyzed
| File | Layer | Purpose |
|---|---|---|
| `Presentation/Web/Pages/Rebate/Dashboard.cshtml` | UI | Dashboard stats tiles, charts, filter dropdowns |
| `Presentation/Web/Pages/Rebate/Dashboard.cshtml.cs` | Handler | GET (load year list), AJAX handlers (campaign list, stats, heatmap) |
| `Presentation/Web/Infrastructure/ApiClients/Rebate/IRebateManageApiService.cs` | Service Contract | Dashboard API methods |
| `Presentation/Web/wwwroot/WebScripts/Rebate/AddRebate.js` | Client | Chart rendering, AJAX calls |

---

## UI / Form Fields
| Field Name | Type | Required | Label | Conditional | Notes |
|---|---|---|---|---|---|
| ddrebates | select | No | Promotions | — | Populated via AJAX `OnGetCampaign`; filters dashboard stats |
| ddyear (fiscalyear) | select | No | Year | — | Populated from `FiscalYearList`; defaults to current year |

---

## API / Handler Endpoints
| Method | Route / Handler | Auth | Purpose |
|---|---|---|---|
| GET | `OnGetAsync` | BasePageModel (session auth) | Load fiscal year dropdown |
| GET | `?handler=Campaign&yearVal=&name=` | Authenticated | Returns campaign list for promotions dropdown |
| GET | `?handler=DashBoard01Detail&Year=&rebate_campaign_seq=` | Authenticated | Returns all dashboard stats |
| GET | `?handler=HeatMap&Year=&rebate_campaign_seq=` | Authenticated | Returns geographic heatmap data |

---

## Business Rules
| Rule ID | Description | Source | Logic Summary |
|---|---|---|---|
| BR-D01 | Year defaults to current | `DashboardModel.OnGetCampaignAsync` | If `yearVal == 0`, use `DateTime.Now.Year` |
| BR-D02 | Deny vs Incomplete separation | `OnGetDashBoard01DetailAsync` | `_RebatesByReason` separates deny/incomplete by `Status == "Incomplete"` |
| BR-D03 | Stats scoped to division | `DashboardModel` | All API calls include `divisionSeq` from `_webHelper.GetActiveDivision()` |
| BR-D04 | Campaign filter optional | `OnGetDashBoard01DetailAsync` | `rebate_campaign_seq = 0` returns stats across all campaigns |

---

## Validation Rules
| Field | Rule | Error Message | Client/Server |
|---|---|---|---|
| fiscalyear | Defaults to 0 (all years) | — | Server |

---

## Dashboard Statistics Tiles
| Tile ID | Label | Data Field | Scope |
|---|---|---|---|
| totalRebate | Total Rebates | `s01.TotalRebates` | All statuses |
| totalAmount | Total Amount | `s01.TotalAmount` | All statuses |
| approvedRebates | Approved Rebates | `s01.Approved` | Approved only |
| approvedAmount | Approved Amount | `s01.ApprovedAmt` | Approved only |
| IncompleteRebates | Incomplete Rebates | `s01.Incomplete` | Incomplete |
| IncompleteAmount | Incomplete Amount | `s01.IncompleteAmt` | Incomplete |
| DeniedRebates | Denied Rebates | `s01.Deny` | Denied |
| DeniedAmount | Denied Amount | `s01.DenyAmt` | Denied |
| PaidRebatesNew | Paid Rebates | `s01.Paid` | Paid |
| PaidAmount | Paid Amount | `s01.PaidAmt` | Paid |
| pendingRebates | Pending Rebates | `s01.Pending` | Pending |
| pendingAmount | Pending Amount | `s01.PendingAmt` | Pending |
| SkippedRebates | Skipped | `s01.Skipped` | Skipped |
| InprogressRebates | Waiting for Review | `s01.InProgress` + `s01.UnderReview` | In-progress |
| PaidRebates | Total Paid ($) | `s01.PaidAmt` formatted | Summary card |
| TotalDealers | Participating Stores | `stats.ParticipatingStore` | Summary card |
| TotalRebatesCount | Total Promotions | `s02.TotalRebates` | Campaign count tile |

---

## Charts / Visualizations
| Chart | Data Source | Notes |
|---|---|---|
| Promotion By Status (chart/table toggle) | `_DashBoard03` (CampaignBreakdown) | Per-campaign breakdown by status |
| Top Dealers | `_DashBoard03` | Dealer ranking by paid amount |
| Rebates by Month | `_RebatesByMonths` | Monthly submission volume |
| Campaign by Month | `_CampaignByMonths` | Monthly campaign-level breakdown |
| Rebates by Reason | `_RebatesByReason.denyRebates` + `incompleteRebates` | Denial / incomplete reason breakdown |
| Rebates by Submission Type | `_RebatesBySubmission` | Submission method breakdown |
| Heatmap | `GetHeatmapDataAsync` | Geographic distribution |

---

## Database Operations
| Operation | Table / SP (via API) | Trigger | Key Fields |
|---|---|---|---|
| SELECT | `GetCampaignsByYearAsync` | Page load / year change | divisionSeq, year |
| SELECT | `GetDashboardStatsAsync` | AJAX on filter change | programSeq, divisionSeq, year, rebate_campaign_seq |
| SELECT | `GetHeatmapDataAsync` | AJAX | programSeq, divisionSeq, year, campaignSeq |

---

## Security Rules
| Rule | Enforcement | Role / Scope |
|---|---|---|
| Auth required | `BasePageModel` session validation | Authenticated users only |
| Division scoping | `_webHelper.GetActiveDivision()` | Stats filtered to user's active division |
| Admin roles permitted | `IsAuthorize()` → Admin, AdminLevel1/2, RebateAdmin, ChannelFusionAdmin | See base model role switch |

---

## Data Models
| Class | Key Fields | Purpose |
|---|---|---|
| `RebateCampaignByYearApiModel` | `RebateCampaignSeq, Name` | Promotions dropdown |
| `RebateDashboardStatsApiModel` | `ClaimSummary, CampaignCount, CampaignBreakdown, ReasonBreakdown, SubmissionTypes, RebatesByMonths, CampaignByMonths, ParticipatingStore` | All dashboard tiles |
| `RebateCampaignBreakdownApiModel` | `Name, Pending, Approved, Deny, Paid, Incomplete, *Amt` | Per-campaign chart data |
| `RebateReasonItemApiModel` | `Reason, Status, TotalRebates, TotalAmount` | Deny/incomplete reasons |
| `RebateHeatmapApiModel` | (geographic fields) | Map overlay |

---

## Client-Side Behaviors
| Behavior | Trigger | Logic |
|---|---|---|
| Load promotions dropdown | Page ready | AJAX GET `?handler=Campaign&yearVal=` populates `#ddrebates` |
| Refresh dashboard stats | `#ddrebates` or `#ddyear` change | AJAX GET `?handler=DashBoard01Detail` updates all tiles |
| Toggle chart/table | Tab click on Promotion By Status | Switches between chart and data table view |
| Heatmap rendering | Stats loaded | AJAX `?handler=HeatMap` fetches geographic data for map overlay |
| Currency formatting | Stats response | Applies `CurrencySymbol`, `DecimalSeparator`, `GroupSeparator` from culture config |

---

## Quality Gate Summary
- **UI fields documented**: 2 filter controls, 17 stat tiles, 7 charts
- **Business rules extracted**: 4
- **API handlers documented**: 4
- **Security rules documented**: 3
- **No form submission** — read-only dashboard
