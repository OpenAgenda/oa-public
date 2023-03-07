const withTM = require('next-transpile-modules')([
  '@openagenda/intl',
  '@openagenda/react-filters',
  '@openagenda/react-shared',
  '@openagenda/sdk-js',
  '@openagenda/uikit',
  'intl-messageformat',
  'intl-messageformat-parser',
  'react-intl',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {() => import('next').NextConfig} */
const config = async () => {
  const {
    NODE_ENV,
    NEXT_API_INTERNAL_BASE_URL,
    NEXT_PUBLIC_ASSET_PREFIX,
  } = process.env;

  return withBundleAnalyzer(withTM({
    assetPrefix: NEXT_PUBLIC_ASSET_PREFIX || undefined,
    i18n: {
      locales: ['default', 'en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'eu', 'oc', 'io'],
      defaultLocale: 'default',
      localeDetection: false,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cibul.s3.amazonaws.com',
        },
        {
          protocol: 'https',
          hostname: 'images.openagenda.com',
        },
      ].concat(NODE_ENV !== 'production' ? [
        {
          protocol: 'https',
          hostname: 'cibuldev.s3.amazonaws.com',
        },
        {
          protocol: 'https',
          hostname: 'imagesdev-1cb1b.kxcdn.com',
        },
      ] : []),
    },
    // productionBrowserSourceMaps: true,
    eslint: {
      dirs: [
        'src',
        'scripts',
        '.storybook',
        'stories',
      ],
      // ignoreDuringBuilds: true,
    },
    // typescript: {
    //   ignoreBuildErrors: true,
    // },
    experimental: {
      isrMemoryCacheSize: 0, // Defaults to 50MB
    },
    async redirects() {
      return [
        {
          source: '/:slug.prv/:path*',
          destination: '/:slug/:path*',
          permanent: true,
        },
      ];
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
  }));
};

module.exports = config;
