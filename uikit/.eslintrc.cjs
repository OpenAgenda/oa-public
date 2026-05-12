module.exports = {
  extends: ['../.eslintrc'],

  ignorePatterns: ['/dist'],

  parserOptions: {
    sourceType: 'module',
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/tsdown.config.ts`,
          `${__dirname}/stories/**/*.{tsx,ts,jsx,js}`,
          `${__dirname}/.storybook/**/*.{tsx,ts,jsx,js}`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.{tsx,ts,jsx,js}', '*.stories.{tsx,ts,jsx,js}'],
      globals: {
        React: true,
      },
    },
  ],

  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
};
