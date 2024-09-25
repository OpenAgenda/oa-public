'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/webpack.config.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['client/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
