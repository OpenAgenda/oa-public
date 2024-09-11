module.exports = {
  extends: ['airbnb'],
  plugins: ['import', 'jsx-a11y', 'react', 'react-hooks', 'unicorn'],
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
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'no-extra-parens': [
      'error',
      'all',
      {
        ignoreJSX: 'all',
        nestedBinaryExpressions: false,
        enforceForArrowConditionals: false,
        conditionalAssign: false,
      },
    ],
    'no-promise-executor-return': 'off',
    'no-bitwise': ['error', { int32Hint: true }],
    'consistent-return': 'off',
    'implicit-arrow-linebreak': 'off',
    // 'space-in-parens': [ 'error', 'always' ],
    'max-len': ['off', 80],
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
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/static-property-placement': ['error', 'static public field'],
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['label'],
        labelAttributes: ['htmlFor'],
        controlComponents: ['Field', 'input', 'textarea', 'select'],
        depth: 3,
      },
    ],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '^useMemoOne|useCallbackOne|use.*Effect$',
      },
    ],

    'unicorn/prefer-node-protocol': 'error',
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
            destructuredArrayIgnorePattern: '^_',
          },
        ],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'react/require-default-props': 'off',
      },
    },
    {
      files: ['*.mjs'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
        'unicorn/prefer-module': ['error'],
      },
    },
  ],
};
