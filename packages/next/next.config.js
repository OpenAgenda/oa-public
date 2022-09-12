'use strict';

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const {
  config
} = require('cibul-node');

const {
  apiClient
} = require('@openagenda/react-shared');

module.exports = async phase => {
  const serverRuntimeConfig = {
    config
  };

  if (phase !== PHASE_PRODUCTION_BUILD) {
    serverRuntimeConfig.api = (req, method, ...args) => apiClient(`http://localhost:${config.port}`, req)[method](...args)
  }

  const nextConfig = {
    serverRuntimeConfig,
    async rewrites() {
      return {
        fallback: [{
          source: '/:path*',
          destination: `http://localhost:${config?.port}/:path*`
        }]
      };
    }
  };
  
  if (config?.next?.CDN) {
    nextConfig.assetPrefix = config.next.CDN;
  }

  return nextConfig;
};
