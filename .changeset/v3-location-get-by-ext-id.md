---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add a v3 read of a single location by its external id:
`GET /agendas/{agendaUid}/locations/ext/{extKey}/{extId}`
(`agendas.locations.getByExtId`).

Sync clients that hold their own source id rather than the OpenAgenda uid can
resolve the corresponding location from the `(key, value)` pair carried in the
location's `extIds`. It mirrors the by-uid get — same full `Location` response,
same `404` envelope, including the `merged` code with the surviving uid in
`details.mergedIn` when the external id resolves to a merged location; an
unknown pair answers `404`. This is the v3 successor to v2's
`GET …/locations/ext/:extKey/:extValue`, dropping its `{ success, location }`
wrapper and its implicit-`default`-key shorthand for the bare `Location` and
explicit key the v3 single-gets use.
