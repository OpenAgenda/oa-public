// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/react/

import { init } from '@sentry/react';
import { dsnFromString } from '@sentry/utils';

const SENTRY_DSN = process.env.SENTRY_DSN
  || 'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

if (ENV === 'production') {
  const dsnComponents = dsnFromString(SENTRY_DSN);
  const sentrySaasDsnMatch = dsnComponents.host.match(/^o(\d+)\.ingest\.sentry\.io$/);
  const orgId = sentrySaasDsnMatch[1];

  if (sentrySaasDsnMatch) {
    init({
      dsn: SENTRY_DSN,
      environment: ENV === 'production' ? 'production' : 'development',
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,
      tunnel: `/api/monit?o=${orgId}&p=${dsnComponents.projectId}`,
      // ...
      // Note: if you want to override the automatic release value, do not set a
      // `release` value here - use the environment variable `SENTRY_RELEASE`, so
      // that it will also get attached to your source maps
    });
  }
}
