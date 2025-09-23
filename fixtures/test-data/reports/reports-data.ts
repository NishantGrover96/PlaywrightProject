/**
 * Reports Module Test Data
 * Contains test data for Reports Dashboard tests
 */

export const REPORTS_TEST_DATA = {
  // Test scenarios
  scenarios: {
    accessibility: {
      name: 'Reports Dashboard URL Accessibility',
      description: 'Verify that the Reports Dashboard URL can be accessed successfully',
    },
  },

  // Expected page elements
  expectedElements: {
    pageIndicators: ['Reports', 'Report', 'Dashboard', 'List'],
    requiredSections: ['main content area', 'page structure'],
  },

  // URLs and paths
  paths: {
    reportsDashboard: '/Reports/ReportList',
  },

  // Roles and permissions
  authorizedRoles: ['admin', 'dealer'],

  // Timeouts
  timeouts: {
    pageLoad: 45000, // Increased for slower networks
    elementVisible: 15000, // Increased for slower loading
  },
} as const;
