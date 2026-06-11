# `openagenda.mcpb` source

One-click [MCP Bundle](https://github.com/anthropics/mcpb) for Claude Desktop,
covering the **local, API-key** path (`npx @openagenda/mcp` over stdio). The
hosted OAuth server is not an mcpb — it is added by URL as a remote connector.

This is a **thin launcher**: `manifest.json` runs `npx @openagenda/mcp`, so the
actual server (and its API catalogue, derived at boot from `@openagenda/api-spec`)
is always pulled fresh from npm. Nothing is vendored here, so the bundle does
**not** need re-releasing when the server or the API contract changes — only when
this manifest's own metadata does.

The manifest `version` here is a static placeholder: at release the CI rewrites
it to the just-published npm version (same jq pattern as `server.json`) before
packing and uploading `openagenda.mcpb` to the public release. So the committed
value only matters for a local `yarn pack:mcpb`.

Build the `.mcpb` (gitignored) yourself with:

```sh
yarn pack:mcpb   # → openagenda.mcpb
```
