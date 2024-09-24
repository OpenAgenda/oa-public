'use strict';

module.exports = {
  extends: '@openagenda',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['lib'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
        ],
      },
    ],
  },
};
