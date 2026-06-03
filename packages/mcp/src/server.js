// The MCP server — backend-agnostic. It owns the two code-mode tools and never
// touches a sandbox directly: it hands code to the injected `executor`, so the
// same server runs identically over deno / srt / microsandbox.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchOperations, renderOperation } from './docs/operations.js';
import { buildScript } from './sandbox/preamble.js';

// Cap on the diagnostic text returned to the client on a failed run. Bounds the
// LLM context blast radius of a runaway, independent of the 1 MiB process-level
// output cap. (Unrelated to secret-leakage: see `redactSecrets`.)
const MAX_ERROR_TEXT = 4000;

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

/**
 * A single MCP text-content item. Typed so `type` stays the `'text'` literal the
 * SDK's tool-result shape requires (a bare object literal widens it to `string`).
 * @param {string} text
 * @returns {{ type: 'text', text: string }}
 */
const textContent = (text) => ({ type: 'text', text });

/**
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 * @param {import('./sandbox/executor.js').SandboxExecutor} deps.executor
 * @param {string|null} [deps.credential]  the API credential baked into executed
 *   code. PER TRANSPORT (see docs/plan-oauth-provider.md §O2): stdio omits it and
 *   falls back to `config.apiKey` (the self-hoster's own key); the HTTP resource
 *   server passes the *caller's* OAuth access token per request (delegation), so
 *   the sandboxed code acts as that user and never exceeds their permissions.
 */
export function createServer({ config, executor, credential }) {
  const server = new McpServer({ name: 'openagenda-mcp', version: '0.0.0' });

  // Resolve once per server instance. stdio builds one server for the process
  // (credential undefined → config.apiKey); the HTTP path builds a fresh server
  // per request carrying that request's token.
  const apiCredential = credential ?? config.apiKey;

  // search_docs — progressive disclosure: find the right operation + how to call
  // it before writing code. Pure metadata, no network, no side effects.
  server.registerTool(
    'search_docs',
    {
      title: 'Search OpenAgenda API docs',
      description:
        'Find the OpenAgenda v3 read operations relevant to a question. Returns '
        + 'operation signatures, parameters and examples to use from the `execute` tool.',
      inputSchema: {
        query: z
          .string()
          .describe('what you want to do, e.g. "upcoming events in Paris"'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }) => {
      const hits = searchOperations(query);
      const text = hits.map(renderOperation).join('\n\n---\n\n');
      return { content: [textContent(text)] };
    },
  );

  // execute — the code-mode tool. The LLM writes JS against the `oa` client; we
  // run it in the sandbox and return the JSON result. readOnly here because the
  // POC only exposes read endpoints; openWorld because it reaches the network.
  server.registerTool(
    'execute',
    {
      title: 'Execute code against the OpenAgenda API',
      description: [
        'Run JavaScript against the OpenAgenda v3 read-only API and return its result.',
        'A ready-to-use `oa` client (an OpenAgenda instance) is available (see search_docs for params):',
        '  oa.agendas.events.list({ path: { agendaUid }, query? })',
        '  oa.agendas.events.get({ path: { agendaUid, eventUid } })',
        '  oa.agendas.events.facets({ path: { agendaUid }, query? })',
        'Each is async and resolves to { data, error } — it does NOT throw on HTTP errors, so check `error`.',
        'For list/facets, `data` is { data: [...], pagination: { after } }; pass query.after to page.',
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
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ code }) => {
      const script = buildScript(code, {
        baseUrl: config.baseUrl,
        apiKey: apiCredential,
      });

      const fail = (text) => ({
        isError: true,
        content: [
          textContent(clampErrorText(redactSecrets(text, apiCredential))),
        ],
      });

      let res;
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
        // A backend should RETURN an ExecResult, never throw — but if one does
        // (the microsandbox stub, or an unexpected fault), route it through the
        // same redacted/clamped failure path instead of letting a raw error
        // (which could echo argv/env) reach the client.
        const msg = err instanceof Error ? err.message : String(err);
        return fail(`Execution failed: ${msg}`);
      }

      if (res.timedOut) {
        return fail(
          `Execution timed out after ${config.limits.timeoutMs} ms `
            + '(possible infinite loop or too-heavy processing).',
        );
      }
      if (res.outputCapped) {
        return fail(
          'Execution produced too much output (exceeded 1 MiB) and was killed. '
            + 'Return only the data you need, not full payloads.',
        );
      }
      if (res.exitCode !== 0) {
        // exitCode is null when the run never produced an exit (spawn error /
        // missing binary) — don't render a misleading "exit null".
        const where = res.exitCode === null ? '' : ` (exit ${res.exitCode})`;
        return fail(`Execution failed${where}:\n${res.stderr || res.stdout}`);
      }
      // Best-effort hygiene, NOT a boundary: also scrub the configured key from a
      // successful result (errors already do), so a naive `return __cfg.apiKey` or
      // an accidental echo doesn't surface it. A hostile caller can still encode the
      // key to defeat this — in-process scrubbing can't be the exfiltration boundary
      // (see preamble.js); the real defense against leaking a SHARED key to an
      // untrusted caller is a per-caller scoped token (OAuth, roadmap).
      return {
        content: [
          textContent(
            redactSecrets(res.stdout.trim() || 'null', apiCredential),
          ),
        ],
      };
    },
  );

  return server;
}
