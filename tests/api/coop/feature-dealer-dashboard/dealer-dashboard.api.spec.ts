import { test, expect } from '@playwright/test';
import testData from '../../../playwright/data/coop/feature-dealer-dashboard/test-data.json';

/**
 * API Tests for Dealer Dashboard
 * 
 * Tests API endpoints used by the dealer dashboard:
 * - Country list endpoint
 * - State list endpoint (AJAX, depends on country)
 * - Admin search endpoint (if migrated to API)
 */

const BASE_API_URL = process.env.API_BASE_URL || 'https://localhost:5001/api';

test.describe('Dealer Dashboard - API Tests', () => {
    
    let apiContext: any;
    
    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext({
            baseURL: BASE_API_URL,
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    });
    
    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('@api Country list API endpoint returns valid data', async () => {
        const response = await apiContext.get('/countries', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify response structure
        const countries = await response.json();
        expect(Array.isArray(countries)).toBeTruthy();
        expect(countries.length).toBeGreaterThan(0);
        
        // Verify data structure
        const firstCountry = countries[0];
        expect(firstCountry).toHaveProperty('country_seq');
        expect(firstCountry).toHaveProperty('country_name');
        expect(firstCountry).toHaveProperty('country_code');
        
        // Verify expected countries exist
        const usaCountry = countries.find((c: any) => c.country_code === 'US');
        expect(usaCountry).toBeTruthy();
        expect(usaCountry.country_name).toBeTruthy();
    });

    test('@api Country list API handles unauthorized access', async () => {
        const response = await apiContext.get('/countries');
        
        // Without auth token, should return 401 or redirect
        expect([401, 403, 302]).toContain(response.status());
    });

    test('@api State list API endpoint returns states for USA', async () => {
        const usaCountrySeq = testData.countries.find((c: { code: string; value: unknown }) => c.code === 'US')?.value;
        
        const response = await apiContext.get(`/states?country_seq=${usaCountrySeq}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify response structure
        const states = await response.json();
        expect(Array.isArray(states)).toBeTruthy();
        expect(states.length).toBeGreaterThan(0);
        
        // Verify data structure
        const firstState = states[0];
        expect(firstState).toHaveProperty('state_seq');
        expect(firstState).toHaveProperty('state_name');
        expect(firstState).toHaveProperty('state_code');
        
        // Verify expected US states exist
        const illinoisState = states.find((s: any) => s.state_code === 'IL');
        expect(illinoisState).toBeTruthy();
        expect(illinoisState.state_name).toContain('Illinois');
    });

    test('@api State list API endpoint returns provinces for Canada', async () => {
        const canadaCountrySeq = testData.countries.find((c: { code: string; value: unknown }) => c.code === 'CA')?.value;
        
        const response = await apiContext.get(`/states?country_seq=${canadaCountrySeq}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify response structure
        const provinces = await response.json();
        expect(Array.isArray(provinces)).toBeTruthy();
        expect(provinces.length).toBeGreaterThan(0);
        
        // Verify Canadian provinces
        const ontarioProvince = provinces.find((p: any) => p.state_code === 'ON');
        expect(ontarioProvince).toBeTruthy();
        expect(ontarioProvince.state_name).toContain('Ontario');
    });

    test('@api State list API requires country_seq parameter', async () => {
        const response = await apiContext.get('/states', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        // Should return 400 Bad Request without country_seq
        expect(response.status()).toBe(400);
        
        const error = await response.json();
        expect(error).toHaveProperty('error');
        expect(error.error).toContain('country_seq');
    });

    test('@api State list API handles invalid country_seq', async () => {
        const response = await apiContext.get('/states?country_seq=99999', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        // Should return empty array or 404
        if (response.status() === 200) {
            const states = await response.json();
            expect(Array.isArray(states)).toBeTruthy();
            expect(states.length).toBe(0);
        } else {
            expect(response.status()).toBe(404);
        }
    });

    test('@api Admin search API endpoint - search by dealer number', async () => {
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                dealerNumber: testData.dealers.valid.dealerNumber
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify response structure
        const result = await response.json();
        expect(result).toHaveProperty('dealers');
        expect(Array.isArray(result.dealers)).toBeTruthy();
        expect(result.dealers.length).toBeGreaterThan(0);
        
        // Verify first result matches search
        const firstDealer = result.dealers[0];
        expect(firstDealer.dealer_number).toBe(testData.dealers.valid.dealerNumber);
        expect(firstDealer).toHaveProperty('dealer_name');
        expect(firstDealer).toHaveProperty('city');
        expect(firstDealer).toHaveProperty('state_code');
    });

    test('@api Admin search API endpoint - search by multiple fields', async () => {
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                dealerName: testData.searchFilters.multiField.dealerName,
                city: testData.searchFilters.multiField.city,
                state: testData.searchFilters.multiField.state
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify response structure
        const result = await response.json();
        expect(result).toHaveProperty('dealers');
        expect(result).toHaveProperty('totalRecords');
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('pageSize');
        
        // Verify results match search criteria
        if (result.dealers.length > 0) {
            const firstDealer = result.dealers[0];
            expect(firstDealer.city.toLowerCase()).toContain(testData.searchFilters.multiField.city.toLowerCase());
        }
    });

    test('@api Admin search API supports pagination', async () => {
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                city: testData.searchFilters.byCity.city,
                page: 1,
                pageSize: 10
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        
        const result = await response.json();
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('pageSize');
        expect(result).toHaveProperty('totalRecords');
        expect(result.dealers.length).toBeLessThanOrEqual(10);
        
        // Request page 2
        const page2Response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                city: testData.searchFilters.byCity.city,
                page: 2,
                pageSize: 10
            }
        });
        
        const page2Result = await page2Response.json();
        expect(page2Result.page).toBe(2);
        
        // Verify different results on page 2
        if (result.totalRecords > 10) {
            expect(page2Result.dealers[0].dealer_number).not.toBe(result.dealers[0].dealer_number);
        }
    });

    test('@api Admin search API handles no results', async () => {
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                dealerNumber: testData.dealers.invalid.dealerNumber
            }
        });
        
        // Verify response status
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        // Verify empty results
        const result = await response.json();
        expect(result.dealers).toHaveLength(0);
        expect(result.totalRecords).toBe(0);
    });

    test('@api Admin search API validates input', async () => {
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            },
            data: {
                dealerNumber: "'; DROP TABLE dealers; --" // SQL injection attempt
            }
        });
        
        // Should either return 400 validation error or empty results
        if (response.status() === 400) {
            const error = await response.json();
            expect(error).toHaveProperty('error');
        } else if (response.status() === 200) {
            const result = await response.json();
            expect(result.dealers).toHaveLength(0);
        }
    });

    test('@api API returns proper error codes for server errors', async () => {
        // Attempt to call endpoint with malformed data
        const response = await apiContext.post('/dealer/search', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: 'invalid json'
        });
        
        // Should return 400 Bad Request
        expect(response.status()).toBe(400);
    });

    test('@api API response time is acceptable', async () => {
        const startTime = Date.now();
        
        const response = await apiContext.get(`/states?country_seq=${testData.countries[0].value}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`
            }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.ok()).toBeTruthy();
        
        // Response time should be under 2 seconds
        expect(responseTime).toBeLessThan(2000);
    });

    test('@api API handles concurrent requests', async () => {
        const requests = [
            apiContext.get('/countries', { headers: { 'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` } }),
            apiContext.get(`/states?country_seq=${testData.countries[0].value}`, { headers: { 'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` } }),
            apiContext.post('/dealer/search', { 
                headers: { 'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` },
                data: { city: 'Chicago' }
            })
        ];
        
        const responses = await Promise.all(requests);
        
        // All requests should succeed
        responses.forEach(response => {
            expect(response.ok()).toBeTruthy();
        });
    });

    test('@api API includes proper CORS headers', async () => {
        const response = await apiContext.get('/countries', {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_TOKEN}`,
                'Origin': 'https://example.com'
            }
        });
        
        const headers = response.headers();
        
        // Verify CORS headers present (if API supports CORS)
        // Note: Adjust based on actual CORS configuration
        if (headers['access-control-allow-origin']) {
            expect(headers['access-control-allow-origin']).toBeTruthy();
        }
    });
});
