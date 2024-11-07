'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  rules: {
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/test/**/*.js`],
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
