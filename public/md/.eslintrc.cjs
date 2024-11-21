'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
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
