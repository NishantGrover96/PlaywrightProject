// fixtures/test-data/fund-management/preapproval-direct-data.ts

export const PreapprovalDirectTestData = {
  dealer: {
    number: '10000',
    validNumbers: ['10000', '10001', '10002'],
    invalidNumbers: ['', '0', '99999']
  },
  adContent: {
    title: 'Test Direct',
    validTitles: [
      'Test Direct',
      'Direct Marketing Campaign',
      'Fund Management Direct Ad'
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