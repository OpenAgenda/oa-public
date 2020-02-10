'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  choice: require('@openagenda/validators/choice'),
});

const validateOptions = schema({
  interval: {
    type: 'choice',
    unique: true,
    options: ['hour', 'day', 'week', 'month', 'year'],
    default: 'day'
  },
  format: {
    type: 'choice',
    unique: true,
    options: ['YYYY-MM-dd', 'YYYY-MM', 'YYYY', 'YYYY-MM-dd HH:mm'],
    default: 'YYYY-MM-dd'
  }
});

module.exports.formatDSL = (query, options = {}) => {
  const {
    interval,
    format
  } = validateOptions(options);

  return {
    nested: {
      path: 'timings'
    },
    aggregations: {
      timings: {
        date_histogram: {
          field: 'timings.begin',
          interval,
          format
        }
      }
    }
  };
}

module.exports.formatResult = result => result.timings.buckets.map(b => ({
  key: b.key_as_string,
  timingCount: b.doc_count
}));
