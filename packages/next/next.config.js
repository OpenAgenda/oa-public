'use strict';

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const {
  loadServicesAndCore,
  config
} = require('cibul-node');

module.exports = async phase => {
  const serverRuntimeConfig = {};

  if (phase !== PHASE_PRODUCTION_BUILD) {
    const {
      services,
      core,
    } = await loadServicesAndCore();

    Object.assign(serverRuntimeConfig, {
      services,
      core,
      config
    });
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
  
  if (serverRuntimeConfig?.config?.next?.CDN) {
    nextConfig.assetPrefix = serverRuntimeConfig.config.next.CDN;
  }

  return nextConfig;
};
