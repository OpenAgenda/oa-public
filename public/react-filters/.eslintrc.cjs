'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/build', '/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/example/**/*.js`,
          `${__dirname}/webpack.config.cjs`,
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
