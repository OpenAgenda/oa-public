'use strict';

const path = require('path');
const cp = require('child_process');

async function getPackages(context) {
  const ctx = context || {};
  const cwd = ctx.cwd || process.cwd();

  const root = cp.execSync('git rev-parse --show-toplevel', { cwd })
    .toString('utf-8')
    .trimEnd();

  const workspaces = cp.execSync('yarn workspaces list --json', { cwd })
    .toString('utf-8')
    .trimEnd()
    .split('\n')
    .map(line => JSON.parse(line));

  return workspaces
    .filter(({ location }) => {
      const packageJson = require(path.join(root, location, 'package.json'))
      return !packageJson?.workspaces?.length;
    })
    .filter(({ name }) => Boolean(name))
    .map(({ name }) => (name.charAt(0) === '@' ? name.split('/')[1] : name));
}

module.exports = {
  extends: [
    '@commitlint/config-conventional'
  ],
  rules: {
    'header-max-length': [0],
    'subject-case': [0],
    'scope-enum': async ctx => {
      const packages = await getPackages(ctx);
      return [2, 'always', packages];
    },
  },
  ignores: [
    commit => /^(Merge commit (.*?))(?:\r?\n)*$/m.test(commit),
  ],
};
