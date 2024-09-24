'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['build', 'stories/static'],

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
      files: ['.storybook/**/*.js', 'stories/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
