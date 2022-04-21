'use strict';

const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,

  testPathIgnorePatterns: ['<rootDir>/test/e2e/']
};
