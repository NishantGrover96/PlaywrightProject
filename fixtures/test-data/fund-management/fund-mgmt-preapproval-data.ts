/**
 * Fund Management Preapproval Test Data
 * Contains test data for Fund Management Preapproval tests
 */

export const FUND_MGMT_PREAPPROVAL_TEST_DATA = {
  // Test scenarios
  scenarios: {
    outdoorPreapproval: {
      name: 'Fund Management - Outdoor Preapproval Request',
      description: 'Submit a preapproval request for outdoor media type with dealer 10000',
    },
  },

  // Test data
  testData: {
    dealerNumber: '10000',
    expectedDealerName: 'TEST DEALER',
    mediaType: 'Outdoor',
    adTitle: 'Test',
    submissionComment: 'Submission Text',
    uploadFileName: 'scan_20250828_125706_125.png',
  },

  // File paths
  filePaths: {
    staticFilesImages: 'static_files\\images\\',
    uploadFile: 'static_files\\images\\scan_20250828_125706_125.png',
  },

  // URLs and paths
  paths: {
    preapprovalSubmit: '/CoopManagement/PreApproval/Submit/SubmitPreApproval',
    fundMgmtDashboard: '/CoopManagement/Dashboard',
  },

  // Expected validation messages
  validationMessages: {
    success: 'Congratulations! You\'ve submitted your Pre-Approval.',
    confirmationNumberPattern: /CONFIRMATION #: \d+/,
    emailConfirmation: 'You\'ve been sent an email confirmation of this request',
    statusCheckAvailable: 'You can check the status of your submissions anytime',
  },

  // Wizard steps
  wizardSteps: {
    dealer: {
      stepNumber: 1,
      title: 'Dealer',
      description: 'Select dealer by name or number',
    },
    mediaType: {
      stepNumber: 2,
      title: 'Media Type',
      description: 'Choose the media type for the preapproval',
    },
    formSubmission: {
      stepNumber: 3,
      title: 'Form Submission',
      description: 'Fill out the preapproval form details',
    },
  },

  // Media types available
  mediaTypes: [
    'Campaign',
    'Direct',
    'Display Advertising (Digital Banners and Native Advertising)',
    'FLYERS / INSERTS',
    'Outdoor',
    'Paid Search',
    'Paid Social (Facebook, Instagram, Pinterest, and X ads; boosted posts)',
    'Point of Sale (POS) Materials',
    'Print Advertising (Newspaper and Magazine)',
    'Radio and Streaming Radio Commercials',
    'Screens (TV and Streaming TV; Online Video)',
    'Shows and Events',
    'Sponsorships',
    'Website Development and SEO',
  ],

  // Authorized roles for this feature
  authorizedRoles: ['admin', 'dealer'],

  // Timeouts
  timeouts: {
    pageLoad: 90000,
    elementVisible: 90000,
    fileUpload: 90000,
    formSubmission: 90000,
  },

  // Form requirements
  formRequirements: {
    requiredFields: ['dealerNumber', 'mediaType', 'adTitle', 'uploadFile'],
    optionalFields: ['offer', 'submissionComment', 'otherContacts'],
    fileUploadFormats: [
      '.avi', '.bmp', '.doc', '.docx', '.gif', '.html', '.jpeg', '.jpg',
      '.mdi', '.mht', '.mp3', '.mp4', '.mpeg', '.mpg', '.msg', '.pdf',
      '.png', '.ppsx', '.ppt', '.rar', '.rtf', '.tif', '.txt', '.vsd',
      '.wav', '.wmv', '.xls', '.xlsx', '.xps', '.zip'
    ],
    maxFileSize: '250 MB',
  },
} as const;