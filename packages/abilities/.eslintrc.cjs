'use strict';

module.exports = {
  extends: ['../../.eslintrc'],

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.babelrc.js`,
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/server.dev.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/scripts/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['**/*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
};
