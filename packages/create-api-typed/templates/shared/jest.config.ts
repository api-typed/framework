export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: __dirname,
  testPathIgnorePatterns: ['/node_modules/'],
  testRegex: '.*\\.(test|spec)\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: ['<rootDir/src/migrations/'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
