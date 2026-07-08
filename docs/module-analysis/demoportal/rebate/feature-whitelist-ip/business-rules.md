# Rebate Whitelist IP — Business Rule Catalog
Generated: 2026-07-07

| BR ID | Title | Category | Source (Code) | Evidence (UI) | Test Priority |
|---|---|---|---|---|---|
| BR-WL-01 | Authenticated access required | Security | `BasePageModel` session auth | Redirect to `/Account/Login` | Critical |
| BR-WL-02 | Admin / RebateAdmin role required | Security | `IsAuthorize()` role switch | Non-admin roles cannot access Whitelist IP pages | Critical |
| BR-WL-03 | SecurityListType: Y=Whitelist / N=Blacklist | Business Logic | `SecurityListType` field on model | Dropdown: Whitelist (Y) or Blacklist (N) | High |
| BR-WL-04 | IP Address is required | Validation | `[LocalizedRequired]` on `IPAddress` | Required field error on save without IP | High |
| BR-WL-05 | Security List Type is required | Validation | `[LocalizedRequired]` on `SecurityListType` | Required field error on save without type | High |
| BR-WL-06 | Comment is required; max length 500 | Validation | `[LocalizedRequired]` + `[MaxLength(500)]` | Required + maxlength validation on Comment field | High |
| BR-WL-07 | Status is required | Validation | `[LocalizedRequired]` on `Status` | Required field error on save without status | High |
| BR-WL-08 | IP readonly in edit mode | Business Logic | JS: `mode=edit` disables `#IPAddress` | IP cannot be changed after initial creation | High |
| BR-WL-09 | Duplicate IP check on CREATE only | Business Logic | `OnPostCheckIPDuplicate` — only runs when `mode=create` | Duplicate check skipped in edit mode | High |
| BR-WL-10 | IPv4 format validation (client-side JS) | Validation | JS regex on `#IPAddress` | Invalid IPv4 format shows inline error | High |
| BR-WL-11 | IPv6 format validation (client-side JS) | Validation | JS regex on `#IPAddress` | Invalid IPv6 format shows inline error | Medium |
| BR-WL-12 | Encrypted IP entry seq in edit URL | Security | `ip_entry_seq` encrypted via `IEncryptDecrypt` | Edit URL uses non-plain-integer seq value | High |
| BR-WL-13 | Export to XLSX on list page | Business Logic | `OnPostExportXlsx` handler | Export button downloads XLSX of current filtered list | Medium |
| BR-WL-14 | Search / filter by IP and list type | UI | `OnPost` search redirect with `IP` + `SecurityListType` params | List filters by entered IP and/or list type | Medium |
| BR-WL-15 | Anti-CSRF token on all POST handlers | Security | Razor Pages `__RequestVerificationToken` | Form submissions require valid token | High |
