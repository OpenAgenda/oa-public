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
//
// The description says what the tool RETURNS, and says it completely. "Find the
// operations relevant to a question" described a filter handing back a subset;
// the tool is a ranker that scores the catalogue and returns everything it
// matched, the top hits in full and the rest named. It also promised only
// "signatures, parameters and examples" while the payload carries a request
// body and a response shape, and said nothing at all of the tail.
//
// What this wording is NOT: a cure for a caller that searches several times.
// That was the hypothesis - a filter framing invites fanning out paraphrases -
// and an A/B measured it dead. 120 runs on the production API, three models,
// ten tasks, arms interleaved: first-turn searches went 0.90 -> 0.90, 2.40 ->
// 2.40, 1.15 -> 1.05. The 30B model still fires three parallel searches on
// seven tasks of ten under both wordings. Correctness was identical. So this
// stands on being true, and nothing else; do not re-derive a behavioural claim
// from it.
export const searchDocsTool = {
  name: 'search_docs',
  config: {
    title: 'Search OpenAgenda API docs',
    description:
      'Rank the OpenAgenda v3 operations against a question. A single call returns '
      + 'the complete result: the top hits in full (signature, parameters, request '
      + 'body, response shape, and a runnable example for the `execute` tool), and '
      + 'every other match as a name, a summary and a call line.',
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
        'A ready-to-use `oa` client (an OpenAgenda instance) is available. An operation shown as',
        '`oa.<resource>.<action>({ path?, query?, body? })` is async and resolves to { data, error }',
        '— it does NOT throw on HTTP errors, so check `error`. One shown as a bare `METHOD /path`',
        'goes over plain HTTPS, not through the client. Call search_docs to discover the',
        "full catalogue with each operation's params, request body, response shape and a runnable example, e.g.:",
        '  oa.agendas.events.list({ path: { agendaUid }, query: { relative: ["upcoming"] } })',
        'A `schemas` namespace (zod validators, prefixed z…) is also available to validate payloads.',
        "A call that touches an agenda's additional fields - filling them in an event you write,",
        "filtering or faceting on them - needs that agenda's event form schema first",
        '(`oa.agendas.events.schema`): it declares which fields exist and the shape of each value.',
        'Any other call needs no schema fetch.',
        'Write an async body and `return` the value you want back (JSON-serialised).',
        'Compose freely: fetch, filter and aggregate in one script; return only what you need.',
        'The `oa` client is the `@openagenda/api-client` npm package: code you prototype here '
          + 'runs unchanged in a real site or tool — building one? Emit that SDK, not raw fetch '
          + '(search_docs shows the one-time setup).',
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
