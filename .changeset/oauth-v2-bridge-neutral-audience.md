---
'@openagenda/mcp': patch
---

Align the OAuth smoke script with the version-neutral API audience. The OAuth access-token audience is now a single, version-neutral API resource id (the bare API root, `aud=api`) covering both the v2 and v3 APIs, instead of a `/v3`-suffixed value. `scripts/smoke-oauth.js` comments are updated accordingly (`aud=<v3>` → `aud=<api>`); the token-exchange flow it exercises is functionally unchanged.
