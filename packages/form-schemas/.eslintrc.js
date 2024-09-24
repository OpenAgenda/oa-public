'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/client/build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/server.dev.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['client/src/**/*.js', 'dev/client/**/*.js', 'stories/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
