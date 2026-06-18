# Coop Dealer Dashboard — Migration Mapping

## Overview

**Status**: Pending Full Verification

**Summary**: The Coop Dealer Dashboard feature has been migrated from ConnectedPlatformWorkspace to PlatformToAPIWorkspace with the same file structure and naming. However, comprehensive functional verification is required to confirm:
1. Service layer changes (direct injection vs. API calls)
2. Session management approach (server session vs. distributed cache/claims)
3. Encryption/decryption mechanism updates
4. Authorization middleware changes
5. Client-side library updates (DataTables, AJAX patterns)

Initial assessment indicates the feature structure is present but implementation equivalence has not been verified.

## File-Level Mapping

| Legacy File | Modern Equivalent | Status |
|---|---|---|
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml | PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml | Structure Present - Logic Unverified |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml.cs | PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml.cs | Structure Present - Logic Unverified |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml | PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml | Structure Present - Logic Unverified |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml.cs | PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml.cs | Structure Present - Logic Unverified |

## Functional Unit Mapping

### UI Behaviors

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-001 | Index.cshtml.cs:OnGet() - Role check with Session-based redirect | Unknown - Requires source verification | Unverified |
| COOP-FU-DD-002 | Index.cshtml:LoadFiscalYears() using Helper class | Unknown - May use different helper or API | Unverified |
| COOP-FU-DD-003 | Index.cshtml - Razor form with fiscal year dropdown + dealer input | Unknown - May use different component model | Unverified |
| COOP-FU-DD-004 | AdminIndex.cshtml - Multi-field Razor form | Unknown - May use different component model | Unverified |
| COOP-FU-DD-005 | Index.cshtml:AgencyDealerTable - DataTables.js initialization | Unknown - May use different table library | Unverified |
| COOP-FU-DD-006 | AdminIndex.cshtml.cs:LoadCountries() via IAddressService | Unknown - May use API endpoint instead | Unverified |
| COOP-FU-DD-007 | AdminIndex.cshtml:OnCountryChange() jQuery AJAX to IReportService | Unknown - May use different AJAX or component pattern | Unverified |
| COOP-FU-DD-008 | AdminIndex.cshtml:ResultsTable - Razor table with pagination | Unknown - May use different rendering approach | Unverified |
| COOP-FU-DD-009 | Index.cshtml:$(document).ready() DataTables initialization | Unknown - May use different JS framework | Unverified |
| COOP-FU-DD-010 | AdminIndex.cshtml:PaginationControls - Razor partial or helper | Unknown - May use different pagination component | Unverified |

### Data Entry

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-011 | Index.cshtml.cs:ValidateDealerNumber() - ModelState validation + Regex | Unknown - May use FluentValidation or DataAnnotations | Unverified |
| COOP-FU-DD-012 | Index.cshtml:FiscalYearDropdown - asp-items binding | Unknown - Component binding may differ | Unverified |
| COOP-FU-DD-013 | AdminIndex.cshtml:txtDealerName - Standard text input | Unknown - Component may differ | Unverified |
| COOP-FU-DD-014 | AdminIndex.cshtml:txtCity - Standard text input | Unknown - Component may differ | Unverified |
| COOP-FU-DD-015 | AdminIndex.cshtml:ddlState - Cascading dropdown with AJAX | Unknown - May use different cascading mechanism | Unverified |
| COOP-FU-DD-016 | AdminIndex.cshtml:ddlCountry - Standard dropdown | Unknown - Component may differ | Unverified |
| COOP-FU-DD-017 | AdminIndex.cshtml:PageSizeDropdown - Standard dropdown | Unknown - Component may differ | Unverified |
| COOP-FU-DD-018 | Index.cshtml.cs:OnPostSearch() - Form POST handler | Unknown - May use different binding approach | Unverified |

### Business Logic

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-019 | Index.cshtml.cs:OnPostSearch() calling IDealerService.SearchDealers | Unknown - Service may be replaced with API call | Unverified |
| COOP-FU-DD-020 | Index.cshtml.cs:ValidateDealerAccess() - Session-based dealer number comparison | Unknown - Authorization approach may differ | Unverified |
| COOP-FU-DD-021 | Index.cshtml.cs:ValidateAgencyAccess() calling IMediaOnlineService.CheckDealerMediaAgency | Unknown - Service may be replaced with API call | Unverified |
| COOP-FU-DD-022 | AdminIndex.cshtml.cs:OnPostSearch() calling IDealerService.SearchDealerswithPaging | Unknown - Service may be replaced with API call | Unverified |
| COOP-FU-DD-023 | Index.cshtml.cs:ProcessSearchResults() - Count check + RedirectToPage | Unknown - Redirect logic may differ | Unverified |
| COOP-FU-DD-024 | Index.cshtml.cs:SetCorporateContext() - Business rule checking dealer properties | Unknown - Business logic location may differ | Unverified |
| COOP-FU-DD-025 | AdminIndex.cshtml.cs:CalculatePagination() - Manual page calculation | Unknown - May use pagination library | Unverified |
| COOP-FU-DD-026 | Index.cshtml.cs:LoadAgencyDealers() calling IMediaOnlineService.GetUserAgencyDealers | Unknown - Service may be replaced with API call | Unverified |
| COOP-FU-DD-027 | AdminIndex.cshtml.cs:OnGetStates() calling IReportService.GetStates | Unknown - Service may be replaced with API call | Unverified |
| COOP-FU-DD-028 | AdminIndex.cshtml.cs:OnPostExportExcel() - Excel generation library (EPPlus/ClosedXML) | Unknown - Excel library may differ | Unverified |

### Workflow

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-029 | Index.cshtml.cs:OnPostSearch() orchestrating validation → auth → search → process | Unknown - Orchestration pattern may differ | Unverified |
| COOP-FU-DD-030 | Index.cshtml.cs:OnPostSearch() - ModelState.IsValid check + validation logic | Unknown - Validation approach may differ | Unverified |
| COOP-FU-DD-031 | Index.cshtml.cs:ProcessSearchResults() - If count==1: RedirectToPage("Detail") | Unknown - Navigation pattern may differ | Unverified |
| COOP-FU-DD-032 | AdminIndex.cshtml.cs:OnPostSearch() - If count>1: populate Model.Results | Unknown - Results handling may differ | Unverified |
| COOP-FU-DD-033 | Index.cshtml.cs:OnGet() - User.IsInRole() check + RedirectToPage("AdminIndex") | Unknown - Role-based routing may use middleware/filter | Unverified |
| COOP-FU-DD-034 | Index.cshtml.cs:SetDealerContext() - Setting 14+ Session[key] = value pairs | Unknown - State management may use distributed cache or claims | Unverified |
| COOP-FU-DD-035 | Index.cshtml.cs:BuildDetailUrl() using IEncryptDecrypt.Encrypt() | Unknown - Encryption service may differ | Unverified |
| COOP-FU-DD-036 | Index.cshtml.cs:OnGet() - Session["ReturnUrl"] = Request.Path | Unknown - Navigation context may differ | Unverified |

### Data Persistence

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-037 | Index.cshtml.cs:SetDealerContext() - HttpContext.Session.SetString/SetInt32 for 14+ keys | Unknown - May use IDistributedCache, claims, or different session approach | Unverified |
| COOP-FU-DD-038 | Index.cshtml.cs:OnPostSearch() - Session["FiscalYear"] = selectedYear | Unknown - State management approach may differ | Unverified |
| COOP-FU-DD-039 | Index.cshtml.cs:OnGet() - Session["ReturnUrl"] = Request.Path.Value | Unknown - Navigation state approach may differ | Unverified |
| COOP-FU-DD-040 | Index.cshtml.cs:ClearDealerContext() - Loop through session keys and remove | Unknown - State clearing approach may differ | Unverified |

### Security

| FU ID | Legacy Implementation | Modern Implementation | Equivalence |
|---|---|---|---|
| COOP-FU-DD-041 | Index.cshtml.cs:OnGet() - User.IsInRole("Admin") check + RedirectToPage | Unknown - Authorization may use [Authorize] attribute or policy-based | Unverified |
| COOP-FU-DD-042 | Index.cshtml.cs:ValidateDealerAccess() - Session["DealerNumber"] comparison | Unknown - Authorization approach may differ (claims-based, policy-based) | Unverified |
| COOP-FU-DD-043 | Index.cshtml.cs:ValidateAgencyAccess() - IMediaOnlineService.CheckDealerMediaAgency call | Unknown - Authorization service may be different | Unverified |
| COOP-FU-DD-044 | Index.cshtml.cs:BuildDetailUrl() - IEncryptDecrypt.Encrypt(dealer_number_seq) | Unknown - Encryption mechanism may differ (Data Protection API, custom service) | Unverified |
| COOP-FU-DD-045 | Index.cshtml:@Html.AntiForgeryToken() + [ValidateAntiForgeryToken] attribute | Unknown - CSRF protection likely similar but implementation may differ | Unverified |
| COOP-FU-DD-046 | Index.cshtml.cs:OnGet() - IUserService.GetCrcUserByExternalUserName(User.Identity.Name) | Unknown - User identity verification approach may differ | Unverified |

## Behavioral Differences

**Note**: The following are anticipated differences based on architectural migration patterns. Actual differences require source code comparison.

### Anticipated Architectural Changes:

1. **Service Layer → API Layer**:
   - Legacy: Direct injection of IDealerService, IMediaOnlineService, IUserService, IAddressService, IReportService
   - Modern (Expected): HTTP API calls to separate service layer with DTOs
   - Impact: Error handling, timeouts, retry logic, performance characteristics may differ

2. **Session Management → Distributed State**:
   - Legacy: In-process HttpContext.Session with 14+ keys
   - Modern (Expected): IDistributedCache (Redis/SQL) or claims-based state
   - Impact: Session expiration, scalability, cross-instance state sharing behavior may differ

3. **Encryption Service**:
   - Legacy: IEncryptDecrypt custom service
   - Modern (Expected): ASP.NET Core Data Protection API or different encryption library
   - Impact: Encrypted parameter format, key management approach may differ

4. **Authorization Pattern**:
   - Legacy: Imperative checks in OnGet/OnPost methods (User.IsInRole, custom validation)
   - Modern (Expected): Policy-based authorization with [Authorize] attributes and custom handlers
   - Impact: Authorization failure handling, redirect behavior may differ

5. **Client-Side Framework**:
   - Legacy: jQuery + DataTables.js + manual AJAX
   - Modern (Expected): May use modern JS framework (React, Vue) or Blazor components
   - Impact: UI interactivity, state management, cascading dropdown behavior may differ

### Validation Differences to Investigate:

1. **Dealer Number Validation**:
   - Verify regex pattern unchanged
   - Confirm 15-character limit preserved
   - Check error message consistency

2. **Single-Result Auto-Redirect**:
   - Confirm count==1 check still triggers immediate redirect
   - Verify same encrypted parameters passed
   - Check redirect destination unchanged

3. **Agency Dealer List Loading**:
   - Confirm agency users still see dealer list on initial load
   - Verify DataTable features (sort, filter, pagination) preserved
   - Check performance with large dealer lists

4. **Country-State Cascading**:
   - Verify AJAX call triggers on country selection
   - Confirm state dropdown updates correctly
   - Check for race conditions or performance issues

5. **Excel Export**:
   - Verify same columns exported
   - Confirm file format (XLSX vs XLS)
   - Check for memory issues with large result sets

## Missing Functionality

**Status**: Cannot determine without source code comparison

**Potential Missing Elements** (require verification):

1. **Session-Based Features**:
   - If modern implementation doesn't use server session, verify all 14+ session keys have alternative storage
   - Confirm dealer context properly maintained across pages
   - Check return URL breadcrumb navigation still functions

2. **Service Dependencies**:
   - Verify all service methods have API equivalents:
     - IDealerService.SearchDealers → API endpoint?
     - IDealerService.SearchDealerswithPaging → API endpoint?
     - IMediaOnlineService.CheckDealerMediaAgency → API endpoint?
     - IMediaOnlineService.GetUserAgencyDealers → API endpoint?
     - IUserService.GetCrcUserByExternalUserName → Claims or API?
     - IAddressService.GetCountryByProgramSeq → API endpoint?
     - IReportService.GetStates → API endpoint?

3. **Authorization Checks**:
   - Dealer-can-only-access-own-number check
   - Agency-can-only-access-associated-dealers check
   - Corporate dealer context determination
   - All may be missing if not migrated to modern auth pattern

4. **DataTable Features**:
   - Agency dealer list may be rendered as plain table without sort/filter/pagination
   - Requires verification of JavaScript initialization

5. **Parameter Encryption**:
   - Encrypted dealer_number_seq passing may be missing
   - Could expose tampering vulnerability if not migrated

## Next Steps for Verification

1. **Read Modern Source Files**:
   - PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml.cs
   - PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml.cs

2. **Compare Service Signatures**:
   - Check if IDealerService, IMediaOnlineService, etc. still exist
   - Identify API endpoints replacing direct service calls
   - Document DTO changes

3. **Verify Authorization**:
   - Identify [Authorize] attributes or policy handlers
   - Confirm dealer number authorization preserved
   - Verify agency-dealer relationship checks

4. **Test State Management**:
   - Identify session/cache/claims usage
   - Verify all 14+ session keys have equivalents
   - Test cross-page context preservation

5. **Run Functional Tests**:
   - Execute smoke tests for each functional unit
   - Verify single-result auto-redirect
   - Test agency dealer list rendering
   - Validate cascading dropdown behavior
   - Test Excel export functionality

6. **Security Testing**:
   - Attempt unauthorized dealer access
   - Test parameter tampering
   - Verify CSRF protection
   - Check role-based routing

## Summary

**Current Assessment**: Migration structure present, functional equivalence unverified

**Confidence Level**: Low (requires full source code comparison)

**Recommended Action**: Execute Step 3 (Modern Implementation Verification) before proceeding with test generation

**Risk Areas**:
- Authorization checks (6 critical security FUs)
- Session state management (4 high-risk data persistence FUs)
- Service layer changes (7 high-risk business logic FUs)
- Single-result auto-redirect (1 high-risk workflow FU)
- Parameter encryption (1 critical security FU)

**Total Unverified**: 46/46 functional units require verification
