---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add a `fields` query parameter to the v3 list reads (`agendas.list`,
`agendas.events.list`, `agendas.locations.list`, `me.agendas.list`) for sparse
field selection.

`?fields=uid,title,location` trims each `data` item to the named top-level
subset, shrinking the payload of large pages (sync scripts). When present,
`fields` selects the response shape directly over the resource's full field
set, so `detailed` no longer applies (it only governs the default shape when
`fields` is omitted) and `fields` wins if both are given — e.g.
`?fields=longDescription` works with no `detailed=true`. `uid` is always
returned; a name the resource cannot expose on the list is a `400`, consistent
with the `limit`/`detailed`/`sort` gates.

Dotted paths descend into nested objects and arrays (`?fields=location.name`,
`timings.begin`, `additionalFields.myField`); the top-level segment is always
validated (an unknown one is a `400`), and an unknown nested sub-field may be a
`400` too (e.g. `location.zzz`), except under an open container (the
`additionalFields` bag, a localized text map) where any sub-key is accepted.

For events and agendas the selection is pushed down to the Elasticsearch
`_source`, so the heavy fields are never fetched (a derived timing field still
pulls the full `timings` array; the bare `additionalFields` bag is enumerated
from the agenda's form schema and pushed down too). Locations push the selection
down to the SQL column projection (the win is for top-level columns; the
JSON-`store`-backed fields share one column). `/me` pushes the selection down to
its public-agenda search and skips the per-agenda `network`/`locationSet` ref
resolution when those fields are not selected.

Response schemas are unchanged (still fully `required`): `fields` is a
best-effort payload optimisation, so a generated client still types the omitted
fields as present — read them as optional on this path. Exact typing of the
trimmed shape (a `Pick<T, Fields>` overlay) is a separate, additive follow-up.
