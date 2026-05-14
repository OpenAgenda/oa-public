'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['embeds/app/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/embeds/app/.storybook/**/*.js`,
          `${__dirname}/embeds/app/stories/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/controlData/test/**/*.js`,
          `${__dirname}/testconfig.js`,
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
