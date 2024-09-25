'use strict';

module.exports = {
  extends: '../.eslintrc',

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
      files: ['fetchLocale.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
