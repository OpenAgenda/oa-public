import execCommands from './execCommands.mjs';

export default function build({ dir, envVars }) {
  const {
    NODE_ENV: nodeEnv,
  } = envVars;

  const { CDN: pushToCDN = false } = process.env;

  const commands = [
    `cd ${dir}`,
    'cd oa',
    'echo yarn turbo prepack',
    'yarn turbo prepack',
    'cd packages/cibul-templates',
    `yarn build:${nodeEnv === 'production' ? 'prod' : 'dev'}`,
    `cp ${dir}/next.local ${dir}/oa/packages/next/.env.local`,
    `cp ${dir}/prod.js ${dir}/oa/packages/cibul-node/config/prod.js`,
    `cd ${dir}/oa/packages/next`,
    'yarn build',
  ];

  if (pushToCDN === '1') {
    commands.push('yarn push');
  }

  return execCommands([
    `cd ${dir}`,
    `echo cloning oa in ${dir}`,
    'git clone git@github.com:OpenAgenda/oa.git',
  ], envVars);
}
