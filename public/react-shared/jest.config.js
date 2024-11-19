export default {
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
