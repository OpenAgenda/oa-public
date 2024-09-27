'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/esm', '/lib'],

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
        '.storybook/**/*.js',
        'stories/**/*.js',
        'src/**/*.js',
        'test/**/*.js',
      ],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
