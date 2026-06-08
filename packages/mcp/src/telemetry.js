// OpenTelemetry for the MCP server — our OWN telemetry, all three signals on ONE
// NodeSDK, pushed via OTLP to the host agent (Alloy), which fans them out (metrics
// → Mimir, traces → Tempo, logs → Loki):
//   - METRICS  : per-tool outcome + latency, warm-pool efficiency, live concurrency
//                (see the instruments below + recordMetric/recordUvmStats/…).
//   - TRACES   : a span per tool call (`mcp.tool/execute`, `mcp.tool/search_docs`)
//                with child spans for the slow steps (token-exchange, sandbox run),
//                so latency is attributable, not just aggregate (see getTracer +
//                server.js). The execute span is also the future parent of the v3
//                API trace (PR2: propagate its context into the µVM's API calls).
//   - LOGS     : the @openagenda/logs records ALSO go out over OTLP (log.js flips
//                `otel:true` when telemetry is on) — IN ADDITION to InsightOps, not
//                instead. The logs library only emits to the in-process OTel logs
//                API; the LoggerProvider it needs is the one this NodeSDK registers,
//                so initTelemetry MUST run before initLogging({otel:true}).
//
// Every exporter reads the standard `OTEL_EXPORTER_OTLP_*` env vars for its
// endpoint/headers, so transport config lives in the environment, not here.
//
// OFF unless an OTLP endpoint is configured (`config.telemetry.enabled`): then
// `initTelemetry` is a no-op, no SDK starts, no provider is registered — so
// `recordMetric` does nothing, `getTracer()` hands back a no-op tracer, and
// `otel:true` logs go nowhere. A dev/stdio run therefore never tries to export.
// Observability must never fail a tool call, so every record path swallows its own
// errors.

import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { metrics, trace } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { SERVICE_NAME as NS } from './serviceName.js';

/**
 * The MCP tracer. Returns a no-op ProxyTracer until `initTelemetry` registers a
 * provider (so server.js can create spans unconditionally — they cost nothing and
 * export nothing in stdio/dev/tests). Single-sources the service name.
 */
export const getTracer = () => trace.getTracer(NS);

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
// Small-integer occupancy: how many runs a caller already held when one was
// admitted (0..cap-1, with headroom if the cap is raised). The default ms buckets
// would pile every value into one bucket, so override with integer boundaries.
const CALLER_CONC_BUCKETS = [0, 1, 2, 3, 4, 5, 6, 8, 12, 16];

let sdk = null;
let instruments = null;

/**
 * Start the OTLP telemetry pipeline (metrics + traces + logs) ONCE, before
 * serving. No-op when telemetry is disabled (no OTLP endpoint) or already started.
 * Call from the hosted entrypoint right after loadConfig and BEFORE initLogging —
 * the LoggerProvider this registers is what @openagenda/logs's `otel:true`
 * transport emits to (it binds the global logger at init time).
 *
 * @param {object} [opts]
 * @param {boolean} [opts.enabled]              whether an OTLP endpoint is configured.
 * @param {string|null} [opts.serviceInstance]  `service.instance.id` (e.g. the host).
 */
export function initTelemetry({ enabled, serviceInstance } = {}) {
  if (sdk || !enabled) return;
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: NS,
      // Same namespace cibul-node tags its spans with, so both OA services group
      // together in Tempo and a future linked execute→v3-API trace reads as one.
      'service.namespace': 'oa',
      ...serviceInstance ? { 'service.instance.id': serviceInstance } : {},
    }),
    // Every exporter takes its endpoint/headers/protocol from OTEL_EXPORTER_OTLP_*
    // (base `…_ENDPOINT`, or a per-signal `…_{METRICS,TRACES,LOGS}_ENDPOINT`).
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      // Export cadence = the time-resolution of every counter/histogram rate() in
      // Grafana. The OTel default is 60s; with short-lived µVMs and fast bursts
      // that smears sub-minute structure, so default to 15s (override via the
      // standard OTEL_METRIC_EXPORT_INTERVAL). NB this only sharpens the rate()
      // resolution — counters/histograms are recorded per-event and stay lossless
      // at any interval; it does NOT rescue observable gauges (still one sample
      // per interval), which is why per-caller occupancy is a histogram, not a gauge.
      exportIntervalMillis:
        Number(process.env.OTEL_METRIC_EXPORT_INTERVAL) || 15000,
    }),
    // Traces: batch-export spans (the per-tool-call spans from server.js). Batching
    // keeps export off the hot path; pending spans are flushed on shutdown.
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
    // Logs: register a LoggerProvider so @openagenda/logs's OTel transport has a
    // global to emit into (see header). Batched like spans, flushed on shutdown.
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
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
    // How many runs the SAME caller already held when one was ADMITTED (0 = solo,
    // up to the per-caller cap − 1). Recorded per admission (lossless), so it
    // captures the short-lived occupancy spikes these µVMs produce that a
    // collection-time gauge sample (every export interval) would almost always
    // miss. Recorded from callerConcurrency.js.
    callerConcurrencyAtAdmission: meter.createHistogram(
      'oa.mcp.caller.concurrency_at_admission',
      {
        description:
          'per-caller in-flight runs already held when a run was admitted (0 = solo)',
        unit: '{run}',
        advice: { explicitBucketBoundaries: CALLER_CONC_BUCKETS },
      },
    ),
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
 * OTEL runs in tests. No-op until `initTelemetry` has run with metrics enabled.
 *
 * @param {string} tool                  'execute' | 'search_docs'
 * @param {{ outcome?: string, duration_ms?: number, error?: boolean }} fields
 *   `error` is the fault-vs-backpressure classification (server.js OUTCOMES) carried
 *   as a label so Grafana filters `error="true"` instead of re-listing fault
 *   outcomes in PromQL — one source of truth, no duplicated classification.
 */
export function recordMetric(tool, fields = {}) {
  if (!instruments) return;
  const attrs = {
    ...fields.outcome ? { outcome: fields.outcome } : {},
    ...typeof fields.error === 'boolean' ? { error: fields.error } : {},
  };
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
 * (peak RSS + cumulative CPU — see microsandboxExecutor). No-op until initTelemetry ran
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
 * until initTelemetry ran with metrics enabled; never throws.
 *
 * @param {'queue_full'|'timeout'|'shutting_down'|'caller_cap'} [reason]  why it
 *   was rejected. The first three come from the global cap (concurrencyLimit.js);
 *   `caller_cap` from the per-caller cap (callerConcurrency.js).
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
 * Record, for an ADMITTED execute, how many in-flight runs the SAME caller already
 * held at admission (0 = their only run, up to cap − 1). Recorded at the event so
 * it is LOSSLESS — a gauge of live per-caller occupancy is sampled only once per
 * export interval and would miss the short-lived spikes these µVMs produce.
 * Recorded from callerConcurrency.js. No-op until initTelemetry ran; never throws.
 *
 * @param {number} [held]  the caller's in-flight count BEFORE this admission.
 */
export function recordCallerConcurrencyAtAdmission(held) {
  if (!instruments) return;
  try {
    if (typeof held === 'number') {
      instruments.callerConcurrencyAtAdmission.record(held);
    }
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
export async function shutdownTelemetry() {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch {
    // best-effort flush — never block exit on telemetry
  }
  sdk = null;
  instruments = null;
}
