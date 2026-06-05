'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  // Build output — not hand-written, don't lint it. The sandbox bundle (tsdown
  // IIFE, ky+zod inlined) trips repo rules it can't satisfy (no-var,
  // max-classes-per-file).
  ignorePatterns: ['dist/**'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/scripts/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/jest.config.js`,
          `${__dirname}/tsdown.config.ts`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['**/*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      // Tests run under jest with vm-modules: describe/it/expect/etc. are
      // injected globals (no @jest/globals import, matching the repo norm), and
      // they use Node/standard globals (globalThis, URL, fetch, console).
      files: ['test/**/*.js'],
      env: { jest: true, node: true, es2021: true },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
