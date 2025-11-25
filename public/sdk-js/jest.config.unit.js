import sharedConfig from './jest.config.js';

export default {
  ...sharedConfig,
  testPathIgnorePatterns: ['<rootDir>/test/e2e/'],
};
