'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/client/dist'],

  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/dev/**/*.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/webpack.dist.cjs`,
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
