---
'@openagenda/mcp': patch
---

Derive the summary/detailed list variants structurally (smaller property set = summary) instead of relying on the contract's `oneOf` order — the spec now lists the detailed branch first (zod client constraint), which would have flipped the operation docs' "default shape + detailed upgrade" labelling.
