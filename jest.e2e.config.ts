export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: __dirname,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['./src/**/*.(ts|js)'],
  coverageDirectory: './coverage-e2e',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
