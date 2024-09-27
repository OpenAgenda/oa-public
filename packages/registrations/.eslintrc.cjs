'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/passCulture/test/**/*.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['**/*.js'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
  ],
};
