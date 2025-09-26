# Playwright Automation Framework

A comprehensive Playwright automation framework with multi-environment support, authentication system, and modular architecture.

## 🚀 Quick Setup

### Prerequisites

- Node.js (v18 or higher)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Configuration

1. **Create Environment Files**: Copy `.env.example` to create environment-specific files:

   ```bash
   cp .env.example .env.dev
   cp .env.example .env.test
   cp .env.example .env.uat
   cp .env.example .env.prod
   ```

2. **Configure Environment Variables**: Edit each `.env.*` file with actual values:
   - `BASE_URL`: Target application URL
   - `USERNAME`/`PASSWORD`: Test user credentials
   - `ADMIN_USERNAME`/`ADMIN_PASSWORD`: Admin user credentials
   - Other environment-specific configurations

⚠️ **IMPORTANT**: Never commit `.env.*` files to the repository as they contain sensitive information.

## 🏗️ Architecture

### Project Structure

```
├── configs/           # Environment and client configurations
├── fixtures/          # Test data and global fixtures
├── pages/            # Page Object Model classes
├── tests/            # Test files organized by type
├── utils/            # Helper utilities and selectors
└── static_files/     # Test assets (images, PDFs)
```

### Test Organization

- **`tests/smoke/`** - Critical path tests
- **`tests/regression/`** - Full regression test suite
- **`tests/e2e/`** - End-to-end user workflows
- **`tests/setup/`** - Environment validation tests

## 🎯 Running Tests

### Environment-Specific Tests

```bash
# Development environment
npm run test:dev

# Test environment
npm run test:test

# UAT environment
npm run test:uat

# Production environment (read-only tests)
npm run test:prod
```

### Test Types

```bash
# Smoke tests (fast, critical paths)
npm run test:smoke

# Full regression suite
npm run test:regression

# Specific module
npm run test:reports
```

## 🔐 Security Features

- **Global Authentication**: Automatic login handling across all tests
- **Session Management**: Reuse authentication state for performance
- **Environment Isolation**: Separate configurations for each environment
- **Sensitive Data Protection**: Environment variables for credentials

## 📊 Reporting

- **HTML Reports**: Generated in `playwright-report/`
- **JUnit XML**: Available for CI/CD integration
- **Screenshots/Videos**: Captured on test failures

## 🛠️ Development

### Adding New Tests

1. Create test files in appropriate `tests/` subdirectory
2. Use PascalCase for test file names (e.g., `CreateUser.spec.ts`)
3. Follow Page Object Model pattern
4. Use common selectors from `utils/selectors/`

### Adding New Page Objects

1. Create page classes in `pages/modules/[module-name]/`
2. Extend `ModuleBasePage` for common functionality
3. Use utility functions from `utils/helpers/`

## 📚 Documentation

- [Global Auth System Architecture](docs/Global-Auth-System-Architecture.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Development Prompts](.github/prompts/)

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow existing code patterns and naming conventions
3. Add tests for new functionality
4. Update documentation as needed
5. Create pull request with descriptive title and description

## 📄 License

This project is licensed under the MIT License.
