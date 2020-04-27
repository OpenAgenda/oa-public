'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const schema = require('@openagenda/validators/schema');

schema.register({
  choice: require('@openagenda/validators/choice'),
  text: require('@openagenda/validators/text')
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
  },
  timezone: {
    type: 'text',
    default: 'Europe/Paris'
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

module.exports.formatResult = (result, options = {}) => {
  const {
    query
  } = options;

  const {
    format,
    timezone
  } = validateOptions(options);

  const gte = _.get(query, 'date.gte') ? moment(query.date.gte).tz(timezone).format(format.toUpperCase()) : null;
  const lte = _.get(query, 'date.lte') ? moment(query.date.lte).tz(timezone).format(format.toUpperCase()) : null;

  const buckets = result.timings.buckets.map(b => ({
    key: b.key_as_string,
    timingCount: b.doc_count
  }));

  if (!gte && !lte) {
    return buckets
  };

  return buckets.filter(b => {
    if (gte && b.key < gte) {
      return false;
    } else if (lte && b.key > lte) {
      return false
    } else {
      return true;
    }
  });
}
