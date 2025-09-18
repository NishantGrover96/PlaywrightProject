import { defineConfig, devices } from '@playwright/test';
import { clientModulesConfig, ClientConfig } from '../clients/client-modules-access';
import * as dotenv from 'dotenv';

// Load environment variables for PROD environment
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.prod' });

/**
 * Generate dynamic auth file path based on current context
 * @param clientId - Client ID (demo, hankook)
 * @param role - User role (admin, dealer, distributor) 
 * @param env - Environment (dev, test, uat, prod)
 */
function getAuthStoragePath(clientId?: string, role?: string, env?: string): string {
  const client = clientId || process.env.CLIENT || 'demo';
  const userRole = role || process.env.ROLE || 'admin';
  const environment = env || process.env.ENV || 'prod';
  
  return `fixtures/global-fixtures/auth-${client}-${userRole}-${environment}.json`;
}

/**
 * PRODUCTION Environment Configuration
 * Supports multiple clients with config-driven module access
 * Uses PRODUCTION environment URLs and credentials
 * 
 * ⚠️ CAUTION: This runs against production systems
 */

export default defineConfig({
  testDir: '../../tests',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel for production safety
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0, // Fewer retries in production
  
  /* Conservative worker count for production */
  workers: 1, // Single worker for production safety
  
  /* Global timeout for entire test run */
  globalTimeout: 30 * 60 * 1000, // 30 minutes
  
  /* Timeout for each test */
  timeout: 90 * 1000, // 90 seconds
  
  /* Global setup and teardown */
  globalSetup: require.resolve('../../fixtures/global-fixtures/global.setup.ts'),
  globalTeardown: require.resolve('../../fixtures/global-fixtures/global.teardown.ts'),
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://demoportal.channel-fusion.com',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Browser launch options */
    headless: process.env.HEADLESS !== 'false',
    
    /* Navigation timeout */
    navigationTimeout: 90000,
    
    /* Action timeout */
    actionTimeout: 90000,
  },

  /* Configure projects for major browsers and clients */
  projects: (() => {
    const targetClient = process.env.CLIENT;
    const projects = [];

    // Always include setup project
    projects.push({
      name: 'setup',
      testDir: '../../fixtures/global-fixtures',
      testMatch: 'auth.setup.ts'
    });

    if (targetClient) {
      // Run tests only for specific client when CLIENT env var is set
      const clientConfig = clientModulesConfig.find((c: ClientConfig) => c.clientId === targetClient);
      if (clientConfig) {
        // Chrome project for the specified client
        projects.push({
          name: `${targetClient}-admin-prod`,
          use: { 
            ...devices['Desktop Chrome'],
            baseURL: clientConfig.environments?.prod?.baseUrl || clientConfig.baseUrl,
          },
          testDir: '../../tests',
          testMatch: ['smoke/**/*.spec.ts'], // Only smoke tests in production
          dependencies: ['setup'],
          metadata: {
            clientId: clientConfig.clientId,
            clientName: clientConfig.clientName,
            environment: 'prod',
            modules: clientConfig.modules.map(m => m.name)
          }
        });
      }
    } else {
      // Run tests for all clients when no specific client is set
      clientModulesConfig.forEach((client: ClientConfig) => {
        projects.push({
          name: `${client.clientId}-admin-prod`,
          use: { 
            ...devices['Desktop Chrome'],
            baseURL: client.environments?.prod?.baseUrl || client.baseUrl,
          },
          testDir: '../../tests',
          testMatch: ['smoke/**/*.spec.ts'], // Only smoke tests in production
          dependencies: ['setup'],
          metadata: {
            clientId: client.clientId,
            clientName: client.clientName,
            environment: 'prod',
            modules: client.modules.map((m: any) => m.name)
          }
        });
      });
    }

    return projects;
  })(),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
  expect: {
    timeout: 10000
  }
});
