// Sibling to `timings.js`, but the shape we need is different.
//
// `timings.js` buckets nested timing objects by `timings.begin` and counts
// timings (so a multi-timing event contributes multiple times to one
// bucket). Useful for "when do events start happening?" displays.
//
// `lastTimings` answers "when do events end?" at the event level. Buckets
// distinct events by their precomputed `_search_last_timing` (the same
// field `relative.js` uses for the `passed` boundary), one bucket per
// future day for a 30-day horizon plus a residual `laterDays` count for
// events ending beyond that. We use this to drive a refresh-when-counts-
// drift-by-tau policy on the agenda-search index: see Layer 5 of the
// "live event counts" work.
//
// `_search_last_timing` is non-nested and per-event, so a `date_histogram`
// on it counts events directly — no `reverse_nested` plumbing.

const HORIZON_DAYS = 30;

export function formatDSL() {
  return {
    filters: {
      filters: {
        in_horizon: {
          range: {
            _search_last_timing: {
              gte: 'now/d',
              lt: `now+${HORIZON_DAYS}d/d`,
            },
          },
        },
        later: {
          range: {
            _search_last_timing: {
              gte: `now+${HORIZON_DAYS}d/d`,
            },
          },
        },
      },
    },
    aggregations: {
      by_day: {
        date_histogram: {
          field: '_search_last_timing',
          calendar_interval: 'day',
          format: 'yyyy-MM-dd',
          min_doc_count: 1,
        },
      },
    },
  };
}

export function formatResult(result) {
  const eventsByEndDay = {};
  const buckets = result?.buckets?.in_horizon?.by_day?.buckets || [];
  for (const b of buckets) {
    eventsByEndDay[b.key_as_string] = b.doc_count;
  }
  return {
    eventsByEndDay,
    laterDays: result?.buckets?.later?.doc_count || 0,
  };
}
