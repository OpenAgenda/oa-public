---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add the `GET /agendas/{agendaUid}/overview` read endpoint (`agendas.overview`) to the v3 API. It returns a live `AgendaOverview`: event volume, `by<Dimension>` distributions (language, source, end-day…), spatial viewport and thematic keywords, organised along two axes — visibility scope (`events.published` / `events.all`) × the shared `EventScopeStats` metric vocabulary — plus a hoisted `recentlyAdded` slice. The all-states `events.all` scope is gated to `administrator|moderator|internal` callers and absent otherwise; everything is computed live so access-gated figures never leak through the index snapshot. Adds the `AgendaOverview`, `PublishedEventStats`, `AllEventStats` and `RecentlyAddedStats` schemas (the two scopes are distinct, fully-required shapes so the generated SDK types every in-scope field as present, with the gated `all` scope as the single optional). The legacy v2 `/agendas/{uid}/summary` route and its flat shape are unchanged.
