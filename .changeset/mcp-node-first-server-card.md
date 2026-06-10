---
'@openagenda/mcp': minor
---

Node-first local mode, unauthenticated discovery card, and CLI flags.

Behavior changes:

- The local default execution engine is now plain node, hardened with Node's permission model (`--permission`, Node ≥ 24: filesystem/subprocess/workers denied) — replacing deno. This shifts the default code-egress posture: the node engine does NOT bound network egress (deno's `--allow-net` did), so a default local deployment must trust the executed code's network reach (a boot banner states this; `OA_EXECUTOR=deno` restores the scoped-egress boundary). `engines.node` is now `>=24` (the permission sandbox floor). `OA_LOCAL_NO_SANDBOX=1` now means "bare node, no sandbox at all" and stays the explicit egress ack for other engines.
- The `http` transport now FAILS CLOSED on an unbounded-egress configuration: `transport=http` with the default node engine (egress=none) refuses to boot. A network-facing server must bound egress (`OA_EXECUTOR=deno` or `microsandbox`), run under an egress wrapper, or explicitly acknowledge a trusted single-tenant box with `OA_LOCAL_NO_SANDBOX=1`. (Production hosted is already forced to microsandbox; this guards the self-hosted operator who runs http but leaves `OA_MCP_MODE` at its local default.)

Features:

- New `/.well-known/mcp.json` (and the `/.well-known/mcp/server-card.json` variant Smithery fetches) MCP Server Card (SEP-1649 draft): static identity, tool definitions and the OAuth requirement, readable without a token — generated from the same tool definitions as `tools/list`. The execute tool description reflects the deployment's REAL sandbox boundary, never an overstated claim.
- App-wide CORS `*` on the HTTP transport (no ambient auth — bearer only): browser-based MCP clients pass the preflight on `POST /mcp`, and the 401's `WWW-Authenticate` discovery challenge is exposed cross-origin.
- CLI: `--help`/`--version` and non-secret flags (`--transport`, `--port`, `--executor`, `--base-url`) mapping onto their env vars; secrets remain env-only.
- Registry `server.json`: brand icons (PNG + SVG), node-first env var docs, new `OA_EXECUTOR` entry.
