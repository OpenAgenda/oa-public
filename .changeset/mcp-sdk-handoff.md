---
'@openagenda/mcp': minor
---

Surface the `@openagenda/api-client` SDK as the path from prototype to product. The `oa.*` calls the `execute` sandbox runs are the public surface of that npm package, but nothing told an agent (or a developer) that the code they prototype ships unchanged in a real site or tool. Now: every `search_docs` response LEADS with the frame that the operations it renders are the SDK (install + one-time `client.setConfig` + key guidance), so the model reproduces them as SDK calls instead of hand-rolled fetch; the `execute` tool description states the portability inline; and the landing page and README gain a "Build with the API" section. The lead also states the wire auth contract — every request authenticates via `Authorization: Bearer <key>`, not a `key` query param or header — which catches the raw-fetch path models still reach for. Use a read-only publishable key (`oa_pk_…`) for in-browser reads, a secret key (`oa_sk_…`) server-side for writes.
