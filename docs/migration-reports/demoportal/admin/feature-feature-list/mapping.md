# Migration Mapping - Admin / Feature List

**Generated:** 2026-06-19  
**Legacy Path:** `Presentation\Web\Pages\Admin\Feature\`  
**Modern Path:** `Presentation\Web\Pages\Admin\Feature\`

---

## Handler-by-Handler Mapping

### FeatureList Page

| Legacy Handler | Modern Handler | Migration Type | Notes |
|---|---|---|---|
| `OnGet` (sync) | `OnGet` (async) | **Async** | Same logic, awaits `FeatureGetAsync()` |
| `GetAllProgramFeatures()` | `GetAllProgramFeaturesAsync()` | **Async + API** | Legacy: `_programService.GetFeatureList/GetDefaultFeature`; Modern: `_featureApiService.GetFeatureModulesAsync/GetFeatureConfigurationsAsync` |
| `OnGetFeatureProgram` | `OnGetFeatureProgram` (async) | **Async + API** | Same response shape |
| `OnGetFeatureCounts` | `OnGetFeatureCounts` (async) | **Async + API** | Response shape identical |
| `OnGetExportFeatureFlags` | `OnGetExportFeatureFlags` (async) | **Async** | Excel generation identical |
| `OnPostImportFeatureFlags` | `OnPostImportFeatureFlags` (async) | **Async + API** | Toggle via `_featureApiService.ToggleFeatureAsync` + `UpdateUserGroupAsync` |
| `OnPostProgramFeatureActiveFlag` | `OnPostProgramFeatureActiveFlag` (async) | **Async + API** | `_programService.UpdateActiveFlag` -> `_featureApiService.ToggleFeatureAsync` |
| `OnGetUserList` | `OnGetUserList` (sync) | **Same** | Still uses `_programService.GetUserList` |
| `OnGetAllUserGroupListDetail` | `OnGetAllUserGroupListDetail` (async) | **Async + API** | `IUserLoginService` + `IDivisionService` -> `INotificationApiService`; result shape same |
| `OnPostUserGroup` | `OnPostUserGroup` (async) | **Async + API** | `_programService.UpdateUserGroup` -> `_featureApiService.UpdateUserGroupAsync` |
| `OnPostSaveFeatureScope` | `OnPostSaveFeatureScope` (async) | **Async + API** | Same |
| `OnGetDivisionList` | `OnGetDivisionList` (async) | **Async + API** | `_divisionService` -> `_commonSupportService` |
| `OnGetCountryList` | `OnGetCountryList` (async) | **Async + API** | `_addressService` -> `_commonSupportService` |
| `OnPostValidateUserPin` | `OnPostValidateUserPin` (sync) | **Same** | Still uses `_user.GetCrcUserById`; identical logic |
| `OnPostResetValidPin` | `OnPostResetValidPin` (sync) | **Same** | Identical |
| `OnPostAddFeature` | `OnPostAddFeature` (async) | **Async + API** | `_programService.InsertFeature` -> `_featureApiService.InsertFeatureAsync`; validation logic same |
| `OnPostEditDescription` | `OnPostEditDescription` (async) | **Async + API** | `_programService.UpdateFeatureFlagDescription` -> `_featureApiService.UpdateFeatureFlagDescriptionAsync` |

### ModuleList Page

| Aspect | Legacy | Modern | Delta |
|--------|--------|--------|-------|
| All handlers | Sync | Sync | **No change** - code is identical |

---

## UI Comparison

| Aspect | Legacy | Modern | Delta |
|--------|--------|--------|-------|
| FeatureList.cshtml | ✅ | ✅ | **Identical** - no markup changes |
| ModuleList.cshtml | ✅ | ✅ | **Identical** - no markup changes |
| Feature.js | ✅ | N/A | Modern uses same JS file from shared wwwroot |

---

## Key Structural Differences

| Dimension | Legacy | Modern |
|-----------|--------|--------|
| Data access | Direct DB via `IProgramService` | REST API via `IFeatureApiService` |
| User/Roles | `IUserLoginService` + `IDivisionService` + `IAddressService` | `INotificationApiService` + `ICommonSupportService` |
| Async model | Sync (most handlers) | Fully async |
| Response contract | Same JSON shapes (`status`, `data`) | Same JSON shapes |
| Validation rules | Identical | Identical |
| PIN validation | Identical | Identical |

---

## Risk Areas

| Area | Risk | Detail |
|------|------|--------|
| API error handling | Medium | Modern API failures may produce different error messages vs direct DB exceptions |
| `OnGetUserList` | Low | Intentionally still uses `_programService` in modern (not yet migrated to API) |
| Excel import | Low | Identical logic; only toggle and user group calls go through API |
