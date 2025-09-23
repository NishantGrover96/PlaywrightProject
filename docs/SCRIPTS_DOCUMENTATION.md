# Scripts Documentation

## Overview

This document provides comprehensive documentation for all NPM scripts in the Playwright test automation framework. Each script is designed with **explicit client and role targeting** to ensure data isolation and proper authentication.

## 🔑 Key Principles

### **Data Safety First**
- ✅ **Every test script requires explicit CLIENT and ROLE**
- ✅ **No default values allowed** to prevent cross-client data contamination
- ✅ **Environment-specific configurations** for proper isolation
- ✅ **Role-based authentication** ensures correct permissions

### **Script Naming Convention**
```
{category}:{client}:{role}:{environment}
```

**Example**: `test:demo:admin:dev`, `smoke:hankook:dealer:uat`

---

## 📋 Script Categories

### 🚨 **Core Commands (Safety Guards)**

These scripts are **intentionally disabled** to force explicit client-role-environment specification:

| Script | Purpose | Action |
|--------|---------|--------|
| `test` | Base Playwright test | ❌ **Throws error** - Forces explicit targeting |
| `test:debug` | Debug mode | ❌ **Throws error** - Use specific script with `-- --debug` |
| `test:headed` | Headed mode | ❌ **Throws error** - Use specific script with `-- --headed` |
| `test:dev` | Dev environment | ❌ **Throws error** - Must specify client and role |
| `test:test` | Test environment | ❌ **Throws error** - Must specify client and role |
| `test:uat` | UAT environment | ❌ **Throws error** - Must specify client and role |

**✅ Safe Alternatives:**
```bash
# Instead of: npm run test
npm run test:demo:admin:dev

# Instead of: npm run test:dev
npm run test:demo:admin:dev

# Debug mode example:
npm run test:demo:admin:dev -- --debug
```

### 🛠️ **Utility Commands (Always Safe)**

| Script | Purpose | Usage |
|--------|---------|-------|
| `report` | Show Playwright HTML report | `npm run report` |
| `install:browsers` | Install Playwright browsers | `npm run install:browsers` |
| `clean` | Clean test artifacts | `npm run clean` |

---

## 🎯 **Main Test Execution Scripts**

### **Client-Role-Environment Matrix**

Complete test execution with specific client, role, and environment targeting:

#### **Demo Client Scripts**

| Script | Client | Role | Environment | Purpose |
|--------|--------|------|-------------|---------|
| `test:demo:admin:dev` | demo | admin | dev | Full test suite as demo admin on dev |
| `test:demo:admin:test` | demo | admin | test | Full test suite as demo admin on test |
| `test:demo:admin:uat` | demo | admin | uat | Full test suite as demo admin on UAT |
| `test:demo:dealer:dev` | demo | dealer | dev | Full test suite as demo dealer on dev |
| `test:demo:dealer:test` | demo | dealer | test | Full test suite as demo dealer on test |
| `test:demo:dealer:uat` | demo | dealer | uat | Full test suite as demo dealer on UAT |

#### **Hankook Client Scripts**

| Script | Client | Role | Environment | Purpose |
|--------|--------|------|-------------|---------|
| `test:hankook:admin:dev` | hankook | admin | dev | Full test suite as hankook admin on dev |
| `test:hankook:admin:test` | hankook | admin | test | Full test suite as hankook admin on test |
| `test:hankook:admin:uat` | hankook | admin | uat | Full test suite as hankook admin on UAT |
| `test:hankook:dealer:dev` | hankook | dealer | dev | Full test suite as hankook dealer on dev |
| `test:hankook:dealer:test` | hankook | dealer | test | Full test suite as hankook dealer on test |
| `test:hankook:dealer:uat` | hankook | dealer | uat | Full test suite as hankook dealer on UAT |

**Usage Examples:**
```bash
# Run all tests for demo client as admin on dev environment
npm run test:demo:admin:dev

# Run all tests for hankook client as dealer on UAT environment  
npm run test:hankook:dealer:uat

# Run with additional Playwright options
npm run test:demo:admin:dev -- --headed --workers=1
```

---

## 🧪 **Test Type Scripts**

Run specific test categories with explicit client-role-environment targeting:

### **Smoke Tests**
Quick validation tests to ensure basic functionality:

| Script | Purpose |
|--------|---------|
| `smoke:demo:admin:dev` | Demo admin smoke tests on dev |
| `smoke:demo:admin:uat` | Demo admin smoke tests on UAT |

### **Regression Tests**  
Comprehensive tests to ensure existing functionality:

| Script | Purpose |
|--------|---------|
| `regression:demo:admin:dev` | Demo admin regression tests on dev |
| `regression:demo:admin:uat` | Demo admin regression tests on UAT |

### **End-to-End Tests**
Complete user workflow tests:

| Script | Purpose |
|--------|---------|
| `e2e:demo:admin:dev` | Demo admin E2E tests on dev |
| `e2e:demo:admin:uat` | Demo admin E2E tests on UAT |

**Usage Examples:**
```bash
# Run smoke tests for demo admin on dev
npm run smoke:demo:admin:dev

# Run regression tests for demo admin on UAT
npm run regression:demo:admin:uat

# Run E2E tests with headed browser
npm run e2e:demo:admin:dev -- --headed
```

---

## 🔧 **Module-Specific Scripts**

Run tests for specific application modules:

### **Learning Management System (LMS)**
| Script | Purpose |
|--------|---------|
| `lms:demo:admin:dev` | LMS module tests for demo admin on dev |
| `lms:demo:admin:uat` | LMS module tests for demo admin on UAT |

### **Brand Shop**
| Script | Purpose |
|--------|---------|
| `brand-shop:demo:admin:dev` | Brand shop tests for demo admin on dev |
| `brand-shop:demo:admin:uat` | Brand shop tests for demo admin on UAT |

### **Fund Management**
| Script | Purpose |
|--------|---------|
| `fund-mgmt:demo:admin:dev` | Fund management tests for demo admin on dev |
| `fund-mgmt:demo:admin:uat` | Fund management tests for demo admin on UAT |

### **Reports Dashboard**
| Script | Purpose |
|--------|---------|
| `reports:demo:admin:dev` | Reports dashboard tests for demo admin on dev |
| `reports:demo:admin:uat` | Reports dashboard tests for demo admin on UAT |

**Usage Examples:**
```bash
# Test LMS module for demo admin on dev
npm run lms:demo:admin:dev

# Test fund management module for demo admin on UAT
npm run fund-mgmt:demo:admin:uat

# Test brand shop module with debug mode
npm run brand-shop:demo:admin:dev -- --debug
```

---

## ⚡ **Quick Action Scripts**

Convenient shortcuts for common testing scenarios:

| Script | Purpose | Equivalent To |
|--------|---------|---------------|
| `quick-test` | Fast smoke test validation | `smoke:demo:admin:dev` |
| `quick-smoke` | Fast smoke test in headed mode | `smoke:demo:admin:dev -- --headed` |
| `demo-smoke` | Demo client smoke tests | `smoke:demo:admin:dev` |

**Usage Examples:**
```bash
# Quick validation (headless)
npm run quick-test

# Quick validation with browser visible
npm run quick-smoke

# Demo-specific smoke tests
npm run demo-smoke
```

---

## 🚀 **CI/CD Scripts**

Optimized scripts for Azure DevOps pipelines with proper reporting:

### **Environment-Specific CI Scripts**
| Script | Purpose |
|--------|---------|
| `ci:demo:admin:dev` | CI execution for demo admin on dev |
| `ci:demo:admin:test` | CI execution for demo admin on test |
| `ci:demo:admin:uat` | CI execution for demo admin on UAT |
| `ci:hankook:admin:dev` | CI execution for hankook admin on dev |
| `ci:hankook:admin:uat` | CI execution for hankook admin on UAT |

### **Test Type CI Scripts**
| Script | Purpose |
|--------|---------|
| `ci:smoke:demo:admin:dev` | CI smoke tests for demo admin on dev |
| `ci:smoke:demo:admin:uat` | CI smoke tests for demo admin on UAT |
| `ci:regression:demo:admin:uat` | CI regression tests for demo admin on UAT |

**Key Features:**
- ✅ **CI=true** environment variable set
- ✅ **JSON and JUnit reporters** for Azure DevOps integration
- ✅ **Explicit client-role-environment** targeting
- ✅ **Optimized for parallel execution**

**Azure Pipeline Usage:**
```yaml
- script: npm run ci:demo:admin:uat
  displayName: 'Run Demo Admin UAT Tests'
  
- script: npm run ci:smoke:demo:admin:dev  
  displayName: 'Run Demo Admin Dev Smoke Tests'
```

---

## 🛠️ **Setup & Maintenance Scripts**

### **Initial Setup**
| Script | Purpose |
|--------|---------|
| `setup` | Complete setup (install + browsers) |
| `setup:install` | Install NPM dependencies |
| `setup:browsers` | Install Playwright browsers |

### **Cleanup**
| Script | Purpose |
|--------|---------|
| `clean:reports` | Remove test reports and artifacts |
| `clean:all` | Full cleanup (scripts + reports) |

**Usage Examples:**
```bash
# Initial project setup
npm run setup

# Clean up after testing
npm run clean:reports

# Complete cleanup
npm run clean:all
```

---

## 🔍 **Utility Scripts**

### **Code Quality**
| Script | Purpose |
|--------|---------|
| `validate` | Validate Playwright configuration |
| `lint` | Run ESLint on TypeScript files |
| `lint:fix` | Fix ESLint issues automatically |
| `format` | Format code with Prettier |
| `format:check` | Check code formatting |
| `type-check` | TypeScript type checking |

**Usage Examples:**
```bash
# Validate configuration
npm run validate

# Fix code quality issues
npm run lint:fix

# Format all code
npm run format

# Check types
npm run type-check
```

---

## 🎯 **Best Practices**

### **✅ DO:**
- Always use explicit client-role-environment scripts
- Use CI scripts for Azure DevOps pipelines
- Clean up reports regularly
- Validate configuration before major changes

### **❌ DON'T:**
- Never use base commands (`test`, `test:dev`, etc.)
- Don't run tests without explicit CLIENT and ROLE
- Don't mix client data by running wrong scripts
- Don't skip environment specification

### **🔧 Advanced Usage:**
```bash
# Run with specific test file pattern
npm run test:demo:admin:dev -- --grep="fund management"

# Run with custom workers
npm run test:demo:admin:uat -- --workers=2

# Run with debugging
npm run test:demo:admin:dev -- --debug

# Run with headed browser
npm run smoke:demo:admin:dev -- --headed

# Run specific test file
npm run fund-mgmt:demo:admin:dev -- tests/e2e/fund-management/submit-preapproval.spec.ts
```

---

## 🆘 **Troubleshooting**

### **Common Error Messages:**
```bash
# ❌ Error: Use specific client-env script
# Solution: Use explicit script like npm run test:demo:admin:dev

# ❌ Error: Specify client and role
# Solution: Always include client, role, and environment
```

### **Environment Variables Set By Scripts:**
- `CLIENT`: demo, hankook
- `ROLE`: admin, dealer, distributor  
- `ENV`: dev, test, uat
- `CI`: true (for CI scripts only)

---

This documentation ensures every team member understands the script purpose and usage patterns for safe, isolated, and reliable test execution.