---
'cibul-node': patch
---

Fix the `12_core.networks.agendas` "agenda creation honours the provided slug"
test, which hardcoded `http://localhost:4000` instead of the `withTestServer`
dynamic base URL. It now posts to `${ctx.baseUrl}`, matching its sibling tests,
so it hits the server's actual bound port.
