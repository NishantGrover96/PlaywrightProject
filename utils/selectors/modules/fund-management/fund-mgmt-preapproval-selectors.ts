/**
 * Fund Management Preapproval Selectors
 * Contains all selectors for Fund Management Preapproval functionality
 * Updated with accurate IDs and classes from MCP browser inspection
 */

export const FUND_MGMT_PREAPPROVAL_SELECTORS = {
  // Multi-step wizard elements
  WIZARD_CONTAINER: 'application[role="tablist"]',
  WIZARD_TABS: '[role="tab"]',
  WIZARD_TAB_DEALER: 'tab:has-text("1. Dealer")',
  WIZARD_TAB_MEDIA_TYPE: 'tab:has-text("2. Media Type")',
  WIZARD_TAB_FORM_SUBMISSION: 'tab:has-text("3. Form Submission")',

  // Step 1 - Dealer Selection (Accurate IDs)
  DEALER_NAME_RADIO: 'input[name="selectDealer"][value="0"]',
  DEALER_NUMBER_RADIO: '#radioDealerNumber', // Accurate ID
  DEALER_NUMBER_INPUT: '#txtdealernumber', // Accurate ID discovered from MCP
  CONTINUE_BUTTON_STEP1: '#ContinueNextStep', // Specific to Step 1
  RESET_BUTTON: '#ResetDealerSearch', // Accurate ID
  RECENT_DEALER_BUTTON: '#RecentDealerView', // Accurate ID

  // Step 2 - Media Type Selection (Accurate classes and IDs)
  MEDIA_TYPE_HEADING: 'h3:has-text("Choose Media Type")',
  MEDIA_TYPE_OPTIONS: 'a.clsSelectMediaType', // Accurate class
  OUTDOOR_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Outdoor")', // Accurate class + text
  CAMPAIGN_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Campaign")',
  DIRECT_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Direct")',
  DISPLAY_ADVERTISING_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Display Advertising")',
  FLYERS_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("FLYERS / INSERTS")',
  PAID_SEARCH_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Paid Search")',
  PAID_SOCIAL_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Paid Social")',
  POS_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Point of Sale")',
  PRINT_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Print Advertising")',
  RADIO_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Radio and Streaming")',
  SCREENS_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Screens")',
  SHOWS_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Shows and Events")',
  SPONSORSHIPS_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Sponsorships")',
  WEBSITE_MEDIA_TYPE: 'a.clsSelectMediaType:has-text("Website Development")',
  CONTINUE_BUTTON_STEP2: '#btnContinue', // Accurate ID for Step 2 Continue
  BACK_BUTTON_STEP2: 'button.clsBackClaimWizardMedia', // Accurate class

  // Step 3 - Form Submission (Accurate IDs)
  DEALER_INFO_SECTION: 'p:has(strong)',
  DEALER_NUMBER_DISPLAY: 'strong:has-text("10000")',
  DEALER_NAME_DISPLAY: 'strong:has-text("TEST DEALER")',
  
  // Form fields
  OFFER_CHECKBOX: 'input[type="checkbox"]',
  AD_TITLE_INPUT: '#txtAdTitle',
  FILE_UPLOAD_AREA: 'div:has-text("Please upload or drag and drop file")',
  FILE_UPLOAD_SUCCESS: 'img:has([alt*=".png"])',
  SUBMISSION_COMMENT_INPUT: '#txtMainComment',
  
  // Email confirmation section
  EMAIL_SECTION_HEADING: 'h6:has-text("Send email confirmations to the following")',
  MY_EMAIL_INPUT: 'input[type="email"]',
  OTHER_CONTACTS_INPUT: 'input[placeholder*="email"]',
  ADD_CONTACT_BUTTON: '#btnAddOtherContact', // Accurate ID

  // Form actions (Accurate IDs)
  SUBMIT_BUTTON: '#btnSubmitPreApproval', // Accurate ID
  FORM_BACK_BUTTON: '#FormSubmissionBackBtn', // Accurate ID
  RESET_FORM_BUTTON: '#ResetPreApprovalForm', // Accurate ID

  // Alternative/Fallback Continue buttons discovered
  CONTINUE_BUTTON_PREAPPROVAL: '#ContinuePreApproval', // Alternative Continue button
  CONTINUE_BUTTON_GENERIC: 'button:has-text("Continue")', // Generic fallback

  // Success page elements (Multiple possible selectors for different success message formats)
  SUCCESS_HEADING: 'h4:has-text("Congratulations"), h3:has-text("Congratulations"), h2:has-text("Congratulations"), h1:has-text("Congratulations"), .success-message, .alert-success, [class*="success"]:has-text("Congratulations"), text="Congratulations! You\'ve submitted your Pre-Approval."',
  SUCCESS_MESSAGE: '.alert-success, .success-message, [class*="success"], .confirmation-message',
  SUCCESS_TEXT: 'text="Congratulations! You\'ve submitted your Pre-Approval."',
  CONFIRMATION_NUMBER: 'h2[data-testid="confirmation-number"], h2:has-text("CONFIRMATION #"), strong:has-text("CONFIRMATION"), [class*="confirmation"]:has-text("#")',
  SUCCESS_INSTRUCTIONS: 'ul li, .instructions, .next-steps',
  BACK_TO_HOME_LINK: 'a:has-text("Back to Home Page"), a:has-text("Home"), a:has-text("Dashboard")',
  SUBMIT_ANOTHER_LINK: 'a:has-text("Submit Another Pre-Approval"), a:has-text("Submit Another"), a:has-text("New Preapproval")',
  SUBMIT_NEW_LINK: 'a:has-text("Submit New Pre-Approval"), a:has-text("Submit New"), a:has-text("New Request")',

  // Common page elements
  PAGE_TITLE: 'h4:has-text("Request a Pre-Approval")',
  MAIN_CONTENT: '.container, .content-wrapper, main',
  LOADING_INDICATOR: '.loading, .spinner, .loader',
  ERROR_MESSAGE: '.error, .alert-danger, .validation-error',
} as const;