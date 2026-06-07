import {
  initMetrics,
  recordMetric,
  recordUvmStats,
  recordConcurrencyRejected,
  registerObservables,
  shutdownMetrics,
} from '../src/metrics.js';

// Metrics are OFF unless an OTLP endpoint is configured. These tests exercise the
// disabled path only — they must NEVER start the SDK or touch the network, so we
// only ever call initMetrics with enabled:false (and rely on the module's "no
// instruments until init" guard for the pre-init calls).

describe('mcp - metrics (disabled / safe no-op)', () => {
  it('initMetrics is a no-op when disabled (no throw, no SDK)', () => {
    expect(() => initMetrics({ enabled: false })).not.toThrow();
    expect(() => initMetrics()).not.toThrow();
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
    expect(() => recordConcurrencyRejected()).not.toThrow();
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

  it('shutdownMetrics resolves when nothing was started', async () => {
    await expect(shutdownMetrics()).resolves.toBeUndefined();
  });
});
