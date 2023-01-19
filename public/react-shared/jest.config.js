'use strict';

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
