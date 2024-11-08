'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/tsup.config.js`,
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
