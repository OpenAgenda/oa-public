import sharedConfig from './jest.config.js';

export default {
  ...sharedConfig,
  testMatch: [
    '**/__tests__/e2e/**/*.[jt]s?(x)',
    '**/e2e/?(*.)+(spec|test).[jt]s?(x)',
  ],
};
