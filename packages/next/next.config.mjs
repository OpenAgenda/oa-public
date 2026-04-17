// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import { withSentryConfig } from '@sentry/nextjs';
import bundleAnalyser from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyser({
  enabled: process.env.ANALYZE === 'true',
});

const withSentry = (c) =>
  withSentryConfig(c, {
    org: 'openagenda',
    project: 'openagenda',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monit',
    silent: true,
  });

// https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer, strict-origin-when-cross-origin',
  },
  {
    key: 'Reporting-Endpoints',
    value: `default="${process.env.NEXT_PUBLIC_ROOT}/reports"`,
  },
];

/** @type {() => import('next').NextConfig} */
const config = async () => {
  const { NODE_ENV, NEXT_API_INTERNAL_BASE_URL, NEXT_PUBLIC_ASSET_PREFIX } =
    process.env;

  return withSentry(
    withBundleAnalyzer({
      assetPrefix: NEXT_PUBLIC_ASSET_PREFIX || undefined,
      images: {
        qualities: [75, 100],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.openagenda.com',
          },
          {
            protocol: 'https',
            hostname: 'cdn.openagenda.com',
          },
          {
            protocol: 'https',
            hostname: 'cibul.s3.amazonaws.com',
          },
        ].concat(
          NODE_ENV !== 'production'
            ? [
                {
                  protocol: 'https',
                  hostname: 'cibuldev.s3.amazonaws.com',
                },
              ]
            : [],
        ),
      },
      // productionBrowserSourceMaps: true,
      // typescript: {
      //   ignoreBuildErrors: true,
      // },
      experimental: {
        scrollRestoration: true,
        // forceSwcTransforms forces storybook to use SWC instead of babel
        forceSwcTransforms: true,
        turbopackFileSystemCacheForDev: true,
        optimizePackageImports: ['@chakra-ui/react'],
      },
      // Compression is enabled with nginx
      compress: false,
      async headers() {
        return [
          {
            source: '/:path*',
            headers: securityHeaders,
          },
        ];
      },
      async redirects() {
        return [
          {
            source: '/strapi/:path*',
            destination: '/p/:path*',
            permanent: true,
            missing: [{ type: 'header', key: 'x-nextjs-data' }],
          },
          {
            source: '/:slug.prv/:path*',
            destination: '/:slug/:path*',
            permanent: true,
          },
        ];
      },
      async rewrites() {
        if (!NEXT_API_INTERNAL_BASE_URL) {
          throw new Error(
            'Environment variable NEXT_API_INTERNAL_BASE_URL is not defined',
          );
        }

        return {
          afterFiles: [
            {
              source: '/fr',
              destination: `/fr/strapi/accueil`,
              locale: false,
            },
            {
              source: '/en',
              destination: `/en/strapi/home`,
              locale: false,
            },
            {
              source: '/:locale',
              destination: `/:locale/strapi/home`,
              locale: false,
            },
            {
              source: '/:locale/p/:path*',
              destination: `/:locale/strapi/:path*`,
            },
          ],
        };
      },
      transpilePackages: [
        '@chakra-ui/react',
        '@emotion/*',
        '@openagenda/activity-apps',
        '@openagenda/intl',
        '@openagenda/react',
        '@openagenda/react-filters',
        '@openagenda/react-shared',
        '@openagenda/sdk-js',
        '@openagenda/uikit',
        '@zag-js/*',
        'intl-messageformat',
        'intl-messageformat-parser',
        'react-intl',
        'react-markdown',
        'react-use',
      ],
      allowedDevOrigins: ['d.openagenda.com'],
    }),
  );
};

export default config;
