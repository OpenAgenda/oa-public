module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/tsup.config.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['src/**/*.{tsx,ts,jsx,js}', '*.stories.{tsx,ts,jsx,js}'],
    },
  ],
};
