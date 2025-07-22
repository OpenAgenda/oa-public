// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/node';
import {
  getDefaultIsolationScope,
  getIsolationScope,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  spanToJSON,
} from '@sentry/core';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const SENTRY_DSN = process.env.SENTRY_DSN
  || process.env.NEXT_PUBLIC_SENTRY_DSN
  || 'https://5fe9d785fe8c43d2aac6372740474a4d@o60122.ingest.sentry.io/128991';
const ENV = process.env.NODE_ENV;

const SPAN_KEY = Symbol.for('oa.otel.span');

const IGNORED_HTTP_PATHS = /^\/(?:dist|monit|_next)(?:\/|$)/;

// requestHook and spanNameHook from Sentry
// with additional otelAttributes and last span
// https://github.com/getsentry/sentry-javascript/blob/8beaa4ea602d3517c272f07b8546325059bcfc21/packages/node/src/integrations/tracing/express.ts

function requestHook(span, { request }) {
  // keep a reference to the last span
  request[SPAN_KEY] = span;

  if (request.otelAttributes) {
    span.setAttributes(request.otelAttributes);
  }
  // addOriginToSpan(span, 'auto.http.otel.express');
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, 'auto.http.otel.express');

  const attributes = spanToJSON(span).data;
  // this is one of: middleware, request_handler, router
  const type = attributes['express.type'];

  if (type) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.express`);
  }

  // Also update the name, we don't need to "middleware - " prefix
  const name = attributes['express.name'];
  if (typeof name === 'string') {
    span.updateName(name);
  }
}

function spanNameHook(info, defaultName) {
  if (getIsolationScope() === getDefaultIsolationScope()) {
    return defaultName;
  }
  if (info.layerType === 'request_handler') {
    const req = info.request;
    const method = req.method ? req.method.toUpperCase() : 'GET';
    getIsolationScope().setTransactionName(`${method} ${info.route}`);
  }
  return defaultName;
}

function extractPath(url, hostHeader) {
  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
      return new URL(url).pathname;
    }
    return new URL(url, `https://${hostHeader ?? 'localhost'}`).pathname;
  } catch {
    return url;
  }
}

const sentryClient = Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENV === 'production' ? 'production' : 'development',
  beforeSend(event, _hint) {
    return ENV === 'production' ? event : null;
  },
  beforeSendTransaction(transaction) {
    return ENV === 'production' ? transaction : null;
  },
  tracesSampler: (samplingContext) => {
    const { attributes, inheritOrSampleWith } = samplingContext;

    if (attributes['db.system'] === 'mysql') {
      // 0.25% in prod to track slow queries
      return ENV === 'production' ? 0.0025 : 0;
    }

    // if (ENV === 'development') {
    //   return 1.0;
    // }

    return inheritOrSampleWith(1);
  },
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  skipOpenTelemetrySetup: true,
  integrations: (integrations) =>
    integrations.filter(
      (integration) => !['Express', 'Redis'].includes(integration.name),
    ),
  openTelemetryInstrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        const method = req.method?.toUpperCase();
        // We do not capture OPTIONS/HEAD requests as transactions
        if (method === 'OPTIONS' || method === 'HEAD') {
          return true;
        }

        const path = extractPath(req.url, req.headers.host);

        if (IGNORED_HTTP_PATHS.test(path)) {
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
    new ExpressInstrumentation({
      ignoreLayersType: ['middleware'],
      requestHook: (span, info) => requestHook(span, info),
      spanNameHook: (info, defaultName) => spanNameHook(info, defaultName),
    }),
  ],
});

export default sentryClient;
