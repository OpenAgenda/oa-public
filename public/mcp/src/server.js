// The MCP server — backend-agnostic. It owns the two code-mode tools and never
// touches a sandbox directly: it hands code to the injected `executor`, so the
// same server runs identically over deno / srt / microsandbox.

import { createHash } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  trace,
  context,
  propagation,
  SpanStatusCode,
} from '@opentelemetry/api';
import pkg from '../package.json' with { type: 'json' };
import { searchOperations, renderSearch } from './docs/operations.js';
import { buildScript } from './sandbox/preamble.js';
import { credentialFp } from './log.js';
import { SERVICE_NAME } from './serviceName.js';
import { sandboxFacts } from './config.js';
import { searchDocsTool, executeTool } from './toolDefs.js';

// Cap on the diagnostic text returned to the client on a failed run. Bounds the
// LLM context blast radius of a runaway, independent of the 1 MiB process-level
// output cap. (Unrelated to secret-leakage: see `redactSecrets`.)
const MAX_ERROR_TEXT = 4000;

// The complete set of tool-call outcomes and whether each is a REAL fault (vs
// backpressure / normal). SINGLE SOURCE for three things that must agree: the span
// status (finish() below), the `error` metric label (so the Grafana failure-ratio
// panel filters `error="true"` instead of re-listing the fault outcomes in PromQL —
// no duplicated classification to drift), and the authoritative list of what
// `finish()` may emit. Every finish(outcome, …) call site MUST use a key here.
//   error:false → success or backpressure (a cap/limit engaging is the server
//     protecting itself, not the call failing — keeps the trace + ratio green);
//   error:true  → a genuine fault.
const OUTCOMES = {
  ok: { error: false },
  disabled: { error: false }, // maintenance kill
  rate_limited: { error: false }, // per-caller rate cap
  caller_busy: { error: false }, // per-caller concurrency cap
  busy: { error: false }, // global cap saturated
  shutting_down: { error: false }, // draining
  credential_error: { error: true },
  threw: { error: true },
  timed_out: { error: true },
  output_capped: { error: true },
  nonzero_exit: { error: true },
};

/** Whether an outcome is a real fault (unknown → not a fault, fail-safe). */
const isErrorOutcome = (outcome) => OUTCOMES[outcome]?.error ?? false;

// Executor rejection codes that are RETRYABLE backpressure, not faults — the global
// concurrency guard shedding load (concurrencyLimit.js throws these). A span must
// NOT mark them ERROR (mirrors OUTCOMES on the parent), else routine
// capacity-shedding paints spans red on every shed request.
const BACKPRESSURE_CODES = new Set(['EXEC_BUSY', 'EXEC_SHUTTING_DOWN']);

/** Record a thrown value as a span exception, normalising non-Errors. */
const recordSpanException = (span, err) =>
  span.recordException(err instanceof Error ? err : new Error(String(err)));

/**
 * Mark a span for a THROWN error, unless the throw is retryable backpressure (the
 * global cap shedding load) — backpressure leaves the span OK, mirroring OUTCOMES.
 */
const markSpanError = (span, err) => {
  const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
  if (typeof code === 'string' && BACKPRESSURE_CODES.has(code)) return;
  recordSpanException(span, err);
  span.setStatus({ code: SpanStatusCode.ERROR });
};

// Cap on the code body recorded in the audit trail, per execute. 8 KiB covers
// the vast majority of code-mode scripts in full; beyond that is almost always
// inlined data, not logic — `code_sha256` (of the FULL code) + `code_truncated`
// keep the rare giant identifiable. Tunable.
const MAX_AUDIT_CODE_BYTES = 8192;

/**
 * Strip the API credential from any text returned to the client. It is baked
 * into the executed program (preamble.js), so a runtime error/stack frame can
 * echo it back via stderr. On stdio that credential is the self-hoster's own
 * key; on the HTTP resource server it is the *caller's* OAuth access token —
 * either way keep it out of returned text (defense-in-depth, both models).
 */
function redactSecrets(text, apiKey) {
  let out = text;
  if (apiKey) out = out.split(apiKey).join('[redacted]');
  return out;
}

/** Truncate to MAX_ERROR_TEXT, noting how much was dropped (no silent cut). */
function clampErrorText(text) {
  if (text.length <= MAX_ERROR_TEXT) return text;
  const dropped = text.length - MAX_ERROR_TEXT;
  return `${text.slice(0, MAX_ERROR_TEXT)}\n…[${dropped} more chars truncated]`;
}

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/**
 * Clamp the audited code body to MAX_AUDIT_CODE_BYTES. Returns the (possibly
 * truncated) text and whether it was cut, from a SINGLE byte measurement — so the
 * `code_truncated` flag and the clamp can never disagree. Cuts on a byte boundary,
 * then re-decodes: a split multibyte char becomes one U+FFFD, so the result can be
 * a couple of bytes over the cap — acceptable for an audit body (the full code's
 * sha256 is recorded alongside).
 * @param {string} text
 * @returns {{ text: string, truncated: boolean }}
 */
function clampAuditCode(text) {
  const buf = Buffer.from(text, 'utf8');
  if (buf.length <= MAX_AUDIT_CODE_BYTES) return { text, truncated: false };
  return {
    text: buf.subarray(0, MAX_AUDIT_CODE_BYTES).toString('utf8'),
    truncated: true,
  };
}

/**
 * A single MCP text-content item. Typed so `type` stays the `'text'` literal the
 * SDK's tool-result shape requires (a bare object literal widens it to `string`).
 * @param {string} text
 * @returns {{ type: 'text', text: string }}
 */
const textContent = (text) => ({ type: 'text', text });

/**
 * A tool-call error result: `isError` + a single text item. Centralises the
 * envelope shared by the rate-limit, busy and credential-failure paths and the
 * `fail()` helper — change the shape here, not in four places.
 * @param {string} text
 */
const toolError = (text) => ({ isError: true, content: [textContent(text)] });

/**
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 * @param {import('./sandbox/executor.js').SandboxExecutor} deps.executor
 * @param {string|null} [deps.credential]  a STATIC API credential baked into
 *   executed code (the stdio self-hoster's own key). Omitted → `config.apiKey`.
 * @param {() => Promise<string>} [deps.getCredential]  a LAZY credential resolver
 *   (the HTTP resource server's per-request token-exchange). Resolved only when
 *   the `execute` tool actually runs — so `initialize`/`tools/list`/`search_docs`
 *   incur no exchange and don't depend on the AS — and memoised for the life of
 *   this (per-request) server. Takes precedence over `credential`. When it
 *   rejects, the `execute` call fails on its own without leaking upstream detail,
 *   instead of failing the whole transport. PER TRANSPORT, see §O2/§O2.5.
 * @param {{ check: (key: string) => { allowed: boolean, retryAfterMs: number } }} [deps.rateLimiter]
 *   per-caller sustained-rate guard (HTTP only; shared across this app's
 *   per-request servers). Absent on stdio (single local user, no caller id).
 * @param {{ tryAcquire: (key: string) => { acquired: boolean, release: () => void } }} [deps.callerConcurrency]
 *   per-caller concurrency cap (HTTP only; shared like `rateLimiter`) so one
 *   caller can't hold every global slot at once and starve others. Absent on
 *   stdio. Keys on `callerId` with the same 'anonymous' fallback.
 * @param {string} [deps.callerId]  the caller identity the limiters key on (the
 *   OAuth `sub`). Used by `rateLimiter`/`callerConcurrency`; a falsy/absent id
 *   keys a shared 'anonymous' bucket (it never bypasses a limit).
 * @param {number} [deps.callerUid]  the OA user id (the AS's optional `uid` claim),
 *   set as the `user.uid` span attribute so a trace is attributable to a user —
 *   the same key cibul-node inherits onto its API spans, so a future linked trace
 *   (PR2) carries one consistent identity. Audit-only otherwise; absent on stdio.
 * @param {(tool: string, fields: object) => void} [deps.recordAudit]  sink for
 *   the per-tool audit trail (see log.js → makeAuditRecorder). Defaults to a no-op
 *   (tests, or a stdio run with logging off). CONVENTION: audit is emitted
 *   per-handler, not at a registration seam — every tool handler MUST call
 *   `recordAudit(name, {... , outcome})` exactly once on every return path, or it
 *   ships un-audited (no test/type/runtime catches the omission). It is safe to
 *   call (it never throws — see makeAuditRecorder).
 * @param {(tool: string, fields: object) => void} [deps.recordMetric]  sink for
 *   OTel metrics (see telemetry.js → recordMetric). Defaults to a no-op (tests, or a
 *   run with metrics off). Emitted alongside `recordAudit` from the same return
 *   paths, reading `outcome` (+ `duration_ms` for execute). Safe to call.
 */
export function createServer({
  config,
  executor,
  credential,
  getCredential,
  rateLimiter,
  callerConcurrency,
  callerId,
  callerUid,
  recordAudit = () => {},
  recordMetric = () => {},
}) {
  // The handshake version is the released package version, so MCP inspectors and
  // the registry listing tell the same story deploy after deploy.
  const server = new McpServer({ name: SERVICE_NAME, version: pkg.version });

  // Tracer for the per-tool-call spans below. From @opentelemetry/api directly (NOT
  // telemetry.js) so this module never pulls in the OTel SDK — it's a no-op
  // ProxyTracer until initTelemetry registers a provider (stdio/dev/tests export
  // nothing), so the handlers can wrap themselves in spans unconditionally. Same
  // SERVICE_NAME as telemetry.js's resource and the McpServer above (one service).
  const tracer = trace.getTracer(SERVICE_NAME);

  // Run `fn` inside a CHILD span of the active tool span, recording any throw as a
  // span error and always ending it. Used for the slow inner steps (token-exchange,
  // sandbox run) so a slow execute is attributable to a stage, not just a total.
  // Re-throws so the caller's existing control flow is unchanged. Generic so it
  // preserves `fn`'s resolved type (else `res`/`apiCredential` would widen to any).
  /**
   * @template T
   * @param {string} name
   * @param {Record<string, string | number | boolean>} attributes
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  const withSpan = (name, attributes, fn) =>
    tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        return await fn();
      } catch (err) {
        markSpanError(span, err);
        throw err;
      } finally {
        span.end();
      }
    });

  // Register a tool whose handler runs inside a `mcp.tool/<name>` span. The span is
  // created, made the active context, and ALWAYS ended here; a thrown error marks it
  // (unless it's backpressure — see markSpanError). The ceremony lives at this
  // registration SEAM, not copied into each handler, so a new tool CANNOT ship
  // un-traced or leak an unended span — the per-handler fragility the audit
  // convention warns about (see recordAudit below) does not apply to tracing. The
  // handler receives (args, span) and sets its own attributes + outcome status; it
  // must NOT end the span itself.
  /**
   * @param {string} name
   * @param {any} schemaConfig  the McpServer.registerTool config (title/description/
   *   inputSchema/annotations) — passed straight through; `any` because registerTool
   *   is overloaded and a precise type resolves to `never` here.
   * @param {(args: any, span: import('@opentelemetry/api').Span) => Promise<any>} handler
   */
  const registerTracedTool = (name, schemaConfig, handler) =>
    server.registerTool(name, schemaConfig, (args) =>
      tracer.startActiveSpan(`mcp.tool/${name}`, async (span) => {
        try {
          return await handler(args, span);
        } catch (err) {
          markSpanError(span, err);
          throw err;
        } finally {
          span.end();
        }
      }));

  // Resolve the credential LAZILY and at most once per server instance. stdio /
  // static: synchronous (`credential ?? config.apiKey`). HTTP: the injected
  // `getCredential` thunk (token-exchange) runs on first `execute`, never for
  // metadata-only calls, and its result is reused across executes in the same
  // (per-request) server.
  let credentialPromise;
  const resolveCredential = () => {
    if (getCredential) {
      credentialPromise ??= getCredential();
      return credentialPromise;
    }
    return Promise.resolve(credential ?? config.apiKey);
  };

  // Fingerprint of the STATIC credential (stdio), for the audit trail. Omitted on
  // HTTP: the per-request token is resolved lazily, and we must NOT trigger a
  // token-exchange just to fingerprint a metadata-only call (execute records the
  // fp of the credential it actually resolves).
  const staticCredentialFp = getCredential
    ? undefined
    : credentialFp(credential ?? config.apiKey);

  // search_docs — progressive disclosure: find the right operation + how to call
  // it before writing code. Pure metadata, no network, no side effects.
  // Definition shared with the server card — see toolDefs.js.
  registerTracedTool(
    searchDocsTool.name,
    searchDocsTool.config,
    async ({ query }, span) => {
      const startedAt = Date.now();
      const ops = searchOperations(query);
      const text = renderSearch(ops);
      const durationMs = Date.now() - startedAt;
      recordAudit('search_docs', {
        duration_ms: durationMs,
        outcome: 'ok',
        query,
        results_count: ops.length,
        credential_fp: staticCredentialFp,
      });
      recordMetric('search_docs', {
        outcome: 'ok',
        duration_ms: durationMs,
        error: false,
        response_bytes: Buffer.byteLength(text, 'utf8'),
      });
      // Span attributes mirror the audit fields that are safe to keep low-card:
      // outcome + result count + the user (no query text — it's free-form and
      // already in the audit log; keep the span lean). user.uid via `!= null` so
      // a uid of 0 isn't dropped (matches the execute exit_code guard).
      span.setAttributes({
        'mcp.tool': 'search_docs',
        'mcp.outcome': 'ok',
        'mcp.search_docs.results_count': ops.length,
        ...callerUid != null ? { 'user.uid': callerUid } : {},
      });
      return { content: [textContent(text)] };
    },
  );

  // execute — the code-mode tool. The LLM writes JS against the `oa` client; we
  // run it in the sandbox and return the JSON result. The definition (and the
  // NOT-readOnly annotation rationale) is shared with the server card — see
  // toolDefs.js; it embeds this instance's configured limits.
  const executeDef = executeTool(config.limits, sandboxFacts(config));
  registerTracedTool(
    executeDef.name,
    executeDef.config,
    async ({ code }, span) => {
      const startedAt = Date.now();
      // `apiCredential`/`res` are filled as the run progresses; finish() reads
      // them so every return path emits ONE audit record from a single place.
      let apiCredential;
      /** @type {import('./sandbox/executor.js').ExecResult | undefined} */
      let res;
      const finish = (outcome, result) => {
        // Code is the input we want for product/abuse analysis — capped (8 KiB)
        // and scrubbed of the resolved credential; the full code's sha256 is kept
        // so a truncated body is still groupable. Never the result payload. The
        // clamp reports `truncated` from one byte measurement (no flag/clamp drift).
        const durationMs = Date.now() - startedAt;
        // Computed ONCE and fed to both the audit record and the span (the
        // sha256 of a large code body is the costly part — don't hash twice).
        const codeBytes = Buffer.byteLength(code, 'utf8');
        const codeSha256 = sha256(code);
        const bytesOut = res ? Buffer.byteLength(res.stdout ?? '', 'utf8') : 0;
        const audited = clampAuditCode(redactSecrets(code, apiCredential));
        recordAudit('execute', {
          duration_ms: durationMs,
          outcome,
          code: audited.text,
          code_bytes: codeBytes,
          code_truncated: audited.truncated,
          code_sha256: codeSha256,
          bytes_out: bytesOut,
          exit_code: res?.exitCode ?? null,
          credential_fp: credentialFp(apiCredential),
        });
        const error = isErrorOutcome(outcome);
        recordMetric('execute', {
          outcome,
          duration_ms: durationMs,
          error,
          response_bytes: bytesOut,
        });
        // Mirror the audit fields onto the tool span (a high-card id like the code
        // hash is fine on a span — traces aren't aggregated like metrics) and set
        // ERROR status only for a REAL fault, not backpressure (see OUTCOMES), so a
        // cap engaging doesn't paint the trace red. user.uid via `!= null` so a uid
        // of 0 isn't dropped (matches the exit_code guard). The registerTracedTool
        // seam ends the span — finish() must NOT.
        span.setAttributes({
          'mcp.tool': 'execute',
          'mcp.outcome': outcome,
          'mcp.execute.code_bytes': codeBytes,
          'mcp.execute.code_sha256': codeSha256,
          'mcp.execute.bytes_out': bytesOut,
          ...res?.exitCode != null
            ? { 'mcp.execute.exit_code': res.exitCode }
            : {},
          ...callerUid != null ? { 'user.uid': callerUid } : {},
        });
        if (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: outcome });
        }
        return result;
      };

      // Maintenance kill: refuse execute (search_docs stays served) without a
      // code redeploy. Checked BEFORE any work — no token exchange, no sandbox.
      if (config.executeDisabled) {
        return finish(
          'disabled',
          toolError(
            'execute is temporarily disabled (maintenance). '
              + 'search_docs still works; retry execute later.',
          ),
        );
      }

      // Per-caller sustained-rate guard (HTTP only; no limiter passed on stdio).
      // Refuse an over-rate caller with a RETRYABLE busy — same back-off
      // vocabulary as the concurrency cap — BEFORE any work (no token exchange,
      // no sandbox spawn). Gate on the limiter's presence alone and default the
      // key, so a falsy/empty callerId falls back to a shared bucket rather than
      // SKIPPING the limit (a missing id must never be a bypass).
      if (rateLimiter) {
        const verdict = rateLimiter.check(callerId || 'anonymous');
        if (!verdict.allowed) {
          const retryAfterSec = Math.ceil(verdict.retryAfterMs / 1000);
          return finish(
            'rate_limited',
            toolError(
              "You're sending execute calls too fast — rate limit reached. "
                + `Wait ~${retryAfterSec}s and retry this execute call.`,
            ),
          );
        }
      }

      // Per-caller concurrency cap (HTTP only; no limiter passed on stdio). Refuse
      // a caller that already holds its cap of in-flight runs with a RETRYABLE
      // busy — so one caller can't occupy every global slot and starve others —
      // BEFORE any work (no token exchange, no sandbox spawn). Same default-the-key
      // rule as the rate limit (a falsy id keys a shared bucket, never a bypass).
      // The slot is held until the run settles and released in `finally` below —
      // which spans the global cap's queue wait too (executor.run may park there),
      // so the cap counts submitted-and-queued runs, not only executing ones (see
      // callerConcurrency.js). Checked AFTER the rate limit on purpose: a caller
      // hammering while already at its cap IS calling too fast, so letting those
      // rejected attempts still spend a rate token throttles naive retry storms —
      // and it keeps this gate a clean reject (no acquire-then-refund path).
      const callerSlot = callerConcurrency
        ? callerConcurrency.tryAcquire(callerId || 'anonymous')
        : null;
      if (callerSlot && !callerSlot.acquired) {
        return finish(
          'caller_busy',
          toolError(
            'You already have the maximum number of execute calls running. '
              + 'Wait for one to finish, then retry this execute call.',
          ),
        );
      }

      try {
        // Resolve the credential at point of use (HTTP: the token-exchange). On
        // failure, fail THIS tool call with a generic message — never echo the
        // upstream error (it may carry AS response detail) — and leave other tools
        // and sessions working (the prior model failed the whole POST with a 502).
        try {
          apiCredential = await withSpan('mcp.credential.exchange', {}, () =>
            resolveCredential());
        } catch {
          return finish(
            'credential_error',
            toolError('Could not obtain an API credential for this request.'),
          );
        }

        const fail = (text) =>
          toolError(clampErrorText(redactSecrets(text, apiCredential)));

        try {
          res = await withSpan(
            'mcp.sandbox.run',
            { 'mcp.executor': executor.name },
            () => {
              // Serialize THIS span's context (W3C traceparent, vendor-neutral) into
              // the program so the v3 API calls the µVM makes continue the same
              // trace — the execute and the downstream API spans read as ONE trace
              // in the shared OTLP backend. No-op when untraced (no provider → the
              // global propagator is a noop → empty carrier → no header). It is a
              // DEFAULT header on the SDK client; untrusted user code can override
              // this default (see preamble.js) — accepted: trace IDs are unguessable
              // so a caller can only pollute its own trace, and the JWT (not this
              // header) is the access boundary.
              /** @type {Record<string, string>} */
              const traceCarrier = {};
              // Observability must never fail a tool call (see telemetry.js — every
              // record path swallows its own errors): a propagator fault must not
              // abort the run. Worst case the carrier stays empty and the API calls
              // just aren't linked to this trace.
              try {
                propagation.inject(context.active(), traceCarrier);
              } catch {
                // leave traceCarrier empty
              }
              const script = buildScript(code, {
                baseUrl: config.baseUrl,
                apiKey: apiCredential,
                trace: traceCarrier,
              });
              return executor.run({
                code: script,
                env: {},
                allowNet: config.allowNet,
                egressAuthority: config.egressAuthority,
                limits: config.limits,
                tls: config.tls,
              });
            },
          );
        } catch (err) {
          // The concurrency guard rejects (it never started the run) when the
          // server is saturated or shutting down — surface that as a RETRYABLE
          // busy, not an execution failure, so the client knows to back off and
          // try again rather than treating its code as broken.
          const errCode = err && typeof err === 'object' && 'code' in err
            ? err.code
            : undefined;
          if (errCode === 'EXEC_BUSY' || errCode === 'EXEC_SHUTTING_DOWN') {
            return finish(
              errCode === 'EXEC_SHUTTING_DOWN' ? 'shutting_down' : 'busy',
              toolError(
                'The server is at capacity right now — no execution slot was '
                  + 'available. Wait a moment and retry this execute call.',
              ),
            );
          }
          // A backend should RETURN an ExecResult, never throw — but if one does
          // (the microsandbox stub, or an unexpected fault), route it through the
          // same redacted/clamped failure path instead of letting a raw error
          // (which could echo argv/env) reach the client.
          const msg = err instanceof Error ? err.message : String(err);
          return finish('threw', fail(`Execution failed: ${msg}`));
        }

        if (res.timedOut) {
          return finish(
            'timed_out',
            fail(
              `Execution timed out after ${config.limits.timeoutMs} ms `
                + '(possible infinite loop or too-heavy processing).',
            ),
          );
        }
        if (res.outputCapped) {
          return finish(
            'output_capped',
            fail(
              'Execution produced too much output (exceeded 1 MiB) and was killed. '
                + 'Return only the data you need, not full payloads.',
            ),
          );
        }
        if (res.exitCode !== 0) {
          // exitCode is null when the run never produced an exit (spawn error /
          // missing binary) — don't render a misleading "exit null".
          const where = res.exitCode === null ? '' : ` (exit ${res.exitCode})`;
          return finish(
            'nonzero_exit',
            fail(`Execution failed${where}:\n${res.stderr || res.stdout}`),
          );
        }
        // Best-effort hygiene, NOT a boundary: also scrub the configured key from a
        // successful result (errors already do), so a naive `return __cfg.apiKey` or
        // an accidental echo doesn't surface it. A hostile caller can still encode the
        // key to defeat this — in-process scrubbing can't be the exfiltration boundary
        // (see preamble.js); the real defense against leaking a SHARED key to an
        // untrusted caller is a per-caller scoped token (OAuth, roadmap).
        const text = redactSecrets(res.stdout.trim() || 'null', apiCredential);
        return finish('ok', { content: [textContent(text)] });
      } finally {
        // Free the caller's slot whatever the outcome (success, failure, or a
        // thrown executor) — a no-op when no limiter ran or the cap refused us.
        callerSlot?.release();
      }
    },
  );

  return server;
}
