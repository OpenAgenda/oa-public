'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/scripts/**/*.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['.eslintrc.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
};
