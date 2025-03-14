// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';
import nextPackageJson from 'next/package.json' with { type: 'json' };
import bundleAnalyser from '@next/bundle-analyzer';

const { version: nextVersion } = nextPackageJson;

const withBundleAnalyzer = bundleAnalyser({
  enabled: process.env.ANALYZE === 'true',
});

const withSentry = (c) =>
  withSentryConfig(c, {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monit',
    silent: true,
  });

function webpackCopyFiles(webpackConfig, files) {
  const CopyFilePlugin = webpackConfig.plugins.find(
    (plugin) => plugin.constructor.name === 'CopyFilePlugin',
  ).constructor;

  for (const file of files) {
    webpackConfig.plugins.push(
      new CopyFilePlugin({
        filePath: file.from,
        cacheKey: nextVersion,
        name: file.to,
        minimize: false,
        info: {
          minimized: true,
        },
      }),
    );
  }
}

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
      i18n: {
        locales: [
          'default',
          'en',
          'fr',
          'de',
          'it',
          'es',
          'br',
          'ca',
          'eu',
          'oc',
          'io',
        ],
        defaultLocale: 'default',
        localeDetection: false,
      },
      images: {
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
      eslint: {
        dirs: ['src', 'scripts', '.storybook', 'stories'],
        // ignoreDuringBuilds: true,
      },
      // typescript: {
      //   ignoreBuildErrors: true,
      // },
      experimental: {
        scrollRestoration: true,
      },
      onDemandEntries: {
        maxInactiveAge: 24 * 3600 * 1000, // 24h
        pagesBufferLength: 50,
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
          beforeFiles: [], // empty array needed because https://github.com/getsentry/sentry-javascript/pull/7649
          fallback: [
            {
              source: '/default/:path*',
              destination: `${NEXT_API_INTERNAL_BASE_URL}/:path*`,
              locale: false,
            },
            {
              source: '/:path*',
              destination: `${NEXT_API_INTERNAL_BASE_URL}/:path*`,
              locale: false,
            },
          ],
        };
      },
      webpack: (webpackConfig, options) => {
        if (options.isServer) return webpackConfig;

        webpackCopyFiles(webpackConfig, [
          {
            from: fileURLToPath(
              import.meta.resolve('@openagenda/outdated-browser'),
            ),
            to: 'static/chunks/outdated-browser.js',
          },
          {
            from: fileURLToPath(
              import.meta.resolve('@openagenda/outdated-browser/main.css'),
            ),
            to: 'static/css/outdated-browser.css',
          },
        ]);

        return webpackConfig;
      },
      transpilePackages: [
        '@openagenda/activity-apps',
        '@openagenda/intl',
        '@openagenda/react-filters',
        '@openagenda/react-shared',
        '@openagenda/sdk-js',
        '@openagenda/uikit',
        'intl-messageformat',
        'intl-messageformat-parser',
        'react-intl',
        'react-markdown',
        'react-use',
      ],
    }),
  );
};

export default config;
