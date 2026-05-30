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
 * Strip the API key from any text returned to the client. The key is baked into
 * the executed program (preamble.js), so a runtime error/stack frame can echo it
 * back via stderr. Today the key is a shared env credential → leaking it is a
 * real footgun; once auth is a per-caller scoped token this keeps the caller's
 * own token out of returned text too (defense-in-depth, valid in both models).
 */
function redactSecrets(text, apiKey) {
  let out = text;
  if (apiKey) out = out.split(apiKey).join('[redacted]');
  // Also catch any oa_pk_/oa_sk_ token shape, in case a different key surfaces.
  return out.replace(/oa_(?:pk|sk)_[A-Za-z0-9]+/g, '[redacted]');
}

/** Truncate to MAX_ERROR_TEXT, noting how much was dropped (no silent cut). */
function clampErrorText(text) {
  if (text.length <= MAX_ERROR_TEXT) return text;
  const dropped = text.length - MAX_ERROR_TEXT;
  return `${text.slice(0, MAX_ERROR_TEXT)}\n…[${dropped} more chars truncated]`;
}

/**
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 * @param {import('./sandbox/executor.js').SandboxExecutor} deps.executor
 */
export function createServer({ config, executor }) {
  const server = new McpServer({ name: 'openagenda-mcp', version: '0.0.0' });

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
      return { content: [{ type: 'text', text }] };
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
        'A global `oa` client is available:',
        '  oa.listEvents(agendaUid, params)   — see search_docs for params',
        '  oa.getEvent(agendaUid, eventUid)',
        '  oa.getFacets(agendaUid, params)',
        '  oa.get(path, query)                — generic GET',
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
        apiKey: config.apiKey,
      });
      const res = await executor.run({
        code: script,
        env: {},
        allowNet: config.allowNet,
        limits: config.limits,
        tls: config.tls,
      });

      const fail = (text) => ({
        isError: true,
        content: [
          {
            type: 'text',
            text: clampErrorText(redactSecrets(text, config.apiKey)),
          },
        ],
      });

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
        return fail(
          `Execution failed (exit ${res.exitCode}):\n${res.stderr || res.stdout}`,
        );
      }
      return { content: [{ type: 'text', text: res.stdout.trim() || 'null' }] };
    },
  );

  return server;
}
