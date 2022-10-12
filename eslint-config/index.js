'use strict';

module.exports = {
  root: true,

  parser: '@babel/eslint-parser',

  extends: [
    '@openagenda/eslint-config/recommended',
    'plugin:jest/recommended'
  ],

  overrides: [
    {
      files: ['*.{ts,mts,cts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
    }
  ],

  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true
  },

  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true
    },
    jsxPragma: null, // for @typescript/eslint-parser
    babelOptions: {
      rootMode: 'upward',
    },
  },

  settings: {
    react: {
      version: 'detect'
    },
    // 'import/resolver': path.resolve(__dirname, './resolver')
    'import/resolver': {
      node: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.node']
      }
    }
  },
};
