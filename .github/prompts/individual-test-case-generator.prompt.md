---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in generating individual test cases for enterprise Playwright frameworks. You excel at using MCP for feature discovery, proper folder structure organization, and leveraging existing framework utilities.
---

## 📌 **Follow these instructions carefully**

# Individual Test Case Generation Process

## 🔍 **STEP 1: Quick Requirements (5 Questions Only)**

Ask user these **5 essential questions only**:

```
1. What feature URL should I test? (provide full URL)
2. Which client/role? (demo-admin, demo-dealer, etc.)
3. Which environment? (dev, test, uat, prod)
4. What main actions to test? (create, update, search, etc.)
5. What should I verify at the end? (success message, data created, etc.)
```

**⚠️ DO NOT ask 20 questions. Keep it simple but maintain proper SaaS architecture!**

## 🎯 **STEP 2: Smart MCP with Codegen-Quality Selectors**

### **2.1 Enhanced MCP Discovery Strategy**

**Use MCP automation with Codegen selector principles:**

```javascript
// 1. Navigate and authenticate using MCP
await mcp.browser_navigate(featureUrl);
await mcp.browser_snapshot(); // Capture initial page

// 2. Smart selector extraction with Codegen priorities
// Priority Order: ID > getByRole > getByText > Class > Complex CSS
// Focus on these selector types from MCP inspection:

CODEGEN_STYLE_SELECTORS = {
  // Priority 1: getByRole (Codegen's top choice)
  roles: {
    buttons: "getByRole('button', { name: 'Submit' })",
    links: "getByRole('link', { name: 'Continue' })", 
    textboxes: "getByRole('textbox', { name: 'Title' })",
    comboboxes: "getByRole('combobox', { name: 'Category' })"
  },
  
  // Priority 2: getByText (Codegen uses frequently)
  texts: {
    buttons: "getByText('Submit')",
    links: "getByText('Continue')",
    headings: "getByText('Success!')"
  },
  
  // Priority 3: getByLabel (Form elements)
  labels: {
    inputs: "getByLabel('Email Address')",
    checkboxes: "getByLabel('I agree to terms')"
  },
  
  // Priority 4: locator (When semantic selectors unavailable)
  locators: {
    ids: "locator('#elementId')",
    classes: "locator('.submit-button')",
    css: "locator('input[type=\"file\"]')"
  },
  
  // Priority 5: getByTestId (Best practice)
  testIds: "getByTestId('submit-form')"
}

// 3. MCP tests these exact Codegen selector patterns
// Perform actual user flow using modern Playwright selectors
```

### **2.2 MCP Validation with Codegen Principles**

**During MCP inspection, use exact Codegen selector patterns:**

1. **getByRole()**: Look for semantic roles - `getByRole('button', { name: 'Submit' })`
2. **getByText()**: Use text content - `getByText('Continue')`  
3. **getByLabel()**: Form labels - `getByLabel('Email Address')`
4. **locator()**: When semantic unavailable - `locator('#elementId')`
5. **getByTestId()**: Modern best practice - `getByTestId('submit-form')`

### **2.3 MCP Smart Interaction Testing**

```javascript
// MCP tests using exact Codegen selector patterns
await mcp.browser_click("button", { name: "Submit" }); // getByRole equivalent
await mcp.browser_type("textbox", { name: "Title" }, "test"); // getByRole textbox
await mcp.browser_wait_for("Success!"); // getByText equivalent

// MCP Codegen-style fallback strategy:
// Try getByRole first → getByText → getByLabel → locator → getByTestId
try {
  await mcp.browser_click("button", { name: "Submit" }); // getByRole
} catch {
  await mcp.browser_click("Submit"); // getByText
} catch {
  await mcp.browser_click("#submitButton"); // locator fallback
}
```

### **2.4 Best of Both Worlds Benefits**

**MCP Automation + Codegen Selector Quality:**
- ✅ **No Manual Steps**: MCP handles all browser automation
- ✅ **Reliable Selectors**: Uses Codegen's proven selector priorities
- ✅ **Live Validation**: MCP tests selectors immediately
- ✅ **Smart Fallbacks**: If ID fails, tries role, then text, then class
- ✅ **Faster Development**: No manual recording needed

---

## 🏗️ **STEP 3: SaaS Architecture with Simple Implementation**

### **3.1 Required File Structure (SaaS Standard)**

**Always create these files for maintainability:**

```
tests/
├── smoke/
│   └── {module-name}.spec.ts          # If smoke test requested
├── regression/
│   └── {module-name}/
│       └── {feature-name}.spec.ts     # If regression test requested
└── e2e/
    └── {module-name}/
        └── {feature-name}.spec.ts     # If e2e test requested

pages/
└── modules/
    └── {module-name}/
        └── {feature-name}.page.ts     # Page Object Model

utils/
└── selectors/
    └── modules/
        └── {module-name}/
            └── {feature-name}-selectors.ts    # Element selectors

fixtures/
└── test-data/
    └── {module-name}/
        └── {feature-name}-data.ts     # Test data
```

### **3.2 Smart MCP Implementation Templates**

#### **3.2.1 Selectors File with MCP-Discovered Elements**

```typescript
// utils/selectors/modules/{module}/{feature}-selectors.ts
export const {FeatureName}Selectors = {
  // MCP discovers these using Codegen-style patterns
  
  // Priority 1: getByRole selectors (most reliable)
  roles: {
    submitButton: { role: 'button', name: 'Submit' },
    continueButton: { role: 'button', name: 'Continue' },
    titleInput: { role: 'textbox', name: 'Title' },
    categorySelect: { role: 'combobox', name: 'Category' }
  },
  
  // Priority 2: getByText selectors (dynamic content)
  texts: {
    submitButton: 'Submit',
    successMessage: 'Form submitted successfully',
    errorMessage: 'Please fix the errors below'
  },
  
  // Priority 3: getByLabel selectors (form elements)
  labels: {
    emailInput: 'Email Address',
    passwordInput: 'Password',
    agreeCheckbox: 'I agree to the terms'
  },
  
  // Priority 4: locator selectors (fallback)
  locators: {
    container: '#form-container',
    fileUpload: 'input[type="file"]',
    loadingSpinner: '.loading-spinner'
  },
  
  // Priority 5: getByTestId (modern best practice)
  testIds: {
    submitForm: 'submit-form',
    userProfile: 'user-profile'
  }
};
```

#### **3.2.2 MCP-Validated Page Object**

```typescript
// pages/modules/{module}/{feature}.page.ts  
import { Page } from '@playwright/test';
import { {FeatureName}Selectors } from '../../../utils/selectors/modules/{module}/{feature}-selectors';

export class {FeatureName}Page {
  constructor(private page: Page) {}

  // Use exact Codegen-style selectors discovered by MCP
  async fillForm(data: any) {
    // getByRole (Codegen's favorite)
    await this.page.getByRole('textbox', { name: 'Title' }).fill(data.title);
    
    // getByLabel for form elements
    await this.page.getByLabel('Email Address').fill(data.email);
    
    // locator for file uploads
    await this.page.locator('input[type="file"]').setInputFiles(data.filePath);
  }

  async submit() {
    // getByRole for buttons (most reliable)
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async verifySuccess() {
    // getByText for dynamic content
    return this.page.getByText('Form submitted successfully').isVisible();
  }
  
  // Alternative methods using selector object
  async submitAlternative() {
    const selector = {FeatureName}Selectors.roles.submitButton;
    await this.page.getByRole(selector.role, { name: selector.name }).click();
  }
}
```

**CRITICAL Requirements:**

- Use `baseTest` with `{ page, auth }` fixtures (follow existing patterns)
- **Use MCP-discovered selectors** in priority order (ID > Role > Text > Class)
- **Keep implementations simple** - don't over-engineer
- **Focus on main workflow** - avoid unnecessary validation steps  
- **MCP validates selectors work** before code generation
- Follow existing framework patterns from other test files

---

## 📋 **STEP 4: Framework Integration Requirements**

### **4.1 SaaS Framework Integration (Simple but Complete)**

**MUST include in ALL files:**
- [ ] **Selectors File**: Externalized selectors with exact Codegen selectors
- [ ] **Page Object**: Clean methods for each user action (no over-engineering)
- [ ] **Test Data**: Simple externalized data for flexibility
- [ ] **Test File**: Uses page objects, not direct selectors
- [ ] **Global Auth**: Use `{ page, auth }` fixtures properly
- [ ] **Framework Imports**: Import from `../base-test` (not @playwright/test)
- [ ] **Simple Assertions**: Focus on main success criteria only

### **4.2 Naming Conventions**

- [ ] **Files**: Use kebab-case (course-listing.spec.ts)
- [ ] **Classes**: Use PascalCase (CourseListingPage)
- [ ] **Methods**: Use camelCase (navigateToFeature)
- [ ] **Constants**: Use UPPER_SNAKE_CASE for selectors object names

### **4.3 Test Organization**

- [ ] **Describe Blocks**: Use format "{Module Name} - {Feature Name}"
- [ ] **Test Names**: Use descriptive names starting with "should"
- [ ] **Setup**: Use beforeEach for authentication and page setup
- [ ] **Cleanup**: Use afterEach for session cleanup

---

## 🎯 **STEP 5: Generation Validation**

### **5.1 Pre-Generation Checklist**

Verify before generating files:

- [ ] User requirements are clear and complete
- [ ] MCP discovery results are confirmed by user
- [ ] Test scope and assertions are defined
- [ ] Required role and permissions are identified
- [ ] Framework integration points are planned

### **5.2 MCP Smart Validation Process**

**During MCP discovery and test creation:**

- [ ] **MCP Live Testing**: Test each selector during discovery phase
- [ ] **Priority Fallbacks**: If ID fails, MCP tries role, then text, then class
- [ ] **Automatic Validation**: MCP performs click/type/wait to verify selectors work
- [ ] **Keep wait strategies simple** (`waitForLoadState('load')` only)
- [ ] **Focus on main workflow** (avoid over-testing edge cases)
- [ ] **Smart Error Handling**: If MCP selector fails, automatically find alternatives

**MCP Codegen-Style Selector Testing:**
```javascript
// MCP tests selectors using exact Codegen patterns
try {
  await mcp.browser_click("button", { name: "Submit" }); // getByRole (best)
} catch {
  await mcp.browser_click("Submit"); // getByText (fallback)
} catch {
  await mcp.browser_click("#submitButton"); // locator (last resort)
}

// MCP validates these work before generating code:
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Success!').waitFor();
await page.getByLabel('Email').fill('test@example.com');
await page.locator('#fileInput').setInputFiles('file.pdf');
```

---

## 🔧 **Framework Integration Requirements**

**MANDATORY: Use these existing framework utilities:**

- **Authentication**: Use global auth system (see details below)
- **Selectors**: Create in `utils/selectors/modules/` (no hardcoded selectors)
- **Assertions**: Use `CustomAssertions` from utils
- **Data**: Use `DataGenerator` for test data
- **UI Helpers**: Use existing helpers for complex UI components
- **Environment**: Use `envHelper` for URLs

### **🔐 Global Authentication System Usage**

**CRITICAL**: Analyze and follow the implementation pattern from `reports-dashboard.spec.ts`:

#### **1. Import Requirements**

- Import `test` and `expect` from `../base-test` (NOT from @playwright/test)
- Import your page object from the appropriate modules folder
- Import test data from fixtures if needed

#### **2. Authentication Methods in beforeEach**

- Use `{ page, auth }` fixtures in beforeEach
- Initialize page object with the page fixture
- Call `auth.isAuthenticated()` method to check session validity
- Use `auth.ensureAuthenticated()` method for session refresh when needed
- Add console logging for authentication flow visibility

#### **3. Role-Based Testing Implementation**

- Set role context using `process.env.ROLE` assignment
- Support multiple roles: 'admin', 'dealer', 'distributor'
- Create separate tests for different role permissions
- Use descriptive console logging for role context

#### **4. Key Auth Framework Features**

- **Auto Session Management**: 20-minute session expiry with automatic refresh
- **Role Support**: Dynamic role switching via environment variables
- **Environment Support**: Uses CLIENT, ROLE, ENV environment variables
- **Session Caching**: Reuses valid sessions across tests
- **No Manual Login**: Authentication handled automatically by framework

#### **5. Environment Variable Pattern**

- Tests respond to CLIENT, ROLE, ENV environment variables
- Default values: CLIENT=demo, ROLE=admin, ENV=dev
- Can be overridden at runtime or in test execution commands

**⚠️ Study `reports-dashboard.spec.ts` for exact method usage and implementation patterns!**

---

## ✅ **Success Criteria**

### **Generated Test Case Must Include**

- [ ] **Proper SaaS Architecture**: All 4 files (selectors, page object, test data, test spec)
- [ ] **Global Auth Integration**: Use `{ page, auth }` fixtures from `../base-test`
- [ ] **Authentication Flow**: `auth.isAuthenticated()` and `auth.ensureAuthenticated()`
- [ ] **Exact Codegen Selectors**: Don't modify working selectors from recording
- [ ] **Page Object Model**: Clean methods, no business logic
- [ ] **Simple Assertions**: Focus on main success criteria only
- [ ] **Reliable Wait Strategy**: Avoid `networkidle` and timeout-prone patterns
- [ ] **Folder Structure**: Follow framework conventions exactly
- [ ] **Working Implementation**: Test runs successfully on first try

### **Final Validation**

- [ ] Tests execute successfully with framework
- [ ] All generated files follow project conventions
- [ ] Package.json scripts added for module execution

---

## 🎯 **Expected Deliverables**

Upon completion, you should have generated:

1. **Selectors File**: `utils/selectors/modules/{module}/{feature}-selectors.ts` (with exact Codegen selectors)
2. **Page Object File**: `pages/modules/{module}/{feature}.page.ts` (simple, clean methods)
3. **Test Data File**: `fixtures/test-data/{module}/{feature}-data.ts` (minimal required data)
4. **Test Specification File**: `tests/e2e/{module}/{feature}.spec.ts` (working test)
5. **Package Script**: Module-specific npm script for easy execution
6. **Architecture Validation**: Confirm all files follow SaaS patterns
7. **Execution Proof**: Run the test once to confirm it works

**Success = Proper SaaS architecture + Working test that runs reliably! 🎉**
