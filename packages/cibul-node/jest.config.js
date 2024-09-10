export default {
  testMatch: [
    '**/__tests__/**/*.?([m|c])[jt]s?(x)',
    '**/?(*.)+(spec|test).?([m|c])[jt]s?(x)',
  ],
  transform: {},
  globalSetup: '<rootDir>/test/globalSetup.js',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 40000,
  verbose: false,
  silent: false,
};
