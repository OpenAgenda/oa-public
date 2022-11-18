const { apiClient } = require('@openagenda/react-shared');

const withTM = require('next-transpile-modules')(['@openagenda/uikit']);

/** @type {() => import('next').NextConfig} */
const config = async () => {
  const {
    NEXT_API_INTERNAL_BASE_URL,
    NEXT_PUBLIC_ASSET_PREFIX,
  } = process.env;

  const serverRuntimeConfig = {
    apiRoot: NEXT_API_INTERNAL_BASE_URL,
    api: (req, method, ...args) => apiClient(NEXT_API_INTERNAL_BASE_URL, req)[method](...args),
  };

  return withTM({
    assetPrefix: NEXT_PUBLIC_ASSET_PREFIX || undefined,
    i18n: {
      locales: ['fr', 'en'],
      defaultLocale: 'fr',
    },
    serverRuntimeConfig,
    eslint: {
      dirs: [
        'src',
        'scripts',
        '.storybook',
        'stories',
      ],
    },
    experimental: {
      isrMemoryCacheSize: 0, // Defaults to 50MB
    },
    async rewrites() {
      return {
        fallback: [
          {
            source: '/:path*',
            destination: `${NEXT_API_INTERNAL_BASE_URL}/:path*`,
          },
        ],
      };
    },
  });
};

module.exports = config;
