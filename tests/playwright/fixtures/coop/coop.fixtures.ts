// Central environment-aware test data for the Coop module.
// Values are verified against each environment before committing.
// Last verified: 2026-06-17

export const ENVIRONMENTS = {
  dev:        process.env.LEGACY_DEV_URL     || process.env.MODERN_DEV_URL     || '',
  testing:    process.env.LEGACY_TEST_URL    || process.env.MODERN_TEST_URL    || '',
  uat:        process.env.LEGACY_UAT_URL     || process.env.MODERN_UAT_URL     || '',
  production: process.env.BASE_URL           || '',
} as const;

export const DEALER = {
  email:    process.env.TEST_USER_EMAIL    || '',
  password: process.env.TEST_USER_PASSWORD || '',
  dealerId: process.env.TEST_DEALER_ID     || '',
} as const;

export const ADMIN = {
  email:    process.env.ADMIN_EMAIL    || '',
  password: process.env.ADMIN_PASSWORD || '',
} as const;

export const DEALER_B = {
  dealerId: process.env.DEALER_B_ID || '',
} as const;

// ── Submit Claim fixtures ─────────────────────────────────────

export const CLAIM = {
  mediaTypes: {
    count: 13,                       // Campaign tile excluded for dealers
    adminCount: 14,
  },
  wizard: {
    steps: 3,
  },
  tempClaimPattern: /^\d{6}$/,       // 6-digit temp claim number
  finalClaimPattern: /^\d{4}$/,      // 4-digit final claim number
  invoiceMaxSizeMb: 10,
  supportingDocMaxSizeMb: 250,
  supportingDocMaxFiles: 7,
  descriptionMaxChars: 500,
} as const;

// ── Submit Preapproval fixtures ───────────────────────────────

export const PREAPPROVAL = {
  mediaTypes: {
    count: 14,
  },
  maxCost: 999_999_999.99,
} as const;

// ── Dashboard fixtures ────────────────────────────────────────

export const DASHBOARD = {
  dealer: {
    navTileCount: 5,
  },
  admin: {
    navTileCount: 6,
  },
} as const;

// ── Timeouts ──────────────────────────────────────────────────

export const TIMEOUTS = {
  pageLoad:     30_000,
  ajaxResponse: 10_000,
  fileUpload:   15_000,
} as const;

// ── Known issues ──────────────────────────────────────────────
// Track open bugs so tests can be correctly annotated with test.fixme()

export const KNOWN_ISSUES = {
  dashboardAccessibleWithoutAuth: true,   // Security: Dashboard bypasses auth check
  dealerInfoReturns500: true,             // Bug: DealerInfo page 500 for test accounts
} as const;
