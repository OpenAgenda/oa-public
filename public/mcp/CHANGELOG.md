# @openagenda/mcp

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
