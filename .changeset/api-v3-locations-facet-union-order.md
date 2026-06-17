---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add the `locations` facet to `agendas.events.facets`: events grouped by their attached location as `{ location: { uid, name }, count }` buckets (new `LocationFacetBucket` schema); the uid feeds the `locationUid` filter.

Fix the generated zod client silently stripping detailed-only fields from list responses: the summary/detailed `oneOf` pairs (EventList, AgendaList, LocationList, MeAgendaList) now list the detailed branch first. JSON Schema validation is order-independent (the branches are mutually exclusive), but `z.union` returns the first match and zod objects strip unknown keys — with the summary branch first, `detailed: true` items lost every detailed field on parse.
