---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Add bucket size and ordering controls to `agendas.events.facets`:

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
