// fixtures/test-data/fund-management/preapproval-data.ts

export const PreapprovalTestData = {
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
    Excel: 'static_files/excel/testcsv.xlsx',
    Img: 'static_files/images/test.png',
    Pdf: 'static_files/pdf/testpdf.pdf',
    testFiles: [
      'static_files/excel/testcsv.xlsx',
      'static_files/images/testimage.png',
      'static_files/pdf/testpdf.pdf'
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