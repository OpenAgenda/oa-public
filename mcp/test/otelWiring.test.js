// Proves the two NON-obvious wirings PR1 relies on, with IN-MEMORY exporters and
// NO network (we never start the real NodeSDK / OTLP exporters here — initTelemetry
// is covered as a no-op in telemetry.test.js):
//
//   1. A span created via telemetry.js's getTracer() is actually recorded once a
//      provider is registered (server.js wraps every tool call in such a span).
//   2. The logs path: a @openagenda/logs record (which resolves its OWN
//      @opentelemetry/api-logs) reaches a LoggerProvider registered through the
//      SDK's api-logs. log.js flips `otel:true` on that holding.
//
//      What this does NOT prove today is the cross-VERSION bridge. Three copies
//      coexist in the tree (0.213.0 under the bullmq instrumentation, 0.220.0
//      under @opentelemetry/instrumentation, 0.221.0 hoisted), but this test, the
//      SDK's sdk-logs and @openagenda/logs all resolve the SAME hoisted 0.221.0,
//      so both sides share one instance. The guard turns cross-version on its own
//      the day a bump splits that resolution — at which point the OTel global
//      protocol (shared Symbol.for key + backwards-compat) is what it exercises.
//      Re-read which copy each side resolves before diagnosing a failure here.
//
// Each test registers a global provider and DISABLES it again in afterEach, so it
// can't leak to the other (--runInBand shares globalThis).

import { trace } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { logs as apiLogs } from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  InMemoryLogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { getTracer } from '../src/telemetry.js';

describe('mcp - otel wiring (in-memory, no network)', () => {
  it('a getTracer() span is recorded once a provider is registered', async () => {
    const exporter = new InMemorySpanExporter();
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    try {
      getTracer().startActiveSpan('mcp.tool/execute', (span) => {
        span.setAttribute('mcp.outcome', 'ok');
        span.end();
      });
      const spans = exporter.getFinishedSpans();
      expect(spans).toHaveLength(1);
      expect(spans[0].name).toBe('mcp.tool/execute');
      expect(spans[0].attributes['mcp.outcome']).toBe('ok');
    } finally {
      trace.disable(); // clear the global so it can't leak to other suites
      await provider.shutdown();
    }
  });

  it('a @openagenda/logs record (otel:true) reaches an SDK-registered provider', async () => {
    const exporter = new InMemoryLogRecordExporter();
    const provider = new LoggerProvider({
      processors: [new SimpleLogRecordProcessor({ exporter })],
    });
    apiLogs.setGlobalLoggerProvider(provider);
    try {
      // Import + init AFTER the provider exists: @openagenda/logs's OTel transport
      // binds the global logger at init time (see log.js header).
      const { default: logs } = await import('@openagenda/logs');
      logs.init({ namespace: 'openagenda-mcp', token: null, otel: true });
      logs('openagenda-mcp').info('wiring probe');

      const records = exporter.getFinishedLogRecords();
      expect(records.length).toBeGreaterThan(0);
      expect(records.some((r) => String(r.body).includes('wiring probe'))).toBe(
        true,
      );
    } finally {
      apiLogs.disable(); // clear the global logger provider
      await provider.shutdown();
    }
  });
});
