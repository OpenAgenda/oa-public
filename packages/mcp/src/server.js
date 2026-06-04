// The MCP server — backend-agnostic. It owns the two code-mode tools and never
// touches a sandbox directly: it hands code to the injected `executor`, so the
// same server runs identically over deno / srt / microsandbox.

import { createHash } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchOperations, renderSearch } from './docs/operations.js';
import { buildScript } from './sandbox/preamble.js';
import { credentialFp } from './log.js';

// Cap on the diagnostic text returned to the client on a failed run. Bounds the
// LLM context blast radius of a runaway, independent of the 1 MiB process-level
// output cap. (Unrelated to secret-leakage: see `redactSecrets`.)
const MAX_ERROR_TEXT = 4000;

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
 * @param {string} [deps.callerId]  the caller identity the limiter keys on (the
 *   OAuth `sub`). Used only when `rateLimiter` is set; a falsy/absent id keys a
 *   shared 'anonymous' bucket (it never bypasses the limit).
 * @param {(tool: string, fields: object) => void} [deps.recordAudit]  sink for
 *   the per-tool audit trail (see log.js → makeAuditRecorder). Defaults to a no-op
 *   (tests, or a stdio run with logging off). CONVENTION: audit is emitted
 *   per-handler, not at a registration seam — every tool handler MUST call
 *   `recordAudit(name, {... , outcome})` exactly once on every return path, or it
 *   ships un-audited (no test/type/runtime catches the omission). It is safe to
 *   call (it never throws — see makeAuditRecorder).
 */
export function createServer({
  config,
  executor,
  credential,
  getCredential,
  rateLimiter,
  callerId,
  recordAudit = () => {},
}) {
  const server = new McpServer({ name: 'openagenda-mcp', version: '0.0.0' });

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
  server.registerTool(
    'search_docs',
    {
      title: 'Search OpenAgenda API docs',
      description:
        'Find the OpenAgenda v3 operations relevant to a question. Returns '
        + 'operation signatures, parameters and examples to use from the `execute` tool.',
      inputSchema: {
        query: z
          .string()
          .describe('what you want to do, e.g. "upcoming events in Paris"'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }) => {
      const startedAt = Date.now();
      const ops = searchOperations(query);
      const text = renderSearch(ops);
      recordAudit('search_docs', {
        duration_ms: Date.now() - startedAt,
        outcome: 'ok',
        query,
        results_count: ops.length,
        credential_fp: staticCredentialFp,
      });
      return { content: [textContent(text)] };
    },
  );

  // execute — the code-mode tool. The LLM writes JS against the `oa` client; we
  // run it in the sandbox and return the JSON result. NOT readOnly: it runs
  // ARBITRARY code, so it can mutate the moment the v3 write surface lands — the
  // annotation must not promise read-only, or a client would stop gating it (see
  // README → "Mutations & moderation"). openWorld because it reaches the network.
  server.registerTool(
    'execute',
    {
      title: 'Execute code against the OpenAgenda API',
      description: [
        'Run JavaScript against the OpenAgenda v3 API and return its result.',
        'A ready-to-use `oa` client (an OpenAgenda instance) is available. Every operation is',
        '`oa.<resource>.<action>({ path?, query? })`, is async, and resolves to { data, error }',
        '— it does NOT throw on HTTP errors, so check `error`. Call search_docs to discover the',
        "full catalogue with each operation's params, response shape and a runnable example, e.g.:",
        '  oa.agendas.events.list({ path: { agendaUid }, query: { relative: ["upcoming"] } })',
        'List endpoints return { data: [...], pagination: { after } } — pass query.after to page;',
        'facets returns { facets: {...} } (no data array, no pagination).',
        'A `schemas` namespace (zod validators, prefixed z…) is also available to validate payloads.',
        'Write an async body and `return` the value you want back (JSON-serialised).',
        'Compose freely: fetch, filter and aggregate in one script; return only what you need.',
        'Sandbox: ONLY network to the OpenAgenda API is allowed (no filesystem, env or subprocess); '
          + `execution is killed after ${config.limits.timeoutMs} ms and heap is capped at ${config.limits.memoryMb} MiB.`,
      ].join('\n'),
      inputSchema: {
        code: z
          .string()
          .describe('async JS body that returns a JSON-serialisable value'),
      },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ code }) => {
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
        const audited = clampAuditCode(redactSecrets(code, apiCredential));
        recordAudit('execute', {
          duration_ms: Date.now() - startedAt,
          outcome,
          code: audited.text,
          code_bytes: Buffer.byteLength(code, 'utf8'),
          code_truncated: audited.truncated,
          code_sha256: sha256(code),
          bytes_out: res ? Buffer.byteLength(res.stdout ?? '', 'utf8') : 0,
          exit_code: res?.exitCode ?? null,
          credential_fp: credentialFp(apiCredential),
        });
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

      // Resolve the credential at point of use (HTTP: the token-exchange). On
      // failure, fail THIS tool call with a generic message — never echo the
      // upstream error (it may carry AS response detail) — and leave other tools
      // and sessions working (the prior model failed the whole POST with a 502).
      try {
        apiCredential = await resolveCredential();
      } catch {
        return finish(
          'credential_error',
          toolError('Could not obtain an API credential for this request.'),
        );
      }

      const script = buildScript(code, {
        baseUrl: config.baseUrl,
        apiKey: apiCredential,
      });

      const fail = (text) =>
        toolError(clampErrorText(redactSecrets(text, apiCredential)));

      try {
        res = await executor.run({
          code: script,
          env: {},
          allowNet: config.allowNet,
          egressAuthority: config.egressAuthority,
          limits: config.limits,
          tls: config.tls,
        });
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
      return finish('ok', {
        content: [
          textContent(
            redactSecrets(res.stdout.trim() || 'null', apiCredential),
          ),
        ],
      });
    },
  );

  return server;
}
