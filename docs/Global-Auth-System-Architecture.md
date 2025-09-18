# Global Authentication System Architecture

## 📋 Overview

This document explains how the global authentication system works in our Playwright POC project, including the relationships between different files and configurations, and how to use it in test cases.

## 🏗️ System Architecture

### High-Level Flow
```
Environment Variables (CLIENT, ROLE, ENV)
    ↓
Client Configuration Resolution
    ↓
Global Auth Setup (Pre-Test)
    ↓
Session Caching & Validation
    ↓
Test Execution with Auth
```

## 📁 File Structure & Relationships

### **1. Configuration Layer**

#### **`configs/clients/client-modules-access.ts`**
- **Purpose**: Defines available clients, their URLs, credentials, and accessible modules
- **Key Features**:
  - Environment-specific URLs (dev, test, uat, prod)
  - Client credentials mapping
  - Module access permissions per client
- **Connection**: Used by AuthManager and EnvironmentHelper to resolve URLs and credentials

#### **`configs/environments/playwright.config.{env}.ts`**
- **Purpose**: Environment-specific Playwright configurations
- **Key Features**:
  - Dynamic project generation based on CLIENT environment variable
  - Environment-aware URL resolution
  - Auth file path generation using CLIENT+ROLE+ENV pattern
- **Connection**: Imports client config and generates test projects dynamically

#### **`utils/env/environment.helper.ts`**
- **Purpose**: Centralized environment configuration resolution
- **Key Features**:
  - Merges environment variables with client configurations
  - Resolves final URLs based on client and environment
  - Provides unified config access across the system
- **Connection**: Used by AuthManager to get resolved configurations

### **2. Authentication Layer**

#### **`tests/global-auth.ts`** 
- **Purpose**: Global authentication state management and caching
- **Key Features**:
  - AuthManager instance caching (prevents duplicate logins)
  - Global session validation (20-minute expiry)
  - Cache key format: `${CLIENT}-${ROLE}-${ENVIRONMENT}`
- **Connection**: Orchestrates AuthManager instances and provides them to base-test

#### **`tests/auth-manager.ts`**
- **Purpose**: Handles actual authentication logic for specific client/role combinations
- **Key Features**:
  - Login execution using client-specific credentials
  - Session storage and loading
  - Session validity checking (20-minute expiry rule)
- **Connection**: Uses client config from client-modules-access and environment helper

#### **`fixtures/global-fixtures/auth.setup.ts`**
- **Purpose**: Pre-test authentication setup that runs before all tests
- **Key Features**:
  - Creates authentication sessions based on CLIENT+ROLE+ENV
  - Saves session state to JSON files
  - Runs as a dependency for all test projects
- **Connection**: Uses GlobalAuth to create and cache authentication sessions

### **3. Test Integration Layer**

#### **`tests/base-test.ts`**
- **Purpose**: Extended Playwright test with authentication fixture
- **Key Features**:
  - Automatic auth manager injection into tests
  - Session reuse and validation
  - Fallback authentication if sessions expire
- **Connection**: Uses GlobalAuth to get authenticated sessions for tests

#### **`playwright.config.ts`** (Main Config)
- **Purpose**: Default configuration that automatically uses dev environment
- **Key Features**:
  - Defaults to dev environment if no ENV specified
  - Dynamic project generation with proper auth file paths
  - 90-second timeouts as per project standards
- **Connection**: Uses client config and auth setup dependencies

## 🔄 Authentication Flow

### **1. Pre-Test Setup Phase**
1. **Environment Resolution**: CLIENT, ROLE, ENV variables are resolved (defaults: demo, admin, dev)
2. **Client Config Loading**: System loads client-specific URLs and credentials
3. **Auth Setup Execution**: `auth.setup.ts` runs and creates authentication session
4. **Session Storage**: Auth state saved as `auth-{CLIENT}-{ROLE}-{ENV}.json`

### **2. Test Execution Phase**
1. **Auth Fixture Creation**: Base-test creates auth fixture using GlobalAuth
2. **Session Validation**: Checks if existing session is valid (20-minute expiry)
3. **Session Reuse**: If valid, loads existing session from JSON file
4. **Fallback Auth**: If expired, performs fresh authentication
5. **Test Execution**: Test runs with authenticated browser context

### **3. Session Management**
- **Caching Strategy**: In-memory caching prevents duplicate AuthManager instances
- **File-Based Persistence**: Sessions stored as JSON files for reuse across test runs
- **Expiry Handling**: 20-minute session expiry with automatic refresh
- **Multi-Context Support**: Separate sessions for different CLIENT+ROLE+ENV combinations

## ⚙️ Configuration Resolution

### **Environment Variable Priority**
```
Direct Environment Variables
    ↓ (if not set)
Client Configuration Defaults
    ↓ (if not set)  
System Defaults (demo, admin, dev)
```

### **URL Resolution Example**
- ENV=dev, CLIENT=demo → Uses `demoportaldev.channel-fusion.com`
- ENV=uat, CLIENT=demo → Uses `demoportaluat.channel-fusion.com`
- ENV=prod, CLIENT=hankook → Uses hankook production URLs

### **Auth File Naming Pattern**
- `auth-demo-admin-dev.json` (demo client, admin role, dev environment)
- `auth-hankook-dealer-uat.json` (hankook client, dealer role, uat environment)

## 🔧 Usage in Test Cases

### **Basic Test Setup**
```typescript
import { test, expect } from '../base-test';

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Auth is automatically available and configured
    // based on CLIENT, ROLE, ENV environment variables
    
    // Verify authentication (optional check)
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should access protected page', async ({ page, auth }) => {
    // Your test logic here
    // Page is already authenticated
    await page.goto('/protected-route');
    await expect(page).toHaveURL(/protected-route/);
  });
});
```

### **Role-Specific Testing**
```typescript
test.describe('Admin Role Tests', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Set role context (can also be done via ENV var)
    process.env.ROLE = 'admin';
    
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Test admin-specific functionality
  });
});
```

### **Multi-Environment Testing**
```typescript
// Run with: CLIENT=demo ENV=uat ROLE=dealer npm run test
test.describe('UAT Environment Tests', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Auth automatically uses UAT environment URLs
    // and dealer role permissions
    
    console.log('🎯 Testing in UAT environment with dealer role');
    
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      await auth.ensureAuthenticated();
    }
  });

  test('should work in UAT environment', async ({ page }) => {
    // Test runs against UAT URLs with dealer permissions
    await page.goto('/dealer/reports');
  });
});
```

### **Custom Authentication Scenarios**
```typescript
test.describe('Custom Auth Scenarios', () => {
  test('should handle session expiry gracefully', async ({ page, auth }) => {
    // Force session validation
    const isValid = await auth.hasValidSession();
    
    if (!isValid) {
      console.log('🔄 Session expired, re-authenticating...');
      await auth.ensureAuthenticated();
    }
    
    // Continue with test
    await page.goto('/dashboard');
  });

  test('should work with different client', async ({ page, auth }) => {
    // This would use different client if CLIENT env var is set
    // e.g., CLIENT=hankook ROLE=admin ENV=dev
    
    await page.goto('/');
    // Test runs with hankook client configuration
  });
});
```

## 🎯 Best Practices

### **1. Environment Variables**
- Always set CLIENT, ROLE, ENV for consistent testing
- Use package.json scripts for common combinations
- Default values: CLIENT=demo, ROLE=admin, ENV=dev

### **2. Session Management**
- Sessions auto-expire after 20 minutes
- System automatically handles re-authentication
- Multiple CLIENT+ROLE+ENV combinations maintain separate sessions

### **3. Test Organization**
- Use `test.beforeEach` for authentication setup
- Check authentication state when needed
- Leverage role-based testing for different user types

### **4. Configuration**
- Add new clients in `client-modules-access.ts`
- Environment-specific URLs are handled automatically
- No hardcoding of URLs or credentials in test files

## 🚀 Running Tests

### **Quick Commands**
```bash
# Default (demo-admin-dev)
npm run test

# Specific client/environment
CLIENT=demo ENV=uat ROLE=dealer npm run test

# Environment-specific config
npm run test:dev
npm run test:uat

# Client-specific
npm run test:demo:dev
npm run test:hankook:uat
```

### **Debug Authentication**
```bash
# Run with console logs to see auth flow
npm run test:headed

# Run specific test with auth debugging
CLIENT=demo ENV=dev ROLE=admin npm run test tests/smoke/reports-dashboard.spec.ts --headed
```

This architecture provides a robust, scalable authentication system that supports multiple clients, roles, and environments while maintaining session efficiency and providing seamless integration for test development.