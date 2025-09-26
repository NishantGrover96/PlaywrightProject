# Scripts Quick Reference Guide

## 🎯 **Most Common Scripts**

### **Daily Development**

```bash
# Quick smoke test validation
npm run quick-test

# Quick smoke test with browser visible
npm run quick-smoke

# Full test suite for demo admin on dev
npm run test:demo:admin:dev

# Full test suite for demo admin on UAT
npm run test:demo:admin:uat
```

### **Module Testing**

```bash
# Test specific modules
npm run fund-mgmt:demo:admin:dev
npm run lms:demo:admin:uat
npm run brand-shop:demo:admin:dev
npm run reports:demo:admin:uat
```

### **Test Types**

```bash
# Smoke tests (quick validation)
npm run smoke:demo:admin:dev
npm run smoke:demo:admin:uat

# Regression tests (comprehensive)
npm run regression:demo:admin:dev
npm run regression:demo:admin:uat

# End-to-end tests (full workflows)
npm run e2e:demo:admin:dev
npm run e2e:demo:admin:uat
```

---

## 🚨 **What NOT to Use**

### **❌ These Scripts Will Fail (Intentionally)**

```bash
# These throw errors to force explicit targeting:
npm run test                    # ❌ Error: Use specific client-env script
npm run test:dev               # ❌ Error: Specify client and role
npm run test:debug             # ❌ Error: Use specific client-env script
npm run test:headed            # ❌ Error: Use specific client-env script
```

### **✅ Use These Instead**

```bash
npm run test:demo:admin:dev            # ✅ Explicit targeting
npm run test:demo:admin:dev -- --debug # ✅ Debug mode
npm run test:demo:admin:dev -- --headed # ✅ Headed mode
```

---

## 🎭 **Client & Role Combinations**

### **Demo Client**
| Role | Dev | Test | UAT |
|------|-----|------|-----|
| **admin** | `test:demo:admin:dev` | `test:demo:admin:test` | `test:demo:admin:uat` |
| **dealer** | `test:demo:dealer:dev` | `test:demo:dealer:test` | `test:demo:dealer:uat` |

### **Hankook Client**
| Role | Dev | Test | UAT |
|------|-----|------|-----|
| **admin** | `test:hankook:admin:dev` | `test:hankook:admin:test` | `test:hankook:admin:uat` |
| **dealer** | `test:hankook:dealer:dev` | `test:hankook:dealer:test` | `test:hankook:dealer:uat` |

---

## 🧪 **Test Type Matrix**

### **Available Test Types**
| Test Type | Demo Admin Dev | Demo Admin UAT | Purpose |
|-----------|----------------|----------------|---------|
| **Smoke** | `smoke:demo:admin:dev` | `smoke:demo:admin:uat` | Quick validation |
| **Regression** | `regression:demo:admin:dev` | `regression:demo:admin:uat` | Comprehensive testing |
| **E2E** | `e2e:demo:admin:dev` | `e2e:demo:admin:uat` | Full user workflows |

---

## 🔧 **Module Testing Matrix**

### **Available Modules**
| Module | Demo Admin Dev | Demo Admin UAT | Purpose |
|--------|----------------|----------------|---------|
| **LMS** | `lms:demo:admin:dev` | `lms:demo:admin:uat` | Learning Management System |
| **Brand Shop** | `brand-shop:demo:admin:dev` | `brand-shop:demo:admin:uat` | E-commerce functionality |
| **Fund Management** | `fund-mgmt:demo:admin:dev` | `fund-mgmt:demo:admin:uat` | Financial operations |
| **Reports** | `reports:demo:admin:dev` | `reports:demo:admin:uat` | Dashboard & analytics |

---

## 🚀 **CI/CD Scripts for Azure**

### **Environment CI Scripts**

```bash
# CI scripts with proper reporting for Azure DevOps
npm run ci:demo:admin:dev
npm run ci:demo:admin:test
npm run ci:demo:admin:uat
npm run ci:hankook:admin:dev
npm run ci:hankook:admin:uat
```

### **Test Type CI Scripts**

```bash
# Specific test types for CI
npm run ci:smoke:demo:admin:dev
npm run ci:smoke:demo:admin:uat
npm run ci:regression:demo:admin:uat
```

---

## 🛠️ **Setup & Maintenance**

### **Initial Setup**

```bash
# Complete project setup
npm run setup

# Individual setup steps
npm run setup:install    # NPM dependencies
npm run setup:browsers   # Playwright browsers
```

### **Cleanup**

```bash
# Clean test artifacts
npm run clean:reports

# Complete cleanup
npm run clean:all
```

### **Code Quality**

```bash
# Quick validation
npm run validate

# Code quality checks
npm run lint
npm run lint:fix
npm run format
npm run type-check
```

---

## 🎯 **Common Usage Patterns**

### **Development Workflow**

```bash
# 1. Quick validation
npm run quick-test

# 2. Test specific module you're working on
npm run fund-mgmt:demo:admin:dev

# 3. Run full test suite before commit
npm run test:demo:admin:dev

# 4. Clean up
npm run clean:reports
```

### **Pre-Release Testing**

```bash
# 1. Smoke tests on UAT
npm run smoke:demo:admin:uat

# 2. Full regression on UAT
npm run regression:demo:admin:uat

# 3. Test critical modules
npm run fund-mgmt:demo:admin:uat
npm run lms:demo:admin:uat
```

### **Debug Session**

```bash
# Run with debug mode
npm run test:demo:admin:dev -- --debug

# Run with headed browser
npm run test:demo:admin:dev -- --headed

# Run specific test file
npm run fund-mgmt:demo:admin:dev -- tests/e2e/fund-management/submit-preapproval.spec.ts



# Run with custom workers
npm run test:demo:admin:dev -- --workers=1
```

---

## 📋 **Script Name Cheat Sheet**

### **Pattern: `{category}:{client}:{role}:{environment}`**

| Component | Options |
|-----------|---------|
| **Category** | `test`, `smoke`, `regression`, `e2e`, `lms`, `brand-shop`, `fund-mgmt`, `reports`, `ci` |
| **Client** | `demo`, `hankook` |
| **Role** | `admin`, `dealer` |
| **Environment** | `dev`, `test`, `uat` |

### **Examples**

```bash
test:demo:admin:dev           # Full test suite
smoke:hankook:dealer:uat      # Smoke tests
fund-mgmt:demo:admin:dev      # Fund management module
ci:demo:admin:uat             # CI execution
```

---

## 🎛️ **Advanced Options**

### **Playwright CLI Options**

Add these after `--` in any script:

| Option | Purpose | Example |
|--------|---------|---------|
| `--headed` | Show browser | `npm run test:demo:admin:dev -- --headed` |
| `--debug` | Debug mode | `npm run test:demo:admin:dev -- --debug` |
| `--workers=N` | Set worker count | `npm run test:demo:admin:dev -- --workers=2` |
| `--grep="pattern"` | Filter tests | `npm run test:demo:admin:dev -- --grep="login"` |
| `--timeout=N` | Set timeout | `npm run test:demo:admin:dev -- --timeout=60000` |

### **Environment Variable Overrides**

```bash
# Override environment variables (advanced usage)
CLIENT=demo ROLE=admin ENV=dev npm run test:demo:admin:dev

# Force specific browser
BROWSER=firefox npm run test:demo:admin:dev

# Disable headless
HEADLESS=false npm run test:demo:admin:dev
```

---

## 🆘 **Troubleshooting Quick Fixes**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| "Use specific client-env script" | Use explicit script like `npm run test:demo:admin:dev` |
| "Specify client and role" | Never use base scripts, always include client/role/env |
| Tests using wrong data | Verify you're using correct client (demo vs hankook) |
| Authentication failures | Check role matches your test requirements |
| Wrong environment data | Verify environment (dev/test/uat) in script name |

### **Quick Diagnostics**

```bash
# Validate configuration
npm run validate

# Check what tests would run
npm run test:demo:admin:dev -- --list

# Run single test to isolate issues
npm run test:demo:admin:dev -- tests/smoke/reports-dashboard.spec.ts
```

---

## 📊 **Performance Tips**

### **Faster Test Execution**

```bash
# Use fewer workers for debugging
npm run test:demo:admin:dev -- --workers=1

# Run only chromium for speed
npm run test:demo:admin:dev -- --project=chromium

# Run headless (default, but explicit)
npm run test:demo:admin:dev -- --headed=false
```

### **Targeted Testing**

```bash
# Test specific file
npm run fund-mgmt:demo:admin:dev -- tests/e2e/fund-management/submit-preapproval.spec.ts

# Test specific describe block
npm run test:demo:admin:dev -- --grep="fund management workflow"

# Skip certain tests
npm run test:demo:admin:dev -- --grep="@slow" --invert
```

---

## 🏆 **Best Practices Summary**

### **✅ Always Do**

1. Use explicit client-role-environment scripts
2. Clean up reports after testing sessions
3. Use smoke tests for quick validation
4. Use CI scripts for Azure DevOps
5. Test on UAT before production releases

### **❌ Never Do**

1. Use base scripts (`test`, `test:dev`, etc.)
2. Mix client data (don't run hankook tests with demo scripts)
3. Skip environment specification
4. Hardcode credentials in scripts
5. Run tests without knowing which client/role context

### **🎯 Pro Tips**

- Use `quick-test` for fastest validation
- Use module-specific scripts when working on specific features
- Use regression scripts before major releases
- Always use CI scripts in Azure pipelines
- Keep test data organized by client and role

---

This quick reference guide helps you quickly find and use the right script for any testing scenario while maintaining data safety and proper isolation.
