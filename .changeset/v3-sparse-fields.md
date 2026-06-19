---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add a `fields` query parameter to the v3 list reads (`agendas.list`,
`agendas.events.list`, `agendas.locations.list`, `me.agendas.list`) for sparse
field selection.

`?fields=uid,title,location` trims each `data` item to the named top-level
subset, shrinking the payload of large pages (sync scripts). It is subtractive
and scoped to the active representation: `detailed` chooses the representation,
`fields` keeps a subset of it. `uid` is always returned. A name outside the
active representation, or an otherwise malformed value, is a `400` — never
silently ignored — consistent with the `limit`/`detailed`/`sort` gates.

Response schemas are unchanged (still fully `required`): `fields` is a
best-effort payload optimisation, so a generated client still types the omitted
fields as present — read them as optional on this path. Exact typing of the
trimmed shape (a `Pick<T, Fields>` overlay) is a separate, additive follow-up.
