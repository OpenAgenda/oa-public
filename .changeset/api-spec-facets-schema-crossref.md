---
'@openagenda/api-spec': patch
'@openagenda/api-client': patch
---

Docs: cross-reference the event form schema and the facets endpoint — the facets description now states that `additionalFields`/`additionalFieldMetrics` facet the agenda's own schema-declared fields, and the schema description lists facet discovery among its uses. Surfaces the schema-first step in `search_docs` so agents pick up agenda-specific facets on the first try.
