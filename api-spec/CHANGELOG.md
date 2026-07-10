# @openagenda/api-spec

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
