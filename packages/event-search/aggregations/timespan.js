'use strict';

module.exports.formatDSL = () => ({
  nested: {
    path: 'timings'
  },
  aggs: {
    first: {
      min: {
        field: 'timings.begin'
      }
    },
    last: {
      max: {
        field: 'timings.begin'
      }
    }
  }
});

module.exports.formatResult = result => ({
  first: new Date(result.first.value_as_string),
  last: new Date(result.last.value_as_string)
});
