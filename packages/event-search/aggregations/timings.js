import _ from 'lodash';
import moment from 'moment-timezone';
import schema from '@openagenda/validators/schema/index';
import choiceValidator from '@openagenda/validators/choice';
import textValidator from '@openagenda/validators/text';

schema.register({
  choice: choiceValidator,
  text: textValidator,
});

const validateOptions = schema({
  interval: {
    type: 'choice',
    unique: true,
    options: ['hour', 'day', 'week', 'month', 'year'],
    default: 'day',
  },
  format: {
    type: 'choice',
    unique: true,
    options: ['YYYY-MM-dd', 'YYYY-MM', 'YYYY', 'YYYY-MM-dd HH:mm'],
    default: 'YYYY-MM-dd',
  },
  timezone: {
    type: 'text',
    default: 'Europe/Paris',
  },
});

export function formatDSL(query, options = {}) {
  const { interval, format } = validateOptions(options);

  return {
    nested: {
      path: 'timings',
    },
    aggregations: {
      timings: {
        date_histogram: {
          field: 'timings.begin',
          calendar_interval: interval,
          min_doc_count: 0,
          format,
        },
      },
    },
  };
}

export function formatResult(result, options = {}) {
  const { query } = options;

  const { format, timezone } = validateOptions(options);

  const gte = _.get(query, 'timings.gte')
    ? moment(query.timings.gte).tz(timezone).format(format.toUpperCase())
    : null;
  const lte = _.get(query, 'timings.lte')
    ? moment(query.timings.lte).tz(timezone).format(format.toUpperCase())
    : null;

  const buckets = result.timings.buckets.map((b) => ({
    // key_as_string is not reliable
    key: moment(b.key).tz(timezone).format(format.toUpperCase()),
    timingCount: b.doc_count,
  }));

  if (!gte && !lte) {
    return buckets;
  }

  return buckets.filter((b) => {
    if (gte && b.key < gte) {
      return false;
    }
    if (lte && b.key > lte) {
      return false;
    }
    return true;
  });
}
