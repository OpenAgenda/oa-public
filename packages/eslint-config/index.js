'use strict';

module.exports = {
  root: true,

  parser: 'babel-eslint',

  extends: [
    'airbnb',
    'plugin:jest/recommended'
  ],

  plugins: [
    'import',
    'jsx-a11y',
    'react',
    'react-hooks'
  ],

  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },

  settings: {
    react: {
      version: 'detect'
    }
  },

  rules: {
    strict: ['error', 'safe'],
    'no-param-reassign': ["error", { "props": false }],
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    'consistent-return': 'off',
    // 'space-in-parens': [ 'error', 'always' ],
    'max-len': ['off', 80],
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'only-multiline'],
    // 'computed-property-spacing': [ 'error', 'always' ],
    // 'array-bracket-spacing': [ 'error', 'always' ],

    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'off',
    'import/no-duplicates': 'warn',
    // 'import/no-extraneous-dependencies': [
    //   'error',
    //   { devDependencies: [] }
    // ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index']
      }
    ],

    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.js', '.jsx']
      }
    ],
    'react/jsx-one-expression-per-line': 'off',
    'react/prop-types': [
      'error',
      {
        skipUndeclared: true
      }
    ],
    'react/jsx-props-no-spreading': [
      'error',
      {
        html: 'enforce',
        custom: 'ignore',
        exceptions: [
          'input'
        ]
      }
    ],

    'jsx-a11y/label-has-for': [
      'error',
      {
        required: 'id'
      }
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['Field', 'input']
      }
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
