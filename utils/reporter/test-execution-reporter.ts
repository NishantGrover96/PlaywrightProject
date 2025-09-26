import { FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { DateHelper } from '../helpers/date-helper';

interface TestResultData {
  title: string;
  status: string;
  duration: number;
  file: string;
  line: number;
  category: string;
  startTime: Date;
  endTime: Date;
  error?: string;
}

export default class TestExecutionReporter implements Reporter {
  private testResults: TestResultData[] = [];
  private suiteStartTime: Date = new Date();
  private currentSuite: string = '';

  onBegin(config: any, suite: Suite) {
    this.suiteStartTime = new Date();
    console.log(`🚀 Starting test execution with ${suite.allTests().length} tests`);
    console.log(`📅 Execution started at: ${this.suiteStartTime.toLocaleString()}`);
    console.log(`🌍 Environment: ${process.env.ENV || 'dev'}`);
    console.log(`👤 Client: ${process.env.CLIENT || 'demo'}`);
    console.log(`🔧 Workers: ${config.workers || 1}`);
    console.log('─'.repeat(80));
  }

  onTestBegin(test: TestCase, result: TestResult) {
    // Determine test category based on file path
    const category = this.getTestCategory(test.location.file);
    this.currentSuite = test.parent.title;

    console.log(`▶️  Starting [${category}]: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;
    const category = this.getTestCategory(test.location.file);
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - duration);

    const testResultData: TestResultData = {
      title: test.title,
      status: status,
      duration: duration,
      file: test.location.file,
      line: test.location.line,
      category: category,
      startTime: startTime,
      endTime: endTime,
      error: result.error?.message,
    };

    this.testResults.push(testResultData);

    const statusIcon = this.getStatusIcon(status);
    const durationColor = duration > 10000 ? '🐌' : duration > 5000 ? '⚡' : '🚀';

    console.log(`${statusIcon} [${category}] ${test.title} - ${duration}ms ${durationColor}`);

    if (result.error) {
      console.log(`   ❌ Error: ${result.error.message}`);
    }
  }

  onEnd(result: FullResult) {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.suiteStartTime.getTime();

    console.log('─'.repeat(80));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('─'.repeat(80));

    this.printOverallStats(totalDuration);
    this.printCategoryBreakdown();
    this.printPerformanceMetrics();
    this.printSlowTests();
    this.printFailedTests();

    console.log('─'.repeat(80));
    console.log(`🏁 Execution completed at: ${endTime.toLocaleString()}`);
    console.log(`⏱️  Total execution time: ${this.formatDuration(totalDuration)}`);

    // Generate detailed report file
    this.generateDetailedReport();
  }

  private getTestCategory(filePath: string): string {
    if (filePath.includes('/smoke/')) return 'SMOKE';
    if (filePath.includes('/regression/')) return 'REGRESSION';
    if (filePath.includes('/e2e/')) return 'E2E';
    if (filePath.includes('/execution-patterns/')) return 'PATTERNS';
    return 'OTHER';
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'skipped':
        return '⚠️';
      case 'timedOut':
        return '⏰';
      default:
        return '❓';
    }
  }

  private printOverallStats(totalDuration: number) {
    const total = this.testResults.length;
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const skipped = this.testResults.filter((t) => t.status === 'skipped').length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

    console.log(`📈 Overall Results:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   🎯 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Total Duration: ${this.formatDuration(totalDuration)}`);
  }

  private printCategoryBreakdown() {
    const categories = ['SMOKE', 'REGRESSION', 'E2E', 'PATTERNS', 'OTHER'];

    console.log(`\n📂 Category Breakdown:`);

    categories.forEach((category) => {
      const categoryTests = this.testResults.filter((t) => t.category === category);
      if (categoryTests.length > 0) {
        const passed = categoryTests.filter((t) => t.status === 'passed').length;
        const failed = categoryTests.filter((t) => t.status === 'failed').length;
        const avgDuration =
          categoryTests.reduce((sum, t) => sum + t.duration, 0) / categoryTests.length;

        console.log(
          `   ${category}: ${passed}/${categoryTests.length} passed (avg: ${avgDuration.toFixed(0)}ms)`
        );
      }
    });
  }

  private printPerformanceMetrics() {
    if (this.testResults.length === 0) return;

    const durations = this.testResults.map((t) => t.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Average Test Duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Fastest Test: ${minDuration}ms`);
    console.log(`   Slowest Test: ${maxDuration}ms`);
  }

  private printSlowTests() {
    const slowTests = this.testResults
      .filter((t) => t.duration > 10000) // Tests taking more than 10 seconds
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (slowTests.length > 0) {
      console.log(`\n🐌 Slowest Tests:`);
      slowTests.forEach((test) => {
        console.log(`   ${test.title} (${test.category}) - ${test.duration}ms`);
      });
    }
  }

  private printFailedTests() {
    const failedTests = this.testResults.filter((t) => t.status === 'failed');

    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedTests.forEach((test) => {
        console.log(`   ${test.title} (${test.category})`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
        }
        console.log(`      File: ${test.file}:${test.line}`);
      });
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private generateDetailedReport() {
    const timestamp = DateHelper.getTimestampForFilename();
    const reportData = {
      executionSummary: {
        startTime: this.suiteStartTime.toISOString(),
        endTime: new Date().toISOString(),
        environment: process.env.ENV || 'dev',
        client: process.env.CLIENT || 'demo',
        totalTests: this.testResults.length,
        passed: this.testResults.filter((t) => t.status === 'passed').length,
        failed: this.testResults.filter((t) => t.status === 'failed').length,
        skipped: this.testResults.filter((t) => t.status === 'skipped').length,
      },
      categoryBreakdown: this.getCategoryStats(),
      testResults: this.testResults,
      performanceMetrics: this.getPerformanceStats(),
    };

    try {
      const fs = require('fs');
      const path = require('path');

      const reportsDir = path.join(process.cwd(), 'test-results', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const reportPath = path.join(reportsDir, `test-execution-${timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

      console.log(`📄 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.error('Failed to generate detailed report:', error);
    }
  }

  private getCategoryStats() {
    const categories = ['SMOKE', 'REGRESSION', 'E2E', 'PATTERNS', 'OTHER'];
    const stats: any = {};

    categories.forEach((category) => {
      const categoryTests = this.testResults.filter((t) => t.category === category);
      stats[category] = {
        total: categoryTests.length,
        passed: categoryTests.filter((t) => t.status === 'passed').length,
        failed: categoryTests.filter((t) => t.status === 'failed').length,
        skipped: categoryTests.filter((t) => t.status === 'skipped').length,
        avgDuration:
          categoryTests.length > 0
            ? categoryTests.reduce((sum, t) => sum + t.duration, 0) / categoryTests.length
            : 0,
      };
    });

    return stats;
  }

  private getPerformanceStats() {
    if (this.testResults.length === 0) {
      return { avgDuration: 0, maxDuration: 0, minDuration: 0 };
    }

    const durations = this.testResults.map((t) => t.duration);
    return {
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
    };
  }
}
