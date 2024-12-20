import execCommands from './execCommands.mjs';

export default function install({ dir, envVars }) {
  return execCommands([
    `cd ${dir}`,
    'cd oa',
    'echo yarn',
    'yarn',
  ], envVars);
}
