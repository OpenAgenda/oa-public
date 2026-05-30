'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/scripts/**/*.{js,mjs}`,
          `${__dirname}/test/**/*.{js,mjs}`,
          `${__dirname}/jest.config.js`,
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
      files: ['test/**/*.{js,mjs}'],
      env: { jest: true, node: true, es2021: true },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
