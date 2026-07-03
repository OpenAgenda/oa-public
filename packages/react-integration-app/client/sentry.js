// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/react/

import { init } from '@sentry/react';
import { dsnFromString } from '@sentry/core';

const SENTRY_DSN = process.env.SENTRY_DSN
  || 'https://903257cfd37db7bda5d29625e310fcab@o4511653347590144.ingest.de.sentry.io/4511659413995600';
const ENV = process.env.NODE_ENV;

if (ENV === 'production') {
  const dsnComponents = dsnFromString(SENTRY_DSN);
  // Ingest hosts are `o<orgId>.ingest.<region>.sentry.io`; the region segment
  // is absent for legacy US-only DSNs.
  const sentrySaasDsnMatch = dsnComponents.host.match(
    /^o(\d+)\.ingest\.(?:[a-z]{2}\.)?sentry\.io$/,
  );

  if (sentrySaasDsnMatch) {
    const orgId = sentrySaasDsnMatch[1];
    init({
      dsn: SENTRY_DSN,
      environment: ENV === 'production' ? 'production' : 'development',
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,
      tunnel: `/monit?o=${orgId}&p=${dsnComponents.projectId}`,
      // ...
      // Note: if you want to override the automatic release value, do not set a
      // `release` value here - use the environment variable `SENTRY_RELEASE`, so
      // that it will also get attached to your source maps
    });
  }
}
