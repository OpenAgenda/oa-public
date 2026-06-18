# @openagenda/mcp

## 1.3.0

### Minor Changes

- [`4e83203`](https://github.com/OpenAgenda/oa/commit/4e832038a829f62c58d56fd0c6bb95d4faddaf65) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Surface the `@openagenda/api-client` SDK as the path from prototype to product. The `oa.*` calls the `execute` sandbox runs are the public surface of that npm package, but nothing told an agent (or a developer) that the code they prototype ships unchanged in a real site or tool. Now: every `search_docs` response LEADS with the frame that the operations it renders are the SDK (install + one-time `client.setConfig` + key guidance), so the model reproduces them as SDK calls instead of hand-rolled fetch; the `execute` tool description states the portability inline; and the landing page and README gain a "Build with the API" section. The lead also states the wire auth contract — every request authenticates via `Authorization: Bearer <key>`, not a `key` query param or header — which catches the raw-fetch path models still reach for. Use a read-only publishable key (`oa_pk_…`) for in-browser reads, a secret key (`oa_sk_…`) server-side for writes.

## 1.2.0

### Minor Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`69963d8`](https://github.com/OpenAgenda/oa/commit/69963d869677beeb5da95a02033900026cd9885c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - search_docs renders a Components section: every named type a rich card references is defined once in the same response — enum components with their decode table (`EventStatus`: 1 = Scheduled, …), object components with typed, described property lines (e.g. `FormSchemaField.schemaId` marking additional fields). Type names are now uniform across the whole payload: params, response fields and validators all use the component name (`status (EventStatus[])` filters, `status (EventStatus)` on events, `schemas.zEventStatus`), params keep their passable values inline, and object-kind responses render their root field by field with descriptions — so an LLM can write the call AND decode what `execute` returns without a second lookup. The section is render-only (not indexed) so shared components leak no relevance credit between operations.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`e570a55`](https://github.com/OpenAgenda/oa/commit/e570a550e02503d0f78fb0aa0d37980b23a4a5c8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The server now ships MCP `instructions` (returned in the initialize result, mounted by clients as system-context guidance): compose `execute` bodies from `search_docs` results — call it before the first `execute`, search again only for operations not yet seen. This channel frames the workflow before any planning happens, which keeps lower-tier models from skipping discovery and composing `execute` bodies from priors, without prescribing redundant re-searches once the catalogue is in context. Content split: `instructions` carries how the tools articulate, tool descriptions carry how to use each tool, the contract carries per-operation reference.

### Patch Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`e570a55`](https://github.com/OpenAgenda/oa/commit/e570a550e02503d0f78fb0aa0d37980b23a4a5c8) Thanks [@bertho-zero](https://github.com/bertho-zero)! - The `execute` tool description now carries the agenda schema-first doctrine: when working with an agenda, fetch its event form schema first (`oa.agendas.events.schema`) — it defines the agenda's topology, whose own fields drive stats (the `additionalFields` facet) and complete event payloads. The tool description is the closest universally-supported text to where the LLM composes its code, which is why the guidance lives there rather than in per-operation docs.

- [#147](https://github.com/OpenAgenda/oa/pull/147) [`227232c`](https://github.com/OpenAgenda/oa/commit/227232c4ecd43051155bf8a0fe3f02a69f22dcc2) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add one-click install deep links to the landing page — Cursor, VS Code, VS Code Insiders and LM Studio — each carrying just the remote endpoint (the client runs the OAuth flow on first connect). Also slim the `execute` tool description: per-operation response shapes (pagination, facets) now live only in `search_docs`, where they are derived from the contract, instead of being duplicated in the tool description.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`916a964`](https://github.com/OpenAgenda/oa/commit/916a9641858014e67c38ab39449bb6067fab83d4) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Derive the advertised OAuth scopes from the contract instead of a hand-maintained list: `scopesSupported` (PRM + DCR client) is now `openid`/`offline_access` plus every `oauth2` scope the bundled spec's operations require. Fixes `/me/agendas` being unreachable over OAuth (`me:read` shipped in the spec but the hand-kept list omitted it, so DCR clients could not even request the scope), and stops advertising declared-but-unused scopes (`members:read`). New spec scopes now reach the PRM by bumping the `@openagenda/api-spec` dependency — do that only once the production AS issues them.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`69963d8`](https://github.com/OpenAgenda/oa/commit/69963d869677beeb5da95a02033900026cd9885c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Derive the summary/detailed list variants structurally (smaller property set = summary) instead of relying on the contract's `oneOf` order — the spec now lists the detailed branch first (zod client constraint), which would have flipped the operation docs' "default shape + detailed upgrade" labelling.

- Updated dependencies [[`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`86975d0`](https://github.com/OpenAgenda/oa/commit/86975d0c0d088e6ad4351a3df9d46841e26f0121), [`9e497b6`](https://github.com/OpenAgenda/oa/commit/9e497b67b0e1a4d06735890a8db082c0ea6a1b7c), [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b), [`7034cd1`](https://github.com/OpenAgenda/oa/commit/7034cd1010e196f47c2047afd3ee0e4c5677b7ba), [`fad618a`](https://github.com/OpenAgenda/oa/commit/fad618aef5a42d4872ed909ba07234c536849820), [`4316075`](https://github.com/OpenAgenda/oa/commit/431607534fdc484939a9c40cc9fa9410e9cc8312), [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/api-spec@0.2.0
  - @openagenda/logs@1.2.0

## 1.1.1

### Patch Changes

- [#145](https://github.com/OpenAgenda/oa/pull/145) [`0f0a50c`](https://github.com/OpenAgenda/oa/commit/0f0a50c8a2fa89ba71a0e2d123242cfae58cbe52) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add a one-click Claude Desktop bundle (`openagenda.mcpb`). It is a thin launcher — the manifest runs `npx @openagenda/mcp` over stdio and prompts for the API key — so it always pulls the current published version and never needs re-releasing when the server or API contract changes. Build it with `yarn pack:mcpb`. The hosted OAuth server stays a remote URL connector (mcpb is local-stdio only).

  The bundle is attached to each GitHub release (CI) and offered for download from the server's landing page, version-pinned to the running server.

- [`11864ca`](https://github.com/OpenAgenda/oa/commit/11864ca9539f1dd36334b6957fc106d2b0f1ad10) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add npm package metadata for discoverability: `keywords` (mcp, model-context-protocol, openagenda, events, …), `author`, a `bugs` URL, and `repository.directory` so the npm listing links to the package subfolder in the mirror.

## 1.1.0

### Minor Changes

- [#142](https://github.com/OpenAgenda/oa/pull/142) [`740ba38`](https://github.com/OpenAgenda/oa/commit/740ba38f307e60e91cd7b485453b39e0e29f9262) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Node-first local mode, unauthenticated discovery card, and CLI flags.

  Behavior changes:

  - The local default execution engine is now plain node, hardened with Node's permission model (`--permission`, Node ≥ 24: filesystem/subprocess/workers denied) — replacing deno. This shifts the default code-egress posture: the node engine does NOT bound network egress (deno's `--allow-net` did), so a default local deployment must trust the executed code's network reach (a boot banner states this; `OA_EXECUTOR=deno` restores the scoped-egress boundary). `engines.node` is now `>=24` (the permission sandbox floor). `OA_LOCAL_NO_SANDBOX=1` now means "bare node, no sandbox at all" and stays the explicit egress ack for other engines.
  - The `http` transport now FAILS CLOSED on an unbounded-egress configuration: `transport=http` with the default node engine (egress=none) refuses to boot. A network-facing server must bound egress (`OA_EXECUTOR=deno` or `microsandbox`), run under an egress wrapper, or explicitly acknowledge a trusted single-tenant box with `OA_LOCAL_NO_SANDBOX=1`. (Production hosted is already forced to microsandbox; this guards the self-hosted operator who runs http but leaves `OA_MCP_MODE` at its local default.)

  Features:

  - New `/.well-known/mcp.json` (and the `/.well-known/mcp/server-card.json` variant Smithery fetches) MCP Server Card (SEP-1649 draft): static identity, tool definitions and the OAuth requirement, readable without a token — generated from the same tool definitions as `tools/list`. The execute tool description reflects the deployment's REAL sandbox boundary, never an overstated claim.
  - App-wide CORS `*` on the HTTP transport (no ambient auth — bearer only): browser-based MCP clients pass the preflight on `POST /mcp`, and the 401's `WWW-Authenticate` discovery challenge is exposed cross-origin.
  - CLI: `--help`/`--version` and non-secret flags (`--transport`, `--port`, `--executor`, `--base-url`) mapping onto their env vars; secrets remain env-only.
  - Registry `server.json`: brand icons (PNG + SVG), node-first env var docs, new `OA_EXECUTOR` entry.

## 1.0.2

### Patch Changes

- [#139](https://github.com/OpenAgenda/oa/pull/139) [`a7efa05`](https://github.com/OpenAgenda/oa/commit/a7efa0544f4eb38c747ac336a0cdacfacb82f6c5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Serve the OAuth Protected Resource Metadata (RFC 9728) at the root well-known
  form too (`/.well-known/oauth-protected-resource`, without the resource path
  suffix). Some clients derive the PRM from the origin instead of the full
  resource URL — Le Chat (Mistral) documents exactly that URL in its connector
  troubleshooting checklist and could not discover the authorization server.

## 1.0.1

### Patch Changes

- [#135](https://github.com/OpenAgenda/oa/pull/135) [`77cd0c9`](https://github.com/OpenAgenda/oa/commit/77cd0c9019de0ccd08b94de2af09013ee39d84fa) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Clearer MCP registry listing and a truthful handshake version. The registry
  description now leads with the capability ("Search, analyze and manage events
  on OpenAgenda.") and the stdio path documents `OA_LOCAL_NO_SANDBOX` — the
  unblock flag when deno is not installed. The MCP `initialize` handshake now
  reports the released package version instead of a hardcoded `0.0.0`.
