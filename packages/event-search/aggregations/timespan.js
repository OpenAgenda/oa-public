export function formatDSL() {
  return {
    nested: {
      path: 'timings',
    },
    aggs: {
      first: {
        min: {
          field: 'timings.begin',
        },
      },
      last: {
        max: {
          field: 'timings.begin',
        },
      },
    },
  };
}

export function formatResult(result) {
  return {
    first: new Date(result.first.value_as_string),
    last: new Date(result.last.value_as_string),
  };
}
