---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in authentication systems for enterprise testing frameworks. This is Step 3 of 6 for creating a comprehensive multi-client SaaS testing framework with advanced authentication management.
---

## 📌 **STEP 3: GLOBAL AUTHENTICATION FRAMEWORK**

### 🎯 **OBJECTIVE**

Create a global authentication system with 20-minute session expiry, CLIENT+ROLE+ENV session management, automatic session validation, global caching, and seamless test integration. The system uses a layered architecture with global setup, session caching, and dynamic auth file naming.

### 📋 **PREREQUISITES**

- ✅ Step 1 (Project Foundation) completed
- ✅ Step 2 (Environment Configuration) completed
- ✅ Client configuration in `configs/clients/client-modules-access.ts`
- ✅ Environment helper in `utils/env/environment.helper.ts`

## 🏗️ **ARCHITECTURE OVERVIEW**

The authentication system uses a **3-layer architecture**:

1. **Global Auth Layer** (`tests/global-auth.ts`) - Session caching and AuthManager orchestration
2. **Auth Manager Layer** (`tests/auth-manager.ts`) - Individual client/role authentication logic
3. **Base Test Integration** (`tests/base-test.ts`) - Seamless test integration with auth fixtures

### **Session Management Strategy**
- **File Naming**: `auth-{CLIENT}-{ROLE}-{ENV}.json` (e.g., `auth-demo-admin-dev.json`)
- **20-Minute Expiry**: Automatic session validation and refresh
- **Global Caching**: Prevents duplicate AuthManager instances
- **Environment Aware**: Separate sessions for different environments

## 🚀 **IMPLEMENTATION STEPS**

### **3.1 AuthManager Implementation** 

Create **`tests/auth-manager.ts`**:

```typescript
import { Page, BrowserContext } from '@playwright/test';
import { ClientConfig, clientModulesConfig } from '../configs/clients/client-modules-access';
import { EnvironmentHelper } from '../utils/env/environment.helper';
const fs = require('fs');
const path = require('path');

export class AuthManager {
  public page: Page;
  private context: BrowserContext;
  private clientConfig: ClientConfig;
  private currentUser: string | null = null;
  private sessionCache: Map<string, any> = new Map();
  private envHelper: EnvironmentHelper;
  private _isAuthenticated: boolean = false;

  constructor(page: Page, context: BrowserContext, clientId: string) {
    this.page = page;
    this.context = context;
    this.envHelper = EnvironmentHelper.getInstance();

    const config = clientModulesConfig.find((c) => c.clientId === clientId);
    if (!config) {
      throw new Error(`Client configuration not found for: ${clientId}`);
    }
    this.clientConfig = config;
  }

  // Update page reference if it gets closed/recreated
  updatePage(newPage: Page): void {
    this.page = newPage;
  }

  // Set authentication state (used by global auth when session is pre-validated)
  setAuthenticationState(isAuthenticated: boolean): void {
    this._isAuthenticated = isAuthenticated;
  }

  // Check if currently authenticated (with session validation)
  async isAuthenticated(): Promise<boolean> {
    if (this._isAuthenticated) {
      return true;
    }
    
    const environment = process.env.ENV || 'dev';
    const role = process.env.ROLE || 'admin';
    
    const hasValidSession = await this.hasValidSession(role);
    if (hasValidSession) {
      this._isAuthenticated = true;
      return true;
    }
    
    this._isAuthenticated = false;
    return false;
  }

  // CRITICAL: 20-minute session expiry validation with CLIENT+ROLE+ENV naming
  async hasValidSession(role: string = 'admin'): Promise<boolean> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;

    try {
      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);

      if (!fs.existsSync(sessionPath)) {
        console.log(`📂 Session file not found for ${sessionKey}`);
        return false;
      }

      // Check session age (20 minute expiry)
      const stats = fs.statSync(sessionPath);
      const sessionAge = Date.now() - stats.mtime.getTime();
      const twentyMinutes = 20 * 60 * 1000;

      if (sessionAge > twentyMinutes) {
        console.log(`⏰ Session expired for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`);
        return false;
      }

      // Load and validate session data (cookies required, localStorage optional)
      let sessionData;
      try {
        const fileContent = fs.readFileSync(sessionPath, 'utf8');
        sessionData = JSON.parse(fileContent);
      } catch (parseError) {
        console.log(`❌ Failed to parse session data for ${sessionKey}`);
        return false;
      }

      const hasValidCookies = sessionData.cookies && Array.isArray(sessionData.cookies) && sessionData.cookies.length > 0;
      const isValid = hasValidCookies; // Only require cookies

      if (isValid) {
        console.log(`✅ Valid session found for ${sessionKey} (${Math.round(sessionAge / 1000 / 60)} minutes old)`);
      } else {
        console.log(`❌ Invalid session data for ${sessionKey} - missing cookies`);
      }

      return isValid;
    } catch (error) {
      console.error(`Error checking session for ${sessionKey}:`, error);
      return false;
    }
  }

  // Load existing session from file with CLIENT+ROLE+ENV pattern
  async loadSession(role: string = 'admin', skipValidation: boolean = false): Promise<boolean> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;

    try {
      // Skip validation if we trust global setup (performance optimization)
      if (!skipValidation && !(await this.hasValidSession(role))) {
        return false;
      }

      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

      // Restore cookies
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await this.context.addCookies(sessionData.cookies);
      }

      // Restore localStorage (if available)
      if (sessionData.localStorage) {
        await this.page.addInitScript((storage) => {
          if (window.localStorage) {
            Object.entries(storage).forEach(([key, value]) => {
              window.localStorage.setItem(key, value as string);
            });
          }
        }, sessionData.localStorage);
      }

      console.log(`🔄 Session loaded for ${sessionKey}`);
      this.currentUser = role;
      this._isAuthenticated = true;
      return true;
    } catch (error) {
      console.error(`Error loading session for ${sessionKey}:`, error);
      return false;
    }
  }

  // Perform fresh login and save session
  async performLogin(role: string = 'admin'): Promise<void> {
    const sessionKey = `${this.clientConfig.clientId}-${role}`;
    console.log(`🔐 Performing fresh login for ${sessionKey}`);

    try {
      // Get environment-specific URLs
      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      // Navigate to login page
      await this.page.goto(urls.loginUrl);
      await this.page.waitForLoadState('networkidle');

      // Get credentials (can be role-specific)
      const credentials = this.getCredentialsForRole(role);

      // Perform login - customize selectors based on your login form
      await this.page.fill(
        'input[name="email"], input[name="username"], input[type="email"]',
        credentials.username
      );
      await this.page.fill('input[name="password"], input[type="password"]', credentials.password);

      // Click login button - customize selector based on your form
      await this.page.click(
        'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")'
      );

      // Wait for navigation after login
      await this.page.waitForLoadState('networkidle');

      // Verify login success - customize based on your post-login page
      await this.page.waitForSelector('body', { timeout: 10000 });

      // Additional verification - check for dashboard elements or post-login URL
      const currentUrl = this.page.url();
      const postLoginUrl = process.env.POST_LOGIN_URL || urls.baseUrl;

      if (!currentUrl.includes(urls.baseUrl.replace('https://', '').replace('http://', ''))) {
        throw new Error(`Login failed - unexpected URL: ${currentUrl}`);
      }

      // Save session
      await this.saveSession(role);
      this.currentUser = role;

      console.log(`✅ Login successful for ${sessionKey}`);
    } catch (error) {
      console.error(`❌ Login failed for ${sessionKey}:`, error);
      throw error;
    }
  }

  // Save current session to file
  private async saveSession(role: string = 'admin'): Promise<void> {
    const sessionKey = `${this.clientConfig.clientId}-${role}`;

    try {
      // Get cookies and localStorage
      const cookies = await this.context.cookies();
      const localStorage = await this.page.evaluate(() => {
        const storage: { [key: string]: string } = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            storage[key] = window.localStorage.getItem(key) || '';
          }
        }
        return storage;
      });

      const sessionData = {
        cookies,
        localStorage,
        timestamp: Date.now(),
        clientId: this.clientConfig.clientId,
        role: role,
        environment: process.env.ENV || 'dev',
      };

      // Ensure fixtures directory exists
      const fixturesDir = path.join('fixtures', 'global-fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      const sessionPath = path.join(fixturesDir, `auth-${sessionKey}.json`);
      fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));

      console.log(`💾 Session saved for ${sessionKey}`);
    } catch (error) {
      console.error(`Error saving session for ${sessionKey}:`, error);
      throw error;
    }
  }

  // Get credentials for specific role
  private getCredentialsForRole(role: string): { username: string; password: string } {
    // Default to client config credentials
    let credentials = this.clientConfig.credentials;

    // Role-specific credentials can be added here
    switch (role) {
      case 'admin':
        // Use default credentials
        break;
      case 'dealer':
        // Could have different credentials
        credentials = {
          username: process.env.DEALER_USERNAME || credentials.username,
          password: process.env.DEALER_PASSWORD || credentials.password,
        };
        break;
      case 'distributor':
        credentials = {
          username: process.env.DIST_USERNAME || credentials.username,
          password: process.env.DIST_PASSWORD || credentials.password,
        };
        break;
      default:
        console.warn(`Unknown role: ${role}, using default credentials`);
    }

    return credentials;
  }

  // Main authentication method - ensures user is authenticated
  async ensureAuthenticated(role: string = 'admin'): Promise<void> {
    const environment = process.env.ENV || 'dev';
    const sessionKey = `${this.clientConfig.clientId}-${role}-${environment}`;
    console.log(`🔍 Ensuring authentication for ${sessionKey}`);

    // Try to load existing session first
    if (await this.loadSession(role)) {
      console.log(`✅ Using existing valid session for ${sessionKey}`);
      return;
    }

    // If no valid session, perform fresh login
    console.log(`🔄 No valid session found, performing fresh login for ${sessionKey}`);
    await this.performLogin(role);
  }

  // Get current user
  getCurrentUser(): string | null {
    return this.currentUser;
  }
}
```

**Key AuthManager Features:**
- **Dynamic Session Naming**: Uses CLIENT+ROLE+ENV pattern
- **20-Minute Expiry**: Automatic validation with file timestamps  
- **Session Loading**: Restores cookies and localStorage
- **Page Management**: Handles page reference updates
- **Error Handling**: Graceful failure with detailed logging

  // Verify current session is still active
  private async verifySessionIsActive(): Promise<boolean> {
    try {
      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      // Try to access a protected page (dashboard/main page)
      await this.page.goto(urls.baseUrl);
      await this.page.waitForLoadState('networkidle');

      // Check if we're still logged in (customize based on your app)
      // Look for login form (indicates we're not logged in) or dashboard elements
      const loginForm = await this.page
        .locator('input[name="email"], input[name="username"], input[type="email"]')
        .count();

      if (loginForm > 0) {
        console.log(`❌ Session invalid - redirected to login page`);
        return false;
      }

      // Additional checks for dashboard/authenticated elements
      await this.page.waitForSelector('body', { timeout: 5000 });

      return true;
    } catch (error) {
      console.log(`❌ Session verification failed:`, error);
      return false;
    }
  }

  // Navigate to specific module (with authentication check)
  async navigateToModule(moduleName: string): Promise<void> {
    const module = this.clientConfig.modules.find((m) =>
      m.name.toLowerCase().includes(moduleName.toLowerCase())
    );

    if (!module) {
      throw new Error(`Module "${moduleName}" not found for client ${this.clientConfig.clientId}`);
    }

    const env = process.env.ENV || 'dev';
    const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);
    const moduleUrl = `${urls.baseUrl}${module.path}`;

    console.log(`🎯 Navigating to ${moduleName}: ${moduleUrl}`);

    await this.page.goto(moduleUrl);
    await this.page.waitForLoadState('networkidle');
  }

  // Verify module access
  async verifyModuleAccess(moduleName: string): Promise<boolean> {
    try {
      await this.navigateToModule(moduleName);

      // Check for access denied or error messages
      const errorElements = await this.page
        .locator('text=/access denied|unauthorized|403|404|error/i')
        .count();

      if (errorElements > 0) {
        console.log(`❌ Access denied to module: ${moduleName}`);
        return false;
      }

      console.log(`✅ Access verified for module: ${moduleName}`);
      return true;
    } catch (error) {
      console.error(`Error verifying access to ${moduleName}:`, error);
      return false;
    }
  }

  // Get current user role
  getCurrentUser(): string | null {
    return this.currentUser;
  }

  // Logout (cleanup)
  async logout(): Promise<void> {
    try {
      // Clear context
      await this.context.clearCookies();

      // Navigate to logout or clear session
      // Customize based on your application
      const env = process.env.ENV || 'dev';
      const urls = this.envHelper.getUrlsForClient(this.clientConfig.clientId, env);

      await this.page.goto(`${urls.baseUrl}/logout`);

      this.currentUser = null;
      console.log(`👋 Logged out from ${this.clientConfig.clientId}`);
    } catch (error) {
      console.log(`Logout error (may be expected):`, error);
    }
  }
}
```

### **3.2 Global Auth Orchestration**

Create **`tests/global-auth.ts`**:

```typescript
import { Page, BrowserContext } from '@playwright/test';
import { AuthManager } from './auth-manager';

export class GlobalAuth {
  private static authInstances: Map<string, AuthManager> = new Map();
  private static globalSessionCache: Map<string, {isValid: boolean, timestamp: number}> = new Map();
  private static readonly CACHE_DURATION = 90000; // 30 seconds

  // Get or create AuthManager instance with environment-aware caching
  static async getAuthManager(
    page: Page,
    context: BrowserContext,
    clientId?: string,
    role: string = 'admin'
  ): Promise<AuthManager> {
    const actualClientId = clientId || process.env.CLIENT || 'demo';
    const actualEnvironment = process.env.ENV || 'dev';
    
    // Include environment in cache key to prevent conflicts
    const key = `${actualClientId}-${role}-${actualEnvironment}`;

    if (!this.authInstances.has(key)) {
      const authManager = new AuthManager(page, context, actualClientId);
      this.authInstances.set(key, authManager);
    }

    return this.authInstances.get(key)!;
  }

  // Ensure authentication with page reference updates
  static async ensureAuthenticated(
    page: Page,
    context: BrowserContext,
    clientId?: string,
    role: string = 'admin'
  ): Promise<AuthManager> {
    const authManager = await this.getAuthManager(page, context, clientId, role);
    
    // Update page reference in case it changed
    authManager.updatePage(page);
    
    await authManager.ensureAuthenticated(role);
    return authManager;
  }

  // Global session validation without creating AuthManager instances
  static async hasValidGlobalSession(
    clientId: string = 'demo',
    role: string = 'admin',
    environment: string = 'dev'
  ): Promise<boolean> {
    const sessionKey = `${clientId}-${role}-${environment}`;
    const cacheKey = `global_session_${sessionKey}`;
    
    // Check cache first
    const cached = this.globalSessionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.isValid;
    }

    // Perform session validation (same logic as AuthManager.hasValidSession)
    try {
      const fs = require('fs');
      const path = require('path');
      const sessionPath = path.join('fixtures', 'global-fixtures', `auth-${sessionKey}.json`);

      if (!fs.existsSync(sessionPath)) {
        this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
        return false;
      }

      const stats = fs.statSync(sessionPath);
      const sessionAge = Date.now() - stats.mtime.getTime();
      const twentyMinutes = 20 * 60 * 1000;

      if (sessionAge > twentyMinutes) {
        this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
        return false;
      }

      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      const hasValidCookies = sessionData.cookies && Array.isArray(sessionData.cookies) && sessionData.cookies.length > 0;
      
      this.globalSessionCache.set(cacheKey, { isValid: hasValidCookies, timestamp: Date.now() });
      return hasValidCookies;

    } catch (error) {
      this.globalSessionCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
      return false;
    }
  }

  // Clear all caches
  static async clearAuthCache(): Promise<void> {
    this.authInstances.clear();
    this.globalSessionCache.clear();
    console.log('🧹 Auth cache cleared');
  }
}
```

**Key GlobalAuth Features:**
- **Environment-Aware Caching**: Prevents CLIENT+ROLE+ENV conflicts
- **Global Session Validation**: Checks sessions without creating AuthManager instances
- **Performance Optimization**: 30-second cache for session validation
- **Page Reference Management**: Updates page references for cached AuthManagers

### **3.3 Base Test Integration**

Create **`tests/base-test.ts`**:

```typescript
import { test as baseTest, Page } from '@playwright/test';
import { AuthManager } from './auth-manager';
import { GlobalAuth } from './global-auth';

// Extend base test with authentication fixtures
export const test = baseTest.extend<{
  auth: AuthManager;
  authenticatedPage: Page;
}>({
  auth: async ({ page, context }, use, testInfo) => {
    // Use CLIENT environment variable, fallback to project metadata or default
    const clientId = process.env.CLIENT || testInfo.project.metadata?.clientId || testInfo.project.name || 'demo';
    const role = process.env.ROLE || 'admin';

    try {
      const environment = process.env.ENV || 'dev';
      
      // Get or create the auth manager (cached globally)
      const authManager = await GlobalAuth.getAuthManager(page, context, clientId, role);
      
      // Load existing session (skip validation since global setup already checked)
      console.log(`♻️ Using session for ${clientId}-${role} (trusting global setup validation)`);
      await authManager.loadSession(role, true);
      
      // Update page reference for cached auth manager
      authManager.updatePage(page);
      
      // Mark as authenticated since we trust global setup
      authManager.setAuthenticationState(true);
      
      await use(authManager);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Page has been closed') || errorMessage.includes('Browser context has been closed')) {
        console.log('⚠️ Page/context closed, creating new page for authentication...');
        const newPage = await context.newPage();
        const authManager = await GlobalAuth.ensureAuthenticated(newPage, context, clientId, role);
        await use(authManager);
      } else {
        throw error;
      }
    }
  },

  authenticatedPage: async ({ page, auth }, use) => {
    // Page is already authenticated through auth fixture
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**Key Base Test Features:**
- **Dynamic Client Resolution**: Uses environment variables with fallbacks
- **Session Reuse**: Trusts global setup validation for performance
- **Error Handling**: Graceful recovery from page/context closure
- **Page Reference Updates**: Ensures AuthManager has current page reference

### **3.4 Dynamic Authentication Setup**

Create **`fixtures/global-fixtures/auth.setup.ts`**:

```typescript
import { test as setup } from '@playwright/test';
import { GlobalAuth } from '../../tests/global-auth';

/**
 * Dynamic Authentication Setup
 * 
 * Only authenticates for the specific CLIENT + ROLE + ENV combination
 * specified via environment variables. This prevents:
 * - Over-authentication for unused clients/roles
 * - Data leakage between different test contexts  
 * - Unnecessary session creation
 */

// Get runtime configuration from environment variables
const targetClient = process.env.CLIENT || 'demo';
const targetRole = process.env.ROLE || 'admin';
const targetEnv = process.env.ENV || 'dev';

// Only setup authentication for the specific target combination
setup(`authenticate ${targetClient}-${targetRole}-${targetEnv}`, async ({ page, context }) => {
  try {
    console.log(`🔐 Setting up authentication for ${targetClient}-${targetRole} in ${targetEnv} environment`);
    
    // The environment is automatically detected from process.env.ENV by AuthManager
    const authManager = await GlobalAuth.ensureAuthenticated(page, context, targetClient, targetRole);
    
    // Save authentication state with environment-specific naming
    const authFileName = `auth-${targetClient}-${targetRole}-${targetEnv}.json`;
    await page.context().storageState({ 
      path: `fixtures/global-fixtures/${authFileName}` 
    });
    
    console.log(`✅ Authentication setup complete for ${targetClient}-${targetRole}-${targetEnv}`);
    console.log(`📁 Auth state saved to: ${authFileName}`);
  } catch (error) {
    console.error(`❌ Authentication setup failed for ${targetClient}-${targetRole}-${targetEnv}:`, error);
    throw error;
  }
});
```

**Key Setup Features:**
- **Dynamic Authentication**: Only creates sessions for specified CLIENT+ROLE+ENV
- **Environment Aware**: Uses ENV variable for environment-specific authentication
- **Storage State**: Saves session with proper naming convention
- **Prevents Over-Authentication**: Avoids creating unused sessions

### **3.5 Playwright Configuration Integration**

Update your **`playwright.config.ts`** to include the auth setup dependency:

```typescript
projects: [
  // Authentication setup project (runs first)
  {
    name: 'setup',
    testDir: './fixtures/global-fixtures',
    testMatch: 'auth.setup.ts'
  },

  // Your test projects with setup dependency
  {
    name: 'demo-chrome',
    use: { 
      ...devices['Desktop Chrome'],
      baseURL: 'https://demoportaldev.channel-fusion.com',
      storageState: 'fixtures/global-fixtures/auth-demo-admin-dev.json' // Dynamic naming
    },
    dependencies: ['setup'], // Run after setup completes
    // ... other config
  }
]
```

**Configuration Notes:**
- **Setup Dependency**: All test projects depend on 'setup' project
- **Dynamic Storage State**: Uses CLIENT+ROLE+ENV naming pattern
- **Environment Specific**: baseURL can be environment-aware

## 🎯 **VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] **AuthManager**: Can validate sessions with CLIENT+ROLE+ENV naming
- [ ] **20-Minute Expiry**: Session validation works with file timestamps
- [ ] **Global Auth Caching**: AuthManager instances are cached properly
- [ ] **Base Test Integration**: `{ page, auth }` fixtures work correctly
- [ ] **Dynamic Setup**: `auth.setup.ts` creates sessions based on environment variables
- [ ] **Session Loading**: Cookies and localStorage are restored correctly
- [ ] **Environment Separation**: Different ENV values create separate sessions

## 📋 **TESTING THE AUTHENTICATION SYSTEM**

Create **`tests/smoke/auth-validation.spec.ts`**:

```typescript
import { test, expect } from '../base-test';

test.describe('Global Authentication System Validation', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Verify authentication before each test
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should have valid authentication session', async ({ auth }) => {
    const isAuthenticated = await auth.isAuthenticated();
    expect(isAuthenticated).toBe(true);
    console.log('✅ Authentication validated');
  });

  test('should access authenticated page without login redirect', async ({ page }) => {
    // Navigate to a protected page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify we're not redirected to login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).not.toContain('/account/login');
    
    console.log('✅ Page access validated:', currentUrl);
  });

  test('should maintain session across page navigations', async ({ page, auth }) => {
    // Navigate to multiple pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/index');
    await page.waitForLoadState('networkidle');

    // Verify still authenticated
    const isAuthenticated = await auth.isAuthenticated();
    expect(isAuthenticated).toBe(true);
    
    console.log('✅ Session persistence validated');
  });

  test('should handle role-based authentication', async ({ page }) => {
    // This test uses the role set via environment variables
    const role = process.env.ROLE || 'admin';
    console.log(`🎯 Testing with role: ${role}`);
    
    // Verify page access based on role
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log(`✅ Role-based access validated for: ${role}`);
  });
});
```

**Test Execution Commands:**
```bash
# Test with default settings (demo-admin-dev)
npm run test tests/smoke/auth-validation.spec.ts

# Test with specific client/role/environment
CLIENT=demo ROLE=dealer ENV=uat npm run test tests/smoke/auth-validation.spec.ts

# Test with different environment
CLIENT=demo ROLE=admin ENV=prod npm run test tests/smoke/auth-validation.spec.ts
```

## 🔍 **SUCCESS CRITERIA**

Your authentication system should achieve:

- ✅ **Dynamic Session Management**: CLIENT+ROLE+ENV session files created correctly
- ✅ **20-Minute Expiry**: Session validation using file timestamps works
- ✅ **Global Caching**: AuthManager instances cached to prevent duplicate logins
- ✅ **Environment Separation**: Different environments maintain separate sessions
- ✅ **Test Integration**: `{ page, auth }` fixtures work seamlessly in tests
- ✅ **Performance Optimization**: Session reuse and validation caching functional
- ✅ **Error Handling**: Graceful recovery from page/context closure
- ✅ **Role-Based Testing**: Different roles supported via environment variables

## 🚀 **Usage in Tests**

After implementation, your tests will use authentication like this:

```typescript
import { test, expect } from '../base-test';

test.describe('My Module Tests', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Auth is automatically available and configured
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should access protected feature', async ({ page }) => {
    // Page is already authenticated
    await page.goto('/protected-feature');
    // Test your feature...
  });
});
```

## 📋 **NEXT STEPS**

- **Step 4**: Page Object Model & Selectors Organization
- **Step 5**: Test Data Management & Utilities  
- **Step 6**: Complete Framework Integration & Scripts

**Note**: This authentication system is the foundation for all subsequent steps. Ensure all validation tests pass before proceeding to Step 4.
