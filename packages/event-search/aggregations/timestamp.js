import schema from '@openagenda/validators/schema/index';
import choiceValidator from '@openagenda/validators/choice';
import textValidator from '@openagenda/validators/text';

schema.register({
  choice: choiceValidator,
  text: textValidator,
});

const validateOptions = schema({
  interval: {
    type: 'regex',
    regex: /^(minute|hour|day|week|month|quarter|year|\d+(m|h|d|w|M|q|y))$/,
    optional: true,
    default: undefined,
  },
  fixedInterval: {
    type: 'regex',
    regex: /^\d+(ms|s|m|h|d)$/,
    optional: true,
    default: undefined,
  },
  format: {
    type: 'choice',
    unique: true,
    options: ['YYYY-MM-dd', 'YYYY-MM', 'YYYY', 'YYYY-MM-dd HH:mm'],
    default: 'YYYY-MM-dd',
  },
  extendedBounds: {
    fields: {
      min: {
        type: 'date',
      },
      max: {
        type: 'date',
      },
    },
  },
});

function formatDSL(field, query, options = {}) {
  const { interval, fixedInterval, format, extendedBounds } = validateOptions(options);

  const calendarInterval = interval === undefined && fixedInterval === undefined ? '1d' : interval;

  return {
    date_histogram: {
      field,
      calendar_interval: calendarInterval,
      fixed_interval: fixedInterval,
      format,
      min_doc_count: 0,
      extended_bounds: {
        min: extendedBounds.min ? extendedBounds.min.getTime() : null,
        max: extendedBounds.max ? extendedBounds.max.getTime() : null,
      },
    },
  };
}

export default (field) => ({
  formatDSL: formatDSL.bind(null, field),
  formatResult: ({ buckets }) =>
    buckets.map((b) => ({
      key: b.key_as_string,
      eventCount: b.doc_count,
    })),
});
