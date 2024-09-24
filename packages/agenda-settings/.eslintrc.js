'use strict';

module.exports = {
  extends: '../../.eslintrc',
  parserOptions: {
    sourceType: 'script',
  },
  ignorePatterns: ['/dist', '/stories/static'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.babelrc.js`,
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.js`,
          `${__dirname}/server.dev.js`,
          `${__dirname}/seeds/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/testconfig.js`,
          `${__dirname}/scripts/**/*.js`,
        ],
      },
    ],
  },
  overrides: [
    {
      files: [
        'src/client/**/*.js',
        '.storybook/**/*.js',
        'stories/**/*.js',
        'server.dev.js',
        'seeds/**/*.js',
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
