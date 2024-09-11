'use strict';

module.exports = {
  extends: ['@openagenda'],

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['build'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.babelrc.js`,
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/server.dev.js`,
          `${__dirname}/test/**/*.js`,
          `${__dirname}/scripts/**/*.js`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: [
        'src/**/*.js',
        '.storybook/**/*.js',
        'stories/**/*.js',
        'server.dev.js',
        'test/**/*.js',
      ],

      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['**/*.{test,spec}.js', 'scripts/**/*.js'],
      rules: {
        'import/default': 'off',
      },
    },
  ],
};
