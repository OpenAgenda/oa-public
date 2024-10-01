module.exports = {
  extends: '../../.eslintrc',

  ignorePatterns: ['/dist'],

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/test/**/*.js`,
          `${__dirname}/testconfig.sample.js`,
          `${__dirname}/testconfig.js`,
        ],
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
