import fs from 'node:fs/promises';

function getNginxAddress(nodes) {
  return nodes.byGroups(['nginx'])[0].address;
}

export default async function prepareConfig({ dir, envVars, nodes }) {
  const {
    DOMAIN: domain,
    API_DOMAIN: APIDomain,
    NODE_ENV: nodeEnv,
    OA_INTERNAL_SERVER_PORT: internalServerPort,
    OA_SESSION_KEYS: sessionKeys,
    OA_INSIGHT_OPS: insightOps,
    NEXT_PUBLIC_ASSET_PREFIX: nextPublicAssetPrefix,
    NEXT_PUBLIC_MAP_TILES: nextPublicMapTiles,
    SENTRY_AUTH_TOKEN: sentryAuthToken,
    NEXT_PUBLIC_IMAGE_PREFIX: nextPublicImagePrefix,
    STRAPI_API_BASE: strapiAPIBase,
    STRAPI_API_AUTH_TOKEN: strapiAPIAuthToken,
  } = envVars;

  const nextEnvVars = [
    `DOMAIN=${domain}`,
    `API_DOMAIN=${APIDomain}`,
    `NODE_ENV=${nodeEnv}`,
    `NEXT_API_INTERNAL_BASE_URL=http://${getNginxAddress(nodes)}:${internalServerPort}`,
    `NEXT_PUBLIC_MAP_TILES=${nextPublicMapTiles}`,
    `NEXT_SESSION_KEYS=${sessionKeys}`,
    `NEXT_INSIGHT_OPS=${insightOps}`,
    `SENTRY_AUTH_TOKEN=${sentryAuthToken}`,
    `STRAPI_API_BASE=${strapiAPIBase}`,
    `STRAPI_API_AUTH_TOKEN=${strapiAPIAuthToken}`,
  ];

  if (nextPublicImagePrefix) {
    nextEnvVars.push(`NEXT_PUBLIC_IMAGE_PREFIX=${nextPublicImagePrefix}`);
  }

  if (nextPublicAssetPrefix) {
    nextEnvVars.push(`NEXT_PUBLIC_ASSET_PREFIX=${nextPublicAssetPrefix}`);
  }

  await fs.writeFile(`${dir}/oa/packages/next/.env.local`, nextEnvVars.join('\n'));

  await fs.writeFile(`${dir}/oa/packages/cibul-node/config/prod.js`, ['export default {};'].join('\n'));
}
