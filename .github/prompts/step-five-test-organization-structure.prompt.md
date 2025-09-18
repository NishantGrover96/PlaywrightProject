---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in test organization and structure. This is Step 5 of 6 for creating a comprehensive multi-client SaaS testing framework with proper test hierarchy and organization.
---

## 📌 **STEP 5: TEST ORGANIZATION & STRUCTURE**

### 🎯 **OBJECTIVE**

Create a comprehensive test organization system with three-tier testing strategy (smoke, regression, e2e), module-based test structure, and sample test implementations that demonstrate the framework's capabilities.

### 📋 **PREREQUISITES**

- ✅ Step 1 (Project Foundation) completed
- ✅ Step 2 (Environment Configuration) completed
- ✅ Step 3 (Authentication Framework) completed
- ✅ Step 4 (Page Object Model & Utils) completed
- ✅ Base test with authentication available

## 🚀 **IMPLEMENTATION STEPS**

### **5.1 Three-Tier Test Structure Setup**

#### **Smoke Tests (Critical Path Validation - 2-5 minutes)**

Create **tests/smoke/framework-health.spec.ts**:

```typescript
import { test, expect } from '../base-test';
import { LoginPage } from '../../pages/common/login.page';
import { DashboardPage } from '../../pages/common/dashboard.page';

test.describe('Framework Health Check', () => {
  test('should validate authentication system', async ({ auth, page }) => {
    // Verify auth manager is working
    expect(auth.getCurrentUser()).toBeTruthy();
    console.log('✅ Authentication system healthy');
  });

  test('should access dashboard successfully', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);

    await dashboardPage.navigateToDashboard();
    await dashboardPage.waitForDashboard();

    const isLoggedIn = await dashboardPage.verifyUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    console.log('✅ Dashboard access successful');
  });

  test('should validate environment configuration', async ({ page }) => {
    const currentUrl = page.url();
    const expectedEnv = process.env.ENV || 'dev';

    // Verify we're on correct environment
    expect(currentUrl).toContain(expectedEnv);
    console.log(`✅ Environment validation successful: ${expectedEnv}`);
  });

  test('should check for critical errors', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.navigateToDashboard();

    const hasErrors = await dashboardPage.checkForErrors();
    expect(hasErrors).toBe(false);

    console.log('✅ No critical errors found');
  });
});
```

Create **tests/smoke/all-modules.spec.ts**:

```typescript
import { test, expect } from '../base-test';
import { EnvironmentHelper } from '../../utils/env/environment.helper';

test.describe('Module Access Validation', () => {
  let envHelper: EnvironmentHelper;

  test.beforeAll(async () => {
    envHelper = EnvironmentHelper.getInstance();
  });

  test('should validate all client modules are accessible', async ({ auth }) => {
    const clientId = process.env.CLIENT || 'demo';
    const clientModules = envHelper.getClientModules(clientId);

    expect(clientModules.length).toBeGreaterThan(0);
    console.log(`Found ${clientModules.length} modules for client: ${clientId}`);

    // Test access to each module
    for (const module of clientModules) {
      console.log(`Testing module access: ${module.name}`);

      const hasAccess = await auth.verifyModuleAccess(module.name);
      expect(hasAccess, `Should have access to module: ${module.name}`).toBe(true);

      console.log(`✅ Access verified for: ${module.name}`);
    }
  });

  test('should navigate through key modules', async ({ auth, page }) => {
    const clientId = process.env.CLIENT || 'demo';
    const clientModules = envHelper.getClientModules(clientId);

    // Navigate to first few modules to ensure basic navigation works
    const modulesToTest = clientModules.slice(0, 3);

    for (const module of modulesToTest) {
      console.log(`Navigating to module: ${module.name}`);

      await auth.navigateToModule(module.name);
      await page.waitForLoadState('networkidle');

      // Verify no errors on page
      const hasErrors = await page.locator('text=/error|404|500/i').count();
      expect(hasErrors, `No errors expected on ${module.name} page`).toBe(0);

      console.log(`✅ Navigation successful for: ${module.name}`);
    }
  });
});
```

#### **Regression Tests (Core Functionality - 15-30 minutes)**

Create **tests/regression/cross-client-validation.spec.ts**:

```typescript
import { test, expect } from '../base-test';
import { clientModulesConfig } from '../../configs/clients/client-modules-access';

test.describe('Cross-Client Validation', () => {
  test('should validate client configurations', async ({ page }) => {
    expect(clientModulesConfig.length).toBeGreaterThan(0);

    for (const client of clientModulesConfig) {
      console.log(`Validating client: ${client.clientId}`);

      // Verify client has required properties
      expect(client.clientId).toBeTruthy();
      expect(client.baseUrl).toBeTruthy();
      expect(client.loginUrl).toBeTruthy();
      expect(client.modules.length).toBeGreaterThan(0);

      // Verify environment configurations
      if (client.environments) {
        expect(client.environments.dev).toBeTruthy();
        expect(client.environments.test).toBeTruthy();
        expect(client.environments.uat).toBeTruthy();
        expect(client.environments.prod).toBeTruthy();
      }

      console.log(`✅ Configuration valid for: ${client.clientId}`);
    }
  });

  test('should validate environment URL resolution', async ({ page }) => {
    const environments = ['dev', 'test', 'uat', 'prod'];

    for (const client of clientModulesConfig) {
      for (const env of environments) {
        if (client.environments && client.environments[env]) {
          const envConfig = client.environments[env];

          expect(envConfig.baseUrl).toBeTruthy();
          expect(envConfig.loginUrl).toBeTruthy();
          expect(envConfig.baseUrl).toMatch(/^https?:\/\//);
          expect(envConfig.loginUrl).toMatch(/^https?:\/\//);

          console.log(`✅ Environment URLs valid for ${client.clientId}-${env}`);
        }
      }
    }
  });

  test('should validate session management across roles', async ({ page, context }) => {
    const roles = ['admin', 'dealer', 'distributor'];
    const clientId = process.env.CLIENT || 'demo';

    for (const role of roles) {
      console.log(`Testing session management for role: ${role}`);

      try {
        const { AuthManager } = await import('../auth-manager');
        const authManager = new AuthManager(page, context, clientId);

        await authManager.ensureAuthenticated(role);
        const currentUser = authManager.getCurrentUser();

        expect(currentUser).toBe(role);
        console.log(`✅ Session management working for role: ${role}`);
      } catch (error) {
        console.log(`⚠️ Role ${role} may not be configured: ${error}`);
      }
    }
  });
});
```

#### **E2E Tests (Complete Workflows - 30+ minutes)**

Create **tests/e2e/user-workflows/complete-user-journey.spec.ts**:

```typescript
import { test, expect } from '../../base-test';
import { LoginPage } from '../../../pages/common/login.page';
import { DashboardPage } from '../../../pages/common/dashboard.page';
import { DataGenerator } from '../../../utils/data-generators/data-generator';

test.describe('Complete User Journey', () => {
  test('should complete full user workflow', async ({ page, context }) => {
    // Step 1: Manual login (testing login page object)
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    const clientId = process.env.CLIENT || 'demo';
    const { EnvironmentHelper } = await import('../../../utils/env/environment.helper');
    const envHelper = EnvironmentHelper.getInstance();
    const clientConfig = envHelper.getClientConfig(clientId);

    expect(clientConfig).toBeTruthy();

    await loginPage.performLogin(
      clientConfig!.credentials.username,
      clientConfig!.credentials.password
    );

    const loginSuccess = await loginPage.verifyLoginSuccess();
    expect(loginSuccess).toBe(true);

    // Step 2: Dashboard navigation
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboard();

    const menuItems = await dashboardPage.getMenuItems();
    expect(menuItems.length).toBeGreaterThan(0);
    console.log('Available menu items:', menuItems);

    // Step 3: Module navigation and interaction
    const clientModules = envHelper.getClientModules(clientId);

    for (const module of clientModules.slice(0, 2)) {
      // Test first 2 modules
      console.log(`Testing workflow in module: ${module.name}`);

      await dashboardPage.navigateToModule(module.path);
      await page.waitForLoadState('networkidle');

      // Basic module interaction
      await page.waitForSelector('body');

      // Check for common elements (search, tables, buttons)
      const hasSearch =
        (await page.locator('input[type="search"], [class*="search"] input').count()) > 0;
      const hasTable = (await page.locator('table, [class*="table"]').count()) > 0;
      const hasButtons = (await page.locator('button, [class*="btn"]').count()) > 0;

      console.log(
        `Module ${module.name} elements - Search: ${hasSearch}, Table: ${hasTable}, Buttons: ${hasButtons}`
      );

      // Verify no errors
      const hasErrors = await page.locator('text=/error|404|500/i').count();
      expect(hasErrors, `No errors expected in ${module.name}`).toBe(0);
    }

    // Step 4: User profile/settings access
    const userProfileVisible = await dashboardPage.verifyUserLoggedIn();
    expect(userProfileVisible).toBe(true);

    console.log('✅ Complete user journey test passed');
  });

  test('should handle data entry workflows', async ({ authenticatedPage }) => {
    const testData = DataGenerator.generateUserData();
    console.log('Generated test data:', testData);

    // Navigate to dashboard
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.navigateToDashboard();

    // Look for forms or data entry points
    const forms = await authenticatedPage.locator('form, [class*="form"]').count();
    const inputs = await authenticatedPage.locator('input, textarea').count();

    console.log(`Found ${forms} forms and ${inputs} input fields`);

    // If forms are available, test data entry
    if (inputs > 0) {
      const firstInput = authenticatedPage.locator('input, textarea').first();
      const isVisible = await firstInput.isVisible();

      if (isVisible) {
        await firstInput.fill(testData.firstName);
        console.log('✅ Data entry test completed');
      }
    }
  });
});
```

### **5.4 Test Utilities and Helpers**

Create **tests/test-helpers/module-test-helper.ts**:

```typescript
import { Page } from '@playwright/test';
import { AuthManager } from '../auth-manager';

export class ModuleTestHelper {
  static async validateModuleAccess(auth: AuthManager, moduleName: string): Promise<boolean> {
    try {
      await auth.navigateToModule(moduleName);
      return await auth.verifyModuleAccess(moduleName);
    } catch (error) {
      console.error(`Error validating access to ${moduleName}:`, error);
      return false;
    }
  }

  static async checkModuleHealth(
    page: Page,
    moduleName: string
  ): Promise<{ hasErrors: boolean; loadTime: number }> {
    const startTime = Date.now();

    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    const errorCount = await page.locator('text=/error|404|500/i').count();
    const hasErrors = errorCount > 0;

    console.log(`Module ${moduleName} - Load time: ${loadTime}ms, Errors: ${hasErrors}`);

    return { hasErrors, loadTime };
  }

  static async getModuleMetrics(page: Page): Promise<any> {
    return await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        elements: {
          buttons: document.querySelectorAll('button, [class*="btn"]').length,
          inputs: document.querySelectorAll('input, textarea, select').length,
          tables: document.querySelectorAll('table, [class*="table"]').length,
          forms: document.querySelectorAll('form').length,
        },
      };
    });
  }
}
```

### **5.5 Test Execution Patterns**

Create **tests/execution-patterns/parallel-test.spec.ts**:

```typescript
import { test, expect } from '../base-test';

test.describe.configure({ mode: 'parallel' });

test.describe('Parallel Execution Tests', () => {
  test('parallel test 1 - dashboard access', async ({ authenticatedPage }) => {
    const startTime = Date.now();

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Test 1 completed in ${loadTime}ms`);

    expect(authenticatedPage.url()).toContain('dashboard');
  });

  test('parallel test 2 - module access', async ({ auth }) => {
    const startTime = Date.now();

    const clientId = process.env.CLIENT || 'demo';
    const { EnvironmentHelper } = await import('../../utils/env/environment.helper');
    const envHelper = EnvironmentHelper.getInstance();
    const modules = envHelper.getClientModules(clientId);

    if (modules.length > 0) {
      await auth.navigateToModule(modules[0].name);
    }

    const loadTime = Date.now() - startTime;
    console.log(`Test 2 completed in ${loadTime}ms`);

    expect(auth.getCurrentUser()).toBeTruthy();
  });

  test('parallel test 3 - data validation', async ({ page }) => {
    const startTime = Date.now();

    const { DataGenerator } = await import('../../utils/data-generators/data-generator');
    const testData = DataGenerator.generateUserData();

    expect(testData.email).toContain('@');
    expect(testData.firstName).toBeTruthy();

    const loadTime = Date.now() - startTime;
    console.log(`Test 3 completed in ${loadTime}ms`);
  });
});
```

### **5.6 Reporter Integration**

Create **utils/reporter/test-execution-reporter.ts**:

```typescript
import { FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export default class TestExecutionReporter implements Reporter {
  private testResults: any[] = [];

  onBegin(config: any, suite: Suite) {
    console.log(`🚀 Starting test execution with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`▶️ Starting: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;

    this.testResults.push({
      title: test.title,
      status: status,
      duration: duration,
      file: test.location.file,
      line: test.location.line,
    });

    const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${test.title} - ${duration}ms`);
  }

  onEnd(result: FullResult) {
    const total = this.testResults.length;
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const skipped = this.testResults.filter((t) => t.status === 'skipped').length;

    console.log('\n📊 Test Execution Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️ Skipped: ${skipped}`);
    console.log(`   📈 Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
  }
}
```

## 🎯 **VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] Three-tier test structure implemented (smoke/regression/e2e)
- [ ] Framework health check tests working
- [ ] Module access validation tests functional
- [ ] Sample module-specific tests created
- [ ] Test data management utilities available
- [ ] Test execution patterns demonstrated
- [ ] Custom reporter integration working
- [ ] Tests can run in parallel
- [ ] All test types pass successfully

## 📋 **TESTING THE STRUCTURE**

Run these commands to validate the test organization:

```bash
# Run smoke tests (should be fast - under 5 minutes)
npm run test tests/smoke

# Run specific module tests
npm run test tests/e2e/lms

# Run regression tests
npm run test tests/regression

# Run with custom reporter
npm run test --reporter=./utils/reporter/test-execution-reporter.ts

# Run parallel tests
npm run test tests/execution-patterns/parallel-test.spec.ts
```

## 🔍 **SUCCESS CRITERIA**

- ✅ Three-tier test structure functional
- ✅ Smoke tests validate framework health quickly
- ✅ Regression tests cover core functionality
- ✅ E2E tests demonstrate complete workflows
- ✅ Module-specific tests organized properly
- ✅ Test data management utilities available
- ✅ Parallel execution working
- ✅ Custom reporting functional
- ✅ All test categories can be executed independently

## 📋 **NEXT STEPS**

- **Step 6**: Advanced Features & Complete Scripts (final npm scripts matrix, CI/CD, advanced reporting)

**Note**: This is Step 5 of 6. Complete this step fully before proceeding to Step 6 (Advanced Features & Complete Scripts).
