'use strict';

const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,

  testMatch: [
    '**/__tests__/e2e/**/*.[jt]s?(x)',
    '**/e2e/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
