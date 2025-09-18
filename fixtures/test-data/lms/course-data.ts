import { DataGenerator } from '../../../utils/data-generators/data-generator';

export const CourseTestData = {
  validCourse: {
    title: `Course_${DataGenerator.randomString(6)}`,
    description: `Test course description ${DataGenerator.randomString(10)}`,
    duration: DataGenerator.randomNumber(1, 40),
    category: 'Testing',
    difficulty: 'Beginner',
  },

  multipleCourses: Array.from({ length: 5 }, () => ({
    title: `Course_${DataGenerator.randomString(6)}`,
    description: `Description ${DataGenerator.randomString(8)}`,
    duration: DataGenerator.randomNumber(1, 40),
    category: ['Testing', 'Development', 'Management'][DataGenerator.randomNumber(0, 2)],
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][DataGenerator.randomNumber(0, 2)],
  })),

  invalidCourse: {
    title: '', // Invalid - empty title
    description: DataGenerator.randomString(500), // Too long
    duration: -1, // Invalid duration
    category: '',
    difficulty: 'Unknown',
  },
};
