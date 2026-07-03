// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init, captureRouterTransitionStart } from '@sentry/nextjs';

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  'https://903257cfd37db7bda5d29625e310fcab@o4511653347590144.ingest.de.sentry.io/4511659413995600';
const ENV = process.env.NODE_ENV;

init({
  dsn: SENTRY_DSN,
  beforeSend(event, hint) {
    if (ENV !== 'production') return null;

    const error = hint?.originalException;
    if (
      error instanceof Error &&
      error.message.toLowerCase().startsWith('failed to load chunk')
    ) {
      return null;
    }

    // Filter Leaflet NaN LatLng errors (triggered by phone rotation)
    const exceptionValues = event.exception?.values;
    if (
      exceptionValues?.some((ex) =>
        ex.value?.startsWith('Invalid LatLng object'),
      )
    ) {
      return null;
    }

    return event;
  },
  beforeSendTransaction(transaction) {
    return ENV === 'production' ? transaction : null;
  },
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = captureRouterTransitionStart;
