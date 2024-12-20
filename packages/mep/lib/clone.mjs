import execCommands from './execCommands.mjs';

export default function clone({ dir, envVars }) {
  return execCommands([
    `cd ${dir}`,
    `echo cloning oa in ${dir}`,
    'git clone git@github.com:OpenAgenda/oa.git',
  ], envVars);
}
