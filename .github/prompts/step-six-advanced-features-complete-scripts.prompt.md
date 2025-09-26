---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in advanced testing features and enterprise deployment. This is Step 6 of 6 for completing a comprehensive multi-client SaaS testing framework with full production readiness.
---

## 📌 **STEP 6: ADVANCED FEATURES & COMPLETE SCRIPTS**

### 🎯 **OBJECTIVE**

Complete the enterprise framework with comprehensive npm scripts matrix (160+ scripts), advanced reporting, CI/CD integration, performance optimization, and production-ready configurations for multi-client, multi-environment testing at scale.

### 📋 **PREREQUISITES**

- ✅ Step 1 (Project Foundation) completed
- ✅ Step 2 (Environment Configuration) completed
- ✅ Step 3 (Authentication Framework) completed
- ✅ Step 4 (Page Object Model & Utils) completed
- ✅ Step 5 (Test Organization & Structure) completed
- ✅ All test types functional and validated

## 🚀 **IMPLEMENTATION STEPS**

### **6.1 Complete NPM Scripts Matrix (160+ Scripts)**

Update **package.json** with comprehensive script matrix:

```json
{
  "scripts": {
    "// ============ BASE COMMANDS ============": "",
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:debug": "npx playwright test --debug",
    "report": "npx playwright show-report",
    "install:browsers": "npx playwright install",

    "// ============ ENVIRONMENT COMMANDS ============": "",
    "test:dev": "cross-env ENV=dev npx playwright test --config=configs/environments/playwright.config.dev.ts",
    "test:test": "cross-env ENV=test npx playwright test --config=configs/environments/playwright.config.test.ts",
    "test:uat": "cross-env ENV=uat npx playwright test --config=configs/environments/playwright.config.uat.ts",
    "test:prod": "cross-env ENV=prod npx playwright test --config=configs/environments/playwright.config.prod.ts",

    "// ============ CLIENT-ENVIRONMENT MATRIX ============": "",
    "test:demo:dev": "cross-env CLIENT=demo ENV=dev npx playwright test --config=configs/environments/playwright.config.dev.ts",
    "test:demo:test": "cross-env CLIENT=demo ENV=test npx playwright test --config=configs/environments/playwright.config.test.ts",
    "test:demo:uat": "cross-env CLIENT=demo ENV=uat npx playwright test --config=configs/environments/playwright.config.uat.ts",
    "test:demo:prod": "cross-env CLIENT=demo ENV=prod npx playwright test --config=configs/environments/playwright.config.prod.ts",

    "// Add similar patterns for other clients": "",
    "test:{client}:dev": "cross-env CLIENT={client} ENV=dev npx playwright test --config=configs/environments/playwright.config.dev.ts",
    "test:{client}:test": "cross-env CLIENT={client} ENV=test npx playwright test --config=configs/environments/playwright.config.test.ts",
    "test:{client}:uat": "cross-env CLIENT={client} ENV=uat npx playwright test --config=configs/environments/playwright.config.uat.ts",
    "test:{client}:prod": "cross-env CLIENT={client} ENV=prod npx playwright test --config=configs/environments/playwright.config.prod.ts",

    "// ============ TEST TYPE SPECIFIC ============": "",
    "test:smoke": "npx playwright test tests/smoke",
    "test:regression": "npx playwright test tests/regression",
    "test:e2e": "npx playwright test tests/e2e",
    "test:auth": "npx playwright test tests/auth-validation.spec.ts",

    "// ============ CLIENT-ENV-TYPE COMBINATIONS ============": "",
    "test:demo:dev:smoke": "cross-env CLIENT=demo ENV=dev npx playwright test tests/smoke --config=configs/environments/playwright.config.dev.ts",
    "test:demo:dev:regression": "cross-env CLIENT=demo ENV=dev npx playwright test tests/regression --config=configs/environments/playwright.config.dev.ts",
    "test:demo:dev:e2e": "cross-env CLIENT=demo ENV=dev npx playwright test tests/e2e --config=configs/environments/playwright.config.dev.ts",

    "test:demo:test:smoke": "cross-env CLIENT=demo ENV=test npx playwright test tests/smoke --config=configs/environments/playwright.config.test.ts",
    "test:demo:test:regression": "cross-env CLIENT=demo ENV=test npx playwright test tests/regression --config=configs/environments/playwright.config.test.ts",
    "test:demo:test:e2e": "cross-env CLIENT=demo ENV=test npx playwright test tests/e2e --config=configs/environments/playwright.config.test.ts",

    "test:demo:uat:smoke": "cross-env CLIENT=demo ENV=uat npx playwright test tests/smoke --config=configs/environments/playwright.config.uat.ts",
    "test:demo:uat:regression": "cross-env CLIENT=demo ENV=uat npx playwright test tests/regression --config=configs/environments/playwright.config.uat.ts",
    "test:demo:uat:e2e": "cross-env CLIENT=demo ENV=uat npx playwright test tests/e2e --config=configs/environments/playwright.config.uat.ts",

    "// ============ MODULE SPECIFIC ============": "",
    "test:module:lms": "npx playwright test tests/e2e/lms",
    "test:module:brand-shop": "npx playwright test tests/e2e/brand-shop",
    "test:module:lms:demo": "cross-env CLIENT=demo npx playwright test tests/e2e/lms",
    "test:module:brand-shop:demo": "cross-env CLIENT=demo npx playwright test tests/e2e/brand-shop",

    "// ============ ROLE-BASED TESTING ============": "",
    "test:role:admin": "cross-env ROLE=admin npx playwright test",
    "test:role:dealer": "cross-env ROLE=dealer npx playwright test",
    "test:role:distributor": "cross-env ROLE=distributor npx playwright test",

    "// ============ BROWSER SPECIFIC ============": "",
    "test:chrome": "cross-env BROWSER=chrome npx playwright test",
    "test:firefox": "cross-env BROWSER=firefox npx playwright test",
    "test:safari": "cross-env BROWSER=webkit npx playwright test",
    "test:edge": "cross-env BROWSER=msedge npx playwright test",

    "// ============ EXECUTION MODES ============": "",
    "test:headed": "npx playwright test --headed",
    "test:headless": "npx playwright test --headless",
    "test:parallel": "npx playwright test --workers=4",
    "test:sequential": "npx playwright test --workers=1",
    "test:debug": "npx playwright test --debug",
    "test:trace": "npx playwright test --trace=on",

    "// ============ REPORTING VARIANTS ============": "",
    "test:report:html": "npx playwright test --reporter=html",
    "test:report:json": "npx playwright test --reporter=json",
    "test:report:junit": "npx playwright test --reporter=junit",
    "test:report:custom": "npx playwright test --reporter=./utils/reporter/test-execution-reporter.ts",

    "// ============ CI/CD COMMANDS ============": "",
    "test:ci": "cross-env CI=true npx playwright test --reporter=json,junit",
    "test:ci:smoke": "cross-env CI=true npx playwright test tests/smoke --reporter=json,junit",
    "test:ci:parallel": "cross-env CI=true npx playwright test --workers=4 --reporter=json,junit",

    "// ============ MAINTENANCE COMMANDS ============": "",
    "setup": "npm install && npx playwright install",
    "setup:auth": "npx playwright test fixtures/global-fixtures/auth.setup.ts",
    "clean": "rimraf test-results playwright-report *.xml *.json",
    "clean:cache": "rimraf fixtures/global-fixtures/auth-*.json",
    "clean:all": "npm run clean && npm run clean:cache",

    "// ============ DEVELOPMENT COMMANDS ============": "",
    "dev:install": "npm install && npx playwright install && npm run setup:auth",
    "dev:smoke": "npm run test:demo:dev:smoke",
    "dev:check": "npm run lint && npm run format:check && npm run test:smoke",

    "// ============ UTILITY COMMANDS ============": "",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "npx tsc --noEmit",

    "// ============ SHOWCASE COMMAND ============": "",
    "showcase": "npm run clean && npm run test:demo:dev:smoke --reporter=html && npm run report"
  }
}
```

### **6.2 Advanced Configuration Management**

Create **configs/advanced/execution-config.ts**:

```typescript
export interface ExecutionConfig {
  environment: string;
  client: string;
  testType: 'smoke' | 'regression' | 'e2e';
  browser: string;
  headless: boolean;
  workers: number;
  retries: number;
  timeout: number;
  role?: string;
}

export class ConfigManager {
  static getExecutionConfig(): ExecutionConfig {
    return {
      environment: process.env.ENV || 'dev',
      client: process.env.CLIENT || 'demo',
      testType: (process.env.TEST_TYPE as any) || 'smoke',
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      workers: parseInt(process.env.WORKERS || '2'),
      retries: parseInt(process.env.RETRIES || '1'),
      timeout: parseInt(process.env.TIMEOUT || '90000'),
      role: process.env.ROLE || 'admin',
    };
  }

  static logExecutionConfig(): void {
    const config = this.getExecutionConfig();
    console.log('🔧 Execution Configuration:');
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Client: ${config.client}`);
    console.log(`   Test Type: ${config.testType}`);
    console.log(`   Browser: ${config.browser}`);
    console.log(`   Headless: ${config.headless}`);
    console.log(`   Workers: ${config.workers}`);
    console.log(`   Retries: ${config.retries}`);
    console.log(`   Timeout: ${config.timeout}ms`);
    console.log(`   Role: ${config.role}\n`);
  }

  static validateConfig(): boolean {
    const config = this.getExecutionConfig();
    const validEnvironments = ['dev', 'test', 'uat', 'prod'];
    const validTestTypes = ['smoke', 'regression', 'e2e'];
    const validBrowsers = ['chromium', 'firefox', 'webkit', 'chrome', 'edge'];

    if (!validEnvironments.includes(config.environment)) {
      console.error(`❌ Invalid environment: ${config.environment}`);
      return false;
    }

    if (!validTestTypes.includes(config.testType)) {
      console.error(`❌ Invalid test type: ${config.testType}`);
      return false;
    }

    if (!validBrowsers.includes(config.browser)) {
      console.error(`❌ Invalid browser: ${config.browser}`);
      return false;
    }

    return true;
  }
}
```

### **6.3 Enhanced Reporting System**

Create **utils/reporter/enhanced-reporter.ts**:

```typescript
import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  successRate: number;
}

interface ModuleMetrics {
  [moduleName: string]: TestMetrics;
}

export default class EnhancedReporter implements Reporter {
  private testResults: any[] = [];
  private startTime: number = 0;
  private moduleMetrics: ModuleMetrics = {};

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    const totalTests = suite.allTests().length;

    console.log('\n🚀 Framework Execution Starting...');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`🌍 Environment: ${process.env.ENV || 'dev'}`);
    console.log(`🏢 Client: ${process.env.CLIENT || 'demo'}`);
    console.log(`👤 Role: ${process.env.ROLE || 'admin'}`);
    console.log(`🌐 Browser: ${process.env.BROWSER || 'chromium'}`);
    console.log('─'.repeat(60));
  }

  onTestBegin(test: TestCase) {
    const module = this.extractModuleFromTest(test);
    console.log(`▶️  [${module}] ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const module = this.extractModuleFromTest(test);
    const status = result.status;
    const duration = result.duration;

    // Initialize module metrics if not exists
    if (!this.moduleMetrics[module]) {
      this.moduleMetrics[module] = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        duration: 0,
        successRate: 0,
      };
    }

    // Update metrics
    this.moduleMetrics[module].total++;
    this.moduleMetrics[module].duration += duration;

    switch (status) {
      case 'passed':
        this.moduleMetrics[module].passed++;
        break;
      case 'failed':
        this.moduleMetrics[module].failed++;
        break;
      case 'skipped':
        this.moduleMetrics[module].skipped++;
        break;
      case 'timedOut':
        this.moduleMetrics[module].failed++;
        break;
    }

    // Store individual test result
    this.testResults.push({
      title: test.title,
      module: module,
      status: status,
      duration: duration,
      file: test.location.file,
      line: test.location.line,
      error: result.error?.message || null,
    });

    const statusIcon = this.getStatusIcon(status);
    const durationStr = `${duration}ms`.padStart(8);
    console.log(`${statusIcon} [${module}] ${test.title} - ${durationStr}`);
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(80));
    console.log('📋 EXECUTION SUMMARY');
    console.log('='.repeat(80));

    // Calculate overall metrics
    const overallMetrics = this.calculateOverallMetrics();
    this.printOverallMetrics(overallMetrics, totalDuration);

    // Print module breakdown
    console.log('\n📊 MODULE BREAKDOWN:');
    console.log('-'.repeat(80));
    this.printModuleMetrics();

    // Print failed tests
    const failedTests = this.testResults.filter((t) => t.status === 'failed');
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('-'.repeat(80));
      failedTests.forEach((test) => {
        console.log(`   • [${test.module}] ${test.title}`);
        if (test.error) {
          console.log(`     Error: ${test.error.split('\n')[0]}`);
        }
      });
    }

    // Generate JSON report
    this.generateJsonReport(overallMetrics, totalDuration);

    // Print final status
    const finalStatus = overallMetrics.successRate >= 90 ? '✅ SUCCESS' : '❌ FAILED';
    console.log(
      `\n🏆 Final Status: ${finalStatus} (${overallMetrics.successRate.toFixed(2)}% success rate)`
    );
    console.log('='.repeat(80));
  }

  private extractModuleFromTest(test: TestCase): string {
    const filePath = test.location.file;

    if (filePath.includes('/smoke/')) return 'Smoke';
    if (filePath.includes('/regression/')) return 'Regression';
    if (filePath.includes('/e2e/lms/')) return 'LMS';
    if (filePath.includes('/e2e/brand-shop/')) return 'Brand Shop';
    if (filePath.includes('/e2e/user-workflows/')) return 'User Workflows';
    if (filePath.includes('/auth/')) return 'Authentication';

    return 'Framework';
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'skipped':
        return '⏭️';
      case 'timedOut':
        return '⏰';
      default:
        return '❓';
    }
  }

  private calculateOverallMetrics(): TestMetrics {
    const total = this.testResults.length;
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const skipped = this.testResults.filter((t) => t.status === 'skipped').length;
    const duration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      flaky: 0,
      duration,
      successRate,
    };
  }

  private printOverallMetrics(metrics: TestMetrics, totalDuration: number): void {
    console.log(`📈 Total Tests: ${metrics.total}`);
    console.log(`✅ Passed: ${metrics.passed}`);
    console.log(`❌ Failed: ${metrics.failed}`);
    console.log(`⏭️ Skipped: ${metrics.skipped}`);
    console.log(`🎯 Success Rate: ${metrics.successRate.toFixed(2)}%`);
    console.log(`⏱️ Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Avg Test Duration: ${(metrics.duration / metrics.total).toFixed(0)}ms`);
  }

  private printModuleMetrics(): void {
    Object.entries(this.moduleMetrics).forEach(([module, metrics]) => {
      const successRate = metrics.total > 0 ? (metrics.passed / metrics.total) * 100 : 0;
      const avgDuration = metrics.total > 0 ? (metrics.duration / metrics.total).toFixed(0) : '0';

      console.log(
        `📁 ${module.padEnd(20)} | ` +
          `Total: ${metrics.total.toString().padStart(3)} | ` +
          `✅ ${metrics.passed.toString().padStart(3)} | ` +
          `❌ ${metrics.failed.toString().padStart(3)} | ` +
          `📈 ${successRate.toFixed(1).padStart(5)}% | ` +
          `⏱️ ${avgDuration.padStart(6)}ms avg`
      );
    });
  }

  private generateJsonReport(metrics: TestMetrics, totalDuration: number): void {
    const report = {
      execution: {
        timestamp: new Date().toISOString(),
        environment: process.env.ENV || 'dev',
        client: process.env.CLIENT || 'demo',
        role: process.env.ROLE || 'admin',
        browser: process.env.BROWSER || 'chromium',
        totalDuration: totalDuration,
        framework: 'Playwright Enterprise Framework',
      },
      summary: metrics,
      modules: this.moduleMetrics,
      tests: this.testResults,
    };

    const reportPath = path.join('test-results', 'enhanced-report.json');

    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Enhanced report generated: ${reportPath}`);
  }
}
```

### **6.4 CI/CD Integration**

Create **ci/azure-pipelines/azure-pipelines.yml**:

```yaml
# Azure DevOps Pipeline for Playwright Enterprise Framework
trigger:
  branches:
    include:
      - main
      - develop
      - release/*

variables:
  nodeVersion: '18.x'

stages:
  - stage: Test
    displayName: 'Run Playwright Tests'
    jobs:
      - job: SmokeTests
        displayName: 'Smoke Tests'
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          matrix:
            Demo_Dev:
              CLIENT: 'demo'
              ENV: 'dev'
            Demo_Test:
              CLIENT: 'demo'
              ENV: 'test'
        steps:
          - template: templates/playwright-test-template.yml
            parameters:
              testCommand: 'npm run test:$(CLIENT):$(ENV):smoke'

      - job: RegressionTests
        displayName: 'Regression Tests'
        dependsOn: SmokeTests
        condition: succeeded()
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          matrix:
            Demo_Dev:
              CLIENT: 'demo'
              ENV: 'dev'
        steps:
          - template: templates/playwright-test-template.yml
            parameters:
              testCommand: 'npm run test:$(CLIENT):$(ENV):regression'

      - job: E2ETests
        displayName: 'E2E Tests'
        dependsOn: RegressionTests
        condition: succeeded()
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          matrix:
            Demo_UAT:
              CLIENT: 'demo'
              ENV: 'uat'
        steps:
          - template: templates/playwright-test-template.yml
            parameters:
              testCommand: 'npm run test:$(CLIENT):$(ENV):e2e'
```

Create **ci/azure-pipelines/templates/playwright-test-template.yml**:

```yaml
# Reusable template for Playwright test execution
parameters:
  - name: testCommand
    type: string

steps:
  - task: NodeTool@0
    displayName: 'Install Node.js'
    inputs:
      versionSpec: '$(nodeVersion)'

  - script: |
      npm ci
      npx playwright install --with-deps
    displayName: 'Install dependencies'

  - script: |
      ${{ parameters.testCommand }}
    displayName: 'Run Playwright Tests'
    env:
      CLIENT: $(CLIENT)
      ENV: $(ENV)
      CI: true

  - task: PublishTestResults@2
    displayName: 'Publish Test Results'
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'junit-results.xml'
      failTaskOnFailedTests: true
    condition: always()

  - task: PublishHtmlReport@1
    displayName: 'Publish HTML Report'
    inputs:
      reportDir: 'playwright-report'
    condition: always()

  - script: |
      cp test-results/enhanced-report.json $(Agent.TempDirectory)/enhanced-report-$(CLIENT)-$(ENV).json
    displayName: 'Archive Enhanced Report'
    condition: always()

  - task: PublishBuildArtifacts@1
    displayName: 'Publish Enhanced Reports'
    inputs:
      pathToPublish: '$(Agent.TempDirectory)'
      artifactName: 'test-reports'
    condition: always()
```

### **6.5 Performance Optimization**

Create **utils/performance/performance-monitor.ts**:

```typescript
import { Page } from '@playwright/test';

export class PerformanceMonitor {
  static async measurePageLoad(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        timeToInteractive: navigation.loadEventEnd - navigation.fetchStart,
        totalSize: navigation.transferSize || 0,
      };
    });
  }

  static async measureTestExecution<T>(
    testName: string,
    testFunction: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();

    console.log(`⏱️ Starting performance measurement for: ${testName}`);

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      console.log(`✅ ${testName} completed in ${duration}ms`);

      return { result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${testName} failed after ${duration}ms`);
      throw error;
    }
  }

  static async getMemoryUsage(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const memory = (performance as any).memory;
      return memory
        ? {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          }
        : null;
    });
  }
}
```

### **6.6 Advanced Test Execution Scripts**

Create **scripts/run-test-suite.js**:

```javascript
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestSuiteRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runTestSuite(client, environment, testTypes = ['smoke', 'regression']) {
    console.log(`🚀 Running test suite for ${client} in ${environment}`);

    for (const testType of testTypes) {
      const command = `npm run test:${client}:${environment}:${testType}`;
      console.log(`\n📋 Executing: ${command}`);

      try {
        const result = await this.executeCommand(command);
        this.results.push({
          client,
          environment,
          testType,
          status: 'passed',
          duration: result.duration,
          output: result.output,
        });
      } catch (error) {
        this.results.push({
          client,
          environment,
          testType,
          status: 'failed',
          duration: error.duration,
          error: error.message,
        });
      }
    }

    this.generateSummary();
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const process = spawn('npm', ['run', command.replace('npm run ', '')], {
        stdio: 'inherit',
        shell: true,
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          resolve({ duration, output: 'Success' });
        } else {
          reject({ duration, message: `Command failed with code ${code}` });
        }
      });
    });
  }

  generateSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(2)}%`);

    // Save results
    const reportPath = path.join('test-results', 'suite-summary.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          summary: { totalDuration, passed, failed },
          results: this.results,
        },
        null,
        2
      )
    );

    console.log(`📄 Suite summary saved: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const [client, environment, ...testTypes] = process.argv.slice(2);

  if (!client || !environment) {
    console.log('Usage: node run-test-suite.js <client> <environment> [testType1] [testType2]');
    console.log('Example: node run-test-suite.js demo dev smoke regression');
    process.exit(1);
  }

  const runner = new TestSuiteRunner();
  runner.runTestSuite(client, environment, testTypes.length ? testTypes : ['smoke']);
}

module.exports = TestSuiteRunner;
```

### **6.7 Documentation Generation**

Create **scripts/generate-docs.js**:

```javascript
const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor() {
    this.framework = {
      name: 'Playwright Enterprise Framework',
      version: '1.0.0',
      description: 'Multi-client SaaS testing framework with advanced authentication and module management'
    };
  }

  generateReadme() {
    const readme = `# ${this.framework.name}

${this.framework.description}

```

## 🎯 Features

- ✅ Multi-client architecture support
- ✅ Multi-environment configuration (dev/test/uat/prod)
- ✅ Advanced authentication with 20-minute session management
- ✅ Three-tier testing strategy (smoke/regression/e2e)
- ✅ Page Object Model with utilities framework
- ✅ 160+ npm scripts for comprehensive test execution
- ✅ CI/CD ready with Azure DevOps integration
- ✅ Advanced reporting and performance monitoring

## 🚀 Quick Start

\`\`\`bash

# Install dependencies

npm run setup

# Run smoke tests for demo client in dev environment

npm run test:demo:dev:smoke

# Run comprehensive test showcase

npm run showcase
\`\`\`

## 📋 Available Commands

### Basic Commands

\`\`\`bash
npm run test # Run all tests
npm run test:headed # Run with browser UI
npm run test:debug # Debug mode
npm run report # Show test report
\`\`\`

### Environment-Specific

\`\`\`bash
npm run test:dev # Dev environment
npm run test:test # Test environment  
npm run test:uat # UAT environment
npm run test:prod # Production environment
\`\`\`

### Client-Environment Matrix

\`\`\`bash
npm run test:demo:dev # Demo client in dev
npm run test:demo:test # Demo client in test
npm run test:demo:uat # Demo client in UAT
npm run test:demo:prod # Demo client in prod
\`\`\`

### Test Type Specific

\`\`\`bash
npm run test:smoke # Quick validation (2-5 min)
npm run test:regression # Core functionality (15-30 min)
npm run test:e2e # Complete workflows (30+ min)
\`\`\`

### Module-Specific

\`\`\`bash
npm run test:module:lms # LMS module tests
npm run test:module:brand-shop # Brand Shop module tests
\`\`\`

### Role-Based

\`\`\`bash
npm run test:role:admin # Admin role tests
npm run test:role:dealer # Dealer role tests
npm run test:role:distributor # Distributor role tests
\`\`\`

## 🏗️ Project Structure

\`\`\`
project-root/
├── configs/ # Configuration files
│ ├── clients/ # Client-specific configs
│ ├── environments/ # Environment-specific configs
│ ├── advanced/ # Advanced execution configs
│ └── endpoints/ # API endpoint configurations
├── pages/ # Page Object Model
│ ├── common/ # Login, Dashboard pages
│ └── modules/ # Module-specific pages
├── tests/ # Test files
│ ├── smoke/ # Smoke tests
│ ├── regression/ # Regression tests
│ ├── e2e/ # End-to-end tests
│ ├── setup/ # Setup and configuration tests
│ ├── execution-patterns/ # Parallel execution patterns
│ └── test-helpers/ # Test helper utilities
├── utils/ # Utilities framework
│ ├── assertions/ # Custom assertions
│ ├── data-generators/ # Test data generators
│ ├── helpers/ # Helper utilities
│ ├── selectors/ # Selector definitions
│ └── reporter/ # Custom reporters
├── fixtures/ # Test fixtures and data
│ ├── global-fixtures/ # Authentication sessions
│ └── test-data/ # Test data files
└── static_files/ # Static assets for testing
\`\`\`

## 📊 Reporting

The framework includes multiple reporting options:

- **HTML Report**: \`npm run report\`
- **JSON Report**: Generated automatically in test-results/
- **Enhanced Report**: Custom detailed reporting with module breakdown
- **JUnit Report**: For CI/CD integration

## 🔧 Configuration

### Environment Files

- \`.env.dev\` - Development environment
- \`.env.test\` - Test environment
- \`.env.uat\` - UAT environment
- \`.env.prod\` - Production environment

### Client Configuration

Edit \`configs/clients/client-modules-access.ts\` to add new clients or modify module access.

## 🚀 CI/CD Integration

The framework includes Azure DevOps pipeline configuration in \`ci/azure-pipelines/\`.

## AuthManager Class

### Methods

#### \`ensureAuthenticated(role: string = 'admin'): Promise<void>\`

Ensures user is authenticated with specified role. Handles session validation and refresh.

#### \`navigateToModule(moduleName: string): Promise<void>\`

Navigates to specific module with authentication check.

#### \`verifyModuleAccess(moduleName: string): Promise<boolean>\`

Verifies user has access to specified module.

## BasePage Class

### Methods

#### \`goto(path: string = ''): Promise<void>\`

Navigate to specific path with base URL resolution.

#### \`waitForPageLoad(): Promise<void>\`

Wait for page to fully load.

#### \`verifyElementVisible(selector: string): Promise<void>\`

Verify element is visible on page.

## Environment Helper

### Methods

#### \`getUrlsForClient(clientId: string, environment?: string)\`

Get environment-specific URLs for client.

#### \`getClientConfig(clientId: string): ClientConfig\`

Get complete client configuration.

#### \`getClientModules(clientId: string): ModuleConfig[]\`

Get available modules for client.
`;

    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/api.md', apiDocs);
    console.log('✅ API documentation generated');

}

generateAll() {
console.log('📚 Generating documentation...');
this.generateReadme();
this.generateApiDocs();
console.log('✅ Documentation generation complete');
}
}

if (require.main === module) {
const generator = new DocumentationGenerator();
generator.generateAll();
}

module.exports = DocumentationGenerator;
`;

### **6.8 Final Validation Script**

Create **scripts/validate-framework.js**:

```javascript
const { spawn } = require('child_process');
const fs = require('fs');

class FrameworkValidator {
  async validateFramework() {
    console.log('🔍 Validating Playwright Enterprise Framework...');

    const validations = [
      { name: 'Dependencies', check: () => this.checkDependencies() },
      { name: 'Configuration', check: () => this.checkConfiguration() },
      { name: 'Authentication', check: () => this.runCommand('npm run test:auth') },
      { name: 'Smoke Tests', check: () => this.runCommand('npm run test:smoke') },
      {
        name: 'Framework Health',
        check: () => this.runCommand('npm run test tests/smoke/framework-health.spec.ts'),
      },
    ];

    let passed = 0;
    let failed = 0;

    for (const validation of validations) {
      console.log(`\n🧪 Validating ${validation.name}...`);

      try {
        await validation.check();
        console.log(`✅ ${validation.name} validation passed`);
        passed++;
      } catch (error) {
        console.log(`❌ ${validation.name} validation failed:`, error.message);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏆 FRAMEWORK VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / validations.length) * 100).toFixed(2)}%`);

    if (failed === 0) {
      console.log('\n🎉 Framework validation successful! Ready for production use.');
    } else {
      console.log('\n⚠️  Some validations failed. Please review and fix issues.');
    }
  }

  checkDependencies() {
    const requiredFiles = ['package.json', 'playwright.config.ts', 'tsconfig.json'];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    return true;
  }

  checkConfiguration() {
    const requiredDirs = [
      'configs/clients',
      'configs/environments',
      'pages/common',
      'tests/smoke',
      'utils/env',
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }

    return true;
  }

  runCommand(command) {
    return new Promise((resolve, reject) => {
      const process = spawn('npm', ['run', command.replace('npm run ', '')], {
        stdio: 'pipe',
        shell: true,
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
    });
  }
}

if (require.main === module) {
  const validator = new FrameworkValidator();
  validator.validateFramework();
}

module.exports = FrameworkValidator;
```

## 🎯 **FINAL VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] Complete npm scripts matrix (160+ scripts) implemented
- [ ] Advanced configuration management working
- [ ] Enhanced reporting system functional
- [ ] CI/CD pipeline configuration ready
- [ ] Performance monitoring utilities available
- [ ] Test suite execution scripts working
- [ ] Documentation auto-generation functional
- [ ] Framework validation script passes
- [ ] All components integrated and tested
- [ ] Production-ready deployment verified

## 🚀 **FINAL TESTING COMMANDS**

Validate the complete framework:

```bash
# Validate entire framework
npm run validate-framework

# Run complete showcase
npm run showcase

# Test client-environment-type matrix
npm run test:demo:dev:smoke
npm run test:demo:test:regression
npm run test:demo:uat:e2e

# Generate documentation
npm run generate:docs

# Run CI simulation
npm run test:ci:smoke
```

## 🏆 **SUCCESS CRITERIA - FRAMEWORK COMPLETION**

- ✅ **160+ npm scripts** covering all client+environment+test-type combinations
- ✅ **Advanced configuration** with environment detection and validation
- ✅ **Enhanced reporting** with module breakdown and performance metrics
- ✅ **CI/CD integration** ready for Azure DevOps deployment
- ✅ **Performance monitoring** for load time and execution metrics
- ✅ **Automated documentation** generation for maintenance
- ✅ **Framework validation** script confirms all components working
- ✅ **Production deployment** ready with full feature set
- ✅ **Scalable architecture** supports adding new clients/modules easily
- ✅ **Enterprise-grade** error handling, logging, and monitoring

## 🎉 **FRAMEWORK COMPLETION**

**Congratulations!** You have successfully created a comprehensive enterprise-grade Playwright testing framework with:

1. **Multi-Client Architecture** - Supports unlimited clients with isolated configurations
2. **Multi-Environment Support** - Dev/Test/UAT/Prod with environment-specific settings
3. **Advanced Authentication** - 20-minute session management with auto-refresh
4. **Three-Tier Testing** - Smoke/Regression/E2E with proper organization
5. **Page Object Model** - Scalable and maintainable page structure
6. **Comprehensive Utilities** - Helpers, assertions, data generators
7. **160+ NPM Scripts** - Complete execution matrix for all scenarios
8. **Enterprise Reporting** - Advanced analytics and CI/CD integration
9. **Performance Monitoring** - Load time tracking and optimization
10. **Production Ready** - CI/CD, validation, and deployment configurations
