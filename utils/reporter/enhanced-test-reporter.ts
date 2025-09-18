import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { PerformanceMonitor, ExecutionConfig } from '../../configs/advanced/execution-config';
import { DateHelper } from '../helpers/date-helper';

export interface DetailedTestResult extends TestResult {
  testCase: TestCase;
  performance?: {
    duration: number;
    retries: number;
    annotations: string[];
  };
}

export interface ExecutionSummary {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  environment: string;
  client: string;
  testType: string;
  browser: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  passRate: number;
  performance: {
    averageTestDuration: number;
    slowestTest: { name: string; duration: number; } | null;
    fastestTest: { name: string; duration: number; } | null;
    totalDuration: number;
  };
  categories: {
    smoke: { passed: number; failed: number; total: number; };
    regression: { passed: number; failed: number; total: number; };
    e2e: { passed: number; failed: number; total: number; };
  };
  artifacts: {
    htmlReport?: string;
    jsonReport?: string;
    junitReport?: string;
    customReport?: string;
  };
}

export class EnhancedTestReporter implements Reporter {
  private executionId: string;
  private startTime: Date;
  private results: DetailedTestResult[] = [];
  private config?: FullConfig;
  private outputDir: string;

  constructor() {
    this.executionId = `execution-${Date.now()}`;
    this.startTime = new Date();
    this.outputDir = process.env.OUTPUT_DIR || 'test-results';
  }

  onBegin(config: FullConfig): void {
    this.config = config;
    console.log(`\n🚀 Enhanced Test Execution Started`);
    console.log(`   Execution ID: ${this.executionId}`);
    console.log(`   Start Time: ${DateHelper.formatDate(this.startTime, 'DB')}`);
    console.log(`   Output Directory: ${this.outputDir}`);
    console.log(`   Total Projects: ${config.projects.length}`);
    console.log('');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const detailedResult: DetailedTestResult = {
      ...result,
      testCase: test,
      performance: {
        duration: result.duration,
        retries: result.retry,
        annotations: result.annotations.map(a => `${a.type}: ${a.description}`),
      },
    };

    this.results.push(detailedResult);

    // Real-time logging for important events
    if (result.status === 'failed') {
      console.log(`❌ FAILED: ${test.title} (${result.duration}ms)`);
      if (result.error?.message) {
        console.log(`   Error: ${result.error.message.substring(0, 100)}...`);
      }
    } else if (result.status === 'passed' && result.retry > 0) {
      console.log(`⚠️  FLAKY: ${test.title} (passed after ${result.retry} retries)`);
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    console.log(`\n🏁 Test Execution Complete`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   Status: ${result.status}`);

    // Generate comprehensive summary
    const summary = this.generateExecutionSummary(endTime, duration, result);

    // Save reports
    await this.saveReports(summary);

    // Display summary
    this.displaySummary(summary);

    // Log artifacts
    this.logArtifacts(summary);
  }

  private generateExecutionSummary(endTime: Date, duration: number, result: FullResult): ExecutionSummary {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const flaky = this.results.filter(r => r.retry > 0).length;
    const total = this.results.length;

    // Performance metrics
    const durations = this.results.map(r => r.duration);
    const averageTestDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    const slowestTest = this.results.reduce((prev, curr) => 
      (curr.duration > (prev?.duration || 0)) ? { name: curr.testCase.title, duration: curr.duration } : prev, 
      null as { name: string; duration: number; } | null
    );
    const fastestTest = this.results.reduce((prev, curr) => 
      (curr.duration < (prev?.duration || Infinity)) ? { name: curr.testCase.title, duration: curr.duration } : prev,
      null as { name: string; duration: number; } | null
    );

    // Categorize tests
    const categories = {
      smoke: this.categorizeTests('smoke'),
      regression: this.categorizeTests('regression'),
      e2e: this.categorizeTests('e2e'),
    };

    return {
      id: this.executionId,
      startTime: this.startTime,
      endTime,
      duration,
      environment: process.env.ENV || 'dev',
      client: process.env.CLIENT || 'demo',
      testType: process.env.TEST_TYPE || 'smoke',
      browser: process.env.BROWSER || 'chromium',
      totalTests: total,
      passed,
      failed,
      skipped,
      flaky,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      performance: {
        averageTestDuration: Math.round(averageTestDuration),
        slowestTest,
        fastestTest,
        totalDuration: duration,
      },
      categories,
      artifacts: {
        customReport: path.join(this.outputDir, `execution-report-${this.executionId}.json`),
      },
    };
  }

  private categorizeTests(category: string) {
    const categoryTests = this.results.filter(r => 
      r.testCase.location.file.includes(`/${category}/`) || 
      r.testCase.location.file.includes(`\\${category}\\`)
    );
    
    return {
      passed: categoryTests.filter(r => r.status === 'passed').length,
      failed: categoryTests.filter(r => r.status === 'failed').length,
      total: categoryTests.length,
    };
  }

  private async saveReports(summary: ExecutionSummary): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Save detailed JSON report
    const detailedReport = {
      summary,
      results: this.results.map(r => ({
        title: r.testCase.title,
        file: r.testCase.location.file,
        line: r.testCase.location.line,
        status: r.status,
        duration: r.duration,
        retries: r.retry,
        error: r.error?.message,
        annotations: r.performance?.annotations,
      })),
      timestamp: new Date().toISOString(),
    };

    const reportPath = path.join(this.outputDir, `execution-report-${this.executionId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

    // Save CI-friendly summary
    const ciSummary = {
      executionId: this.executionId,
      status: summary.failed === 0 ? 'SUCCESS' : 'FAILURE',
      passRate: summary.passRate,
      duration: Math.round(summary.duration / 1000),
      tests: {
        total: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        flaky: summary.flaky,
      },
      environment: summary.environment,
      client: summary.client,
      timestamp: summary.startTime.toISOString(),
    };

    const ciReportPath = path.join(this.outputDir, `ci-summary-${this.executionId}.json`);
    fs.writeFileSync(ciReportPath, JSON.stringify(ciSummary, null, 2));

    summary.artifacts.customReport = reportPath;
  }

  private displaySummary(summary: ExecutionSummary): void {
    console.log('\n📊 EXECUTION SUMMARY');
    console.log('════════════════════════════════════════════');
    console.log(`📋 Execution ID: ${summary.id}`);
    console.log(`🌍 Environment: ${summary.environment} (${summary.client})`);
    console.log(`🧪 Test Type: ${summary.testType}`);
    console.log(`🌐 Browser: ${summary.browser}`);
    console.log(`⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);
    console.log('');
    
    console.log('📈 TEST RESULTS');
    console.log('────────────────────────────────────────────');
    console.log(`✅ Passed: ${summary.passed}/${summary.totalTests} (${summary.passRate}%)`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(`⚠️  Flaky: ${summary.flaky}`);
    console.log('');

    console.log('🏷️  CATEGORIES');
    console.log('────────────────────────────────────────────');
    console.log(`💨 Smoke: ${summary.categories.smoke.passed}/${summary.categories.smoke.total} passed`);
    console.log(`🔄 Regression: ${summary.categories.regression.passed}/${summary.categories.regression.total} passed`);
    console.log(`🎯 E2E: ${summary.categories.e2e.passed}/${summary.categories.e2e.total} passed`);
    console.log('');

    console.log('⚡ PERFORMANCE');
    console.log('────────────────────────────────────────────');
    console.log(`📊 Average Test: ${summary.performance.averageTestDuration}ms`);
    if (summary.performance.slowestTest) {
      console.log(`🐌 Slowest: ${summary.performance.slowestTest.name} (${summary.performance.slowestTest.duration}ms)`);
    }
    if (summary.performance.fastestTest) {
      console.log(`⚡ Fastest: ${summary.performance.fastestTest.name} (${summary.performance.fastestTest.duration}ms)`);
    }
    console.log('');
  }

  private logArtifacts(summary: ExecutionSummary): void {
    console.log('📁 ARTIFACTS');
    console.log('────────────────────────────────────────────');
    if (summary.artifacts.customReport) {
      console.log(`📊 Custom Report: ${summary.artifacts.customReport}`);
    }
    if (summary.artifacts.htmlReport) {
      console.log(`🌐 HTML Report: ${summary.artifacts.htmlReport}`);
    }
    if (summary.artifacts.jsonReport) {
      console.log(`📋 JSON Report: ${summary.artifacts.jsonReport}`);
    }
    if (summary.artifacts.junitReport) {
      console.log(`🧪 JUnit Report: ${summary.artifacts.junitReport}`);
    }
    console.log('════════════════════════════════════════════\n');
  }
}

// Export for use in Playwright config
export default EnhancedTestReporter;
