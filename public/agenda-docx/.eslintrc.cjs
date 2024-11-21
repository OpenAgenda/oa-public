'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/client/build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/config.dev.js`,
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
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
