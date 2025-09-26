export const CommonSelectors = {
  // Authentication - Updated with MCP-discovered selectors
  login: {
    usernameInput: 'textbox[name="Username"]',
    passwordInput: 'textbox[name="Password"]',
    loginButton: 'button:has-text("Sign In")',
    errorMessage: '[class*="error"], [class*="alert"], .error-message',
    forgotPassword: 'link:has-text("Forgot Password?")',
    needHelp: 'link:has-text("Need Help?")',
    loginHeading: 'heading:has-text("Sign Into Your Account")',
  },

  // Navigation - Based on MCP exploration
  navigation: {
    sidebar: 'nav, [class*="sidebar"], [class*="menu"], list',
    menuItem: 'a[href], [class*="menu-item"], [class*="nav-item"], listitem',
    breadcrumbs: '[class*="breadcrumb"], nav[aria-label="breadcrumb"]',
    userProfile:
      'button:has-text("David Lenzen Corporate Admin"), [class*="user"], [class*="profile"]',
    logoutButton: 'text=/logout/i, [class*="logout"]',
    moduleGrid: 'list', // Main dashboard module grid
    moduleCard: 'listitem',
  },

  // Common UI Elements
  ui: {
    button: 'button, [class*="btn"], [role="button"]',
    input: 'input, textarea',
    dropdown: 'select, [class*="dropdown"], [role="combobox"]',
    checkbox: 'input[type="checkbox"], [role="checkbox"]',
    radioButton: 'input[type="radio"], [role="radio"]',
    table: 'table, [class*="table"], [class*="grid"]',
    modal: '[class*="modal"], [role="dialog"]',
    tab: '[role="tab"], [class*="tab"]',
    tooltip: '[class*="tooltip"], [role="tooltip"]',
    link: 'a, link',
    heading: 'h1, h2, h3, h4, h5, h6, heading',
    text: 'text, span, p, div',
    generic: 'generic, div',
  },

  // Data Table
  table: {
    header: 'thead th, [class*="header"] th, th',
    row: 'tbody tr, [class*="row"], tr',
    cell: 'td, [class*="cell"]',
    sortButton: '[class*="sort"], th button',
    pagination: '[class*="pagination"], [class*="pager"]',
  },

  // Forms
  form: {
    container: 'form, [class*="form"]',
    field: '[class*="field"], [class*="form-group"]',
    label: 'label, [class*="label"]',
    required: '[required], [class*="required"]',
    error: '[class*="error"], [class*="invalid"]',
    submit: 'button[type="submit"], input[type="submit"]',
    cancel: 'button[type="button"]:has-text("Cancel"), button:has-text("Cancel")',
  },

  // Loading and Status
  status: {
    loading: '[class*="loading"], [class*="spinner"], .loading',
    success: '[class*="success"], [class*="alert-success"]',
    error: '[class*="error"], [class*="alert-error"], [class*="alert-danger"]',
    warning: '[class*="warning"], [class*="alert-warning"]',
    info: '[class*="info"], [class*="alert-info"]',
  },

  // Common Actions
  actions: {
    add: 'button:has-text("Add"), button:has-text("Create"), button:has-text("New")',
    edit: 'button:has-text("Edit"), [class*="edit"], [title*="edit" i]',
    delete: 'button:has-text("Delete"), [class*="delete"], [title*="delete" i]',
    save: 'button:has-text("Save"), button[type="submit"]',
    cancel: 'button:has-text("Cancel"), button:has-text("Close")',
    search: 'input[type="search"], [placeholder*="search" i], [class*="search"] input',
    filter: '[class*="filter"], [class*="dropdown"]',
  },

  // Demo Portal Specific (based on MCP exploration)
  demoPortal: {
    corporateAdmin: 'text="Corporate Admin"',
    davidLenzen: 'text="David Lenzen"',
    recentActivities: 'text="Recent Activities / Notification(s)"',
    processingClaims: 'text=/Now processing.*claims/i',
    processingPreApprovals: 'text=/Now processing.*pre-approvals/i',
    modules: {
      adsAssets: 'link:has-text("Ads & Assets")',
      brandShop: 'link:has-text("Brand Shop")',
      coopManagement: 'link:has-text("Coop Management")',
      engageHQ: 'link:has-text("EngageHQ")',
      incentives: 'link:has-text("Incentives")',
      lms: 'link:has-text("LMS")',
      rebates: 'link:has-text("Rebates")',
      rewards: 'link:has-text("Rewards")',
      spiff: 'link:has-text("SPIFF")',
      resources: 'link:has-text("Resources")',
    },
  },

  // Access Control
  access: {
    accessDenied: 'text=/access denied/i',
    unauthorized: 'text=/unauthorized/i',
    forbidden: 'text=/403/i',
    notFound: 'text=/404/i',
    serverError: 'text=/500/i',
    permissionError: 'text=/permission/i',
  },

  // Page Layout
  layout: {
    header: 'header, [role="banner"]',
    footer: 'footer, [role="contentinfo"]',
    main: 'main, [role="main"], [class*="content"]',
    aside: 'aside, [role="complementary"]',
    nav: 'nav, [role="navigation"]',
  },
};
