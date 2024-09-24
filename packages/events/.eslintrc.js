'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/iso/build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/**/*.test.js`,
          `${__dirname}/**/*.spec.js`,
          `${__dirname}/test/**/*.js`,
        ],
      },
    ],
  },
};
