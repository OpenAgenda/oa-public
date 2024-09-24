'use strict';

module.exports = {
  extends: ['@openagenda'],

  ignorePatterns: ['dist'],

  parserOptions: {
    sourceType: 'script',
  },

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
      files: ['src/**/*.js'],

      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
