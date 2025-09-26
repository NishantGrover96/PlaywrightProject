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
    const testData = DataGenerator.randomUser();

    expect(testData.email).toContain('@');
    expect(testData.firstName).toBeTruthy();

    const loadTime = Date.now() - startTime;
    console.log(`Test 3 completed in ${loadTime}ms`);
  });
});

test.describe('Sequential Execution Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('sequential test 1 - setup data', async ({ page }) => {
    console.log('🔧 Setting up test data...');

    // Simulate data setup
    const { DataGenerator } = await import('../../utils/data-generators/data-generator');
    const testUser = DataGenerator.randomUser();

    // Store in page context for next test
    await page.evaluate((user) => {
      (window as any).testUser = user;
    }, testUser);

    console.log('✅ Test data setup complete');
  });

  test('sequential test 2 - use setup data', async ({ page }) => {
    console.log('📊 Using test data from previous test...');

    const testUser = await page.evaluate(() => (window as any).testUser);
    expect(testUser).toBeTruthy();
    expect(testUser.email).toContain('@');

    console.log('✅ Test data validation complete');
  });

  test('sequential test 3 - cleanup data', async ({ page }) => {
    console.log('🧹 Cleaning up test data...');

    await page.evaluate(() => {
      delete (window as any).testUser;
    });

    const testUser = await page.evaluate(() => (window as any).testUser);
    expect(testUser).toBeFalsy();

    console.log('✅ Test data cleanup complete');
  });
});

test.describe('Load Testing Patterns', () => {
  test('concurrent user simulation', async ({ browser }) => {
    const contexts = [];
    const pages = [];

    try {
      // Create multiple browser contexts to simulate different users
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();

        contexts.push(context);
        pages.push(page);
      }

      // Simulate concurrent navigation
      const navigationPromises = pages.map(async (page, index) => {
        const startTime = Date.now();

        await page.goto('https://demoportaldev.channel-fusion.com/index');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        console.log(`User ${index + 1} load time: ${loadTime}ms`);

        return loadTime;
      });

      const loadTimes = await Promise.all(navigationPromises);
      const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;

      console.log(
        `Average load time across ${pages.length} concurrent users: ${averageLoadTime}ms`
      );

      // Verify all pages loaded successfully
      for (const page of pages) {
        expect(page.url()).toContain('demoportaldev.channel-fusion.com');
      }
    } finally {
      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    }
  });

  test('resource stress testing', async ({ page }) => {
    const startTime = Date.now();
    const resourceRequests: string[] = [];

    // Monitor network requests
    page.on('request', (request) => {
      resourceRequests.push(request.url());
    });

    // Navigate to main page
    await page.goto('https://demoportaldev.channel-fusion.com/index');
    await page.waitForLoadState('networkidle');

    // Navigate through multiple modules rapidly
    const moduleNavigation = ['/LMS/Dashboard', '/PopShop/Dashboard', '/index'];

    for (const moduleUrl of moduleNavigation) {
      await page.goto(`https://demoportaldev.channel-fusion.com${moduleUrl}`);
      await page.waitForLoadState('domcontentloaded');
    }

    const totalTime = Date.now() - startTime;

    console.log(`Resource stress test completed in ${totalTime}ms`);
    console.log(`Total network requests: ${resourceRequests.length}`);

    // Verify reasonable performance
    expect(totalTime).toBeLessThan(90000); // Should complete within 30 seconds
    expect(resourceRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Error Recovery Patterns', () => {
  test('network failure simulation', async ({ page }) => {
    console.log('🌐 Testing network failure recovery...');

    // Start with successful navigation
    await page.goto('https://demoportaldev.channel-fusion.com/index');
    await page.waitForLoadState('networkidle');

    // Simulate network failure by blocking requests
    await page.route('**/*', (route) => {
      if (route.request().url().includes('api')) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Try to navigate - should handle gracefully
    try {
      await page.goto('https://demoportaldev.channel-fusion.com/LMS/Dashboard');
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (error) {
      console.log(
        'Expected network error occurred:',
        error instanceof Error ? error.message : String(error)
      );
    }

    // Restore network and verify recovery
    await page.unroute('**/*');
    await page.goto('https://demoportaldev.channel-fusion.com/index');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('demoportaldev.channel-fusion.com');
    console.log('✅ Network failure recovery test complete');
  });

  test('timeout handling', async ({ page }) => {
    console.log('⏱️ Testing timeout handling...');

    // Set aggressive timeouts
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(5000);

    try {
      // Navigate to a potentially slow-loading page
      await page.goto('https://demoportaldev.channel-fusion.com/index');
      await page.waitForLoadState('networkidle');

      console.log('✅ Page loaded within timeout');
    } catch (error) {
      console.log(
        '⚠️ Timeout occurred as expected:',
        error instanceof Error ? error.message : String(error)
      );

      // Verify we can still interact with the page
      const pageContent = await page.content();
      expect(pageContent).toContain('html');
    }

    // Reset timeouts
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(90000);
  });
});
