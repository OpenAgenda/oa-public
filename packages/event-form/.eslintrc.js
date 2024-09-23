'use strict';

module.exports = {
  extends: '@openagenda',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['build'],

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
      files: [
        'src/**/*.js',
        'dev/client/**/*.js',
        'stories/**/*.js',
        'test/**/*.js',
      ],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
