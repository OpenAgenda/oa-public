// OpenTelemetry metrics for the MCP server — our OWN business metrics (per-tool
// outcome + latency, warm-pool efficiency, live concurrency), pushed via OTLP to
// the host agent (Alloy), which forwards them to Mimir. This is DISTINCT from the
// audit LOG (one structured record per call → InsightOps; see log.js): logs and
// metrics are kept in their own systems, on purpose.
//
// Metrics-only today (a `metricReader`, no tracing/instrumentations on the
// NodeSDK) — but the same NodeSDK is where distributed tracing would later plug
// in, no rewrite. The exporter reads the standard `OTEL_EXPORTER_OTLP_*` env vars
// for its endpoint/headers, so transport config lives in the environment, not here.
//
// OFF unless an OTLP endpoint is configured (`config.metrics.enabled`): then
// `initMetrics` is a no-op, no SDK starts, and `recordMetric` does nothing — so a
// dev/stdio run never tries to export. Observability must never fail a tool call,
// so every record path swallows its own errors.

import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { metrics } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const NS = 'openagenda-mcp';

let sdk = null;
let instruments = null;

/**
 * Start the OTLP metrics pipeline ONCE, before serving. No-op when metrics are
 * disabled (no OTLP endpoint) or already started. Call from the hosted entrypoint
 * right after loadConfig.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.enabled]              whether an OTLP endpoint is configured.
 * @param {string|null} [opts.serviceInstance]  `service.instance.id` (e.g. the host).
 */
export function initMetrics({ enabled, serviceInstance } = {}) {
  if (sdk || !enabled) return;
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: NS,
      ...serviceInstance ? { 'service.instance.id': serviceInstance } : {},
    }),
    // The exporter takes its endpoint/headers/protocol from OTEL_EXPORTER_OTLP_*.
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
  });
  sdk.start();

  const meter = metrics.getMeter(NS);
  instruments = {
    execute: meter.createCounter('oa.mcp.execute', {
      description: 'execute tool calls, by outcome',
      unit: '{call}',
    }),
    executeDuration: meter.createHistogram('oa.mcp.execute.duration', {
      description: 'execute tool wall-clock duration',
      unit: 'ms',
    }),
    searchDocs: meter.createCounter('oa.mcp.search_docs', {
      description: 'search_docs tool calls',
      unit: '{call}',
    }),
  };
}

/**
 * Record one tool call. Mirrors `makeAuditRecorder`'s shape so server.js emits to
 * both from the same place; injected as a callback so the server stays pure and no
 * OTEL runs in tests. No-op until `initMetrics` has run with metrics enabled.
 *
 * @param {string} tool                  'execute' | 'search_docs'
 * @param {{ outcome?: string, duration_ms?: number }} fields
 */
export function recordMetric(tool, fields = {}) {
  if (!instruments) return;
  const attrs = fields.outcome ? { outcome: fields.outcome } : {};
  try {
    if (tool === 'execute') {
      instruments.execute.add(1, attrs);
      if (typeof fields.duration_ms === 'number') {
        instruments.executeDuration.record(fields.duration_ms, attrs);
      }
    } else if (tool === 'search_docs') {
      instruments.searchDocs.add(1, attrs);
    }
  } catch {
    // observability must never break a tool call — see header
  }
}

/**
 * Register observable instruments that PULL live engine state at collection time:
 * warm-pool efficiency (cumulative hits/misses, idle depth) and the in-flight run
 * count. Both getters are optional (the pool exists only for the microsandbox
 * engine with pooling on; `inflight` only when the concurrency limiter wraps the
 * engine — i.e. always, today). No-op when metrics are disabled.
 *
 * @param {object} [opts]
 * @param {() => ({hits:number,misses:number,idle:number}|null)} [opts.poolStats]
 * @param {() => number} [opts.inflight]
 */
export function registerObservables({ poolStats, inflight } = {}) {
  if (!instruments) return;
  const meter = metrics.getMeter(NS);

  if (poolStats) {
    const hits = meter.createObservableCounter('oa.mcp.warm_pool.hits', {
      description: 'warm-pool acquires served from a ready spare',
      unit: '{acquire}',
    });
    const misses = meter.createObservableCounter('oa.mcp.warm_pool.misses', {
      description: 'warm-pool acquires that had to boot a µVM inline',
      unit: '{acquire}',
    });
    const idle = meter.createObservableGauge('oa.mcp.warm_pool.idle', {
      description: 'warm spares currently ready',
      unit: '{spare}',
    });
    meter.addBatchObservableCallback(
      (observer) => {
        const s = poolStats();
        if (!s) return;
        observer.observe(hits, s.hits);
        observer.observe(misses, s.misses);
        observer.observe(idle, s.idle);
      },
      [hits, misses, idle],
    );
  }

  if (inflight) {
    const gauge = meter.createObservableGauge('oa.mcp.concurrency.inflight', {
      description: 'execute runs currently in flight',
      unit: '{run}',
    });
    gauge.addCallback((observer) => observer.observe(inflight()));
  }
}

/** Flush and stop the metrics pipeline on shutdown (best-effort). */
export async function shutdownMetrics() {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch {
    // best-effort flush — never block exit on telemetry
  }
  sdk = null;
  instruments = null;
}
