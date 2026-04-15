import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  BatchSpanProcessor,
  ReadableSpan,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  trace,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  Span,
  Context,
} from '@opentelemetry/api';
import {
  SentryContextManager,
  validateOpenTelemetrySetup,
  init,
} from '@sentry/nextjs';
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from '@sentry/opentelemetry';
import { RequestLogSpanProcessor } from './utils/requestLogSpanProcessor';
import { SessionAttributesSpanProcessor } from './utils/sessionAttributesSpanProcessor';

/**
 * Copies a whitelist of attributes from parent span → child span at onStart.
 * General-purpose propagator kept around because it is cheap and future-
 * proofs any attribute that a parent sets at/before its own onStart (e.g.
 * a future tenant.id, feature-flag variant, …).
 *
 * NOTE: it does NOT propagate `session.id` / `user.uid` today. Those are
 * populated by `SessionAttributesSpanProcessor` at the root span's `onEnd`
 * (the `oa.user` cookie attribute only lands after onStart, see that
 * processor's JSDoc), by which time all children have already started and
 * most have ended — too late to inherit. Child spans therefore do not
 * receive user context in Sentry/OTLP traces; only the root span (and the
 * request log) does. Accepted trade-off: the request log is the primary
 * consumer and it reads from the root span directly.
 */
class InheritedAttributesSpanProcessor implements SpanProcessor {
  private _attributeKeys: string[];

  constructor(attributeKeys: string[]) {
    this._attributeKeys = attributeKeys;
  }

  // eslint-disable-next-line class-methods-use-this
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  onStart(span: Span, parentContext: Context): void {
    const parentSpan = trace.getSpan(parentContext);

    if (parentSpan && 'attributes' in parentSpan) {
      for (const key of this._attributeKeys) {
        const value = (
          parentSpan as unknown as { attributes: Record<string, unknown> }
        ).attributes[key];

        if (value !== undefined && value !== null) {
          span.setAttribute(key, value as string | number | boolean);
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onEnd(_: ReadableSpan): void {
    // no-op
  }

  // eslint-disable-next-line class-methods-use-this
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

const INHERITED_ATTRIBUTES = ['session.id', 'user.uid'];

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

if (process.env.NODE_ENV !== 'production') {
  // Optional: For internal OpenTelemetry debugging
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

const sentryClient = init({
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
  skipOpenTelemetrySetup: true,
  openTelemetryInstrumentations: [
    new HttpInstrumentation({
      // We are using the HTTP integration without instrumenting incoming HTTP requests because Next.js does that by itself.
      disableIncomingRequestInstrumentation: true,
      ignoreIncomingRequestHook: (req) => {
        const method = req.method?.toUpperCase();
        // We do not capture OPTIONS/HEAD requests as transactions
        if (method === 'OPTIONS' || method === 'HEAD') {
          return true;
        }

        if (
          req.url.match(/^\/(_next\/static|_next\/image|favicon\.ico)($|\/).*$/)
        ) {
          return true;
        }

        return false;
      },
      applyCustomAttributesOnSpan: (span, request) => {
        if (request.otelAttributes) {
          span.setAttributes(request.otelAttributes);
        }
      },
    }),
  ],
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': 'next',
    'service.namespace': 'oa',
  }),
  sampler: new SentrySampler(sentryClient),
  spanProcessors: [
    // General-purpose parent→child attribute propagator. Does NOT carry
    // session.id / user.uid today (those are set at root-span onEnd, after
    // children are already underway — see SessionAttributesSpanProcessor and
    // InheritedAttributesSpanProcessor JSDoc). Kept in place as a no-cost
    // hook for any future attribute that lands on the parent at/before
    // onStart.
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    // Must run before RequestLogSpanProcessor: it decodes the `oa.user`
    // cookie from the root span's `http.request.header.cookie.oa.user`
    // attribute (set by Sentry's HTTP integration) and writes session.id /
    // user.uid onto the same span so the log processor can read them.
    // This is the only path that works for RSC soft navigations, where
    // RootLayout is cached and cannot enrich the span.
    new SessionAttributesSpanProcessor(),
    new SentrySpanProcessor(),
    // Morgan-style per-request log → @openagenda/logs → InsightOps,
    // enriched with user.uid + session.id populated by
    // SessionAttributesSpanProcessor above.
    new RequestLogSpanProcessor(),
    process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT
      ? new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: `${process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
          }),
        )
      : null,
  ].filter(Boolean),
  logRecordProcessors: [
    process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT
      ? new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
          }),
        )
      : null,
  ],
  textMapPropagator: new SentryPropagator(),
  contextManager: new SentryContextManager(),
  metricReader: process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT
    ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${process.env.NEXT_OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
        }),
      })
    : null,
});

validateOpenTelemetrySetup();

sdk.start();

// _resource and _tracerProvider are private members

// eslint-disable-next-line dot-notation
await sdk['_resource']?.waitForAsyncAttributes?.();

// @ts-ignore
// eslint-disable-next-line dot-notation
sentryClient.traceProvider = sdk['_tracerProvider'];

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error));
});
