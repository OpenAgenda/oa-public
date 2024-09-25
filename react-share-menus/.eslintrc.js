'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/lib'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: [
        'src/**/*.js',
        'test/**/*.js',
        '.storybook/**/*.js',
        'stories/**/*.js',
      ],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
