---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in enterprise-grade Playwright framework foundation setup. This is Step 1 of 6 for creating a comprehensive multi-client SaaS testing framework.
---

## 📌 **STEP 1: PROJECT FOUNDATION & BASIC SETUP**

### 🎯 **OBJECTIVE**

Create the foundational structure for an enterprise-grade Playwright testing framework with proper TypeScript setup, basic configurations, and core folder architecture.

## 🚀 **IMPLEMENTATION STEPS**

### **1.1 Project Initialization**

```bash
# Create project directory
mkdir {project-name}
cd {project-name}

# Initialize npm project
npm init -y

# Install core dependencies
npm install @playwright/test typescript @types/node

# Install development dependencies
npm install -D dotenv cross-env eslint prettier @typescript-eslint/eslint-config @typescript-eslint/parser

# Install Playwright browsers
npx playwright install
```

### **1.2 Create Core Folder Structure**

Create the complete folder architecture:

```
{project-name}/
├── .env.dev                    # Development environment variables
├── .env.test                   # Test environment variables  
├── .env.uat                    # UAT environment variables
├── .env.prod                   # Production environment variables
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── README.md
├── .github/
│   └── prompts/               # Framework setup prompts and documentation
├── configs/
│   ├── advanced/              # Advanced execution configurations
│   ├── clients/               # Client-specific access configurations
│   ├── endpoints/             # API endpoint configurations
│   └── environments/          # Environment-specific Playwright configs
├── pages/
│   ├── common/                # Shared page objects (login, dashboard)
│   └── modules/               # Module-specific page objects
├── tests/
│   ├── auth-manager.ts        # Individual client/role authentication logic
│   ├── base-test.ts           # Extended test with auth fixtures
│   ├── global-auth.ts         # Global auth orchestration and caching
│   ├── e2e/                   # End-to-end test scenarios
│   ├── smoke/                 # Smoke test cases
│   ├── regression/            # Regression test suites
│   ├── setup/                 # Setup and validation tests
│   ├── execution-patterns/    # Test execution pattern examples
│   └── test-helpers/          # Test utility helpers
├── utils/
│   ├── assertions/            # Custom assertion utilities
│   ├── data-generators/       # Test data generation utilities
│   ├── env/                   # Environment configuration helpers
│   ├── helpers/               # General utility helpers
│   ├── logger/                # Logging utilities
│   ├── performance/           # Performance monitoring utilities
│   ├── reporter/              # Custom test reporters
│   └── selectors/             # Element selector definitions
│       ├── common/            # Common UI element selectors
│       └── modules/           # Module-specific selectors
├── fixtures/
│   ├── global-fixtures/       # Global setup/teardown and auth sessions
│   ├── client-fixtures/       # Client-specific test fixtures
│   └── test-data/             # Test data organized by module
├── scripts/                   # Build and utility scripts
├── docs/                      # Project documentation
├── ci/                        # CI/CD configurations
├── static_files/              # Static assets for testing (images, PDFs)
└── test-results/              # Generated test results and reports
```

### **1.3 TypeScript Configuration**

Create **tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "@playwright/test"]
  },
  "include": ["tests/**/*", "pages/**/*", "utils/**/*", "configs/**/*", "fixtures/**/*"],
  "exclude": ["node_modules", "test-results", "playwright-report"]
}
```

### **1.4 Basic Playwright Configuration**

Create **playwright.config.ts** (basic version):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 90000,
    navigationTimeout: 90000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results/',
});
```

### **1.5 Git Configuration**

Create **.gitignore**:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Test Results
test-results/
playwright-report/
test-results.json
junit-results.xml
allure-report/
allure-results/
coverage/
.nyc_output/

# Environment files (keep patterns, ignore actual files)
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Authentication fixtures (session files) - CRITICAL for security
fixtures/global-fixtures/auth-*.json

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Build outputs
dist/
build/

# Temporary files
*.tmp
*.temp
.cache/
```

### **1.6 ESLint Configuration**

Create **.eslintrc.js**:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### **1.7 Prettier Configuration**

Create **.prettierrc**:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### **1.8 Authentication Foundation Preparation**

Create placeholder files for the authentication system (content will be added in Step 3):

- Create empty `tests/auth-manager.ts` file
- Create empty `tests/global-auth.ts` file  
- Create empty `tests/base-test.ts` file
- Ensure `fixtures/global-fixtures/` directory exists (for auth session storage)

These files are essential for the global authentication framework that will be implemented in Step 3.

### **1.9 Basic Package.json Scripts**

Update **package.json** with initial scripts:

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:debug": "npx playwright test --debug",
    "report": "npx playwright show-report",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## 🎯 **VALIDATION CHECKLIST**

After completing this step, verify:

- [ ] Project structure matches the defined architecture with all folders
- [ ] Environment files (.env.dev, .env.test, .env.uat, .env.prod) are created
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Basic Playwright test can run (`npm test`)
- [ ] Linting works (`npm run lint`)
- [ ] Authentication framework files ready:
  - [ ] `tests/auth-manager.ts` placeholder created
  - [ ] `tests/global-auth.ts` placeholder created  
  - [ ] `tests/base-test.ts` placeholder created
  - [ ] `fixtures/global-fixtures/` directory created
- [ ] Configuration structure ready:
  - [ ] `configs/clients/` for client configurations
  - [ ] `configs/environments/` for environment-specific configs
  - [ ] `configs/endpoints/` for API endpoint management
- [ ] Git repository is initialized with proper .gitignore
- [ ] Static files directory created for test assets

## 📋 **NEXT STEPS**

After completing this foundation setup:

1. **Step 2**: Environment Configuration System (.env files, client configs)
2. **Step 3**: Authentication Framework (AuthManager, session management)
3. **Step 4**: Page Object Model & Utils
4. **Step 5**: Test Organization & Structure
5. **Step 6**: Advanced Features & Complete Scripts

## 🔍 **SUCCESS CRITERIA**

- ✅ **Complete Project Structure**: All folders match the defined architecture
- ✅ **Environment Foundation**: Multiple .env files created for different environments
- ✅ **TypeScript Setup**: Configuration working properly with all required types
- ✅ **Basic Playwright**: Initial setup functional with basic configuration  
- ✅ **Code Quality Tools**: ESLint and Prettier configured and working
- ✅ **Authentication Structure**: Placeholder files ready for global auth system
- ✅ **Multi-Client Foundation**: Configuration structure ready for client-specific setups
- ✅ **Static Assets**: Directory structure for test files and assets
- ✅ **Documentation Structure**: GitHub prompts and docs directory organized
- ✅ **Git Repository**: Properly configured with comprehensive .gitignore

**Note**: This foundation step prepares the structure for:
- **Step 2**: Environment Configuration System (client configs, environment helpers)
- **Step 3**: Global Authentication Framework (auth-manager, global-auth, base-test)
- **Step 4**: Page Object Model & Utilities
- **Step 5**: Test Organization & Data Management  
- **Step 6**: Advanced Features & Complete Integration
