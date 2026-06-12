---
'@openagenda/mcp': patch
---

Derive the advertised OAuth scopes from the contract instead of a hand-maintained list: `scopesSupported` (PRM + DCR client) is now `openid`/`offline_access` plus every `oauth2` scope the bundled spec's operations require. Fixes `/me/agendas` being unreachable over OAuth (`me:read` shipped in the spec but the hand-kept list omitted it, so DCR clients could not even request the scope), and stops advertising declared-but-unused scopes (`members:read`). New spec scopes now reach the PRM by bumping the `@openagenda/api-spec` dependency — do that only once the production AS issues them.
