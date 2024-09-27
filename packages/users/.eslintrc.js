'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/seeds/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/testconfig.js`,
        ],
      },
    ],
  },
};
