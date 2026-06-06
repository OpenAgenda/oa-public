import {
  initMetrics,
  recordMetric,
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

  it('registerObservables is a no-op when metrics are disabled', () => {
    expect(() =>
      registerObservables({
        poolStats: () => ({ hits: 1, misses: 0, idle: 2 }),
        inflight: () => 0,
      })).not.toThrow();
  });

  it('shutdownMetrics resolves when nothing was started', async () => {
    await expect(shutdownMetrics()).resolves.toBeUndefined();
  });
});
