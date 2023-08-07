import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import getNodeGroupEndpoint from './getNodeGroupEndpoint.mjs';

export default async function cloneAndBuild({
  dir,
  envVars,
  nodeGroups,
}) {
  const {
    DOMAIN: domain,
    API_DOMAIN: APIDomain,
    NODE_ENV: nodeEnv,
    OA_SERVER_PORT: serverPort,
    NEXT_PUBLIC_ASSET_PREFIX: nextPublicAssetPrefix,
  } = envVars;

  const {
    CDN: pushToCDN = false
  } = process.env;

  const nextEnvVars = [
    `DOMAIN=${domain}`,
    `API_DOMAIN=${APIDomain}`,
    `NODE_ENV=${nodeEnv}`,
    `NEXT_API_INTERNAL_BASE_URL=http://${getNodeGroupEndpoint(nodeGroups, 'web')}:${serverPort}`,
  ];

  if (nodeEnv === 'production') {
    nextEnvVars.push(`NEXT_PUBLIC_ASSET_PREFIX=${nextPublicAssetPrefix}`);
  }

  await fs.writeFile(`${dir}/next.local`, nextEnvVars.join('\n'));

  await fs.writeFile(`${dir}/prod.js`, [
    'module.exports = {};'
  ].join('\n'));

  const buildCommands = [
    `cd ${dir}`,
    `echo cloning oa in ${dir}`,
    `git clone git@github.com:OpenAgenda/oa.git`,
    `cd oa`,
    'echo yarn',
    `yarn`,
    'echo yarn prepack',
    `yarn prepack`,
    `cd packages/cibul-templates`,
    `yarn build:${nodeEnv === 'production' ? 'prod' : 'dev'}`,
    `cp ${dir}/next.local ${dir}/oa/packages/next/.env.local`,
    `cp ${dir}/prod.js ${dir}/oa/packages/cibul-node/config/prod.js`,
    `cd ${dir}/oa/packages/next`,
    `yarn build`,
  ];

  if (pushToCDN === '1') {
    buildCommands.push('yarn push');
  }

  return new Promise((rs, rj) => {
    const p = exec(buildCommands.join('\n'), {
      maxBuffer: Infinity,
      env: {
        ...process.env,
        ...envVars,
      },
    }, (err, stdout, stderr) => {
      if (err) return rj(err);
      rs({ stdout, stderr });
    });

    p.stdout.on('data', data => {
      console.log(data);
    });
  });
}
