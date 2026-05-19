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
import { decodeSessionDataUnsafe } from '@openagenda/auth/cookie-decode';
import { RequestLogSpanProcessor } from './utils/requestLogSpanProcessor';

// BA writes the session-cache cookie under the `oa` prefix configured by
// @openagenda/auth. The HTTPS-only `__Secure-` variant is emitted in prod;
// dev (HTTP) carries the unprefixed name.
const SESSION_COOKIE_ATTR_SECURE =
  'http.request.header.cookie.__Secure-oa.session_data';
const SESSION_COOKIE_ATTR_PLAIN = 'http.request.header.cookie.oa.session_data';

/**
 * Copies a whitelist of attributes from parent span → child span at onStart.
 * Combined with the `spanStart` hook below (which sets `session.id` /
 * `user.uid` on every root request span synchronously at creation), this
 * propagates user context to every descendant span in the same trace —
 * DB queries, outgoing fetches, etc. — so traces in Sentry / OTLP carry
 * the request's user and session identifiers end-to-end.
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
    // Propagates session.id / user.uid (set on every root span by the
    // `spanStart` hook below) from parent → child at span creation so all
    // descendants in the trace carry the user context.
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    new SentrySpanProcessor(),
    // Morgan-style per-request log → @openagenda/logs → InsightOps,
    // enriched with user.uid + session.id by the `spanStart` hook below.
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

/**
 * Enrich every root HTTP request span with `session.id` / `user.uid` at
 * span creation so downstream processors — including the
 * `InheritedAttributesSpanProcessor` above — see the attrs before any
 * child span is started.
 *
 * Why via Sentry's `spanStart` event and not an OTel `SpanProcessor.onStart`?
 * The cookie attribute we decode (`http.request.header.cookie.oa.session_data`
 * or its `__Secure-` prefix variant) is populated on the span by Sentry's HTTP
 * integration inside *its own* `spanStart` listener, registered during
 * `init()`. Running after it in the same synchronous event emission is the
 * only way to see the cookie before children are spawned — any OTel
 * `SpanProcessor.onStart` fires earlier, when the attribute is not yet set.
 *
 * Ordering guarantee: event listeners on Sentry's client run in registration
 * order; since `init()` registers the cookie-capture handler before we
 * attach ours, this listener always runs after the attribute is present.
 *
 * The cookie value is the BA "compact" session-data payload. We decode it
 * unverified here (HMAC verify is async; `spanStart` is sync). The result is
 * used solely for observability attributes — never as an authorization
 * signal.
 */
sentryClient?.on('spanStart', (span) => {
  const attrs = (span as unknown as { attributes: Record<string, unknown> })
    .attributes;
  if (attrs['next.span_type'] !== 'BaseServer.handleRequest') return;
  if (attrs['next.bubble'] === true) return;
  if (attrs['session.id'] && attrs['user.uid']) return;

  const cookieValue =
    attrs[SESSION_COOKIE_ATTR_SECURE] ?? attrs[SESSION_COOKIE_ATTR_PLAIN];
  if (typeof cookieValue !== 'string') return;

  const payload = decodeSessionDataUnsafe(cookieValue);
  const sessionId = payload?.session?.session?.id;
  const userUid = payload?.session?.user?.uid;

  if (sessionId) span.setAttribute('session.id', sessionId);
  if (userUid) span.setAttribute('user.uid', userUid);
});

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error));
});
