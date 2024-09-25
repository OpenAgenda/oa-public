'use strict';

module.exports = {
  extends: '../.eslintrc',
  parserOptions: {
    sourceType: 'script',
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/config.js`,
          `${__dirname}/**/*.test.js`,
        ],
      },
    ],
  },
};
