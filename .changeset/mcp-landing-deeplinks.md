---
'@openagenda/mcp': patch
---

Add one-click install deep links to the landing page — Cursor, VS Code, VS Code Insiders and LM Studio — each carrying just the remote endpoint (the client runs the OAuth flow on first connect). Also slim the `execute` tool description: per-operation response shapes (pagination, facets) now live only in `search_docs`, where they are derived from the contract, instead of being duplicated in the tool description.
