---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add a v3 read of a single event by its external id:
`GET /agendas/{agendaUid}/events/ext/{extKey}/{extId}`
(`agendas.events.getByExtId`).

Sync clients that hold their own source id rather than the OpenAgenda uid can
resolve the corresponding event from the `(key, value)` pair carried in the
event's `extIds`. It mirrors the by-uid get exactly — same access gate, same
bare `Event` response shape, same `404` envelope — only the identifier differs;
an unknown pair answers `404`. This is the v3 successor to v2's
`GET …/events/ext/:extKey/:extId`, dropping its `{ success, event }` wrapper for
the bare `Event` the v3 single-gets return.
