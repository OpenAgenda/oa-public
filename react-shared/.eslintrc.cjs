'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.{js,jsx}`,
          `${__dirname}/stories/**/*.{js,jsx}`,
          `${__dirname}/scripts/**/*.{js,jsx}`,
          `${__dirname}/test/**/*.{js,jsx}`,
          `${__dirname}/tsdown.config.ts`,
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
