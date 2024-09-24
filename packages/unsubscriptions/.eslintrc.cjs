module.exports = {
  extends: '@openagenda',

  parserOptions: {
    sourceType: 'module',
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [`${__dirname}/test/**/*.js`],
      },
    ],
  },

  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
  ],
};
