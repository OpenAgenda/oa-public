import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  trace,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
} from '@opentelemetry/api';
import { SentryContextManager, validateOpenTelemetrySetup } from '@sentry/node';
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from '@sentry/opentelemetry';
import sentryClient from '../sentry.config.js';

if (process.env.NODE_ENV !== 'production') {
  // Optional: For internal OpenTelemetry debugging
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

class InheritedAttributesSpanProcessor {
  constructor(attributeKeys) {
    this._attributeKeys = attributeKeys;
  }

  // eslint-disable-next-line class-methods-use-this
  forceFlush() {
    // no-op
    return Promise.resolve();
  }

  onStart(span, parentContext) {
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
  onEnd(_) {
    // no-op
  }

  // eslint-disable-next-line class-methods-use-this
  shutdown() {
    // no-op
    return Promise.resolve();
  }
}

const INHERITED_ATTRIBUTES = ['visitor.id', 'user.uid'];

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': 'cibul-node',
    'service.namespace': 'oa',
    'service.instance.id': ['MASTER_ID', 'NODE_APP_INSTANCE']
      .map((n) => process.env[n])
      .filter((n) => !!n?.length)
      .join('.'),
  }),
  sampler: new SentrySampler(sentryClient),
  spanProcessors: [
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    new SentrySpanProcessor(),
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        }),
      )
      : null,
  ].filter(Boolean),
  logRecordProcessors: [
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
        }),
      )
      : null,
  ],
  // Speak BOTH Sentry's wire format and the vendor-neutral W3C trace-context, so
  // a generic OpenTelemetry caller (e.g. the MCP server) can continue its trace
  // into this API without anyone emitting Sentry-proprietary headers. Sentry stays
  // first for continuity with its own peers; W3C handles `traceparent`, which
  // SentryPropagator alone ignores. Deliberately NOT W3CBaggagePropagator: it
  // would re-write the `baggage` header on outgoing requests and clobber the
  // Sentry Dynamic Sampling Context that SentryPropagator packs there.
  textMapPropagator: new CompositePropagator({
    propagators: [new SentryPropagator(), new W3CTraceContextPropagator()],
  }),
  contextManager: new SentryContextManager(),
  metricReader: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      }),
    })
    : null,
});

validateOpenTelemetrySetup();

sdk.start();

// _resource and _tracerProvider are private members

// eslint-disable-next-line dot-notation
await sdk['_resource']?.waitForAsyncAttributes?.();

// eslint-disable-next-line dot-notation
sentryClient.traceProvider = sdk['_tracerProvider'];

export { sdk };
