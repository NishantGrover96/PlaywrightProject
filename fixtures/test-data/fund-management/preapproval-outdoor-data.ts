// fixtures/test-data/fund-management/preapproval-outdoor-data.ts

export const PreapprovalOutdoorTestData = {
  dealer: {
    number: '10000',
    validNumbers: ['10000', '10001', '10002'],
    invalidNumbers: ['', '0', '99999']
  },
  adContent: {
    title: 'Test outdoor',
    validTitles: [
      'Test outdoor',
      'Outdoor Marketing Campaign',
      'Fund Management Outdoor Ad'
    ],
    invalidTitles: ['', 'a'.repeat(256)]
  },
  uploadFiles: {
  validFile: 'static_files/images/test.png',
    testFiles: [
      'static_files/images/test.png'
    ]
  },
  expectedResults: {
    successHeading: 'Congratulations! You\'ve',
    successMessage: 'Your pre-approval request has been submitted successfully'
  },
  urls: {
    submitPreapproval: '/CoopManagement/PreApproval/Submit/SubmitPreApproval',
    dashboard: '/CoopManagement/Dashboard?navtitle=Fund%20Mgmt'
  }
};

export const PreapprovalOutdoorSelectors = {
  dealerNumber: '#txtdealernumber',
  continueButton: 'button[name="Continue"]',
  outdoorLink: 'a:has-text("Outdoor")',
  adTitle: '#txtAdTitle',
  fileDropzone: '#dropzone_fuBGImage i',
  submitButton: 'button[name="Submit"]',
  successHeading: 'text=Congratulations'
};
