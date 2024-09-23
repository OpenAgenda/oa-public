'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/**/*.test.js`,
          `${__dirname}/**/*.spec.js`,
          `${__dirname}/test/service/index.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: [
        'src/**/*.js',
        '**/*.test.js',
        '**/*.spec.js',
        'test/service/index.js',
      ],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
