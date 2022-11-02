module.exports = {
  extends: ['airbnb'],
  plugins: ['import', 'jsx-a11y', 'react', 'react-hooks'],
  rules: {
    strict: ['error', 'safe'],
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    'no-cond-assign': ['error', 'except-parens'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
    'no-extra-parens': [
      'error',
      'all',
      {
        ignoreJSX: 'all',
        nestedBinaryExpressions: false,
        enforceForArrowConditionals: false,
      },
    ],
    'no-promise-executor-return': 'off',
    'consistent-return': 'off',
    'implicit-arrow-linebreak': 'off',
    // 'space-in-parens': [ 'error', 'always' ],
    'max-len': ['off', 80],
    'arrow-parens': ['error', 'as-needed'],
    'function-call-argument-newline': 'error',
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          consistent: true,
        },
        ObjectPattern: {
          multiline: true,
          consistent: true,
        },
        ImportDeclaration: {
          multiline: true,
          consistent: true,
        },
        ExportDeclaration: {
          multiline: true,
          consistent: true,
        },
      },
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],

    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        mjs: 'never',
      },
    ],
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'off',
    'import/no-duplicates': 'warn',
    'import/prefer-default-export': 'off',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],

    'react/destructuring-assignment': [
      'error',
      'always',
      {
        ignoreClassFields: true,
      },
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function',
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
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
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

  overrides: [
    {
      files: ['*.{tsx,ts,mts,cts}'],
      plugins: ['@typescript-eslint'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_',
          },
        ],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-extra-parens': 'off',
        '@typescript-eslint/no-extra-parens': [
          'error',
          'all',
          {
            ignoreJSX: 'all',
            nestedBinaryExpressions: false,
            enforceForArrowConditionals: false,
          },
        ],
      },
    },
    {
      files: ['*.mjs'],
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
        ],
      },
    },
  ],
};
