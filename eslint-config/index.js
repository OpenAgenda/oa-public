const path = require('node:path');

module.exports = {
  parser: '@babel/eslint-parser',

  extends: [
    'airbnb',
    '@openagenda/eslint-config/recommended',
    'plugin:jest/recommended',
  ],

  plugins: ['import', 'jsx-a11y', 'react', 'react-hooks', 'unicorn'],

  overrides: [
    {
      files: ['*.{tsx,ts,mts,cts}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        '@openagenda/eslint-config/recommended',
        'plugin:jest/recommended',
      ],
    },
    {
      files: ['*.{cjs,cts}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],

  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },

  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
    jsxPragma: null, // for @typescript/eslint-parser
    babelOptions: {
      rootMode: 'upward',
    },
  },

  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': path.resolve(__dirname, './resolver'),
  },
};
