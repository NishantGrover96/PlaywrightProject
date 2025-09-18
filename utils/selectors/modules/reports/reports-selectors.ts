/**
 * Reports Module Selectors
 * Contains all selectors for Reports Dashboard functionality
 */

export const REPORTS_SELECTORS = {
  // Page structure elements - based on actual Reports page inspection
  PAGE_TITLE: 'h1, h2, h3, .page-title, .title, [data-testid="page-title"]',
  MAIN_CONTENT: 'body > .container, body > div, .content-wrapper, .page-content',
  REPORTS_SECTIONS: 'h3', // Report section headings
  
  // Specific Reports page elements
  REWARDS_REPORTS_SECTION: 'h3:has-text("Rewards Reports"), h3:contains("Rewards Reports")',
  INCENTIVES_SECTION: 'h3:has-text("Incentives"), h3:contains("Incentives")',
  COOP_REPORTS_SECTION: 'h3:has-text("Co-op Reports"), h3:contains("Co-op Reports")',
  BRAND_SHOP_REPORTS_SECTION: 'h3:has-text("Brand Shop Reports"), h3:contains("Brand Shop Reports")',
  
  // Report links (any report link to verify content loaded)
  REPORT_LINKS: 'a[href*="/Reports/"]',
  FIRST_REPORT_LINK: 'a[href*="/Reports/"]:first',
  
  // Navigation elements
  TOP_NAVIGATION: 'banner, nav, .navbar, [role="banner"]',
  BREADCRUMB: '.breadcrumb, nav[aria-label="Breadcrumb"], [data-testid="breadcrumb"]',
  
  // Loading states
  LOADING_INDICATOR: '.loading, .spinner, .loader, [data-testid="loading"]',
  
  // Error states
  ERROR_MESSAGE: '.error, .alert-danger, .error-message, [data-testid="error"]',
  NO_ACCESS_MESSAGE: '.no-access, .access-denied, [data-testid="no-access"]',
  
  // Common UI elements
  HEADER: 'header, .header, [data-testid="header"], banner',
  FOOTER: 'footer, .footer, [data-testid="footer"], contentinfo'
} as const;
