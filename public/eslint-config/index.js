'use strict';

const path = require('path');

module.exports = {
  root: true,

  parser: '@babel/eslint-parser',

  extends: [
    '@openagenda/eslint-config/recommended',
    'plugin:jest/recommended'
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
    }
  },

  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': path.resolve(__dirname, './resolver')
  },
};
