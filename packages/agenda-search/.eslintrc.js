'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/server.dev.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['server.dev.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
