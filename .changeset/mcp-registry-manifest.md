---
'@openagenda/mcp': patch
---

Clearer MCP registry listing and a truthful handshake version. The registry
description now leads with the capability ("Search, analyze and manage events
on OpenAgenda.") and the stdio path documents `OA_LOCAL_NO_SANDBOX` — the
unblock flag when deno is not installed. The MCP `initialize` handshake now
reports the released package version instead of a hardcoded `0.0.0`.
