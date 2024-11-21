'use strict';

module.exports = {
  root: true,

  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'unicorn/prefer-module': ['error'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/scripts/**/*.js`,
          `${__dirname}/test/**/*.?([m|c])js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/testconfig.js`,
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
