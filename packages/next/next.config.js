const withTM = require('next-transpile-modules')([
  '@openagenda/react-filters',
  '@openagenda/react-shared',
  '@openagenda/uikit',
]);

/** @type {() => import('next').NextConfig} */
const config = async () => {
  const {
    NODE_ENV,
    NEXT_API_INTERNAL_BASE_URL,
    NEXT_PUBLIC_ASSET_PREFIX,
  } = process.env;

  return withTM({
    assetPrefix: NEXT_PUBLIC_ASSET_PREFIX || undefined,
    i18n: {
      locales: ['fr', 'en'],
      defaultLocale: 'fr',
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cibul.s3.amazonaws.com',
        },
      ].concat(NODE_ENV !== 'production' ? [
        {
          protocol: 'https',
          hostname: 'cibuldev.s3.amazonaws.com',
        },
      ] : []),
    },
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
      if (!NEXT_API_INTERNAL_BASE_URL) {
        throw new Error('Environment variable NEXT_API_INTERNAL_BASE_URL is not defined');
      }

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
