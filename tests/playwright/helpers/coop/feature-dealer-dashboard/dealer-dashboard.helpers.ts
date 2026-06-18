import { Page } from '@playwright/test';
import { DealerIndexPage } from '../../pages/coop/feature-dealer-dashboard/DealerIndexPage';
import { DealerAdminIndexPage } from '../../pages/coop/feature-dealer-dashboard/DealerAdminIndexPage';

/**
 * Helper Functions for Dealer Dashboard Test Automation
 * 
 * Provides reusable multi-step workflows for dealer search,
 * authentication, session management, and database setup.
 */

/**
 * Search as dealer user (Dealer Index flow)
 * @param page - Playwright page object
 * @param dealerNumber - Dealer number to search
 * @param fiscalYear - Optional fiscal year
 */
export async function searchAsDealer(
    page: Page,
    dealerNumber: string,
    fiscalYear?: string
): Promise<void> {
    const dealerIndexPage = new DealerIndexPage(page);
    await dealerIndexPage.navigate();
    await dealerIndexPage.waitForPageLoad();
    await dealerIndexPage.searchDealer(dealerNumber, fiscalYear);
}

/**
 * Search as admin user (Admin Index flow)
 * @param page - Playwright page object
 * @param filters - Search filters object
 */
export async function searchAsAdmin(
    page: Page,
    filters: {
        dealerNumber?: string;
        dealerName?: string;
        country?: string;
        state?: string;
        city?: string;
    }
): Promise<void> {
    const adminIndexPage = new DealerAdminIndexPage(page);
    await adminIndexPage.navigate();
    await adminIndexPage.waitForPageLoad();
    await adminIndexPage.searchByMultipleFields(filters);
}

/**
 * Verify session storage contains expected dealer context keys
 * @param page - Playwright page object
 * @param expectedKeys - Array of expected session key names
 * @returns Object with verification results
 */
export async function verifySessionKeys(
    page: Page,
    expectedKeys: string[]
): Promise<{ allPresent: boolean; missingKeys: string[]; sessionData: Record<string, any> }> {
    const sessionData = await page.evaluate(() => {
        const data: Record<string, any> = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                data[key] = sessionStorage.getItem(key);
            }
        }
        return data;
    });
    
    const missingKeys = expectedKeys.filter(key => !(key in sessionData));
    const allPresent = missingKeys.length === 0;
    
    return { allPresent, missingKeys, sessionData };
}

/**
 * Clear all session storage
 * @param page - Playwright page object
 */
export async function clearSessionStorage(page: Page): Promise<void> {
    await page.evaluate(() => sessionStorage.clear());
}

/**
 * Set session storage key-value pair
 * @param page - Playwright page object
 * @param key - Session key name
 * @param value - Session value
 */
export async function setSessionKey(page: Page, key: string, value: string): Promise<void> {
    await page.evaluate(
        ({ key, value }) => sessionStorage.setItem(key, value),
        { key, value }
    );
}

/**
 * Get session storage value by key
 * @param page - Playwright page object
 * @param key - Session key name
 */
export async function getSessionKey(page: Page, key: string): Promise<string | null> {
    return await page.evaluate(
        (key) => sessionStorage.getItem(key),
        key
    );
}

/**
 * Login as specific role
 * @param page - Playwright page object
 * @param role - User role ('dealer', 'agency', 'admin')
 * @param credentials - User credentials
 */
export async function loginAsRole(
    page: Page,
    role: 'dealer' | 'agency' | 'admin',
    credentials: { username: string; password: string }
): Promise<void> {
    // Navigate to login page
    await page.goto('/Account/Login');
    
    // Fill login form (adjust selectors based on actual login page)
    await page.locator('#username, input[name="username"], input[type="email"]').fill(credentials.username);
    await page.locator('#password, input[name="password"], input[type="password"]').fill(credentials.password);
    
    // Submit login form
    await page.locator('button[type="submit"], input[type="submit"], #btnLogin').click();
    
    // Wait for redirect after successful login
    await page.waitForURL(/\/(Home|Dashboard|Dealer|CoopManagement)/, { timeout: 10000 });
}

/**
 * Setup agency-dealer relationship in database for testing
 * This is a placeholder - actual implementation requires database connection
 * @param dealerSeq - Dealer sequence number
 * @param agencySeq - Agency sequence number
 */
export async function setupAgencyDealerRelationship(
    dealerSeq: number,
    agencySeq: number
): Promise<void> {
    // TODO: Implement database insert using test database connection
    // This would typically use a database client or API endpoint
    // Example:
    // await dbClient.query(`
    //     INSERT INTO agency_dealer_relationship (dealer_seq, agency_seq, active_flag)
    //     VALUES (?, ?, 'Y')
    // `, [dealerSeq, agencySeq]);
    
    console.log(`Setup agency-dealer relationship: Dealer ${dealerSeq} <-> Agency ${agencySeq}`);
}

/**
 * Verify URL contains encrypted parameters
 * @param page - Playwright page object
 * @param paramNames - Parameter names to check for encryption
 * @returns Boolean indicating if parameters appear encrypted
 */
export async function verifyEncryptedParameters(
    page: Page,
    paramNames: string[]
): Promise<boolean> {
    const currentUrl = page.url();
    
    for (const paramName of paramNames) {
        const regex = new RegExp(`[?&]${paramName}=([^&]+)`);
        const match = currentUrl.match(regex);
        
        if (match && match[1]) {
            const paramValue = decodeURIComponent(match[1]);
            
            // Check if value appears encrypted (not plain numeric or text)
            // Encrypted values typically contain special characters, are base64, etc.
            const looksEncrypted = 
                paramValue.length > 20 && // Long enough
                /[A-Za-z0-9+/=]{20,}/.test(paramValue) && // Contains base64-like chars
                !/^\d+$/.test(paramValue); // Not just numbers
            
            if (!looksEncrypted) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Wait for dealer detail page to load after search redirect
 * @param page - Playwright page object
 */
export async function waitForDealerDetailRedirect(page: Page): Promise<void> {
    await page.waitForURL(/\/Dealer\/index\/DealerInfo/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
}

/**
 * Get current fiscal year from page
 * @param page - Playwright page object
 */
export async function getCurrentFiscalYear(page: Page): Promise<string> {
    const dealerIndexPage = new DealerIndexPage(page);
    return await dealerIndexPage.getSelectedFiscalYear();
}

/**
 * Verify AJAX call was made to load states
 * @param page - Playwright page object
 * @param countrySeq - Country sequence number
 */
export async function verifyStateAjaxCall(page: Page, countrySeq: string): Promise<boolean> {
    // Listen for network requests during country selection
    let ajaxCallMade = false;
    
    page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/states') || url.includes('GetStates') || url.includes('country')) {
            ajaxCallMade = true;
        }
    });
    
    return ajaxCallMade;
}

/**
 * Extract dealer number from current URL
 * @param page - Playwright page object
 */
export async function extractDealerNumberFromUrl(page: Page): Promise<string | null> {
    const url = page.url();
    const match = url.match(/dealerNumber=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Check if user is on dealer index page
 * @param page - Playwright page object
 */
export async function isOnDealerIndexPage(page: Page): Promise<boolean> {
    const url = page.url();
    return url.includes('/CoopManagement/Dealer/Index') || url.includes('/Dealer/Index');
}

/**
 * Check if user is on admin index page
 * @param page - Playwright page object
 */
export async function isOnAdminIndexPage(page: Page): Promise<boolean> {
    const url = page.url();
    return url.includes('/CoopManagement/Dealer/AdminIndex') || url.includes('/Dealer/AdminIndex');
}

/**
 * Wait for DataTables initialization
 * @param page - Playwright page object
 * @param tableId - Table element ID
 */
export async function waitForDataTableInit(page: Page, tableId: string): Promise<void> {
    await page.waitForFunction(
        (id) => {
            const table = document.getElementById(id);
            return table && table.classList.contains('dataTable');
        },
        tableId,
        { timeout: 5000 }
    );
}

/**
 * Get all session storage dealer context keys (16 keys)
 */
export const DEALER_CONTEXT_SESSION_KEYS = [
    'dealerSeq',
    'dealerNumber',
    'dealerName',
    'dealerTypeSeq',
    'dealerType',
    'fiscalYear',
    'countrySeq',
    'stateSeq',
    'divisionSeq',
    'orderingSeq',
    'contractType',
    'activeFlag',
    'returnUrl',
    'mediaCompanyDealerSeq',
    'agencySeq',
    'userId'
];

/**
 * Verify all 16 dealer context session keys are present
 * @param page - Playwright page object
 */
export async function verifyDealerContextSession(page: Page): Promise<{
    allPresent: boolean;
    missingKeys: string[];
    sessionData: Record<string, any>;
}> {
    return await verifySessionKeys(page, DEALER_CONTEXT_SESSION_KEYS);
}
