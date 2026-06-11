---
'@openagenda/mcp': patch
---

Add a one-click Claude Desktop bundle (`openagenda.mcpb`). It is a thin launcher — the manifest runs `npx @openagenda/mcp` over stdio and prompts for the API key — so it always pulls the current published version and never needs re-releasing when the server or API contract changes. Build it with `yarn pack:mcpb`. The hosted OAuth server stays a remote URL connector (mcpb is local-stdio only).

The bundle is attached to each GitHub release (CI) and offered for download from the server's landing page, version-pinned to the running server.
