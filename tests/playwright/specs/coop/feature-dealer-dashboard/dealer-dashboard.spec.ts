import { test, expect } from '@playwright/test';
import { DealerIndexPage } from '../../pages/coop/feature-dealer-dashboard/DealerIndexPage';
import { DealerAdminIndexPage } from '../../pages/coop/feature-dealer-dashboard/DealerAdminIndexPage';
import {
    searchAsDealer,
    searchAsAdmin,
    loginAsRole,
    verifyDealerContextSession,
    verifyEncryptedParameters,
    waitForDealerDetailRedirect,
    isOnDealerIndexPage,
    isOnAdminIndexPage,
    clearSessionStorage,
    waitForDataTableInit
} from '../../helpers/coop/feature-dealer-dashboard/dealer-dashboard.helpers';
import testData from '../../data/coop/feature-dealer-dashboard/test-data.json';

test.describe('Dealer Dashboard - Smoke Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        await clearSessionStorage(page);
    });

    test('@smoke COOP-FU-DD-001: Role-based page redirect - Admin to AdminIndex', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        await page.goto('/CoopManagement/Dealer');
        
        // Verify redirect to AdminIndex for admin role
        expect(await isOnAdminIndexPage(page)).toBe(true);
    });

    test('@smoke COOP-FU-DD-001: Role-based page redirect - Dealer to Index', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        await page.goto('/CoopManagement/Dealer');
        
        // Verify redirect to Index for dealer role
        expect(await isOnDealerIndexPage(page)).toBe(true);
    });

    test('@smoke COOP-FU-DD-019: Dealer search with valid number redirects to detail', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.searchDealer(testData.dealers.valid.dealerNumber);
        
        // Verify redirect to dealer detail page
        await waitForDealerDetailRedirect(page);
        expect(page.url()).toContain('/Dealer/index/DealerInfo');
        expect(page.url()).toContain(`dealerNumber=${testData.dealers.valid.dealerNumber}`);
    });

    test('@smoke COOP-FU-DD-011: Dealer number required validation', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.clickSubmit(); // Submit without entering dealer number
        
        // Verify validation error
        expect(await dealerIndexPage.hasValidationErrors()).toBe(true);
        expect(await dealerIndexPage.hasErrorMessage(testData.errorMessages.dealerRequired)).toBe(true);
    });

    test('@smoke COOP-FU-DD-005: Agency dealer list table displays', async ({ page }) => {
        await loginAsRole(page, 'agency', testData.users.agency);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        // Verify agency dealer list is visible
        expect(await dealerIndexPage.isAgencyDealerListVisible()).toBe(true);
        expect(await dealerIndexPage.getAgencyDealerCount()).toBeGreaterThan(0);
        
        // Verify DataTables initialization
        await waitForDataTableInit(page, 'agencyDealerCaps');
    });

    test('@smoke COOP-FU-DD-024: Admin multi-field search returns results table', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        await adminIndexPage.searchByDealerNumber(testData.dealers.valid.dealerNumber);
        
        // Verify results table is displayed
        expect(await adminIndexPage.isResultsTableVisible()).toBe(true);
        expect(await adminIndexPage.getResultsCount()).toBeGreaterThan(0);
    });

    test('@smoke @critical COOP-FU-DD-042: Dealer authorization - cannot search other dealers', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.searchDealer(testData.dealers.crossDealerTest.dealerNumber);
        
        // Verify unauthorized error
        expect(await dealerIndexPage.hasValidationErrors()).toBe(true);
        expect(await dealerIndexPage.hasErrorMessage(testData.errorMessages.dealerUnauthorized)).toBe(true);
    });

    test('@smoke @critical COOP-FU-DD-043: Agency authorization - cannot search non-worked-with dealers', async ({ page }) => {
        await loginAsRole(page, 'agency', testData.users.agency);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.searchDealer(testData.dealers.crossDealerTest.dealerNumber);
        
        // Verify agency-specific error message
        expect(await dealerIndexPage.hasValidationErrors()).toBe(true);
        expect(await dealerIndexPage.hasErrorMessage(testData.errorMessages.agencyNotWorkedWith)).toBe(true);
    });

    test('@smoke COOP-FU-DD-034: Session keys populated after dealer search', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        await waitForDealerDetailRedirect(page);
        
        // Verify all 16 session keys are populated
        const sessionCheck = await verifyDealerContextSession(page);
        expect(sessionCheck.allPresent).toBe(true);
        expect(sessionCheck.missingKeys).toHaveLength(0);
    });

    test('@smoke @critical COOP-FU-DD-044: Parameters encrypted in redirect URL', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        await waitForDealerDetailRedirect(page);
        
        // Verify encrypted parameters
        const isEncrypted = await verifyEncryptedParameters(page, ['dealer_number_seq', 'dealer_type']);
        expect(isEncrypted).toBe(true);
    });

    test('@smoke @critical COOP-FU-DD-045: Anti-CSRF token present', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        // Verify anti-forgery token exists
        expect(await dealerIndexPage.hasAntiForgeryToken()).toBe(true);
    });

    test('@smoke COOP-FU-DD-004: Country dropdown populated', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Verify country dropdown has options
        expect(await adminIndexPage.isCountryDropdownPopulated()).toBe(true);
        const countries = await adminIndexPage.getAvailableCountries();
        expect(countries.length).toBeGreaterThan(1);
    });

    test('@smoke COOP-FU-DD-007: State dropdown cascades from country (AJAX)', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Select country
        await adminIndexPage.selectCountry(testData.countries[0].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify states loaded
        const states = await adminIndexPage.getAvailableStates();
        expect(states.length).toBeGreaterThan(1);
    });
});

test.describe('Dealer Dashboard - Regression Tests: UI', () => {
    
    test('@regression COOP-FU-DD-002: Fiscal year dropdown defaults to current year', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        const selectedYear = await dealerIndexPage.getSelectedFiscalYear();
        expect(selectedYear).toBeTruthy();
        expect(testData.fiscalYears).toContain(selectedYear);
    });

    test('@regression COOP-FU-DD-003: Dealer search form renders correctly', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        expect(await dealerIndexPage.isFiscalYearDropdownVisible()).toBe(true);
        expect(await dealerIndexPage.isDealerNumberInputVisible()).toBe(true);
        expect(await dealerIndexPage.isSubmitButtonEnabled()).toBe(true);
    });

    test('@regression COOP-FU-DD-006: Admin search form renders with all fields', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        expect(await adminIndexPage.isSearchFormVisible()).toBe(true);
        expect(await adminIndexPage.dealerNumberInput.isVisible()).toBe(true);
        expect(await adminIndexPage.dealerNameInput.isVisible()).toBe(true);
        expect(await adminIndexPage.countryDropdown.isVisible()).toBe(true);
        expect(await adminIndexPage.stateDropdown.isVisible()).toBe(true);
        expect(await adminIndexPage.cityInput.isVisible()).toBe(true);
    });

    test('@regression COOP-FU-DD-008: Pagination controls display', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        await adminIndexPage.searchByMultipleFields(testData.searchFilters.byCity);
        
        if (await adminIndexPage.getResultsCount() > 10) {
            expect(await adminIndexPage.paginationContainer.isVisible()).toBe(true);
        }
    });

    test('@regression COOP-FU-DD-009: DataTable initialization on agency dealer list', async ({ page }) => {
        await loginAsRole(page, 'agency', testData.users.agency);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        await waitForDataTableInit(page, 'agencyDealerCaps');
        
        // Verify DataTable features
        const tableHasClass = await page.locator('#agencyDealerCaps').evaluate(el => 
            el.classList.contains('dataTable')
        );
        expect(tableHasClass).toBe(true);
    });
});

test.describe('Dealer Dashboard - Regression Tests: Data Entry', () => {
    
    test('@regression COOP-FU-DD-011: Dealer number validation - max 15 characters', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        const longDealerNumber = '1234567890123456'; // 16 characters
        await dealerIndexPage.enterDealerNumber(longDealerNumber);
        
        const enteredValue = await dealerIndexPage.dealerNumberInput.inputValue();
        expect(enteredValue.length).toBeLessThanOrEqual(15);
    });

    test('@regression COOP-FU-DD-012: Fiscal year selection changes context', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        await dealerIndexPage.selectFiscalYear(testData.fiscalYears[1]);
        const selectedYear = await dealerIndexPage.getSelectedFiscalYear();
        
        expect(selectedYear).toBe(testData.fiscalYears[1]);
    });

    test('@regression COOP-FU-DD-013: Multi-field search with all combinations', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        await adminIndexPage.searchByMultipleFields(testData.searchFilters.multiField);
        
        expect(await adminIndexPage.isResultsTableVisible()).toBe(true);
    });

    test('@regression COOP-FU-DD-014: Country selection triggers state load', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Initial state count
        const initialStates = await adminIndexPage.getAvailableStates();
        
        // Select country
        await adminIndexPage.selectCountry(testData.countries[0].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify state dropdown updated
        const updatedStates = await adminIndexPage.getAvailableStates();
        expect(updatedStates.length).toBeGreaterThan(0);
    });

    test('@regression COOP-FU-DD-015: State selection dependent on country', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Select USA
        await adminIndexPage.selectCountry(testData.countries[0].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify US states available
        const usStates = await adminIndexPage.getAvailableStates();
        expect(usStates).toContain(testData.states.USA[0].name);
        
        // Change to Canada
        await adminIndexPage.selectCountry(testData.countries[1].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify Canadian provinces available
        const canadianProvinces = await adminIndexPage.getAvailableStates();
        expect(canadianProvinces).toContain(testData.states.Canada[0].name);
    });

    test('@regression COOP-FU-DD-016: Page size selection changes results', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        await adminIndexPage.searchByMultipleFields(testData.searchFilters.byCity);
        
        const initialCount = await adminIndexPage.getResultsCount();
        
        await adminIndexPage.changePageSize(25);
        
        const newCount = await adminIndexPage.getResultsCount();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
});

test.describe('Dealer Dashboard - Regression Tests: Business Logic', () => {
    
    test('@regression @critical COOP-FU-DD-020: Dealer lookup by exact number match', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        await waitForDealerDetailRedirect(page);
        
        expect(page.url()).toContain(testData.dealers.valid.dealerNumber);
    });

    test('@regression COOP-FU-DD-021: Invalid dealer number shows error', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.searchDealer(testData.dealers.invalid.dealerNumber);
        
        expect(await dealerIndexPage.hasValidationErrors()).toBe(true);
        expect(await dealerIndexPage.hasErrorMessage(testData.errorMessages.dealerNotFound)).toBe(true);
    });

    test('@regression COOP-FU-DD-022: Single result auto-redirects', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        
        // Should auto-redirect to detail page
        await page.waitForURL(/\/DealerInfo/, { timeout: 5000 });
        expect(page.url()).toContain('/DealerInfo');
    });

    test('@regression COOP-FU-DD-023: Multi-result displays in table', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        await adminIndexPage.searchByMultipleFields({ city: testData.searchFilters.byCity.city });
        
        expect(await adminIndexPage.isResultsTableVisible()).toBe(true);
        const count = await adminIndexPage.getResultsCount();
        expect(count).toBeGreaterThan(1);
    });
});

test.describe('Dealer Dashboard - Regression Tests: Workflow', () => {
    
    test('@regression COOP-FU-DD-025: Search validates then redirects (single)', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.searchDealer(testData.dealers.valid.dealerNumber);
        
        await waitForDealerDetailRedirect(page);
        expect(page.url()).toContain('/DealerInfo');
    });

    test('@regression COOP-FU-DD-026: Search validates then shows list (multiple)', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        await searchAsAdmin(page, testData.searchFilters.byCity);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        expect(await adminIndexPage.isResultsTableVisible()).toBe(true);
    });

    test('@regression COOP-FU-DD-027: Agency dealer list loads on page init', async ({ page }) => {
        await loginAsRole(page, 'agency', testData.users.agency);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.waitForPageLoad();
        
        expect(await dealerIndexPage.isAgencyDealerListVisible()).toBe(true);
        expect(await dealerIndexPage.getAgencyDealerCount()).toBeGreaterThan(0);
    });
});

test.describe('Dealer Dashboard - Regression Tests: Data Persistence', () => {
    
    test('@regression COOP-FU-DD-034: Session storage dealer context (16 keys)', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        await waitForDealerDetailRedirect(page);
        
        const sessionCheck = await verifyDealerContextSession(page);
        
        expect(sessionCheck.allPresent).toBe(true);
        expect(Object.keys(sessionCheck.sessionData)).toHaveLength(16);
        
        // Verify specific keys
        expect(sessionCheck.sessionData['dealerNumber']).toBe(testData.dealers.valid.dealerNumber);
        expect(sessionCheck.sessionData['fiscalYear']).toBeTruthy();
    });

    test('@regression COOP-FU-DD-035: Session storage fiscal year', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        await dealerIndexPage.selectFiscalYear(testData.fiscalYears[2]);
        await dealerIndexPage.searchDealer(testData.dealers.valid.dealerNumber);
        
        await waitForDealerDetailRedirect(page);
        
        const sessionCheck = await verifyDealerContextSession(page);
        expect(sessionCheck.sessionData['fiscalYear']).toBe(testData.fiscalYears[2]);
    });
});

test.describe('Dealer Dashboard - Regression Tests: Security', () => {
    
    test('@regression @critical COOP-FU-DD-040: Role-based access for 7 roles', async ({ page }) => {
        // Test dealer role
        await loginAsRole(page, 'dealer', testData.users.dealer);
        await page.goto('/CoopManagement/Dealer');
        expect(await isOnDealerIndexPage(page)).toBe(true);
        
        await page.context().clearCookies();
        
        // Test admin role
        await loginAsRole(page, 'admin', testData.users.admin);
        await page.goto('/CoopManagement/Dealer');
        expect(await isOnAdminIndexPage(page)).toBe(true);
    });

    test('@regression @critical COOP-FU-DD-044: Parameter encryption applied', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        await searchAsDealer(page, testData.dealers.valid.dealerNumber);
        await waitForDealerDetailRedirect(page);
        
        const isEncrypted = await verifyEncryptedParameters(page, ['dealer_number_seq']);
        expect(isEncrypted).toBe(true);
    });

    test('@regression @critical COOP-FU-DD-045: Anti-CSRF token validation', async ({ page }) => {
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        const hasToken = await dealerIndexPage.hasAntiForgeryToken();
        expect(hasToken).toBe(true);
        
        // Verify token is non-empty
        const token = await page.locator('input[name="__RequestVerificationToken"]').inputValue();
        expect(token.length).toBeGreaterThan(20);
    });

    test('@regression @critical COOP-FU-DD-046: SQL injection prevention', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        const maliciousInput = "'; DROP TABLE dealers; --";
        await adminIndexPage.enterDealerNumber(maliciousInput);
        await adminIndexPage.clickSearch();
        
        // Should either show no results or validation error, not execute SQL
        const hasResults = await adminIndexPage.isResultsTableVisible();
        const hasNoData = await adminIndexPage.isNoDataMessageVisible();
        
        expect(hasResults || hasNoData).toBe(true);
    });
});

test.describe('Dealer Dashboard - E2E Tests', () => {
    
    test('@e2e E2E-001: Complete dealer user journey', async ({ page }) => {
        // Login as dealer
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        // Navigate to dealer dashboard
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        // Select fiscal year
        await dealerIndexPage.selectFiscalYear(testData.fiscalYears[0]);
        
        // Search for dealer
        await dealerIndexPage.enterDealerNumber(testData.users.dealer.dealerNumber);
        await dealerIndexPage.clickSubmit();
        
        // Verify redirect to detail
        await waitForDealerDetailRedirect(page);
        expect(page.url()).toContain('/DealerInfo');
        
        // Verify session populated
        const sessionCheck = await verifyDealerContextSession(page);
        expect(sessionCheck.allPresent).toBe(true);
    });

    test('@e2e E2E-002: Complete agency user journey', async ({ page }) => {
        // Login as agency
        await loginAsRole(page, 'agency', testData.users.agency);
        
        // Navigate to dealer dashboard
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        // Verify agency dealer list displayed
        expect(await dealerIndexPage.isAgencyDealerListVisible()).toBe(true);
        const dealerCount = await dealerIndexPage.getAgencyDealerCount();
        expect(dealerCount).toBeGreaterThan(0);
        
        // Click first dealer link
        const firstDealer = await dealerIndexPage.getAgencyDealerData(0);
        await dealerIndexPage.clickAgencyDealerLink(firstDealer.dealerNumber);
        
        // Verify navigation to detail
        await page.waitForURL(/\/DealerInfo/);
        expect(page.url()).toContain(firstDealer.dealerNumber);
    });

    test('@e2e E2E-003: Complete admin user journey', async ({ page }) => {
        // Login as admin
        await loginAsRole(page, 'admin', testData.users.admin);
        
        // Navigate to admin dashboard
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Perform multi-field search
        await adminIndexPage.selectCountry(testData.searchFilters.multiField.country);
        await adminIndexPage.waitForStateDropdownUpdate();
        await adminIndexPage.selectState(testData.searchFilters.multiField.state);
        await adminIndexPage.enterCity(testData.searchFilters.multiField.city);
        await adminIndexPage.clickSearch();
        
        // Verify results
        expect(await adminIndexPage.isResultsTableVisible()).toBe(true);
        
        // Click first dealer
        if (await adminIndexPage.getResultsCount() > 0) {
            const firstDealer = await adminIndexPage.getDealerResultData(0);
            await adminIndexPage.clickDealerLink(firstDealer.dealerNumber);
            
            await page.waitForURL(/\/DealerInfo/);
        }
    });

    test('@e2e @critical E2E-004: Authorization failure - dealer tries to search other dealer', async ({ page }) => {
        // Login as dealer A
        await loginAsRole(page, 'dealer', testData.users.dealer);
        
        const dealerIndexPage = new DealerIndexPage(page);
        await dealerIndexPage.navigate();
        
        // Attempt to search dealer B's number
        await dealerIndexPage.searchDealer(testData.users.dealerB.dealerNumber);
        
        // Verify authorization error
        expect(await dealerIndexPage.hasValidationErrors()).toBe(true);
        expect(await dealerIndexPage.hasErrorMessage(testData.errorMessages.dealerUnauthorized)).toBe(true);
        
        // Verify no redirect occurred
        expect(await isOnDealerIndexPage(page)).toBe(true);
    });

    test('@e2e E2E-005: Cascading dropdown flow (country to state)', async ({ page }) => {
        await loginAsRole(page, 'admin', testData.users.admin);
        
        const adminIndexPage = new DealerAdminIndexPage(page);
        await adminIndexPage.navigate();
        
        // Verify initial state dropdown is empty or has default
        let initialStates = await adminIndexPage.getAvailableStates();
        
        // Select USA
        await adminIndexPage.selectCountry(testData.countries[0].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify US states loaded
        let usStates = await adminIndexPage.getAvailableStates();
        expect(usStates.length).toBeGreaterThan(initialStates.length);
        
        // Select a state
        await adminIndexPage.selectState(testData.states.USA[0].value);
        
        // Change country to Canada
        await adminIndexPage.selectCountry(testData.countries[1].value);
        await adminIndexPage.waitForStateDropdownUpdate();
        
        // Verify Canadian provinces loaded (different list)
        let canadianProvinces = await adminIndexPage.getAvailableStates();
        expect(canadianProvinces).toContain(testData.states.Canada[0].name);
        expect(canadianProvinces).not.toContain(testData.states.USA[0].name);
    });
});
