---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Qualify `pagination.total` with a `totalRelation` field (`exact` | `atLeast`). Elasticsearch stops counting large result sets past a limit, so the agenda list's `total` could be a floor (e.g. `10000`) presented as exact. `totalRelation` now states which it is — `exact` for SQL counts and exhaustively-counted searches, `atLeast` when `total` is only a lower bound. It is emitted whenever `total` is.
