'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist', '/coverage'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/test/**/*.js`,
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
  ],
};
