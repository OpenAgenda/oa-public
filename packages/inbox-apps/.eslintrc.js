'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['dist', 'coverage'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/test/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.js', 'test/**/*.js', 'stories/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
