'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

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
