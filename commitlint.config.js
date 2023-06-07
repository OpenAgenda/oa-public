'use strict';

module.exports = {
  extends: [
    '@commitlint/config-conventional',
    '@commitlint/config-lerna-scopes'
  ],
  rules: {
    'header-max-length': [0],
    'subject-case': [0]
  },
  ignores: [
    commit => /^(Merge commit (.*?))(?:\r?\n)*$/m.test(commit)
  ]
};
