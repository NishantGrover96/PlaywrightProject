# Rebate Setup Campaign - Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-SC-01 | Authenticated access required | Security | `BasePageModel` session auth | Redirect to `/Account/Login` | Critical |
| BR-SC-02 | Admin / RebateAdmin role required | Security | `IsAuthorize()` role switch | Dealer role cannot access `/Rebate/CreateRebate` | Critical |
| BR-SC-03 | Group campaign required to proceed | Business Logic | `Rebate_Group_Campaign.Count == 0` -> redirect to `/Admin/CMS/Campaign/list` | Error notification + redirect if no groups exist | Critical |
| BR-SC-04 | Campaign Selection required | Validation | `re_group_seq` required | Wizard Step 1: error if no group campaign selected | High |
| BR-SC-05 | Rebate Offer (product) required | Validation | `products_error` span | At least one offer must be linked | High |
| BR-SC-06 | Start Date required | Validation | `start_date_error` span + date picker | Missing start date shows error | High |
| BR-SC-07 | End Date required; must be ≥ Start Date | Validation | `end_date_error` + JS date comparison | End date before start date shows error | High |
| BR-SC-08 | Rebate Code uniqueness | Business Logic | `IsRebateCodeTakenAsync` | AJAX check on code blur; error if taken | High |
| BR-SC-09 | Currency locked on edit | Business Logic | JS: `Currency` disabled when `RebateCampaignSeq` in query | Currency cannot be changed after creation | High |
| BR-SC-10 | Auto-select group campaign for new rebate | Business Logic | `Rebate_Campaign_Modal.re_group_seq = Encrypt(first group)` | First group pre-selected on new rebate form | Medium |
| BR-SC-11 | EnsureGroupCampaignOption: expired group shown on edit | Business Logic | `EnsureGroupCampaignOptionAsync` searches expired/inactive/draft groups | On edit, expired linked group added to dropdown | High |
| BR-SC-12 | Payment rule: By Product or By Series | Business Logic | `_PaymentRuleModal.BySeries.Count > 0` pre-selects By Series | Radio button selection drives payment rule table | High |
| BR-SC-13 | Duplicate address count ≥ 0 | Validation | `[Range(0, int.MaxValue)]` | Negative value rejected by ModelState | Medium |
| BR-SC-14 | Publish gate: confirmation modal | Workflow | `#publishRebateModal` shown before publish | User must confirm campaign name + start date before publish | Critical |
| BR-SC-15 | Publish sets status to "Published" | Workflow | `UpdatePublishStatusAsync(campaignSeq, "Published")` | Campaign status changes; currency locked for all users | Critical |
| BR-SC-16 | Delete removes campaign | Workflow | `DeleteCampaignAsync(campaignSeq)` | Campaign no longer appears in Manage Rebate after delete | High |
| BR-SC-17 | Campaign Language step saves per language | Business Logic | `SaveCampaignLanguageAsync` per language variant | Language step supports multiple translations | High |
| BR-SC-18 | Series upload parses Excel file | Business Logic | `ExcelDataReader` on upload; parsed into `BySeriesJson` | Series grid rendered from uploaded file | Medium |
| BR-SC-19 | Anti-CSRF token on all POST handlers | Security | Razor Pages built-in `__RequestVerificationToken` | Form tampering blocked | High |
| BR-SC-20 | Encrypted campaign seq in all form fields | Security | `re_campaign_seq`, `re_rule_campaign_seq`, `re_group_seq` encrypted | Plain IDs never in form or URL | High |
