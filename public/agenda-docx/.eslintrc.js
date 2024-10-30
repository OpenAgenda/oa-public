'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/client/build', '/client/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/config.dev.js`,
          `${__dirname}/server.dev.js`,
          `${__dirname}/webpack.dev.js`,
          `${__dirname}/webpack.dist.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['client/src/**/*.js', 'test/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
