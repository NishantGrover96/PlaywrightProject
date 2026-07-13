# Coop Dealer Dashboard - Discovery Report

## Feature Summary

The Coop Dealer Dashboard provides role-based dealer search and navigation functionality with two distinct views: a simplified dealer/agency view (Index) for searching dealers by number within a fiscal year, and an advanced admin view (AdminIndex) with multi-field search, pagination, and Excel export capabilities. The feature enforces authorization rules ensuring dealers can only access their own data, agencies can only access dealers they work with, and admins have unrestricted search access. Single-result searches automatically redirect to the dealer detail page.

## Legacy Source Files

| File | Purpose |
|---|---|
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml | Dealer/Agency view - simple search form with fiscal year dropdown and dealer number input |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml.cs | Dealer/Agency view page model - handles role-based routing, dealer search, and agency dealer list retrieval |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml | Admin view - advanced search form with multiple filters (dealer #, name, city, state, country) and results table |
| ConnectedPlatformWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml.cs | Admin view page model - handles multi-field search with pagination and Excel export |

## Modern Source Files

| File | Purpose |
|---|---|
| PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml | Modern equivalent of dealer/agency view |
| PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\Index.cshtml.cs | Modern equivalent of dealer/agency page model |
| PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml | Modern equivalent of admin view |
| PlatformToAPIWorkspace\DemoPortalV2\Presentation\Web\Pages\CoopManagement\Dealer\AdminIndex.cshtml.cs | Modern equivalent of admin page model |

## UI Components (Legacy)

### Index (Dealer/Agency View)

**Form Fields:**
- Fiscal Year Dropdown (ddlFiscalYear) - populated from helper, defaults to current year
- Dealer Number Input (txtDealerNumber) - required, max 15 characters, text input

**Buttons:**
- Search Button (btnSearch) - triggers dealer search

**Tables/Lists:**
- Agency Dealer List Table (conditional display) - DataTable-enabled, shows all dealers associated with logged-in agency user
  - Columns: Dealer Number, Dealer Name, Action (link to detail)

**Conditional Elements:**
- Agency dealer list section - only displayed for users with agency role and associated dealers
- Role-based redirect logic (admin users redirected to AdminIndex on page load)

### AdminIndex (Admin View)

**Form Fields:**
- Fiscal Year Dropdown - populated from helper
- Dealer Number Input (txtDealerNumber) - max 15 characters
- Dealer Name Input (txtDealerName) - text input
- City Input (txtCity) - text input
- State Dropdown (ddlState) - cascading, depends on Country selection
- Country Dropdown (ddlCountry) - populated from IReportService
- Page Size Dropdown - controls results per page

**Buttons:**
- Search Button - triggers multi-field search
- Export to Excel Button - generates Excel report of search results

**Tables/Lists:**
- Search Results Table - paginated display of dealer search results
  - Columns: Dealer Number, Dealer Name, City, State, Country, Action (link to detail)
  - Pagination controls (first, previous, next, last, page numbers)

**AJAX Components:**
- Country-State cascading dropdown (state dropdown populated based on country selection)

## Services & Dependencies

| Service Interface | Methods Used | Purpose |
|---|---|---|
| IDealerService | SearchDealers | Retrieve dealers matching search criteria (simple search) |
| IDealerService | SearchDealerswithPaging | Retrieve dealers with pagination support (admin search) |
| IUserService | GetCrcUserByExternalUserName | Retrieve user information for authorization checks |
| IMediaOnlineService | CheckDealerMediaAgency | Verify if dealer is associated with a media agency |
| IMediaOnlineService | GetUserAgencyDealers | Retrieve all dealers associated with logged-in agency user |
| IEncryptDecrypt | (Encrypt/Decrypt methods) | Encrypt dealer parameters passed to detail page |
| IAddressService | GetCountryByProgramSeq | Populate country dropdown with program-specific countries |
| IReportService | GetStates | Retrieve states for cascading dropdown (filtered by country) |
| ICommonService | (Various utility methods) | Common helper functions |
| IDivisionService | (Division lookup methods) | Retrieve division information for session context |
| IFiscalService | (Fiscal year methods) | Support fiscal year operations |

## Data Models

| Entity/DTO | Properties Used | Purpose |
|---|---|---|
| Dealer | DealerNumberSeq, DealerNumber, DealerName, City, State, Country, DealerType, Division, MediaAgency | Core dealer entity for search results and context |
| CrcUser | ExternalUserName, Roles, AssociatedDealers | User information for authorization |
| FiscalYear | Year, IsCurrent | Fiscal year dropdown population |
| Country | CountryCode, CountryName, ProgramSeq | Country dropdown population |
| State | StateCode, StateName, CountryCode | State dropdown population (cascading) |
| SearchCriteria | DealerNumber, DealerName, City, StateCode, CountryCode, FiscalYear, PageNumber, PageSize | Admin search parameters |
| PagedResult<Dealer> | Items, TotalCount, PageNumber, PageSize, TotalPages | Paginated search results |
| AgencyDealerList | DealerNumber, DealerName, DealerNumberSeq | Agency-associated dealers |

## Session State

| Session Key | Stored Value | Purpose |
|---|---|---|
| DealerNumberSeq | Dealer primary key | Unique dealer identifier for subsequent operations |
| DealerNumber | Dealer number string | Display and reference in detail pages |
| DealerType | Dealer type code | Business logic branching |
| Division | Division code | Context for division-specific operations |
| FiscalYear | Selected fiscal year | Maintain fiscal year context across pages |
| MediaAgency | Boolean flag | Indicates if dealer has media agency relationship |
| DealerName | Dealer name | Display in breadcrumbs and headers |
| City | Dealer city | Address context |
| State | Dealer state | Address context |
| Country | Dealer country | Address context |
| CorporateDealer | Boolean flag | Corporate dealer indicator for wallet access |
| ReturnUrl | Previous page URL | Breadcrumb navigation support |
| IsCorporate | Corporate user flag | Authorization context |
| AgencyNumber | Agency number (if agency user) | Agency context tracking |

## Known Gaps (Preliminary)

**Based on file structure analysis:**

1. **Service Layer Changes**: Modern workspace may have migrated to API-based services rather than direct service injection. Need to verify if IDealerService, IMediaOnlineService, etc. still exist with same signatures.

2. **Session Management**: Modern implementations may use different state management (e.g., distributed cache, authentication claims) instead of session variables.

3. **Encryption Mechanism**: IEncryptDecrypt service may have been replaced with different encryption approach in modern workspace.

4. **DataTable Library**: Client-side DataTable initialization may use different library or approach in modern implementation.

5. **AJAX Cascading Dropdowns**: Modern implementation may use different approach (e.g., Blazor components, React, or different AJAX pattern).

6. **Excel Export**: Excel generation mechanism may have changed (different library or API endpoint).

7. **Authorization Approach**: Role-based access control may use different middleware or attribute-based authorization in modern workspace.

**Functional Gaps to Investigate:**
- Verify all validation rules migrated correctly (dealer number format, required fields)
- Confirm single-result auto-redirect logic preserved
- Validate agency-dealer relationship checks still enforced
- Ensure corporate dealer context properly established
- Check if all 14+ session keys are still populated with same logic
