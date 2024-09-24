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
        devDependencies: [`${__dirname}/stories/**/*.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.js', 'stories/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
