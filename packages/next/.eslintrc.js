module.exports = {
  root: true,
  extends: ['@openagenda/eslint-config/recommended', 'next/core-web-vitals'],
  plugins: ['unicorn'],
  ignorePatterns: ['/.next', '/public', '/next-env.d.ts'],
  rules: {
    // "@next/next/no-html-link-for-pages": ["error", "src/pages/"]
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
    next: {
      rootDir: __dirname,
    },
    'import/resolver': {
      typescript: {
        project: [`${__dirname}/tsconfig.json`],
      },
      [require.resolve('@openagenda/eslint-config/resolver')]: {},
    },
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    jsxPragma: null,
    tsconfigRootDir: __dirname,
    babelOptions: {
      configFile: false,
    },
  },
};
