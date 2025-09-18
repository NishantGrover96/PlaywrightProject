# Getting Started with Playwright Automation Framework

Welcome to the Playwright Automation Framework! This guide will help you get up and running quickly with the project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)
- **VS Code** (recommended) - [Download VS Code](https://code.visualstudio.com/)

## 🚀 Quick Start

### 1. Clone and Setup

```powershell
# Clone the repository
git clone <repository-url>
cd Automation

# Quick setup - installs dependencies and browsers
npm run setup
```

The `npm run setup` command will:
- Install all npm dependencies
- Install Playwright browsers automatically

### 2. Verify Installation

```powershell
# Verify the setup by running a simple test
npm run test:smoke:demo:dev
```

If everything is set up correctly, you should see tests running and a report generated.

## 🔧 Environment Configuration

### Default Environment
The framework comes with default configurations for the **demo** client on **dev** environment. You can start testing immediately without additional configuration.

### Custom Environment Setup (Optional)

For advanced usage or different environments:

1. **Create Environment Files**:
   ```powershell
   # Copy example environment files
   cp .env.example .env.dev
   cp .env.example .env.test
   cp .env.example .env.uat
   cp .env.example .env.prod
   ```

2. **Configure Variables**: Edit the `.env.*` files with your specific values:
   - `BASE_URL`: Target application URL
   - `USERNAME`/`PASSWORD`: Test user credentials
   - `ADMIN_USERNAME`/`ADMIN_PASSWORD`: Admin credentials

⚠️ **Security Note**: Never commit `.env.*` files to version control!

## 🧪 Running Your First Tests

### Basic Test Commands

```powershell
# Run all tests
npm test

# Run tests with browser visible (headed mode)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View test reports
npm run report
```

### Environment-Specific Tests

```powershell
# Run tests on demo dev environment
npm run test:demo:dev

# Run smoke tests on demo dev environment
npm run test:smoke:demo:dev

# Run specific module tests
npm run test:lms
npm run test:brand-shop
npm run test:reports
```

### Test Types

```powershell
# Smoke tests (quick validation)
npm run test:smoke

# End-to-end tests (full workflows)
npm run test:e2e

# Regression tests (comprehensive coverage)
npm run test:regression
```

## 📂 Project Structure Overview

```
Automation/
├── configs/              # Environment and client configurations
│   ├── clients/          # Client-specific access configurations
│   ├── endpoints/        # API endpoint configurations
│   └── environments/     # Environment-specific Playwright configs
├── docs/                 # Documentation files
├── fixtures/             # Test data and setup files
│   ├── global-fixtures/  # Authentication and global setup
│   └── test-data/        # Test data for different modules
├── pages/                # Page Object Model classes
│   ├── common/           # Shared page objects
│   └── modules/          # Module-specific page objects
├── tests/                # Test files organized by type
│   ├── smoke/            # Smoke tests
│   ├── e2e/              # End-to-end tests
│   ├── regression/       # Regression tests
│   └── setup/            # Setup validation tests
├── utils/                # Helper utilities
│   ├── selectors/        # Element selectors
│   ├── helpers/          # Utility functions
│   └── assertions/       # Custom assertions
└── static_files/         # Test files for upload scenarios
```

## ✨ Key Features

### 🔐 Global Authentication
- Automatic login handling across all tests
- Session management and reuse
- Role-based authentication (admin, user, etc.)

### 🌍 Multi-Environment Support
- **dev** - Development environment
- **test** - Testing environment  
- **uat** - User Acceptance Testing
- **prod** - Production environment

### 👥 Multi-Client Support
- **demo** - Demo client configuration
- **hankook** - Hankook client configuration

### 📊 Test Organization
- **Smoke Tests** - Quick validation of core functionality
- **E2E Tests** - Complete user workflows
- **Regression Tests** - Comprehensive feature testing
- **Module Tests** - Specific module functionality

## 🎯 Common Workflows

### Adding a New Test

1. **Choose the appropriate test type and location**:
   - Smoke tests → `tests/smoke/`
   - E2E tests → `tests/e2e/`
   - Regression tests → `tests/regression/`

2. **Create your test file** (use PascalCase):
   ```typescript
   // Example: tests/e2e/CreateUser.spec.ts
   import { test, expect } from '../base-test';
   
   test.describe('Create User', () => {
     test('should create a new user successfully', async ({ page }) => {
       // Your test logic here
     });
   });
   ```

3. **Add page objects if needed** in `pages/modules/[module-name]/`

4. **Run your specific test**:
   ```powershell
   npm run test tests/e2e/CreateUser.spec.ts
   ```

### Debugging Tests

```powershell
# Debug mode - step through tests
npm run test:debug

# Headed mode - see browser actions
npm run test:headed

# Debug specific test
npx playwright test tests/e2e/CreateUser.spec.ts --debug
```

### Viewing Reports

```powershell
# Open HTML report
npm run report

# Check test results in terminal
cat test-results.json
```

## 🛠️ Maintenance Commands

```powershell
# Clean all reports and results
npm run clean:all

# Install/update browsers
npm run setup:browsers

# Validate configuration
npm run config:validate

# Code quality checks
npm run validate  # Runs linting, formatting, and type checking
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format code
```

## 🆘 Troubleshooting

### Common Issues

1. **Tests failing to start**:
   ```powershell
   # Reinstall browsers
   npm run setup:browsers
   ```

2. **Authentication issues**:
   ```powershell
   # Check if auth setup is working
   npm run test:setup
   ```

3. **Environment configuration issues**:
   ```powershell
   # Validate environment config
   npm run config:validate:dev
   ```

4. **Clean slate restart**:
   ```powershell
   # Clean everything and reinstall
   npm run clean:all
   npm run setup
   ```

### Getting Help

- Check existing documentation in the `docs/` folder
- Review the main `README.md` for detailed architecture information
- Look at existing test examples in the `tests/` directory
- Examine page objects in the `pages/` directory for interaction patterns

## 🎉 Next Steps

Once you're comfortable with the basics:

1. **Explore Module Tests**: Look at specific module tests like LMS, Brand Shop, or Fund Management
2. **Understand Page Objects**: Study the Page Object Model implementation
3. **Custom Utilities**: Learn about the helper utilities and selectors
4. **Advanced Configuration**: Explore multi-client and environment matrix testing
5. **CI/CD Integration**: Check out the CI-specific commands for automated testing

Happy Testing! 🚀