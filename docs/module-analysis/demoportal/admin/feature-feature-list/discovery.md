# Discovery - Admin / Feature List

**Generated:** 2026-06-19  
**Module:** admin  
**Feature:** feature-list  
**URL:** `/Admin/Feature/FeatureList` . `/Admin/Feature/ModuleList`

---

## Source Files Analyzed

### Legacy
| File | Path |
|------|------|
| FeatureList.cshtml | `Presentation\Web\Pages\Admin\Feature\FeatureList.cshtml` |
| FeatureList.cshtml.cs | `Presentation\Web\Pages\Admin\Feature\FeatureList.cshtml.cs` |
| ModuleList.cshtml | `Presentation\Web\Pages\Admin\Feature\ModuleList.cshtml` |
| ModuleList.cshtml.cs | `Presentation\Web\Pages\Admin\Feature\ModuleList.cshtml.cs` |
| Feature.js | `Presentation\Web\wwwroot\WebScripts\Admin\Feature\Feature.js` |

### Modern
| File | Path |
|------|------|
| FeatureList.cshtml | `Presentation\Web\Pages\Admin\Feature\FeatureList.cshtml` |
| FeatureList.cshtml.cs | `Presentation\Web\Pages\Admin\Feature\FeatureList.cshtml.cs` |
| ModuleList.cshtml | `Presentation\Web\Pages\Admin\Feature\ModuleList.cshtml` |
| ModuleList.cshtml.cs | `Presentation\Web\Pages\Admin\Feature\ModuleList.cshtml.cs` |

---

## Page Handlers Summary

### FeatureList - Legacy
| Handler | Method | Description |
|---------|--------|-------------|
| `OnGet` | GET | Load feature list grouped by modules |
| `OnGetFeatureProgram(moduleValue)` | GET | Load features for a selected module tab |
| `OnGetFeatureCounts(searchText, statusFilter)` | GET | Per-module feature count for tab badges |
| `OnGetUserList(masterConfigId)` | GET | Get user role list for a feature |
| `OnGetAllUserGroupListDetail()` | GET | Get all roles + dealer types + divisions + countries |
| `OnGetDivisionList()` | GET | Division list for scope modal |
| `OnGetCountryList()` | GET | Country list for scope modal |
| `OnGetExportFeatureFlags()` | GET | Export all feature flags to Excel |
| `OnPostProgramFeatureActiveFlag(programDataId, isChecked, masterConfigId)` | POST | Toggle feature on/off |
| `OnPostUserGroup(selectedValues, program_data_seq, divisionSeqs, programCountrySeqs)` | POST | Update user group / role for a feature |
| `OnPostSaveFeatureScope(programDataSeq, userRoles, divisionSeqs, programCountrySeqs)` | POST | Save division/country scope for a feature |
| `OnPostValidateUserPin(pin)` | POST | Validate admin security PIN for edit mode |
| `OnPostResetValidPin()` | POST | Reset PIN state when edit mode disabled |
| `OnPostAddFeature(module, feature, featureKey, activeFlag, description, propertyName)` | POST | Add a new feature flag |
| `OnPostImportFeatureFlags(importFile)` | POST | Bulk import/update feature flags from Excel |
| `OnPostEditDescription(MasterConfigurationSeq, description)` | POST | Update a feature's description |

### FeatureList - Modern (Delta from Legacy)
| Change | Detail |
|--------|--------|
| All handlers are `async Task<IActionResult>` | Async/await throughout |
| Data source | Direct DB via `IProgramService` -> API via `IFeatureApiService` |
| User groups | `IUserLoginService` + `IDivisionService` + `IAddressService` -> `INotificationApiService` + `ICommonSupportService` |
| `IUserLoginService` removed | Not injected in modern constructor |

### ModuleList (Legacy = Modern - identical code)
| Handler | Method | Description |
|---------|--------|-------------|
| `OnGet` | GET | Load paginated module list |
| `OnPost` | POST | Redirect with search filters |
| `OnPostUpdateModuleStatusAsync` | POST | Toggle module active/inactive |

---

## Bound Properties

### FeatureList
| Property | Type | Notes |
|----------|------|-------|
| `ProgramFeatureList` | `List<ProgramFeature>` | Module tab list |
| `DefaultProgramFeatureList` | `List<ProgramFeature>` | Features for active tab |
| `UserGroupList` | `Dictionary<string,string>` | Controls tab visibility |
| `IsAutoPlay` | `bool` | Edit mode toggle |
| `SelectedValues` | `string[]` | User group checkboxes |

### ModuleList
| Property | Type | Notes |
|----------|------|-------|
| `UserModule` | `List<UserModule>` | Paginated module rows |
| `module_name` | `string` | Filter field |
| `status` | `string` | Filter field (Y/N/"") |

---

## Client-Side Behaviors (Feature.js)

| Behavior | Trigger | Action |
|----------|---------|--------|
| Module tab switch | `.tabModule` click | Calls `FeatureProgramGet(module)`, updates URL param |
| Feature search | `#SearchFeature` input | Debounced client-side filter + tab count refresh |
| Status filter | `#StatusFilter` change | Client-side filter + tab count refresh |
| Tab count badges | On load and on filter | `GET /FeatureList/FeatureCounts?searchText=&statusFilter=` |
| Feature toggle | Checkbox change on row | `POST /FeatureList/ProgramFeatureActiveFlag` via PIN gate |
| Edit mode enable | `#spnAutoPlay` toggle ON | Shows action/status columns, `POST /FeatureList/ValidateUserPin` |
| Edit mode disable | `#spnAutoPlay` toggle OFF | Hides columns, `POST /FeatureList/ResetValidPin` |
| User Role click | Row icon | Opens `#exampleModal`, loads roles/divisions/countries |
| Save user group | `#btnSubmit` in modal | `POST /FeatureList/UserGroup` |
| Scope modal | Row icon | Opens `#scopeModal`, loads divisions/countries |
| Save scope | `saveScopeModal()` | `POST /FeatureList/SaveFeatureScope` |
| Description edit | Row edit icon | Opens `#DescriptionModal` |
| Save description | `#DescriptionBtnSubmit` | `POST /FeatureList/EditDescription` |
| Download Excel | `#btnDownloadFeatureFlags` | `GET /FeatureList/ExportFeatureFlags` |
| Upload Excel | `#btnUploadFeatureFlags` -> `#FeatureFlagImportFile` | `POST /FeatureList/ImportFeatureFlags` |
| Add feature | `#btnAddFeature` | Opens `#AddFeatureModal` |
| Save new feature | `#afSubmitBtn` | `POST /FeatureList/AddFeature` with validation |
