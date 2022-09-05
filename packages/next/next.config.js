'use strict';

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const loadServicesAndCore = require('cibul-node/loadServicesAndCore');

module.exports = async phase => {
  const serverRuntimeConfig = {};

  if (phase !== PHASE_PRODUCTION_BUILD) {
    const {
      services,
      core,
      config
    } = await loadServicesAndCore();

    Object.assign(serverRuntimeConfig, {
      services,
      core,
      config
    });
  } else {
    serverRuntimeConfig.isBuilding = true;
  }

  const nextConfig = {
    serverRuntimeConfig,
    async rewrites() {
      return {
        fallback: [{
          source: '/:path*',
          destination: `http://localhost:${serverRuntimeConfig.config?.port}/:path*`
        }]
      };
    }
  };

  if (serverRuntimeConfig?.next?.CDN) {
    nextConfig.assetPrefix = serverRuntimeConfig.next.CDN;
  }

  return nextConfig;
};
