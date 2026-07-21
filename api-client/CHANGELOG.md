# @openagenda/api-client

## 0.3.0

### Minor Changes

- [#175](https://github.com/OpenAgenda/oa/pull/175) [`5420053`](https://github.com/OpenAgenda/oa/commit/54200538b8108ce7664e800c6ae4a70f38b68c4a) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add the `GET /agendas/{agendaUid}/overview` read endpoint (`agendas.overview`) to the v3 API. It returns a live `AgendaOverview`: event volume, `by<Dimension>` distributions (language, source, end-day…), spatial viewport and thematic keywords, organised along two axes — visibility scope (`events.published` / `events.all`) × the shared `EventScopeStats` metric vocabulary — plus a hoisted `recentlyAdded` slice. The all-states `events.all` scope is gated to `administrator|moderator|internal` callers and absent otherwise; everything is computed live so access-gated figures never leak through the index snapshot. Adds the `AgendaOverview`, `PublishedEventStats`, `AllEventStats` and `RecentlyAddedStats` schemas (the two scopes are distinct, fully-required shapes so the generated SDK types every in-scope field as present, with the gated `all` scope as the single optional). The legacy v2 `/agendas/{uid}/summary` route and its flat shape are unchanged.

- [#220](https://github.com/OpenAgenda/oa/pull/220) [`13a924d`](https://github.com/OpenAgenda/oa/commit/13a924d48b45f5b3133f10c137f2ceab43f28768) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add the v3 event by-ext-id write endpoints (W3): `PUT /agendas/{agendaUid}/events/ext/{extKey}/{extId}` (`agendas.events.setByExtId`, replace upsert), `PATCH` (`agendas.events.patchByExtId`, partial upsert) and `DELETE` (`agendas.events.deleteByExtId`). The upserts create the event when no event carries the `(extKey, extId)` pair (`201` + `Location`) or update it when one does (`200`); the path pair is forced onto the event's `extIds`, making these the idempotent, retry-safe write path for syncing from an external system. `DELETE` resolves the pair and removes the event (`200` with a `DeletionResult`, `404` on an unknown pair). All require a write credential carrying `events:write`.

- [#220](https://github.com/OpenAgenda/oa/pull/220) [`ea60459`](https://github.com/OpenAgenda/oa/commit/ea604592638ee8890612c40a9bd8d672d358be9b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Open the v3 event WRITE surface (W1): add `POST /agendas/{agendaUid}/events` (`agendas.events.create`) and `POST /agendas/{agendaUid}/events/validate` (`agendas.events.validate`). Create returns the canonical `Event` (identical to the single-get) with a `Location` header; validate is a non-persisting dry run answering `200 { valid: true }` or `422` with per-field `error.details.errors[]`. Both require a write credential (a secret key or an OAuth2 token carrying the new `events:write` scope) — a publishable/agenda key is read-only and answers `403 read_only_credential`. Adds the `EventInput`, `EventPatch` and `EventLocationRef` request schemas (write shape, distinct from the read `Event`: read-only/computed fields are rejected, agenda-specific fields go under `additionalFields`; images and draft creation are not yet supported) and a shared `422 UnprocessableEntity` response.

- [#195](https://github.com/OpenAgenda/oa/pull/195) [`1708abd`](https://github.com/OpenAgenda/oa/commit/1708abdcdfc9679b6a72a0709f13db20263d5efa) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add a v3 read of a single event by its external id:
  `GET /agendas/{agendaUid}/events/ext/{extKey}/{extId}`
  (`agendas.events.getByExtId`).

  Sync clients that hold their own source id rather than the OpenAgenda uid can
  resolve the corresponding event from the `(key, value)` pair carried in the
  event's `extIds`. It mirrors the by-uid get exactly — same access gate, same
  bare `Event` response shape, same `404` envelope — only the identifier differs;
  an unknown pair answers `404`. This is the v3 successor to v2's
  `GET …/events/ext/:extKey/:extId`, dropping its `{ success, event }` wrapper for
  the bare `Event` the v3 single-gets return.

- [#220](https://github.com/OpenAgenda/oa/pull/220) [`cb8a56f`](https://github.com/OpenAgenda/oa/commit/cb8a56f3c63e95b37359495d36bbc57034ae43ec) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Make the v3 event write surface accept the moderation `state` and lifecycle `status` fields on `EventInput`/`EventPatch` (create, by-uid `PUT`/`PATCH`, and by-ext upsert). The moderation `state` is arbitrated by the server from the agenda's contribution settings and the caller's role — a moderator/administrator's value is honored, a `state: 2` (publish) without publish permission answers `403`, and a contributor's value is ignored in favour of the agenda default. The lifecycle `status` (scheduled/cancelled/…) is a per-agenda opt-in feature: it is accepted only when the agenda has `settings.lab.status` enabled, and answers `422` otherwise. Both remain unset by default (omit them to keep the current behaviour).

- [#177](https://github.com/OpenAgenda/oa/pull/177) [`e4a1f3d`](https://github.com/OpenAgenda/oa/commit/e4a1f3d285ca8828a7fdd8caf656f845549c0f9a) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Fix two `EventSummary` (list, `detailed: false`) contract bugs where a `required` field never carried real data.

  - **`timings` was always `[]`.** event-search strips the full occurrence array from the light projection, so the summary mapper coerced the absent field to `[]` — a consumer reading `EventSummary.timings` saw "no occurrences" for every event. `timings` is now **detailed-only** (removed from `EventSummary`, kept on `Event`); the compact view already exposes the span through `firstTiming`/`lastTiming`/`nextTiming`.
  - **`timezone` was always `null`.** event-search grouped `timezone` with `timings` in the same non-detailed strip, dropping a single IANA name that the compact `firstTiming`/`lastTiming`/`nextTiming` instants need to render correctly across DST. The strip no longer removes `timezone`, so `EventSummary.timezone` is now populated.

  Breaking for the v3 SDK types: `EventSummary.timings` is gone (fetch a single `Event` for the full list).

- [#220](https://github.com/OpenAgenda/oa/pull/220) [`86edff3`](https://github.com/OpenAgenda/oa/commit/86edff39e89184230b8351d87723277c0faa3be6) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add the v3 event by-uid write endpoints (W2): `PUT /agendas/{agendaUid}/events/{eventUid}` (`agendas.events.update`, full replace), `PATCH .../events/{eventUid}` (`agendas.events.patch`, partial update) and `DELETE .../events/{eventUid}` (`agendas.events.delete`). PUT/PATCH take an `EventInput`/`EventPatch` body and return the updated `Event` (identical to the single-get); DELETE answers `200` with a `DeletionResult` (`{ uid, deleted: true }`). All three require a write credential (a secret key or an OAuth2 token carrying `events:write`) whose member may edit/remove the event — a read-only credential answers `403 read_only_credential`, an unknown uid `404`, invalid field values `422`.

- [#178](https://github.com/OpenAgenda/oa/pull/178) [`a37dc80`](https://github.com/OpenAgenda/oa/commit/a37dc8072933f449af337ee5785fb881a101c548) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Make the v3 `limit` query parameter reject out-of-contract values instead of silently clamping them.

  A `limit` outside `[1, 100]` (e.g. the v2-era `300`) or a non-integer was previously coerced — clamped to the bound, or reset to the default — and the request still returned `200`. A truncated page looks complete to the caller, hiding data with no signal. It is now a `400` with a per-field error, consistent with the `detailed`/`sort` gate (an out-of-contract value is a bad request, not a coerced one). The `100` cap is enforced as declared: bulk/sync reads page through the cursor (`after`), which is safe at any depth (no offset `max_result_window`), rather than requesting one oversized page.

  Spec change is documentation-only (the `Limit` schema already declared `minimum: 1` / `maximum: 100`); the enforcement is server-side. No SDK type change.

- [#197](https://github.com/OpenAgenda/oa/pull/197) [`072a7b6`](https://github.com/OpenAgenda/oa/commit/072a7b69279ef1390e79e89c1f230e13dc1fa6cf) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add a v3 read of a single location by its external id:
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

- [#187](https://github.com/OpenAgenda/oa/pull/187) [`c3d33c4`](https://github.com/OpenAgenda/oa/commit/c3d33c488c0d65a077bf2ad12a74cd821dde7106) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add a `fields` query parameter to the v3 list reads (`agendas.list`,
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

## 0.2.0

### Minor Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`86975d0`](https://github.com/OpenAgenda/oa/commit/86975d0c0d088e6ad4351a3df9d46841e26f0121) Thanks [@bertho-zero](https://github.com/bertho-zero)! - `GET /agendas` now ranks `?search` results by relevance and accepts a `?sort` parameter. Previously the list forced `createdAt.desc` unconditionally, which buried text-search matches under the most recently created agendas. The default is now conditional — relevance (`_score`) when `search` is set, the stable `createdAt.desc` otherwise — and an explicit `sort` (`createdAt.desc` | `recentlyAddedEvents.desc`) overrides it. The chosen sort is pinned into the `after` cursor (validated against the allowlist, so a forged cursor cannot smuggle an out-of-contract sort), keeping a page sequence consistent.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`9e497b6`](https://github.com/OpenAgenda/oa/commit/9e497b67b0e1a4d06735890a8db082c0ea6a1b7c) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add bucket size and ordering controls to `agendas.events.facets`:

  - `facetSize` sets a request-wide default cap for the bucket-list facets (the
    term, provenance and `locations` families), and `facetSizes[<facet>]`
    overrides it per facet (precedence: per-facet override > `facetSize` >
    default 10). Both clamp lenient to `[1, 250]`. Fixes the previous behaviour
    where bucket-list facets were stuck at Elasticsearch's default of 10 — too
    small even for the 101 French departments.
  - `facetSort` orders the buckets, `count` (default, most frequent first) or
    `alpha` (the same top-`facetSize` buckets, ordered alphabetically by their
    display value for readable scanning); `facetSorts[<facet>]` overrides it per
    facet.

  The other facet families (geohash, viewport, timespan, timings, dateRanges,
  `additionalFields`/`additionalFieldMetrics`) keep their own bounded shapes and
  ignore these controls.

  Add `POST /agendas/{agendaUid}/events/facets` (`agendas.events.facetsReport`) —
  the analytical projection of the same facet model: a JSON body of **named,
  repeatable** aggregations. The same facet `type` may appear several times under
  distinct `name` aliases, so a field can be aggregated several ways in one
  request (e.g. `timings` by month AND by year); `filters` (same shape as the list
  query params) scope every facet, and `facetSize`/`facetSort` set request-wide
  defaults. The response is keyed by alias, each entry tagged with its `type`. The
  GET form (one instance per facet) stays the simple, cacheable path.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add the `locations` facet to `agendas.events.facets`: events grouped by their attached location as `{ location: { uid, name }, count }` buckets (new `LocationFacetBucket` schema); the uid feeds the `locationUid` filter.

  Fix the generated zod client silently stripping detailed-only fields from list responses: the summary/detailed `oneOf` pairs (EventList, AgendaList, LocationList, MeAgendaList) now list the detailed branch first. JSON Schema validation is order-independent (the branches are mutually exclusive), but `z.union` returns the first match and zod objects strip unknown keys — with the summary branch first, `detailed: true` items lost every detailed field on parse.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`7034cd1`](https://github.com/OpenAgenda/oa/commit/7034cd1010e196f47c2047afd3ee0e4c5677b7ba) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add the locations read surface: `agendas.locations.list` (cursor-paginated, `detailed` toggle, `search`/`uid`/`extId`/`bbox`/`createdAt`/`updatedAt` filters) and `agendas.locations.get` (full record; a merged location answers 404 with code `merged` and the surviving uid in `error.details.mergedIn`).

  New schemas `LocationSummary`, `Location`, `LocationList`, `LocationExtId` and `LocationAdditionalFields` (the legacy tag set exposed under the events-aligned `additionalFields` name). BREAKING for pre-1.0 consumers of the generated types: the event-embedded location snapshot schema is renamed `Location` → `EventLocation` to free the canonical name for the resource.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`fad618a`](https://github.com/OpenAgenda/oa/commit/fad618aef5a42d4872ed909ba07234c536849820) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Add `me.agendas.list` (`GET /me/agendas` — the caller's agenda memberships with role and private flag, gated by the new `me:read` OAuth scope; publishable keys carry no identity and are denied) and `agendas.events.schema` (`GET /agendas/{agendaUid}/events/schema` — the agenda's merged event form schema in the form-schema vocabulary; per-field `read` access levels gate both event values and the descriptors served here, so a public caller only sees public fields — matching the facets endpoint and the legacy `settings/schema` façade).

  New schemas: `MeAgendaList`, `MeAgendaItem`, `MemberRole`, `EventFormSchema`, `FormSchemaField`.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`4316075`](https://github.com/OpenAgenda/oa/commit/431607534fdc484939a9c40cc9fa9410e9cc8312) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Qualify `pagination.total` with a `totalRelation` field (`exact` | `atLeast`). Elasticsearch stops counting large result sets past a limit, so the agenda list's `total` could be a floor (e.g. `10000`) presented as exact. `totalRelation` now states which it is — `exact` for SQL counts and exhaustively-counted searches, `atLeast` when `total` is only a lower bound. It is emitted whenever `total` is.

### Patch Changes

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Docs: cross-reference the event form schema and the facets endpoint — the facets description now states that `additionalFields`/`additionalFieldMetrics` facet the agenda's own schema-declared fields, and the schema description lists facet discovery among its uses. Surfaces the schema-first step in `search_docs` so agents pick up agenda-specific facets on the first try.

- [#149](https://github.com/OpenAgenda/oa/pull/149) [`b6f92ab`](https://github.com/OpenAgenda/oa/commit/b6f92abf879fe3191ec5044b24ef1872915cea2b) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Every place that mentions agenda additional fields now points at the event form schema endpoint that declares them: the `additionalFields`/`additionalFieldMetrics` facet families and their `…Keys` params gain the breadcrumb (`GET /agendas/{agendaUid}/events/schema`), and the `additionalFields` filter param and `AdditionalFields` component had it but pointed at a stale pre-v3 path (`/settings/eventSchema`) — fixed.
