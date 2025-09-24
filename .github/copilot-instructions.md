# Copilot Instructions

## General Rules

- Follow user instructions **exactly**.
- Avoid unnecessary **verbosity and test cases**.
- Keep solutions **clean, modern, and concise**.
- Preserve project structure and avoid redundancy.
- No unnecessary files, comments only when needed.
- While running tests, use script which takes minimum time.
- If encountered multiple errors while testing, fix all errors in one go.
- ✅ Use **PascalCase** for **test/spec file names** (e.g., `CreateList.spec.ts`, `UpdateUser.spec.ts`).
- ✅ Use **camelCase** for **variables and function names** (e.g., `userName`, `getContactList`).
- ❌ Do **NOT** create unnecessary files (e.g., if `CreateList.spec.ts` exists, do not create `CreateList.new.spec.js` or `.update.spec.ts` duplicates).
- For credentials use `client-modules-access.ts` file.
- Use static_files from `fixtures/test-data/static_files/` folder for file upload tests.

## Playwright Usage

- Always use **Playwright MCP** to:
  - Open the target URL.
  - Inspect the page.
  - Identify all form fields, buttons, links, navigation before writing test cases.
  - Use **fetch to load related JS files** when creating test cases to understand overall logic.
- If a test case fails:
  - Use **MCP again** to open the URL.
  - Mimic the inspection process again.
  - Retry writing or fixing the test with updated findings.
- Run tests with **90s timeout** (unless specified).
- Default environment: **Uat env** (`https://demoportaluat.channel-fusion.com`).

## Field Interaction Patterns for Test Cases

When creating test cases for different field types, use these interaction patterns:

### Select2 Fields

- **Single Select**: Click `combobox` → Select `treeitem`
- **Multi-Select**: Click `textbox` → Select multiple `treeitem` options
- Selected items appear as removable tags with × symbols

### Date Picker Fields

- Click `textbox` with date placeholder → Select `cell` from calendar widget
- Dates auto-format as MM/DD/YYYY

### File Upload/Dropzone Fields

- Click dropzone area → Handle `filechooser` event → Set files using absolute paths
- Use files from `fixtures/test-data/static_files/` folder

## Selectors & URLs (Most Important)

- Always prioritise ID selectors (e.g., `#elementID`). And then class selectors (e.g., `.className`).
- Do **NOT** hardcode selectors (e.g., `text=/product|item|shop|order/i`).
- Always use selectors from the **Utils/selectors.ts** file.
- Do **NOT** hardcode URLs in tests.
- Always fetch URLs from a dedicated **Utils/urls.ts** file.

## Authentication

- Always use **global-auth setup** for login/authentication.
- Login URL: `https://demoportaluat.channel-fusion.com/account/login`.
- Post-login URL: `https://demoportaluat.channel-fusion.com/index`.

## Code Organization

- Use **Page Object Model (POM)**.
- Place common selectors & helpers in **Utils**.
- In `pages` → create actual module folders (e.g., `lms`, `brand-shop`) inside the **modules** folder.
- In `e2e` → create test files directly under the **e2e** folder.

## Commands

- Use **PowerShell syntax** (Windows) or **CMD** (Windows).
