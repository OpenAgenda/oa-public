import execCommands from './execCommands.mjs';

export default function pull({ dir, envVars }) {
  return execCommands([
    `cd ${dir}`,
    'cd oa',
    `echo pulling oa`,
    'git fetch origin',
    'git checkout main',
    'git reset --hard origin/main',
    'git clean -xdf -e node_modules'
  ], envVars);
}
