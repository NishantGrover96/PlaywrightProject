# Gap Analysis — Admin / Feature List

**Generated:** 2026-06-19  
**Legacy:** `DemoPortalV2_Dev_branch\Presentation\Web\Pages\Admin\Feature\`  
**Modern:** `DemoPortalV2\Presentation\Web\Pages\Admin\Feature\`

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 0 |
| 🟡 Medium | 3 |
| 🟢 Low | 2 |

---

## Gap Details

### 🟡 Medium Gaps

#### GAP-M01 — Data Layer Migration: Direct DB → API Client
- **Dimension:** Business Rules / Data Access
- **Legacy:** `_programService.GetFeatureList`, `GetDefaultFeature`, `InsertFeature`, `UpdateActiveFlag`, `UpdateFeatureFlagDescription`, `UpdateUserGroup` — all direct synchronous DB calls
- **Modern:** `_featureApiService.GetFeatureModulesAsync`, `GetFeatureConfigurationsAsync`, `ToggleFeatureAsync`, `InsertFeatureAsync`, `UpdateFeatureFlagDescriptionAsync`, `UpdateUserGroupAsync` — REST API calls
- **Risk:** API HTTP failures produce different error payloads than DB exceptions. Network timeouts on import/export not present in legacy.
- **Test Coverage Needed:** Verify API error handling returns same user-visible error messages; verify async failures surface via `_notificationService?.ErrorNotification`.

#### GAP-M02 — User Group Detail Source Change
- **Dimension:** Data Model / Role Loading
- **Legacy:** `IUserLoginService.GetCorporateTitleByProgram` + `getProgramDealerType` → combined via `_webHelper.UserList(ds)`
- **Modern:** `INotificationApiService.GetCorporateTitlesByProgramAsync` + `GetProgramDealerTypesAsync` → combined as `Dictionary<string,string>`
- **Risk:** If the API returns different keys or descriptions, the role checkboxes in the User Group modal will show different labels.
- **Test Coverage Needed:** Compare User Group modal role list between legacy and modern; verify "All" option always present.

#### GAP-M03 — Division/Country Source Change
- **Dimension:** Data Model / Scope Loading
- **Legacy:** `IDivisionService.GetDivisionByProgramSeq` + `IAddressService.GetCountryByProgramSeq`
- **Modern:** `ICommonSupportService.GetDivisionListByProgramAsync` + `GetCountryByProgramSeqAsync`
- **Risk:** Model shape differences (`division_seq`/`name` vs `DivisionSeq`/`Name`) handled by projection but API source may return subset.
- **Test Coverage Needed:** Verify scope modal Division and Country checkboxes load correctly in modern.

---

### 🟢 Low Gaps

#### GAP-L01 — `OnGetUserList` Not Yet Migrated to API
- **Dimension:** Data Access
- **Legacy:** `_programService.GetUserList(masterConfigId)`
- **Modern:** Same — `_programService.GetUserList(masterConfigId)` (intentionally not migrated)
- **Risk:** Low — behavior identical; only a tracking note that this handler was not moved to API.
- **Test Coverage Needed:** None additional — behavior is same.

#### GAP-L02 — Null-safe Notification Service in Modern
- **Dimension:** Error Handling
- **Legacy:** `_notificationService.ErrorNotification(...)` (may throw if null)
- **Modern:** `_notificationService?.ErrorNotification(...)` (null-safe)
- **Risk:** Low — silently swallows notification if service not registered; unlikely in production.
- **Test Coverage Needed:** Verify error toast appears on simulated API failure.

---

## Coverage by Dimension

| Dimension | Legacy FUs Analyzed | Modern FUs Analyzed | Coverage |
|-----------|--------------------|--------------------|----------|
| UI / Page Structure | ✅ Complete | ✅ Identical | 100% |
| Feature Toggle (On/Off) | ✅ Complete | ✅ Via API | 100% |
| Edit Mode / PIN Gate | ✅ Complete | ✅ Identical | 100% |
| User Group / Role | ✅ Complete | ⚠️ API source change | 90% |
| Scope (Division/Country) | ✅ Complete | ⚠️ API source change | 90% |
| Description Edit | ✅ Complete | ✅ Via API | 100% |
| Add Feature | ✅ Complete | ✅ Via API | 100% |
| Excel Export | ✅ Complete | ✅ Via API | 100% |
| Excel Import | ✅ Complete | ✅ Via API | 100% |
| Module List | ✅ Complete | ✅ Identical | 100% |
| Search / Filter | ✅ Complete | ✅ Identical | 100% |
| Validation | ✅ Complete | ✅ Identical | 100% |

---

## Overall Functional Coverage Estimate: **96%**
