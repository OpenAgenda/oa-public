'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/stories/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.js', 'stories/**/*.js', 'test/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
