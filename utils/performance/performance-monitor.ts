import { Page, Browser, BrowserContext } from '@playwright/test';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export interface PerformanceMetrics {
  testName: string;
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  networkRequests: number;
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timestamp: string;
}

export interface SystemMetrics {
  totalMemory: number;
  freeMemory: number;
  cpuCount: number;
  loadAverage: number[];
  platform: string;
  nodeVersion: string;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static systemMetrics: SystemMetrics;
  private static startTime: number;
  private static testStartTime: number;

  static initialize(): void {
    this.startTime = Date.now();
    this.systemMetrics = {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
    };

    console.log('⚡ Performance Monitor initialized');
    console.log(`   System: ${this.systemMetrics.platform} (${this.systemMetrics.cpuCount} cores)`);
    console.log(`   Memory: ${Math.round(this.systemMetrics.totalMemory / 1024 / 1024 / 1024)}GB total`);
    console.log(`   Node.js: ${this.systemMetrics.nodeVersion}`);
    console.log('');
  }

  static startTest(testName: string): void {
    this.testStartTime = Date.now();
    console.log(`⏱️  Starting performance tracking for: ${testName}`);
  }

  static async endTest(testName: string, page?: Page): Promise<PerformanceMetrics> {
    const endTime = Date.now();
    const duration = endTime - this.testStartTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    // Get CPU usage (approximation)
    const cpuUsage = process.cpuUsage();

    // Get network metrics if page is available
    let networkRequests = 0;
    let pageLoadTime = 0;
    let domContentLoaded = 0;
    let firstContentfulPaint: number | undefined;
    let largestContentfulPaint: number | undefined;

    if (page) {
      try {
        // Get navigation timing
        const performanceMetrics = await page.evaluate(() => {
          const timing = performance.timing;
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          return {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstContentfulPaint: navigation.responseStart - navigation.fetchStart,
            largestContentfulPaint: navigation.loadEventEnd - navigation.fetchStart,
          };
        });

        pageLoadTime = performanceMetrics.pageLoadTime;
        domContentLoaded = performanceMetrics.domContentLoaded;
        firstContentfulPaint = performanceMetrics.firstContentfulPaint;
        largestContentfulPaint = performanceMetrics.largestContentfulPaint;

        // Count network requests (approximate)
        const resourceEntries = await page.evaluate(() => 
          performance.getEntriesByType('resource').length
        );
        networkRequests = resourceEntries;
      } catch (error) {
        console.warn(`⚠️  Could not collect page performance metrics: ${error}`);
      }
    }

    const metrics: PerformanceMetrics = {
      testName,
      duration,
      memoryUsage: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      networkRequests,
      pageLoadTime,
      domContentLoaded,
      firstContentfulPaint,
      largestContentfulPaint,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metrics);

    console.log(`✅ Performance tracking complete for: ${testName}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB heap`);
    console.log(`   Page Load: ${pageLoadTime}ms`);
    console.log('');

    return metrics;
  }

  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  static getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  static generateReport(): {
    summary: {
      totalTests: number;
      totalDuration: number;
      averageDuration: number;
      slowestTest: { name: string; duration: number; } | null;
      fastestTest: { name: string; duration: number; } | null;
      totalMemoryUsed: number;
      averageMemoryUsed: number;
      peakMemoryUsed: number;
    };
    details: PerformanceMetrics[];
    system: SystemMetrics;
  } {
    const totalTests = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    const slowestTest = this.metrics.reduce((prev, curr) => 
      (curr.duration > (prev?.duration || 0)) ? { name: curr.testName, duration: curr.duration } : prev,
      null as { name: string; duration: number; } | null
    );

    const fastestTest = this.metrics.reduce((prev, curr) => 
      (curr.duration < (prev?.duration || Infinity)) ? { name: curr.testName, duration: curr.duration } : prev,
      null as { name: string; duration: number; } | null
    );

    const memoryUsages = this.metrics.map(m => m.memoryUsage.heapUsed);
    const totalMemoryUsed = memoryUsages.reduce((sum, mem) => sum + mem, 0);
    const averageMemoryUsed = memoryUsages.length > 0 ? totalMemoryUsed / memoryUsages.length : 0;
    const peakMemoryUsed = Math.max(...memoryUsages, 0);

    return {
      summary: {
        totalTests,
        totalDuration,
        averageDuration: Math.round(averageDuration),
        slowestTest,
        fastestTest,
        totalMemoryUsed,
        averageMemoryUsed: Math.round(averageMemoryUsed),
        peakMemoryUsed,
      },
      details: this.metrics,
      system: this.systemMetrics,
    };
  }

  static async saveReport(outputDir: string = 'test-results'): Promise<string> {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `performance-report-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    console.log(`📊 Performance report saved: ${filepath}`);
    return filepath;
  }

  static displaySummary(): void {
    const report = this.generateReport();
    const { summary } = report;

    console.log('\n⚡ PERFORMANCE SUMMARY');
    console.log('════════════════════════════════════════════');
    console.log(`📊 Total Tests: ${summary.totalTests}`);
    console.log(`⏱️  Total Duration: ${Math.round(summary.totalDuration / 1000)}s`);
    console.log(`📈 Average Duration: ${summary.averageDuration}ms`);
    
    if (summary.slowestTest) {
      console.log(`🐌 Slowest Test: ${summary.slowestTest.name} (${summary.slowestTest.duration}ms)`);
    }
    
    if (summary.fastestTest) {
      console.log(`⚡ Fastest Test: ${summary.fastestTest.name} (${summary.fastestTest.duration}ms)`);
    }

    console.log(`💾 Average Memory: ${Math.round(summary.averageMemoryUsed / 1024 / 1024)}MB`);
    console.log(`📊 Peak Memory: ${Math.round(summary.peakMemoryUsed / 1024 / 1024)}MB`);
    console.log('════════════════════════════════════════════\n');
  }

  static reset(): void {
    this.metrics = [];
    console.log('🧹 Performance metrics reset');
  }
}

export class ResourceOptimizer {
  static async optimizeBrowserContext(context: BrowserContext): Promise<void> {
    // Disable images and CSS for faster loading in headless mode
    await context.route('**/*.{png,jpg,jpeg,gif,svg,css}', route => {
      if (process.env.HEADLESS === 'true' && process.env.OPTIMIZE_RESOURCES === 'true') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Block unnecessary requests
    await context.route('**/*.{woff,woff2,ttf,eot}', route => {
      if (process.env.OPTIMIZE_RESOURCES === 'true') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Block analytics and tracking
    await context.route('**/analytics/**', route => route.abort());
    await context.route('**/gtag/**', route => route.abort());
    await context.route('**/googletagmanager.com/**', route => route.abort());
    await context.route('**/google-analytics.com/**', route => route.abort());

    console.log('🚀 Browser context optimized for performance');
  }

  static async optimizePage(page: Page): Promise<void> {
    // Set aggressive timeouts for performance testing
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(90000);

    // Disable animations
    await page.addInitScript(() => {
      // Disable CSS animations and transitions
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    });

    console.log('⚡ Page optimized for performance');
  }
}

export class ParallelExecutionOptimizer {
  static calculateOptimalWorkers(): number {
    const cpuCount = os.cpus().length;
    const totalMemory = os.totalmem();
    const availableMemory = os.freemem();

    // Calculate based on available resources
    const memoryBasedWorkers = Math.floor(availableMemory / (512 * 1024 * 1024)); // 512MB per worker
    const cpuBasedWorkers = Math.max(1, cpuCount - 1); // Leave one core free

    const optimalWorkers = Math.min(
      memoryBasedWorkers,
      cpuBasedWorkers,
      8 // Cap at 8 workers
    );

    console.log(`🧮 Calculated optimal workers: ${optimalWorkers}`);
    console.log(`   Based on: ${cpuCount} CPUs, ${Math.round(totalMemory / 1024 / 1024 / 1024)}GB total memory`);
    
    return Math.max(1, optimalWorkers);
  }

  static getRecommendedConfig(): {
    workers: number;
    retries: number;
    timeout: number;
    fullyParallel: boolean;
  } {
    const workers = this.calculateOptimalWorkers();
    
    return {
      workers,
      retries: workers > 1 ? 1 : 2, // Fewer retries with more workers
      timeout: 60000, // 1 minute timeout
      fullyParallel: true,
    };
  }
}

export default {
  PerformanceMonitor,
  ResourceOptimizer,
  ParallelExecutionOptimizer,
};
