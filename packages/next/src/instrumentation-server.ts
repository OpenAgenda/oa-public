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

// Visitor id cookie — opaque UUID set by cibul-node visitorId mw / Next.js
// proxy on first visit; persists across login/logout for end-to-end tracing.
const VISITOR_COOKIE_ATTR = 'http.request.header.cookie.oa.visitor_id';
// BA session cache cookie. We renamed it from the default `session_data` to
// `sess_data` (cf. packages/auth/src/index.js) so its attribute name doesn't
// match Sentry's sensitive-header snippet `session` and survives unfiltered.
// `__Secure-` variant emitted by BA over HTTPS in production — Sentry
// lowercases and replaces `-` with `_` in attribute keys.
const SESSION_CACHE_ATTR_SECURE =
  'http.request.header.cookie.__secure_oa.sess_data';
const SESSION_CACHE_ATTR_PLAIN = 'http.request.header.cookie.oa.sess_data';

/**
 * Copies a whitelist of attributes from parent span → child span at onStart.
 * Combined with the `spanStart` hook below (which sets `visitor.id` /
 * `user.uid` on every root request span synchronously at creation), this
 * propagates user context to every descendant span in the same trace —
 * DB queries, outgoing fetches, etc. — so traces in Sentry / OTLP carry
 * the request's user and visitor identifiers end-to-end.
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

const INHERITED_ATTRIBUTES = ['visitor.id', 'user.uid'];

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  'https://903257cfd37db7bda5d29625e310fcab@o4511653347590144.ingest.de.sentry.io/4511659413995600';
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
    // Propagates visitor.id / user.uid (set on every root span by the
    // `spanStart` hook below) from parent → child at span creation so all
    // descendants in the trace carry the user context.
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    new SentrySpanProcessor(),
    // Morgan-style per-request log → @openagenda/logs → InsightOps,
    // enriched with user.uid + visitor.id by the `spanStart` hook below.
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
 * Enrich every root HTTP request span with `visitor.id` at span creation so
 * downstream processors — including the `InheritedAttributesSpanProcessor`
 * above — see the attr before any child span is started.
 *
 * Why via Sentry's `spanStart` event and not an OTel `SpanProcessor.onStart`?
 * The cookie attribute we read is populated on the span by Sentry's nextjs
 * integration inside *its own* `spanStart` listener, registered during
 * `init()`. Running after it in the same synchronous event emission is the
 * only way to see the cookie before children are spawned — any OTel
 * `SpanProcessor.onStart` fires earlier, when the attribute is not yet set.
 *
 * Ordering guarantee: event listeners on Sentry's client run in registration
 * order; since `init()` registers the cookie-capture handler before we
 * attach ours, this listener always runs after the attribute is present.
 *
 * Known gap: the very first request from a fresh browser doesn't yet carry
 * the `oa.visitor_id` cookie, so its span will not carry `visitor.id`. All
 * subsequent requests will. `user.uid` is decoded from the BA session cache
 * cookie (`oa.sess_data` — renamed from `session_data` to dodge Sentry's
 * `session` snippet filter).
 */
sentryClient?.on('spanStart', (span) => {
  const attrs = (span as unknown as { attributes: Record<string, unknown> })
    .attributes;
  if (attrs['next.span_type'] !== 'BaseServer.handleRequest') return;
  if (attrs['next.bubble'] === true) return;
  if (attrs['visitor.id'] && attrs['user.uid']) return;

  const visitorId = attrs[VISITOR_COOKIE_ATTR];
  if (typeof visitorId === 'string' && visitorId) {
    span.setAttribute('visitor.id', visitorId);
  }

  const cacheCookie =
    attrs[SESSION_CACHE_ATTR_SECURE] ?? attrs[SESSION_CACHE_ATTR_PLAIN];
  if (typeof cacheCookie === 'string' && cacheCookie) {
    const payload = decodeSessionDataUnsafe(cacheCookie);
    const userUid = payload?.session?.user?.uid;
    if (userUid) span.setAttribute('user.uid', userUid);
  }
});

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error));
});
