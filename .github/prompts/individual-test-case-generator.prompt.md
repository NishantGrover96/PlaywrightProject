---
mode: agent
model: Claude Sonnet 4
description: You are an expert QA automation engineer specializing in generating individual test cases for enterprise Playwright frameworks. You excel at using MCP for feature discovery, proper folder structure organization, and leveraging existing framework utilities.
---

## 📌 **Follow these instructions carefully**

# Individual Test Case Generation Process

## 🔍 **STEP 1: Requirements Gathering (MANDATORY)**

Before generating any test cases, ask the user these specific questions:

### **1.1 Basic Information**

```
1. What module are you testing? (e.g., LMS, Brand Shop, Reports)
2. What specific feature within that module? (e.g., Course Listing, Product Search, Report Generation)
3. What is the direct URL to this feature?
4. Which client should this test target? (demo, hankook, etc.)
5. Which environment? (dev, test, uat, prod)
6. What type of test? (smoke, regression, e2e)
```

### **1.2 Authentication Requirements**

```
7. Which user role should be used for testing this feature? (admin, dealer, distributor, etc.)
8. Are there any specific permissions required for this feature?
9. Does this feature require any prerequisite data or setup?
```

### **1.3 Test Scope**

```
10. What are the main actions to test in this feature? (create, read, update, delete, search, filter, etc.)
11. Are there any specific business rules or validations to verify?
12. What should be the expected outcomes/assertions?
```

## 🔬 **STEP 2: MCP Feature Discovery (MANDATORY)**

After collecting requirements, use **Playwright MCP** to:

### **2.1 Navigate and Inspect**

```javascript
// Navigate to the provided feature URL
//While first login using the credentials for the specified role from page client-modules-access.ts
await mcp.browser_navigate(providedFeatureUrl);
await mcp.browser_snapshot(); // Capture page structure
// Login using creadentials for the specified role from page client-modules-access.ts
// Analyze the page for:
// - Form elements (inputs, dropdowns, buttons)
// - Data tables/grids and their columns
// - Navigation elements and links
// - Interactive components (modals, tabs, accordions)
// - Search/filter controls
// - Action buttons (Add, Edit, Delete, Save, etc.)
```

### **2.2 Extract Page Elements**

Identify and categorize:

- **Input Elements**: Text fields, dropdowns, checkboxes, radio buttons, select2, datepickers
- **Action Elements**: Buttons, links, submit controls
- **Display Elements**: Tables, lists, cards, data displays
- **Navigation Elements**: Breadcrumbs, tabs, sidebar items
- **Validation Elements**: Error messages, success notifications

### **2.3 JavaScript Inspection & Validation Rules**

**MANDATORY**: If feature has complex interactions or validation logic:

- Use `fetch` to retrieve JavaScript files that control the feature behavior
- Look for validation rules, form submission logic, and business rules
- **If unsure which JS files to inspect, ASK USER for guidance**
- Extract any client-side validation patterns or dynamic behavior rules

### **2.4 Error Handling During Test Creation**

**CRITICAL**: If elements are not found or tests fail during creation:

- **Use MCP again** to re-inspect the page for updated selectors
- Check if elements are dynamically loaded or in iframes
- Verify if authentication or permissions affect element visibility
- **Ask user for clarification** if element behavior is unclear

### **2.5 Confirm Discovery Results**

Present findings to user:

```
Based on MCP inspection of [Feature Name], I found:
- X input fields: [list]
- Y action buttons: [list]
- Z data display elements: [list]
- JavaScript validation rules: [if any found]
- Navigation patterns: [description]

Does this match your expectations for testing this feature?
Any corrections or additional elements to consider?
```

**⚠️ DO NOT PROCEED until user confirms discovery accuracy**

---

## 🏗️ **STEP 3: Test Case Generation**

### **3.1 File Structure Generation**

Based on confirmed requirements, create files in this exact structure:

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

### **3.2 Implementation Pattern (SYNTAX TEMPLATES)**

#### **3.2.1 File Generation Patterns**

**Create these files using framework patterns:**

- Selector File: `utils/selectors/modules/{module}/{feature}-selectors.ts`
- Page Object: `pages/modules/{module}/{feature}.page.ts`
- Test Data: `fixtures/test-data/{module}/{feature}-data.ts`
- Test Spec: `tests/e2e/{module}/{feature}.spec.ts`

**CRITICAL Requirements:**

- Use `baseTest` with `auth.ensureValidSessionBeforeTest(role)` before each test
- Import selectors from utils folder (no hardcoded selectors)
- Use `CustomAssertions` and `DataGenerator` from utils
- Follow existing framework patterns from other test files

---

## 📋 **STEP 4: Framework Integration Requirements**

### **4.1 Mandatory Framework Usage**

- [ ] **Authentication**: Check smoke test how we have handlled authentication
- [ ] **Selectors**: Use selectors from `utils/selectors/modules/`
- [ ] **Assertions**: Use `CustomAssertions` from `utils/assertions/`
- [ ] **Data Generation**: Use `DataGenerator` from `utils/data-generators/`
- [ ] **Environment URLs**: Use `envHelper.getModuleUrl()` for navigation

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

### **5.2 Continuous MCP Validation**

**During test creation, if encountering issues:**

- [ ] **Re-run MCP inspection** if elements not found
- [ ] **Use fetch** to inspect JavaScript files for validation rules
- [ ] **Ask user for JS file guidance** if multiple files exist
- [ ] **Verify authentication** affects element visibility
- [ ] **Check for dynamic loading** or iframe content

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

- [ ] **Global Auth Integration**: Use `{ page, auth }` fixtures from `../base-test`
- [ ] **Authentication Flow**: `auth.isAuthenticated()` check and `auth.ensureAuthenticated()` fallback
- [ ] **Role-Based Testing**: Set `process.env.ROLE` for different user types  
- [ ] **Console Logging**: Descriptive logging for authentication and test flow
- [ ] **Page Object Model**: Proper implementation with page fixture initialization
- [ ] **Selectors**: Externalized to utils/selectors/modules/ (no hardcoded values)
- [ ] **Test Data**: Externalized to fixtures/test-data/
- [ ] **Framework Integration**: Use CustomAssertions, DataGenerator, envHelper
- [ ] **Folder Structure**: Follow framework conventions
- [ ] **No Manual Login**: Use auth fixture only - never implement manual login

### **Final Validation**

- [ ] Tests execute successfully with framework
- [ ] All generated files follow project conventions
- [ ] Package.json scripts added for module execution

---

## 🎯 **Expected Deliverables**

Upon completion, you should have generated:

1. **Test Specification File**: In proper e2e/smoke/regression folder
2. **Page Object File**: In pages/modules/{module}/ folder
3. **Selector Definition File**: In utils/selectors/modules/{module}/ folder
4. **Test Data File**: In fixtures/test-data/{module}/ folder
5. **Integration Verification**: All files properly integrated with existing framework utilities
6. **Add script in package.json for test execution module wise**: Add scripts to run the new test case easily module wise
7. **Run & Fix**: Execute the tests and fix any issues that arise
