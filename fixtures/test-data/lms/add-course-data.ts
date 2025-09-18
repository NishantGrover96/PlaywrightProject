/**
 * Add Course Test Data - LMS Module
 * Test data for Add Course feature smoke tests
 */

export const ADD_COURSE_TEST_DATA = {
  // URL configurations for different environments and clients
  DEMO_URLS: {
    dev: 'https://demoportaldev.channel-fusion.com',
    test: 'https://demoportaltest.channel-fusion.com',
    uat: 'https://demoportaluat.channel-fusion.com',
    prod: 'https://demoportal.channel-fusion.com'
  },
  
  HANKOOK_URLS: {
    dev: 'https://dev2.channel-fusion.com',
    test: 'https://test2.channel-fusion.com',
    uat: 'https://uat2.channel-fusion.com',
    prod: 'https://hankook.channel-fusion.com'
  },
  
  // Feature-specific path
  ADD_COURSE_PATH: '/Lms/Core/Course/Submit/SubmitCourse',
  
  // Expected page elements for verification
  EXPECTED_ELEMENTS: {
    PAGE_TITLE_PATTERNS: [
      'Add Course',
      'Submit Course',
      'Course Creation',
      'New Course'
    ],
    SUCCESS_INDICATORS: [
      'content-wrapper',
      'main-content',
      'course-form',
      'page-content'
    ]
  },
  
  // Test timeouts
  TIMEOUTS: {
    PAGE_LOAD: 90000,    // 90 seconds for page load
    ELEMENT_VISIBLE: 90000,  // 30 seconds for element visibility
    NETWORK_IDLE: 15000      // 15 seconds for network idle
  }
} as const;

export type AddCourseTestDataType = typeof ADD_COURSE_TEST_DATA;
