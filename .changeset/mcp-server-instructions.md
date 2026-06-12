---
'@openagenda/mcp': minor
---

The server now ships MCP `instructions` (returned in the initialize result, mounted by clients as system-context guidance): compose `execute` bodies from `search_docs` results — call it before the first `execute`, search again only for operations not yet seen. This channel frames the workflow before any planning happens, which keeps lower-tier models from skipping discovery and composing `execute` bodies from priors, without prescribing redundant re-searches once the catalogue is in context. Content split: `instructions` carries how the tools articulate, tool descriptions carry how to use each tool, the contract carries per-operation reference.
