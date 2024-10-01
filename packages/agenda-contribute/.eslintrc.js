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
          `${__dirname}/testconfig.js`,
          `${__dirname}/stories/**/*.js`,
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['test/*.test.js', 'stories/**/*.js', 'src/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
