// Single source of truth for the MCP tool definitions: name + the
// McpServer.registerTool config (title/description/inputSchema/annotations).
// Consumed by BOTH server.js (the live, registered tools) and serverCard.js
// (the static /.well-known/mcp.json card) — so what an unauthenticated crawler
// reads in the card is, by construction, exactly what an authenticated
// tools/list returns.
//
// Neither tool declares an outputSchema: both return a single text block (the
// channel the LLM reads). Declaring one would oblige a structuredContent copy
// that just duplicates that payload on the wire for an untyped result.

import { z } from 'zod';

// search_docs — progressive disclosure: find the right operation + how to call
// it before writing code. Pure metadata, no network, no side effects (hence
// readOnly + closed-world).
export const searchDocsTool = {
  name: 'search_docs',
  config: {
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
};

// The sandbox-boundary sentence, derived from the deployment's ACTUAL posture
// (config.sandboxFacts) — never a fixed claim. An LLM reads this to decide
// whether execute is exfiltration-safe, so it must not promise a boundary the
// engine doesn't enforce: the node-first local default bounds fs/subprocess but
// NOT egress, and bare node bounds nothing. The caps are always real.
function sandboxLine(limits, { egressBounded, fsBounded }) {
  const caps = `execution is killed after ${limits.timeoutMs} ms and heap is capped at ${limits.memoryMb} MiB.`;
  if (egressBounded && fsBounded) {
    return `Sandbox: ONLY network to the OpenAgenda API is allowed (no filesystem, env or subprocess); ${caps}`;
  }
  if (fsBounded) {
    // node + permission, egress=none: fs/subprocess denied, network unrestricted.
    return `Sandbox: no filesystem, env or subprocess access, but network egress is NOT restricted (local trusted use; ${caps}`;
  }
  // bare node (OA_LOCAL_NO_SANDBOX): no boundary at all.
  return `NO sandbox boundary: filesystem and network are unrestricted — trusted local use only; ${caps}`;
}

// execute — the code-mode tool. NOT readOnly: it runs ARBITRARY code, so it can
// mutate the moment the v3 write surface lands — the annotation must not promise
// read-only, or a client would stop gating it (see README → "Mutations &
// moderation"). openWorld because it reaches the network. The description embeds
// the per-deployment resource caps AND the real sandbox boundary, so the def is
// a function of the configured limits + posture — the card and tools/list both
// advertise the instance's true budget and isolation.
export function executeTool(limits, sandboxFacts) {
  return {
    name: 'execute',
    config: {
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
        sandboxLine(limits, sandboxFacts),
      ].join('\n'),
      inputSchema: {
        code: z
          .string()
          .describe('async JS body that returns a JSON-serialisable value'),
      },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
  };
}
