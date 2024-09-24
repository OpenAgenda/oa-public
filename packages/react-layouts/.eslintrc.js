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
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['.storybook/**/*.js', 'stories/**/*.js', 'src/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
