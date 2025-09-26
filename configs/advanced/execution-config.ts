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
  outputDir?: string;
  reporter?: string[];
  trace?: boolean;
  video?: boolean;
  screenshot?: boolean;
}

export interface PerformanceMetrics {
  testDuration: number;
  averageTestTime: number;
  slowestTest: {
    name: string;
    duration: number;
  };
  fastestTest: {
    name: string;
    duration: number;
  };
  memoryUsage: number;
  cpuUsage: number;
}

export interface TestExecution {
  id: string;
  config: ExecutionConfig;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  results?: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
  performance?: PerformanceMetrics;
  artifacts?: {
    htmlReport?: string;
    jsonReport?: string;
    junitReport?: string;
    videos?: string[];
    screenshots?: string[];
    traces?: string[];
  };
}

export class ExecutionConfigManager {
  private static readonly DEFAULT_CONFIG: Partial<ExecutionConfig> = {
    browser: 'chromium',
    headless: true,
    workers: 4,
    retries: 2,
    timeout: 60000,
    trace: false,
    video: false,
    screenshot: true,
  };

  static createConfig(overrides: Partial<ExecutionConfig>): ExecutionConfig {
    const config = { ...this.DEFAULT_CONFIG, ...overrides } as ExecutionConfig;
    this.validateConfig(config);
    return config;
  }

  static validateConfig(config: ExecutionConfig): void {
    if (!config.environment) {
      throw new Error('Environment is required');
    }
    if (!config.client) {
      throw new Error('Client is required');
    }
    if (!config.testType) {
      throw new Error('Test type is required');
    }
    if (config.workers < 1 || config.workers > 8) {
      throw new Error('Workers must be between 1 and 8');
    }
    if (config.timeout < 10000 || config.timeout > 900000) {
      throw new Error('Timeout must be between 10s and 5min');
    }
  }

  static getConfigFromEnv(): Partial<ExecutionConfig> {
    return {
      environment: process.env.ENV || 'dev',
      client: process.env.CLIENT || 'demo',
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADED !== 'true',
      workers: parseInt(process.env.WORKERS || '4'),
      retries: parseInt(process.env.RETRIES || '2'),
      timeout: parseInt(process.env.TIMEOUT || '60000'),
      role: process.env.ROLE,
      trace: process.env.TRACE === 'true',
      video: process.env.VIDEO === 'true',
      screenshot: process.env.SCREENSHOT !== 'false',
    };
  }

  static getOutputDir(config: ExecutionConfig): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `test-results/${config.client}-${config.environment}-${config.testType}-${timestamp}`;
  }

  static getReporterConfig(config: ExecutionConfig): string[] {
    const reporters: string[] = [];

    if (process.env.CI === 'true') {
      reporters.push('json', 'junit');
    } else {
      reporters.push('html');
    }

    if (config.reporter) {
      reporters.push(...config.reporter);
    }

    return [...new Set(reporters)]; // Remove duplicates
  }

  static createExecutionId(config: ExecutionConfig): string {
    const timestamp = Date.now();
    return `${config.client}-${config.environment}-${config.testType}-${timestamp}`;
  }

  static logExecutionStart(config: ExecutionConfig): void {
    console.log(`🚀 Starting test execution:`);
    console.log(`   Client: ${config.client}`);
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Test Type: ${config.testType}`);
    console.log(`   Browser: ${config.browser}`);
    console.log(`   Mode: ${config.headless ? 'Headless' : 'Headed'}`);
    console.log(`   Workers: ${config.workers}`);
    console.log(`   Timeout: ${config.timeout}ms`);
    if (config.role) {
      console.log(`   Role: ${config.role}`);
    }
    console.log('');
  }
}

export class PerformanceMonitor {
  private static executions: Map<string, TestExecution> = new Map();

  static startExecution(config: ExecutionConfig): string {
    const id = ExecutionConfigManager.createExecutionId(config);
    const execution: TestExecution = {
      id,
      config,
      startTime: new Date(),
      status: 'running',
    };

    this.executions.set(id, execution);
    ExecutionConfigManager.logExecutionStart(config);

    return id;
  }

  static finishExecution(
    id: string,
    results: TestExecution['results'],
    performance?: PerformanceMetrics,
    artifacts?: TestExecution['artifacts']
  ): void {
    const execution = this.executions.get(id);
    if (!execution) return;

    execution.endTime = new Date();
    execution.status = results?.failed === 0 ? 'completed' : 'failed';
    execution.results = results;
    execution.performance = performance;
    execution.artifacts = artifacts;

    this.logExecutionSummary(execution);
  }

  static getExecution(id: string): TestExecution | undefined {
    return this.executions.get(id);
  }

  static getAllExecutions(): TestExecution[] {
    return Array.from(this.executions.values());
  }

  static getExecutionHistory(limit = 10): TestExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  private static logExecutionSummary(execution: TestExecution): void {
    const duration = execution.endTime
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : 0;

    console.log(`\n🏁 Execution Complete:`);
    console.log(`   ID: ${execution.id}`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   Status: ${execution.status}`);

    if (execution.results) {
      console.log(
        `   Results: ${execution.results.passed} passed, ${execution.results.failed} failed, ${execution.results.skipped} skipped`
      );
    }

    if (execution.performance) {
      console.log(
        `   Performance: Avg ${Math.round(execution.performance.averageTestTime)}ms per test`
      );
    }

    if (execution.artifacts) {
      console.log(`   Artifacts:`);
      if (execution.artifacts.htmlReport) {
        console.log(`     📊 HTML Report: ${execution.artifacts.htmlReport}`);
      }
      if (execution.artifacts.jsonReport) {
        console.log(`     📋 JSON Report: ${execution.artifacts.jsonReport}`);
      }
      if (execution.artifacts.videos?.length) {
        console.log(`     🎥 Videos: ${execution.artifacts.videos.length} files`);
      }
      if (execution.artifacts.screenshots?.length) {
        console.log(`     📸 Screenshots: ${execution.artifacts.screenshots.length} files`);
      }
    }
    console.log('');
  }
}

export default {
  ExecutionConfigManager,
  PerformanceMonitor,
};
