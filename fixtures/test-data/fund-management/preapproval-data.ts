// fixtures/test-data/fund-management/preapproval-data.ts
import { DataGenerator } from '../../../utils/data-generators/data-generator';

export const PreapprovalTestData = {
  dealer: {
    number: '10000',
    validNumbers: ['10000'],
    invalidNumbers: ['', '0', 'abc']
  },

  adContent: {
    title: DataGenerator.randomString(10),
    validTitles: [
      DataGenerator.randomString(15),
      DataGenerator.randomString(18),
      DataGenerator.randomString(25)
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
  }
};