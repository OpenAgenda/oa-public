'use strict';

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const config = require('./config');
const initServices = require('./services/init');
const Core = require('./core');

module.exports = async phase => {
  const serverRuntimeConfig = {};

  if (phase !== PHASE_PRODUCTION_BUILD) {
    const services = await initServices();

    const core = Core(services, config);

    services.core = core;

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
          destination: `http://localhost:${config.port}/:path*`
        }]
      };
    }
  };

  if (config.next.CDN) {
    nextConfig.assetPrefix = config.next.CDN;
  }

  return nextConfig;
};
