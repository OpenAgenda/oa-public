'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/lib', '/esm'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/test/**/*.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.js', 'test/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
