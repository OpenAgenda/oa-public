import {
  initTelemetry,
  getTracer,
  recordMetric,
  recordUvmStats,
  recordConcurrencyRejected,
  recordCallerConcurrencyAtAdmission,
  registerObservables,
  shutdownTelemetry,
} from '../src/telemetry.js';

// Telemetry (metrics + traces + logs) is OFF unless an OTLP endpoint is configured.
// These tests exercise the disabled path only — they must NEVER start the SDK or
// touch the network, so we only ever call initTelemetry with enabled:false (and
// rely on the module's "no instruments / no provider until init" guard for the
// pre-init calls). The cross-version OTel logs path and span export are proven
// separately, with in-memory exporters and no network, in otelWiring.test.js.

describe('mcp - telemetry (disabled / safe no-op)', () => {
  it('initTelemetry is a no-op when disabled (no throw, no SDK)', () => {
    expect(() => initTelemetry({ enabled: false })).not.toThrow();
    expect(() => initTelemetry()).not.toThrow();
  });

  it('getTracer returns a no-op tracer that still runs the span body', () => {
    // With no provider registered, getTracer() is a no-op ProxyTracer: spans cost
    // nothing and export nothing, but startActiveSpan MUST still invoke the body
    // and return its value (server.js wraps every handler in one unconditionally).
    const tracer = getTracer();
    let ended = false;
    const out = tracer.startActiveSpan('test.span', (span) => {
      span.setAttribute('k', 'v');
      span.setStatus({ code: 1 });
      span.end();
      ended = true;
      return 'result';
    });
    expect(out).toBe('result');
    expect(ended).toBe(true);
  });

  it('recordMetric is a safe no-op before/without init', () => {
    expect(() =>
      recordMetric('execute', { outcome: 'ok', duration_ms: 5 })).not.toThrow();
    expect(() => recordMetric('search_docs', { outcome: 'ok' })).not.toThrow();
    expect(() => recordMetric('unknown', {})).not.toThrow();
  });

  it('recordUvmStats is a safe no-op before/without init', () => {
    expect(() =>
      recordUvmStats({
        hostPeakBytes: 127 * 1024 * 1024,
        workloadPeakBytes: 63 * 1024 * 1024,
        cpuSeconds: 0.43,
        workloadCpuSeconds: 0.23,
      })).not.toThrow();
    expect(() => recordUvmStats()).not.toThrow();
    expect(() => recordUvmStats({})).not.toThrow();
    expect(() =>
      recordUvmStats({
        hostPeakBytes: 1,
        workloadPeakBytes: null,
        cpuSeconds: 0,
        workloadCpuSeconds: null,
      })).not.toThrow();
  });

  it('recordConcurrencyRejected is a safe no-op before/without init', () => {
    expect(() => recordConcurrencyRejected('queue_full')).not.toThrow();
    expect(() => recordConcurrencyRejected('timeout')).not.toThrow();
    expect(() => recordConcurrencyRejected('shutting_down')).not.toThrow();
    expect(() => recordConcurrencyRejected('caller_cap')).not.toThrow();
    expect(() => recordConcurrencyRejected()).not.toThrow();
  });

  it('recordCallerConcurrencyAtAdmission is a safe no-op before/without init', () => {
    expect(() => recordCallerConcurrencyAtAdmission(0)).not.toThrow();
    expect(() => recordCallerConcurrencyAtAdmission(1)).not.toThrow();
    expect(() => recordCallerConcurrencyAtAdmission()).not.toThrow();
  });

  it('registerObservables is a no-op when metrics are disabled', () => {
    expect(() =>
      registerObservables({
        poolStats: () => ({
          hits: 1,
          misses: 0,
          created: 3,
          failed: 0,
          expired: 1,
          idle: 2,
        }),
        inflight: () => 0,
      })).not.toThrow();
  });

  it('shutdownTelemetry resolves when nothing was started', async () => {
    await expect(shutdownTelemetry()).resolves.toBeUndefined();
  });
});
