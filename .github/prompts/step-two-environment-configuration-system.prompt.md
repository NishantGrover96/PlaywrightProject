---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in multi-environment configuration systems. This is Step 2 of 6 for creating a comprehensive multi-client SaaS testing framework.
---

## 📌 **STEP 2: ENVIRONMENT CONFIGURATION SYSTEM**

### 🎯 **OBJECTIVE**

Create a comprehensive environment configuration system with .env files, client-specific configurations, environment helpers, and environment-specific Playwright configs that support multi-client, multi-environment testing.

### 📋 **PREREQUISITES**

- ✅ Step 1 (Project Foundation) completed
- ✅ Basic folder structure in place
- ✅ TypeScript and Playwright installed

## 🚀 **IMPLEMENTATION STEPS**

### **2.1 Environment Files Creation (.env.\* pattern)**

Create environment-specific configuration files:

**.env.dev** (Development Environment)

```bash
NODE_ENV=dev
BROWSER=chromium
HEADLESS=false
TIMEOUT=90000
RETRIES=1
WORKERS=1
BASE_URL={your-dev-base-url}
LOGIN_URL={your-dev-login-url}
POST_LOGIN_URL={your-dev-post-login-url}
USERNAME={your-dev-username}
PASSWORD={your-dev-password}
TRACE=retain-on-failure
VIDEO=retain-on-failure
SCREENSHOT=only-on-failure
CLIENT={your-primary-client}
```

**.env.test** (Test Environment)

```bash
NODE_ENV=test
BROWSER=chromium
HEADLESS=true
TIMEOUT=90000
RETRIES=2
WORKERS=2
BASE_URL={your-test-base-url}
LOGIN_URL={your-test-login-url}
POST_LOGIN_URL={your-test-post-login-url}
USERNAME={your-test-username}
PASSWORD={your-test-password}
TRACE=on-first-retry
VIDEO=retain-on-failure
SCREENSHOT=only-on-failure
CLIENT={your-primary-client}
```

**.env.uat** (UAT Environment)

```bash
NODE_ENV=uat
BROWSER=chromium
HEADLESS=true
TIMEOUT=90000
RETRIES=2
WORKERS=3
BASE_URL={your-uat-base-url}
LOGIN_URL={your-uat-login-url}
POST_LOGIN_URL={your-uat-post-login-url}
USERNAME={your-uat-username}
PASSWORD={your-uat-password}
TRACE=on
VIDEO=retain-on-failure
SCREENSHOT=only-on-failure
CLIENT={your-primary-client}
```

**.env.prod** (Production Environment)

```bash
NODE_ENV=prod
BROWSER=chromium
HEADLESS=true
TIMEOUT=90000
RETRIES=3
WORKERS=4
BASE_URL={your-prod-base-url}
LOGIN_URL={your-prod-login-url}
POST_LOGIN_URL={your-prod-post-login-url}
USERNAME={your-prod-username}
PASSWORD={your-prod-password}
TRACE=off
VIDEO=off
SCREENSHOT=off
CLIENT={your-primary-client}
```

### **2.2 Client Configuration Structure**

Create **configs/clients/client-modules-access.ts**:

```typescript
/**
 * Client Module Access Configuration
 *
 * This configuration defines which modules each client has access to in the SaaS platform.
 * The structure supports dynamic test execution based on client-specific access permissions.
 */

export interface ModuleConfig {
  name: string;
  path: string;
  isExternal?: boolean;
  externalUrl?: string;
  description: string;
  features?: string[];
}

export interface ClientConfig {
  clientId: string;
  clientName: string;
  baseUrl: string; // Default URL (can be overridden by environment)
  loginUrl: string; // Default login URL
  environments?: {
    [key: string]: {
      baseUrl: string;
      loginUrl: string;
    };
  };
  credentials: {
    username: string;
    password: string;
  };
  modules: ModuleConfig[];
}

export const clientModulesConfig: ClientConfig[] = [
  {
    clientId: '{your-client-id}', // e.g., "demo", "client1"
    clientName: '{Your Client Display Name}',
    baseUrl: '{your-default-base-url}', // Default URL (usually dev)
    loginUrl: '{your-default-login-url}', // Default login URL
    environments: {
      dev: {
        baseUrl: '{your-dev-base-url}',
        loginUrl: '{your-dev-login-url}',
      },
      test: {
        baseUrl: '{your-test-base-url}',
        loginUrl: '{your-test-login-url}',
      },
      uat: {
        baseUrl: '{your-uat-base-url}',
        loginUrl: '{your-uat-login-url}',
      },
      prod: {
        baseUrl: '{your-prod-base-url}',
        loginUrl: '{your-prod-login-url}',
      },
    },
    credentials: {
      username: '{your-client-username}',
      password: '{your-client-password}',
    },
    modules: [
      {
        name: '{Module Name 1}',
        path: '{/path/to/module1}',
        description: '{Module 1 description}',
        features: ['{Feature 1}', '{Feature 2}', '{Feature N}'],
      },
      {
        name: '{Module Name 2}',
        path: '{/path/to/module2}',
        description: '{Module 2 description}',
        features: ['{Feature A}', '{Feature B}', '{Feature N}'],
      },
      // Add more modules following same pattern
    ],
  },
  // Add more clients following same structure pattern
];
```

### **2.3 Environment Helper Utility**

Create **utils/env/environment.helper.ts**:

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ClientConfig, clientModulesConfig } from '../../configs/clients/client-modules-access';

export class EnvironmentHelper {
  private static instance: EnvironmentHelper;
  private config: any = {};

  private constructor() {
    this.loadEnvironmentConfig();
  }

  public static getInstance(): EnvironmentHelper {
    if (!EnvironmentHelper.instance) {
      EnvironmentHelper.instance = new EnvironmentHelper();
    }
    return EnvironmentHelper.instance;
  }

  private loadEnvironmentConfig(): void {
    const env = process.env.ENV || process.env.NODE_ENV || 'dev';
    const envFile = `.env.${env}`;

    // Load environment-specific .env file
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });

    this.config = {
      NODE_ENV: process.env.NODE_ENV,
      BROWSER: process.env.BROWSER || 'chromium',
      HEADLESS: process.env.HEADLESS === 'true',
      TIMEOUT: parseInt(process.env.TIMEOUT || '90000'),
      RETRIES: parseInt(process.env.RETRIES || '1'),
      WORKERS: parseInt(process.env.WORKERS || '1'),
      BASE_URL: process.env.BASE_URL,
      LOGIN_URL: process.env.LOGIN_URL,
      POST_LOGIN_URL: process.env.POST_LOGIN_URL,
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
      CLIENT: process.env.CLIENT || 'demo',
      TRACE: process.env.TRACE || 'retain-on-failure',
      VIDEO: process.env.VIDEO || 'retain-on-failure',
      SCREENSHOT: process.env.SCREENSHOT || 'only-on-failure',
    };
  }

  getConfig(key?: string): any {
    return key ? this.config[key] : this.config;
  }

  // Dynamic URL resolution based on client and environment
  getUrlsForClient(clientId: string, environment?: string): { baseUrl: string; loginUrl: string } {
    const client = clientModulesConfig.find((c) => c.clientId === clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found in configuration`);
    }

    const env = environment || process.env.ENV || 'dev';

    // Use environment-specific URLs if available in client config
    if (client.environments && client.environments[env]) {
      return client.environments[env];
    }

    // Fallback to default URLs from client config
    return {
      baseUrl: client.baseUrl,
      loginUrl: client.loginUrl,
    };
  }

  // Get client configuration
  getClientConfig(clientId: string): ClientConfig | undefined {
    return clientModulesConfig.find((c) => c.clientId === clientId);
  }

  // Get available modules for client
  getClientModules(clientId: string): ModuleConfig[] {
    const client = this.getClientConfig(clientId);
    return client ? client.modules : [];
  }
}
```

### **2.4 Environment-Specific Playwright Configurations**

Create **configs/environments/playwright.config.dev.ts**:

```typescript
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.dev file
dotenv.config({ path: path.resolve(__dirname, '../../.env.dev') });

export default defineConfig({
  testDir: '../../tests',
  timeout: parseInt(process.env.TIMEOUT || '90000'),
  retries: parseInt(process.env.RETRIES || '1'),
  workers: parseInt(process.env.WORKERS || '1'),

  use: {
    browserName: (process.env.BROWSER as any) || 'chromium',
    headless: process.env.HEADLESS === 'true',
    baseURL: process.env.BASE_URL,
    trace: (process.env.TRACE as any) || 'retain-on-failure',
    video: (process.env.VIDEO as any) || 'retain-on-failure',
    screenshot: (process.env.SCREENSHOT as any) || 'only-on-failure',
  },

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],

  projects: [
    {
      name: 'dev-environment',
      testMatch: '**/*.spec.ts',
    },
  ],

  outputDir: 'test-results/',
});
```

Create similar configs for other environments:

- **configs/environments/playwright.config.test.ts** - Loads `.env.test`
- **configs/environments/playwright.config.uat.ts** - Loads `.env.uat`
- **configs/environments/playwright.config.prod.ts** - Loads `.env.prod`

**Pattern for other environment configs:**

```typescript
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load corresponding .env.{environment} file
dotenv.config({ path: path.resolve(__dirname, '../../.env.{environment}') });

export default defineConfig({
  testDir: '../../tests',
  timeout: parseInt(process.env.TIMEOUT || '{default-timeout}'),
  retries: parseInt(process.env.RETRIES || '{default-retries}'),
  workers: parseInt(process.env.WORKERS || '{default-workers}'),

  use: {
    browserName: (process.env.BROWSER as any) || 'chromium',
    headless: process.env.HEADLESS === 'true',
    baseURL: process.env.BASE_URL,
    trace: (process.env.TRACE as any) || '{default-trace-setting}',
    video: (process.env.VIDEO as any) || '{default-video-setting}',
    screenshot: (process.env.SCREENSHOT as any) || '{default-screenshot-setting}',
  },

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],

  projects: [
    {
      name: '{environment-name}',
      testMatch: '**/*.spec.ts',
    },
  ],

  outputDir: 'test-results/',
});
```

### **2.5 Update Package.json with Environment Scripts**

Update **package.json** with environment-specific scripts:

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:dev": "cross-env ENV=dev npx playwright test --config=configs/environments/playwright.config.dev.ts",
    "test:test": "cross-env ENV=test npx playwright test --config=configs/environments/playwright.config.test.ts",
    "test:uat": "cross-env ENV=uat npx playwright test --config=configs/environments/playwright.config.uat.ts",
    "test:prod": "cross-env ENV=prod npx playwright test --config=configs/environments/playwright.config.prod.ts",

    "test:client": "cross-env CLIENT={client-id} ENV={env} npx playwright test --config=configs/environments/playwright.config.{env}.ts",

    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "report": "npx playwright show-report"
  }
}
```

## 🎯 **VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] All .env files created with proper variable structure
- [ ] Client configuration file created with proper interfaces
- [ ] Environment helper utility works correctly
- [ ] Environment-specific Playwright configs load respective .env files
- [ ] Scripts can run with different environment configurations
- [ ] EnvironmentHelper can resolve URLs dynamically

## 📋 **TESTING THE SETUP**

Test the environment configuration:

```typescript
// Test file: tests/setup/environment-test.spec.ts
import { test, expect } from '@playwright/test';
import { EnvironmentHelper } from '../../utils/env/environment.helper';

test('Environment configuration works', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const config = envHelper.getConfig();

  expect(config.NODE_ENV).toBeDefined();
  expect(config.BASE_URL).toBeDefined();
  expect(config.CLIENT).toBeDefined();

  console.log('Environment Config:', config);
});

test('Client URL resolution works', async () => {
  const envHelper = EnvironmentHelper.getInstance();
  const clientId = process.env.CLIENT || 'demo';
  const urls = envHelper.getUrlsForClient(clientId);

  expect(urls.baseUrl).toBeDefined();
  expect(urls.loginUrl).toBeDefined();

  console.log('Client URLs:', urls);
});
```

## 🔍 **SUCCESS CRITERIA**

- ✅ Environment files (.env.\*) created with proper structure
- ✅ Client configuration supports multi-environment URLs
- ✅ Environment helper can resolve configurations dynamically
- ✅ Environment-specific Playwright configs work properly
- ✅ Scripts can switch between environments seamlessly
- ✅ Configuration validation tests pass

## 📋 **NEXT STEPS**

- **Step 3**: Authentication Framework (AuthManager, session management)
- **Step 4**: Page Object Model & Utils
- **Step 5**: Test Organization & Structure
- **Step 6**: Advanced Features & Complete Scripts

**Note**: This is Step 2 of 6. Complete this step fully before proceeding to Step 3 (Authentication Framework).
