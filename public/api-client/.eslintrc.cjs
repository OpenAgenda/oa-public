'use strict';

module.exports = {
  extends: '../.eslintrc',

  parserOptions: {
    sourceType: 'module',
  },

  // Generated code is not hand-written — don't lint it. It has its own style and
  // trips repo rules it can't satisfy (no-shadow, no-explicit-any in the codegen
  // output); it's verified against the spec, not the repo's rules. Same as the
  // build output. (Repo convention, cf. packages/strapi ignoring /types/generated.)
  ignorePatterns: ['src/generated/**', 'dist/**'],

  // Resolve relative TS imports (src/index.ts re-exports ./generated/*) — same
  // resolver the other TS packages use (see packages/strapi).
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },

  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          `${__dirname}/openapi-ts.config.ts`,
          `${__dirname}/tsdown.config.ts`,
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['**/*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
};
