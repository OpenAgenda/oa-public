module.exports = {
  // root: true,
  extends: ['../../.eslintrc'],

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/.storybook/**/*.js`,
          `${__dirname}/stories/**/*.{tsx,ts,jsx,js}`,
          `${__dirname}/scripts/**/*.mjs`,
        ],
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },

  overrides: [
    {
      files: ['**/*.{tsx,ts}', 'stories/**/*.stories.{tsx,ts}'],
      parserOptions: {
        project: [`${__dirname}/tsconfig.json`],
      },
    },

    {
      files: ['src/**/*.{tsx,ts,jsx,js}', '*.stories.{tsx,ts,jsx,js}'],
      globals: {
        React: true,
      },
    },
    {
      files: ['*.stories.{tsx,ts,jsx,js}'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
    {
      files: ['scripts/**/*.mjs'],
      rules: {
        // node esm modules require extensions
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
  ],

  settings: {
    'import/resolver': {
      [require.resolve('@openagenda/eslint-config/resolver')]: {},
      typescript: {
        project: [`${__dirname}/tsconfig.json`],
      },
    },
  },

  parserOptions: {
    //   ecmaVersion: 'latest',
    sourceType: 'module',
    //   jsxPragma: null,
    //   babelOptions: {
    //     configFile: false,
    //   },
  },
};
