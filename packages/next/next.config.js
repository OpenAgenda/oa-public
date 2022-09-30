const { config: nodeConfig } = require('cibul-node');
const { apiClient } = require('@openagenda/react-shared');

const withTM = require('next-transpile-modules')(['@openagenda/uikit']);

// TODO:
// NEXT_PUBLIC_ASSET_PREFIX
// NEXT_API_BASE_URL=`http://localhost:${config.port}`

/** @type {() => import('next').NextConfig} */
const config = async () => {
  const serverRuntimeConfig = {
    config: nodeConfig,
    api: (req, method, ...args) => apiClient(`http://localhost:${nodeConfig.port}`, req)[method](...args),
  };

  return withTM({
    experimental: {
      images: {
        allowFutureImage: true,
        // remotePatterns: [
        //   {
        //     protocol: 'https',
        //     hostname: 'openagenda.com',
        //   },
        // ],
      },
    },
    assetPrefix: nodeConfig?.next?.CDN || undefined,
    serverRuntimeConfig,
    async rewrites() {
      return {
        fallback: [
          {
            source: '/:path*',
            destination: `http://localhost:${nodeConfig?.port}/:path*`,
          },
        ],
      };
    },
  });
};

module.exports = config;
