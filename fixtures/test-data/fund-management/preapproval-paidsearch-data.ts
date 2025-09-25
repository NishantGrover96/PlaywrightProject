// fixtures/test-data/fund-management/preapproval-paidsearch-data.ts

export const PreapprovalPaidSearchTestData = {
  dealer: {
    number: '10000',
    validNumbers: ['10000', '10001', '10002'],
    invalidNumbers: ['', '0', '99999']
  },

  adContent: {
    title: 'Test Paid Search Ad',
    validTitles: [
      'Test Paid Search Ad',
      'Demo Marketing Campaign',
      'Fund Management Test Ad'
    ],
    invalidTitles: ['', 'a'.repeat(256)] // empty and too long
  },

  uploadFiles: {
    validFile: 'static_files/excel/testcsv.xlsx',
    testFiles: [
      'static_files/excel/testcsv.xlsx'
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

export const PreapprovalPaidSearchSelectors = {
  dealerNumber: '#txtdealernumber',
  continueButton: 'button[name="Continue"]',
  paidSearchLink: 'link[name="Paid Search"]',
  adTitle: '#txtAdTitle',
  fileDropzone: '#dropzone_fuBGImage div',
  submitButton: 'button[name="Submit"]',
  successHeading: 'heading[name=" Congratulations! You\'ve"]'
};