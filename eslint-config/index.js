'use strict';

const path = require('path');

module.exports = {
  root: true,

  parser: 'babel-eslint',

  extends: ['eslint-config-airbnb', 'plugin:jest/recommended'],

  plugins: [
    'eslint-plugin-import',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks'
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

  rules: {
    strict: ['error', 'safe'],
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    'no-cond-assign': ['error', 'except-parens'],
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
    'consistent-return': 'off',
    // 'space-in-parens': [ 'error', 'always' ],
    'max-len': ['off', 80],
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'only-multiline'],
    // 'computed-property-spacing': [ 'error', 'always' ],
    // 'array-bracket-spacing': [ 'error', 'always' ],
    'prefer-arrow-callback': [ 'error', { allowNamedFunctions: true } ],
    'import/extensions': [ 'warn', {
      js: 'never',
      mjs: 'always'
    } ],
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

    'react/destructuring-assignment': [
      'error',
      'always',
      {
        ignoreClassFields: true
      }
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.js', '.jsx']
      }
    ],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': [
      'error',
      {
        skipUndeclared: true
      }
    ],
    'react/static-property-placement': ['error', 'static public field'],

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
        controlComponents: ['Field', 'input', 'textarea', 'select']
      }
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '^useMemoOne|useCallbackOne|use.*Effect$'
      }
    ]
  }
};
