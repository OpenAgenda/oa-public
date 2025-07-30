import { init } from '@sentry/nextjs';
import { OTLPHttpProtoTraceExporter, registerOTel } from '@vercel/otel';

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

init({
  dsn: SENTRY_DSN,
  beforeSend(event, _hint) {
    return ENV === 'production' ? event : null;
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
  skipOpenTelemetrySetup: !!process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT,
});

if (process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT) {
  registerOTel({
    serviceName: 'next',
    traceExporter: new OTLPHttpProtoTraceExporter({
      url: process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
}
