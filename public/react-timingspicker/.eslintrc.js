'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'script',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.babelrc.js`,
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
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
