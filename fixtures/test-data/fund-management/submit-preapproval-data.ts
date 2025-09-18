/**
 * Submit PreApproval Test Data
 * 
 * Contains test data for various Submit PreApproval scenarios including campaigns,
 * standard media types, shows & events, sponsorships, and validation scenarios.
 */

export const SubmitPreapprovalTestData = {
  // Dealer Information
  dealers: {
    valid: {
      number: '10000',
      name: 'TEST DEALER',
    },
    invalid: {
      number: '99999',
      name: 'INVALID DEALER',
    },
  },

  // Campaign Test Data
  campaigns: {
    validCampaign: {
      title: 'Test Campaign Pre-Approval',
      hasOffer: true,
      expirationDate: '12/31/2025',
      comment: 'Test submission comment for campaign pre-approval',
      emailMe: 'test@channel-fusion.com',
      otherContacts: ['other1@test.com', 'other2@test.com'],
      mediaTypes: [
        {
          type: 'Display Advertising',
          url: 'https://example.com/test-campaign',
          filePath: 'static_files/images/scan_20250828_125706_125.png',
        },
        {
          type: 'Paid Search',
          filePath: 'static_files/documents/test-spreadsheet.xlsx', // Would need to create this
        },
      ],
    },
    
    invalidCampaign: {
      title: 'Invalid Campaign - Single Media',
      hasOffer: false,
      comment: 'This should fail validation',
      emailMe: 'test@channel-fusion.com',
      mediaTypes: [
        {
          type: 'Display Advertising',
          url: 'https://example.com/single-media',
          filePath: 'static_files/images/scan_20250828_125706_125.png',
        },
      ],
    },

    campaignWithMultipleUrls: {
      title: 'Campaign with Multiple URLs',
      hasOffer: false,
      comment: 'Testing multiple URL functionality',
      emailMe: 'test@channel-fusion.com',
      mediaTypes: [
        {
          type: 'Display Advertising',
          urls: [
            'https://example.com/url1',
            'https://example.com/url2',
            'https://example.com/url3'
          ],
          filePath: 'static_files/images/scan_20250828_125706_125.png',
        },
        {
          type: 'Paid Social',
          filePath: 'static_files/images/scan_20250828_125706_125.png',
        },
      ],
    },
  },

  // Standard Media Types Test Data
  standardMedia: {
    displayAdvertising: {
      title: 'Display Advertising Test',
      url: 'https://example.com/display-ad',
      hasOffer: true,
      expirationDate: '12/31/2025',
      comment: 'Display advertising pre-approval test',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/images/scan_20250828_125706_125.png',
    },

    paidSearch: {
      title: 'Paid Search Test',
      comment: 'Paid search pre-approval test',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/documents/paid-search-keywords.xlsx', // Would need this file
    },

    paidSocial: {
      title: 'Paid Social Test',
      comment: 'Paid social pre-approval test',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/images/scan_20250828_125706_125.png',
    },

    printAdvertising: {
      title: 'Print Advertising Test',
      url: 'https://example.com/print-ad',
      hasOffer: false,
      comment: 'Print advertising pre-approval test',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/documents/print-ad-proof.pdf', // Would need this file
    },
  },

  // Shows and Events Test Data
  showsEvents: {
    individualShow: {
      title: 'Individual Trade Show',
      address: '123 Convention Center Blvd',
      city: 'Las Vegas',
      state: 'NV',
      zip: '89101',
      startDate: '06/15/2025',
      endDate: '06/18/2025',
      cost: '$5,000.00',
      equipment: ['Tires', 'Wheels', 'Brake Pads'],
      comment: 'Individual trade show participation',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/documents/show-registration.pdf',
    },

    groupShow: {
      title: 'Group Trade Show',
      address: '456 Expo Center Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      startDate: '08/20/2025',
      endDate: '08/23/2025',
      cost: '$15,000.00',
      equipment: ['Tires', 'Batteries', 'Oil Filters'],
      dealers: ['10001', '10002', '10003'],
      comment: 'Group trade show with multiple dealers',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/documents/group-show-agreement.pdf',
    },
  },

  // Sponsorship Test Data
  sponsorships: {
    validSponsorship: {
      title: 'Racing Event Sponsorship',
      startDate: '07/01/2025',
      endDate: '07/04/2025',
      comment: 'Sponsorship of local racing event',
      emailMe: 'test@channel-fusion.com',
      filePath: 'static_files/documents/sponsorship-agreement.pdf',
    },
  },

  // Email Notification Test Data
  emailNotifications: {
    validEmails: [
      'test1@channel-fusion.com',
      'test2@channel-fusion.com',
      'dealer@example.com',
    ],
    invalidEmails: [
      'invalid-email',
      'test@',
      '@channel-fusion.com',
      'test.com',
    ],
  },

  // File Upload Test Data
  fileUploads: {
    validFiles: {
      image: 'static_files/images/scan_20250828_125706_125.png',
      pdf: 'static_files/documents/test-document.pdf',
      excel: 'static_files/documents/test-spreadsheet.xlsx',
      word: 'static_files/documents/test-document.docx',
    },
    invalidFiles: {
      executable: 'static_files/invalid/test.exe',
      script: 'static_files/invalid/test.js',
      oversized: 'static_files/invalid/large-file.zip', // > 250MB
    },
    mediaSpecificFiles: {
      paidSearch: ['static_files/documents/keywords.xlsx', 'static_files/documents/ad-copy.xls'],
      displayAdvertising: [
        'static_files/images/banner-ad.jpg',
        'static_files/documents/ad-specs.pdf',
        'static_files/images/creative-mockup.png',
      ],
    },
  },

  // URL Test Data
  urls: {
    valid: [
      'https://example.com',
      'https://www.test-site.com/campaign',
      'https://subdomain.example.org/path/to/page',
      'https://example.com/page?param=value',
    ],
    invalid: [
      'not-a-url',
      'http://',
      'https://',
      'ftp://example.com',
      'example.com', // Missing protocol
    ],
    multipleUrls: {
      valid: [
        'https://example.com/url1',
        'https://example.com/url2',
        'https://example.com/url3',
      ],
      tooMany: [
        'https://example.com/url1',
        'https://example.com/url2',
        'https://example.com/url3',
        'https://example.com/url4', // Should fail - max 3 URLs
      ],
    },
  },

  // Validation Error Messages
  validationMessages: {
    required: 'This field is required.',
    invalidEmail: 'Please enter valid email address.',
    invalidUrl: 'Please enter valid format.',
    maxUrls: 'Max 3 urls are allowed.',
    campaignMinimum: 'Please select at least two media types',
    invalidDate: 'End end must be greater than start date.',
    invalidCost: 'Please enter valid cost',
    duplicateEmail: 'Email address already exists.',
    duplicateEquipment: 'Equipment already exits.',
    duplicateDealer: 'Dealer already exits.',
    dealerNotFound: 'Dealer does not exits.',
    invalidDealerId: 'Invalid dealer id for the selected media.',
    showMinimumDealers: 'Show must include at least two dealers.',
    fileRequired: 'This field is required.',
    invalidFileType: 'Please upload acceptable file formats only.',
  },

  // Date Test Data
  dates: {
    validFutureDates: [
      '12/31/2025',
      '06/15/2025',
      '08/20/2025',
    ],
    invalidDates: [
      '12/31/2020', // Past date
      '13/32/2025', // Invalid date format
      'invalid-date',
    ],
    dateRanges: {
      valid: {
        start: '06/15/2025',
        end: '06/18/2025',
      },
      invalid: {
        start: '06/18/2025',
        end: '06/15/2025', // End before start
      },
    },
  },

  // Cost Test Data
  costs: {
    valid: [
      '$1,000.00',
      '$5,500.50',
      '$15,000.00',
      '$999,999.99',
    ],
    invalid: [
      '$0.00',
      '-$1,000.00',
      'invalid-cost',
      '$abc',
    ],
  },

  // Equipment Test Data (for Shows & Events)
  equipment: {
    valid: [
      'Tires',
      'Brake Pads',
      'Oil Filters',
      'Batteries',
      'Spark Plugs',
      'Air Filters',
    ],
    duplicate: 'Tires', // To test duplicate validation
  },

  // Dealer Numbers (for Group Shows)
  dealerNumbers: {
    valid: ['10001', '10002', '10003', '10004', '10005'],
    invalid: ['99998', '99999'],
    duplicate: '10001', // To test duplicate validation
  },

  // Test Scenarios Configuration
  scenarios: {
    smoke: {
      dealer: '10000',
      mediaType: 'Campaign',
    },
    
    e2e: {
      dealer: '10000',
      campaignData: 'validCampaign',
      shouldSubmit: true,
    },
    
    regression: {
      validationTests: [
        'requiredFields',
        'emailValidation',
        'urlValidation',
        'fileUploadValidation',
        'campaignMinimumMedia',
        'dateValidation',
        'costValidation',
      ],
    },
  },

  // Environment-specific data
  environments: {
    dev: {
      baseUrl: 'https://demoportaldev.channel-fusion.com',
      dealer: '10000',
    },
    uat: {
      baseUrl: 'https://demoportaluat.channel-fusion.com',
      dealer: '10000',
    },
    prod: {
      baseUrl: 'https://demoportal.channel-fusion.com',
      dealer: '10000',
    },
  },
} as const;

// Type definitions for better TypeScript support
export type SubmitPreapprovalTestDataType = typeof SubmitPreapprovalTestData;

// Helper functions for test data
export class SubmitPreapprovalDataHelper {
  static getCampaignData(type: keyof typeof SubmitPreapprovalTestData.campaigns) {
    return SubmitPreapprovalTestData.campaigns[type];
  }

  static getStandardMediaData(type: keyof typeof SubmitPreapprovalTestData.standardMedia) {
    return SubmitPreapprovalTestData.standardMedia[type];
  }

  static getShowsEventsData(type: keyof typeof SubmitPreapprovalTestData.showsEvents) {
    return SubmitPreapprovalTestData.showsEvents[type];
  }

  static getValidationMessage(type: keyof typeof SubmitPreapprovalTestData.validationMessages) {
    return SubmitPreapprovalTestData.validationMessages[type];
  }

  static getRandomValidEmail(): string {
    const emails = SubmitPreapprovalTestData.emailNotifications.validEmails;
    return emails[Math.floor(Math.random() * emails.length)];
  }

  static getRandomValidUrl(): string {
    const urls = SubmitPreapprovalTestData.urls.valid;
    return urls[Math.floor(Math.random() * urls.length)];
  }

  static getFutureDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US');
  }

  static getDateRange(startDaysFromNow: number = 30, durationDays: number = 3): { start: string; end: string } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startDaysFromNow);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    
    return {
      start: startDate.toLocaleDateString('en-US'),
      end: endDate.toLocaleDateString('en-US'),
    };
  }
}
