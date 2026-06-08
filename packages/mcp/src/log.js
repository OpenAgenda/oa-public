// Logging + per-tool audit trail, on the house logger (@openagenda/logs, winston).
//
// ONE logger, one destination (`openagenda-mcp`). Operational logs (boot,
// shutdown, fallbacks, faults) and the per-tool audit records share it; audit
// records carry `kind: 'audit'` so they stay filterable without a second logger.
//
// Up to three independent, env-gated sinks: stderr (the DebugTransport, turned on
// by the standard `DEBUG=openagenda-mcp*` env var), InsightOps (added when an
// OA_INSIGHT_OPS_TOKEN is set), and — when telemetry is on (hosted + an OTLP
// endpoint) — the OTel logs transport (`otel: true`), which ships the SAME records
// over OTLP to the host Alloy agent → Loki, IN ADDITION to InsightOps. They run in
// parallel and independently; none is mutually exclusive. All are stderr/network —
// NEVER stdout — so this is safe under the stdio transport, where stdout is the MCP
// protocol channel.
//
// The OTel transport binds the global logger provider AT init time, so the provider
// must already exist: `initTelemetry` (telemetry.js, which registers it) MUST run
// before `initLogging({ otel: true })`. A bonus of routing logs through OTel: a
// record emitted inside a tool span is auto-correlated to that trace (the transport
// stamps the active span's attributes onto the record).

import { createHash } from 'node:crypto';
import logs from '@openagenda/logs';
import { SERVICE_NAME as NS } from './serviceName.js';

// `logs.init()` only reconfigures the library's basic logger, NOT namespaced
// loggers created earlier — so we keep a single internal instance (reassigned by
// initLogging) and expose stable methods that delegate to the CURRENT one. That
// is robust to the init-before-import ordering of a multi-entry (CLI/http/stdio)
// library, where a per-module `logs('ns')` created at import time would be stuck
// pre-init. The pre-init instance is a safe stderr-only fallback (also the shape
// tests get, since they never call initLogging).
let logger = logs(NS);

/** Operational logger: `log.info('msg %s', x)`, `log.warn(...)`, `log.error(...)`. */
export const log = {
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
  info: (...args) => logger.info(...args),
  debug: (...args) => logger.debug(...args),
};

/**
 * Configure the transports ONCE, before any logging. Call from each entrypoint
 * right after loadConfig, before booting. Two independent sinks:
 *   - stderr — the @openagenda/logs DebugTransport, gated by the standard `DEBUG`
 *     env var (`DEBUG=openagenda-mcp*`). This is the dev lever; NODE_ENV plays no
 *     part. (The library's own `enableDebug` flag is a no-op for output, so we
 *     don't pass it — `debug` reads `DEBUG` once at load.)
 *   - InsightOps — added by the library when `insightOpsToken` is set (prod).
 *   - OTel logs — added when `otel` is true (telemetry enabled): the same records
 *     also go over OTLP to the host agent. Requires initTelemetry to have run first
 *     (see header); harmless if it hasn't (records go to a no-op global logger).
 * So: prod sets `OA_INSIGHT_OPS_TOKEN` and ships there; a terminal/dev sets
 * `DEBUG=openagenda-mcp*` to see stderr. Any combination can be on; none touches
 * stdout.
 *
 * @param {object} opts
 * @param {string|null} opts.insightOpsToken  the InsightOps token, or null.
 * @param {boolean} [opts.otel]  also emit logs over OTLP (telemetry enabled).
 */
export function initLogging({ insightOpsToken, otel = false }) {
  logs.init({ namespace: NS, token: insightOpsToken ?? null, otel });
  // Recreate so the logger picks up the just-configured transports.
  logger = logs(NS);
}

/**
 * A non-reversible fingerprint of an API credential — enough to correlate a
 * caller's activity (especially on stdio, where there is no OAuth `sub`), never
 * the secret itself. A 12-hex prefix of its SHA-256.
 *
 * @param {string|null|undefined} secret
 * @returns {string|undefined}
 */
export function credentialFp(secret) {
  if (!secret) return undefined;
  return createHash('sha256').update(secret).digest('hex').slice(0, 12);
}

/**
 * Build the audit sink injected into createServer. Binds the per-connection
 * context (transport + caller identity) once; the server supplies the per-call
 * fields. Audit records go through the shared logger at `info`, tagged
 * `kind: 'audit'` for filtering.
 *
 * @param {object} [ctx]
 * @param {'stdio'|'http'} [ctx.transport]
 * @param {string} [ctx.callerId]  the OAuth `sub` (http); absent on stdio. The
 *   stable AS join key.
 * @param {number} [ctx.callerUid] the OpenAgenda user id (http, when the token
 *   carries the AS's optional `uid` claim); absent on stdio or for an
 *   uid-less user. The business-meaningful caller identity.
 * @param {string} [ctx.clientId]  the OAuth client app (http).
 * @param {(tool: string, meta: object) => void} [sink]  where the record is
 *   emitted; defaults to the shared logger. Injectable for tests (the package's
 *   hand-rolled-stub style, cf. assertIssuer's `warn`).
 * @returns {(tool: string, fields: object) => void}
 */
export function makeAuditRecorder(
  { transport, callerId, callerUid, clientId } = {},
  sink = (tool, meta) => log.info(tool, meta),
) {
  return (tool, fields) => {
    const meta = { kind: 'audit', transport, ...fields };
    if (callerId) meta.callerId = callerId;
    if (callerUid) meta.callerUid = callerUid;
    if (clientId) meta.clientId = clientId;
    // Observability must never fail the tool call: a throwing transport (or a
    // synchronous logger fault) is swallowed rather than turning a successful
    // execute into an error. Audit is a fire-and-forget side effect.
    try {
      sink(tool, meta);
    } catch {
      // intentionally ignored — see above
    }
  };
}
