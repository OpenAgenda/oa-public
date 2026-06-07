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

// Explicit histogram buckets. The OTel SDK default boundaries
// ([0,5,10,…,7500,10000]) are tuned for MILLISECONDS, so a byte- or
// second-valued histogram left on the default would pile every observation into
// a single bucket (tens-of-MB → all in +Inf; sub-second CPU → all in (0,5]),
// making histogram_quantile return a flat, meaningless value. These boundaries
// bracket the measured ranges (see README / docs/microsandbox.md) so the Grafana
// quantile panels are actually interpretable.
const MB = 1024 * 1024;
const MS_BUCKETS = [
  5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000,
];
const HOST_PEAK_BYTE_BUCKETS = [
  8, 16, 32, 64, 96, 128, 160, 192, 256, 384, 512,
].map((m) => m * MB);
const WORKLOAD_PEAK_BYTE_BUCKETS = [
  1, 2, 4, 8, 16, 32, 48, 64, 96, 128, 192, 256,
].map((m) => m * MB);
const CPU_SECOND_BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];
const WORKLOAD_CPU_SECOND_BUCKETS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5,
];

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
      advice: { explicitBucketBoundaries: MS_BUCKETS },
    }),
    searchDocs: meter.createCounter('oa.mcp.search_docs', {
      description: 'search_docs tool calls',
      unit: '{call}',
    }),
    // execute runs the concurrency guard REFUSED before they started (the run never
    // ran), by `reason`. The execute outcome counter already shows these collapsed
    // (busy / shutting_down), but only at the source can we split a `queue_full`
    // (instantaneous burst over the cap+queue) from a `timeout` (sustained overload
    // — waited the full queue timeout and never got a slot) — different operator
    // signals. Recorded from concurrencyLimit.js.
    concurrencyRejected: meter.createCounter('oa.mcp.concurrency.rejected', {
      description: 'execute runs rejected by the concurrency guard, by reason',
      unit: '{rejection}',
    }),
    // Per-µVM resource use, read at end of run from the libkrun VMM process's /proc
    // (VmHWM = peak RSS; utime+stime = cumulative CPU) — see microsandboxExecutor.
    // readVmmStats. We do NOT use the SDK's sb.metrics(): that is a 1s shared-memory
    // sample, so for our sub-150ms runs its memory reads the idle floor and its CPU
    // reads 0. VmHWM (monotone) and the CPU counters (cumulative) capture even a very
    // short run, and survive the in-guest workload process exit.
    uvmHostPeak: meter.createHistogram('oa.mcp.uvm.host_peak', {
      description:
        'per-µVM peak host RAM (libkrun VmHWM) — real footprint, incl. VMM + guest kernel',
      unit: 'By',
      advice: { explicitBucketBoundaries: HOST_PEAK_BYTE_BUCKETS },
    }),
    uvmWorkloadPeak: meter.createHistogram('oa.mcp.uvm.workload_peak', {
      description:
        'per-µVM peak host RAM above the boot baseline ≈ memory the run touched',
      unit: 'By',
      advice: { explicitBucketBoundaries: WORKLOAD_PEAK_BYTE_BUCKETS },
    }),
    uvmCpuSeconds: meter.createHistogram('oa.mcp.uvm.cpu', {
      description:
        'per-µVM total CPU time (libkrun VMM utime+stime) — boot + run',
      unit: 's',
      advice: { explicitBucketBoundaries: CPU_SECOND_BUCKETS },
    }),
    uvmWorkloadCpuSeconds: meter.createHistogram('oa.mcp.uvm.workload_cpu', {
      description:
        'per-µVM CPU time above the boot baseline ≈ the run workload',
      unit: 's',
      advice: { explicitBucketBoundaries: WORKLOAD_CPU_SECOND_BUCKETS },
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
 * Record a per-µVM resource sample taken at end of run from the libkrun VMM's /proc
 * (peak RSS + cumulative CPU — see microsandboxExecutor). No-op until initMetrics ran
 * with metrics enabled; never throws.
 *
 * @param {object} [sample]
 * @param {number} [sample.hostPeakBytes]      real per-µVM host footprint (capacity).
 * @param {number|null} [sample.workloadPeakBytes]  host RAM above the boot baseline
 *        ≈ memory the run's guest workload touched (null when no baseline is known yet).
 * @param {number} [sample.cpuSeconds]         total per-µVM CPU time (boot + run).
 * @param {number|null} [sample.workloadCpuSeconds]  CPU time above the boot baseline
 *        ≈ the run workload (null when no baseline is known yet).
 */
export function recordUvmStats({
  hostPeakBytes,
  workloadPeakBytes,
  cpuSeconds,
  workloadCpuSeconds,
} = {}) {
  if (!instruments) return;
  try {
    if (typeof hostPeakBytes === 'number') {
      instruments.uvmHostPeak.record(hostPeakBytes);
    }
    if (typeof workloadPeakBytes === 'number') {
      instruments.uvmWorkloadPeak.record(workloadPeakBytes);
    }
    if (typeof cpuSeconds === 'number') {
      instruments.uvmCpuSeconds.record(cpuSeconds);
    }
    if (typeof workloadCpuSeconds === 'number') {
      instruments.uvmWorkloadCpuSeconds.record(workloadCpuSeconds);
    }
  } catch {
    // observability must never break a run — see header
  }
}

/**
 * Record one execute run the concurrency guard refused before it started. No-op
 * until initMetrics ran with metrics enabled; never throws.
 *
 * @param {'queue_full'|'timeout'|'shutting_down'} [reason]  why it was rejected.
 */
export function recordConcurrencyRejected(reason) {
  if (!instruments) return;
  try {
    instruments.concurrencyRejected.add(1, reason ? { reason } : {});
  } catch {
    // observability must never break a run — see header
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
 * @param {() => ({hits:number, misses:number, created:number, failed:number,
 *   expired:number, idle:number}|null)} [opts.poolStats]
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
    // Pool churn/health: spares booted, boots that failed, and spares evicted
    // past their TTL before use. `failed` is the warm-pool boot-failure signal
    // (rising = the image/host can't keep spares warm); `expired` rising with a
    // low hit ratio means the spares idle out faster than calls arrive.
    const created = meter.createObservableCounter('oa.mcp.warm_pool.created', {
      description: 'warm µVM spares booted into the pool (cumulative)',
      unit: '{spare}',
    });
    const failed = meter.createObservableCounter('oa.mcp.warm_pool.failed', {
      description: 'warm µVM spare boots that failed',
      unit: '{spare}',
    });
    const expired = meter.createObservableCounter('oa.mcp.warm_pool.expired', {
      description: 'warm spares evicted past their TTL before use',
      unit: '{spare}',
    });
    meter.addBatchObservableCallback(
      (observer) => {
        const s = poolStats();
        if (!s) return;
        observer.observe(hits, s.hits);
        observer.observe(misses, s.misses);
        observer.observe(idle, s.idle);
        observer.observe(created, s.created);
        observer.observe(failed, s.failed);
        observer.observe(expired, s.expired);
      },
      [hits, misses, idle, created, failed, expired],
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
