import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
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
import sentryClient from './sentry.config.js';

if (process.env.NODE_ENV !== 'production') {
  // Optional: For internal OpenTelemetry debugging
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

const SPAN_KEY = Symbol.for('oa.otel.span');

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

const INHERITED_ATTRIBUTES = ['session.id', 'user.uid'];

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': 'cibul-node',
    'service.namespace': 'oa',
  }),
  instrumentations: sentryClient
    ? undefined
    : [
      new HttpInstrumentation(),
      new ExpressInstrumentation({
        requestHook: (span, { request }) => {
          request[SPAN_KEY] = span;

          if (request.otelAttributes) {
            span.setAttributes(request.otelAttributes);
          }
        },
      }),
    ],
  sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
  spanProcessors: [
    new InheritedAttributesSpanProcessor(INHERITED_ATTRIBUTES),
    sentryClient ? new SentrySpanProcessor() : null,
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        }),
      )
      : null,
  ].filter(Boolean),
  textMapPropagator: sentryClient ? new SentryPropagator() : undefined,
  contextManager: sentryClient ? new SentryContextManager() : undefined,
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new OTLPMetricExporter({
  //     url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
  //   }),
  // }),
});

validateOpenTelemetrySetup();

sdk.start();

// _resource and _tracerProvider are private members

// eslint-disable-next-line dot-notation
await sdk['_resource']?.waitForAsyncAttributes?.();

if (sentryClient) {
  // eslint-disable-next-line dot-notation
  sentryClient.traceProvider = sdk['_tracerProvider'];
}

// TODO check this, OA can have multiple services to gracefully shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
