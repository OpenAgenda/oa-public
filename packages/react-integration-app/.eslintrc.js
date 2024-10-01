'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/dist'],

  overrides: [
    {
      files: ['client/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
