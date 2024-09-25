'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/lib', '/esm'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/scripts/**/*.js`,
          `${__dirname}/test/**/*.js`,
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
