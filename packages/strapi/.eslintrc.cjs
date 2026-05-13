'use strict';

module.exports = {
  extends: '../../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/types/generated', '/dist'],

  settings: {
    'import/resolver': {
      typescript: true,
    },
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/src/admin/vite.config.ts`],
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
