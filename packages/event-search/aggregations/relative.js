export function formatDSL() {
  return {
    filters: {
      filters: {
        upcoming: {
          bool: {
            filter: [
              {
                range: {
                  _search_first_timing: {
                    gt: 'now',
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
                    lt: 'now',
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
                    gt: 'now',
                  },
                },
              },
              {
                range: {
                  _search_first_timing: {
                    lt: 'now',
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
