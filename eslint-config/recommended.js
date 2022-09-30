module.exports = {
  extends: ['airbnb'],
  plugins: [
    'import',
    'jsx-a11y',
    'react',
    'react-hooks'
  ],
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
    'no-extra-parens': 'error',
    'no-promise-executor-return': 'off',
    'consistent-return': 'off',
    // 'space-in-parens': [ 'error', 'always' ],
    'max-len': ['off', 80],
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'always-multiline'],
    'function-call-argument-newline': 'error',
    "object-curly-newline": ["error", {
      "ObjectExpression": {
        "multiline": true,
        "consistent": true
      },
      "ObjectPattern": {
        "multiline": true,
        "consistent": true
      },
      "ImportDeclaration": {
        "multiline": true,
        "consistent": true
      },
      "ExportDeclaration": {
        "multiline": true,
        "consistent": true
      }
    }],
    // 'computed-property-spacing': [ 'error', 'always' ],
    // 'array-bracket-spacing': [ 'error', 'always' ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'import/extensions': [
      'warn', {
        js: 'never',
        mjs: 'always',
      },
    ],
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
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
      },
    ],

    'react/destructuring-assignment': [
      'error',
      'always',
      {
        ignoreClassFields: true,
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': [
      'error',
      {
        skipUndeclared: true,
      },
    ],
    // 'react/react-in-jsx-scope': 'off', // TODO check this
    'react/static-property-placement': ['error', 'static public field'],

    'jsx-a11y/label-has-for': [
      'error',
      {
        required: 'id',
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['Field', 'input', 'textarea', 'select'],
      },
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '^useMemoOne|useCallbackOne|use.*Effect$',
      },
    ],
  },
};
