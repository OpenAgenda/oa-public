'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/scripts/**/*.js`,
          `${__dirname}/test/**/*.js`,
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
