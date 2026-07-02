// `now` is threaded from search.js (a minute-floored timestamp) so these facet
// counts are computed against the SAME instant as the query filters. Without it
// the hits (pinned now) and the relative facet counts (live `now`) can disagree
// for events crossing a boundary within the up-to-60s gap. Falls back to the live
// ES `now` token for direct callers that pass none (backward-compatible).
export function formatDSL(query, { now = 'now' } = {}) {
  return {
    filters: {
      filters: {
        upcoming: {
          bool: {
            filter: [
              {
                range: {
                  _search_first_timing: {
                    gt: now,
                  },
                },
              },
            ],
          },
        },
        passed: {
          bool: {
            filter: [
              {
                range: {
                  _search_last_timing: {
                    lt: now,
                  },
                },
              },
            ],
          },
        },
        current: {
          bool: {
            filter: [
              {
                range: {
                  _search_last_timing: {
                    gt: now,
                  },
                },
              },
              {
                range: {
                  _search_first_timing: {
                    lt: now,
                  },
                },
              },
            ],
          },
        },
      },
    },
  };
}

export function formatResult({ buckets }) {
  return Object.keys(buckets).map((key) => ({
    key,
    eventCount: buckets[key].doc_count,
  }));
}
