'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['client/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/dev/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/webpack.dist.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['client/src/**/*.js', '.storybook/**/*.js', 'stories/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
