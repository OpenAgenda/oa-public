const withTM = require('next-transpile-modules')([
  '@openagenda/intl',
  '@openagenda/react-filters',
  '@openagenda/react-shared',
  '@openagenda/uikit',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const NODE_ROUTES = [
  // '/api', // also used by next
  '/events',
  '/users',
  '/incoming-emails', // (POST)
  '/locations',
  '/home',
  '/admin',
  '/dist', // (/networkApps)
  '/abilities',
  '/unsubscribe',
  '/docx',
  '/signin',
  '/signup',
  '/signout',
  '/newsletter',
  '/services',
  '/flash',
  '/start',
  '/discover',
  '/decouvrir',
  '/entdecken',
  '/decouvrirbr',
  '/descubrir',
  '/scoprire',
  '/session',
  '/latest-inbox-timestamp',
  '/widgets',
  '/agendas',
  '/agendas.:format',
  '/facebook',
  '/twitter',
  '/google',
  '/activate',
  '/password',
  '/new',
  '/supervisor',
  '/settings',
  '/support',
  '/notifications',

  '/images',
  '/css',
  '/js',
];

const NODE_STRICT_ROUTES = [
  '/en',
  '/de',
  '/br',
  '/es',
  '/it',
];

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
      ].concat(NODE_ENV !== 'production' ? [
        {
          protocol: 'https',
          hostname: 'cibuldev.s3.amazonaws.com',
        },
      ] : []),
    },
    productionBrowserSourceMaps: true,
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
        beforeFiles: [
          ...NODE_ROUTES.map(route => ({
            source: `/:locale${route}/:path*`,
            destination: `${NEXT_API_INTERNAL_BASE_URL}${route}/:path*`,
            locale: false,
          })),
          ...NODE_STRICT_ROUTES.map(route => ({
            source: route,
            destination: `${NEXT_API_INTERNAL_BASE_URL}${route}`,
            locale: false,
          })),
        ],
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
