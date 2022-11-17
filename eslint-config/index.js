'use strict';

const path = require('path');

module.exports = {
  parser: '@babel/eslint-parser',

  extends: [
    '@openagenda/eslint-config/recommended',
    'plugin:jest/recommended'
  ],

  overrides: [
    {
      files: ['*.{tsx,ts,mts,cts}'],
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
    'import/resolver': {
      [path.resolve(__dirname, './resolver')]: {},
      node: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.node']
      }
    }
  },
};
