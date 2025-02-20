'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/assets'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/dev/**/*.js`,
          `${__dirname}/test/**/*.js`,
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

  // settings: {
  //   'import/resolver': {
  //     typescript: true,
  //     node: true,
  //   },
  // },
};
