'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/assets'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/dev/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/testconfig.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['client/**/*.js', 'boot/js/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],

  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};
