import { DataGenerator } from '../../utils/data-generators/data-generator';
import { DateHelper } from '../../utils/helpers/date-helper';

export const CommonTestData = {
  users: {
    validUser: {
      firstName: DataGenerator.randomName('first'),
      lastName: DataGenerator.randomName('last'),
      email: DataGenerator.randomEmail(),
      phone: DataGenerator.randomPhone(),
      company: DataGenerator.randomCompany(),
      address: DataGenerator.randomAddress(),
      role: 'user',
    },

    adminUser: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      phone: DataGenerator.randomPhone(),
      company: 'Test Company',
      address: DataGenerator.randomAddress(),
      role: 'admin',
    },

    multipleUsers: Array.from({ length: 3 }, () => ({
      firstName: DataGenerator.randomName('first'),
      lastName: DataGenerator.randomName('last'),
      email: DataGenerator.randomEmail(),
      phone: DataGenerator.randomPhone(),
      company: DataGenerator.randomCompany(),
      address: DataGenerator.randomAddress(),
      role: ['user', 'dealer', 'distributor'][DataGenerator.randomNumber(0, 2)],
    })),
  },

  credentials: {
    validCredentials: {
      username: 'test.user',
      password: 'P@ssw0rd123!',
    },

    invalidCredentials: {
      username: 'invalid.user',
      password: 'wrongpassword',
    },

    emptyCredentials: {
      username: '',
      password: '',
    },
  },

  dates: {
    today: DateHelper.getCurrentDate(),
    tomorrow: DateHelper.addDays(1),
    yesterday: DateHelper.subtractDays(1),
    nextWeek: DateHelper.addDays(7),
    nextMonth: DateHelper.addMonths(1),
    lastMonth: DateHelper.subtractDays(30),
  },

  searchTerms: [
    'test',
    'sample',
    'demo',
    'product',
    'course',
    'user',
    'admin',
    'training',
    'order',
    'management',
  ],

  errorMessages: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    accessDenied: 'Access denied',
    notFound: 'Page not found',
    serverError: 'Internal server error',
  },

  urls: {
    validUrls: ['https://example.com', 'https://test.org', 'https://demo.net'],
    invalidUrls: ['invalid-url', 'ftp://example.com', 'http://localhost:3000'],
  },

  files: {
    validFileNames: [
      'test-document.pdf',
      'sample-image.jpg',
      'data-export.csv',
      'presentation.pptx',
    ],
    invalidFileNames: [
      'invalid file name.txt',
      'file<>name.doc',
      'very_long_file_name_that_exceeds_normal_limits.xlsx',
    ],
  },
};
