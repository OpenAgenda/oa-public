// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init, Integrations } from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN
  || process.env.NEXT_PUBLIC_SENTRY_DSN
  || 'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

if (ENV === 'production') {
  init({
    dsn: SENTRY_DSN,
    environment: ENV === 'production' ? 'production' : 'development',
    integrations: integrations => [
      ...integrations
        .filter(({ name }) => !['OnUncaughtException', 'Modules'].includes(name)),
      new Integrations.OnUncaughtException({
        exitEvenIfOtherHandlersAreRegistered: false,
      }),
    ],
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}
