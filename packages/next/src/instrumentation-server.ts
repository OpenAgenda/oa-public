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

const SENTRY_DSN =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

if (process.env.NODE_ENV !== 'production') {
  // Optional: For internal OpenTelemetry debugging
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

class InheritedAttributesSpanProcessor implements SpanProcessor {
  private _attributeKeys: string[];

  constructor(attributeKeys: string[]) {
    this._attributeKeys = attributeKeys;
  }

  // eslint-disable-next-line class-methods-use-this
  forceFlush(): Promise<void> {
    // no-op
    return Promise.resolve();
  }

  onStart(span: Span, parentContext: Context): void {
    const parentSpan = trace.getSpan(parentContext);

    if (parentSpan && 'attributes' in parentSpan) {
      for (const key of this._attributeKeys) {
        const value = parentSpan.attributes[key];

        if (value !== undefined && value !== null) {
          span.setAttribute(key, value);
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
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    new SentrySpanProcessor(),
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
