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
        devDependencies: [`${__dirname}/test/**/*.js`, `${__dirname}/app.js`],
      },
    ],
  },
};
