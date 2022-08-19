'use strict';

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const config = require('./config');
const initServices = require('./services/init');
const Core = require('./core');

module.exports = async phase => {
  const serverRuntimeConfig = {};

  if (phase !== PHASE_PRODUCTION_BUILD) {
    const services = await initServices();

    const core = Core(
      serverRuntimeConfig.services,
      config
    );

    services.core = core;

    Object.assign(serverRuntimeConfig, {
      services,
      core,
      config
    });
  } else {
    serverRuntimeConfig.isBuilding = true;
  }

  return {
    assetPrefix: config.next.CDN,
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
};
