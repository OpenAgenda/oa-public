'use strict';

module.exports = {
  testMatch: [
    '**/__tests__/**/*.?([m|c])[jt]s?(x)',
    '**/?(*.)+(spec|test).?([m|c])[jt]s?(x)',
  ],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 40000,
  verbose: false,
  silent: false,
};
