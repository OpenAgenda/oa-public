import moment from 'moment-timezone';

const { tz } = moment;

export default (v1, { timezone, slugSchemaOptionIdMap, query = {} }) => {
  const v2 = {};
  if (!v1) {
    return v2;
  }

  const currentQueryHasTemporalComponent = !![
    'relative',
    'timings',
    'date',
  ].filter((k) => !!query[k]).length;

  if (!currentQueryHasTemporalComponent && (v1.from || v1.to)) {
    const fromAtDayStart = tz(v1.from || v1.to, timezone);
    const toAtDayEnd = tz(v1.to || v1.from, timezone);

    fromAtDayStart.hour(0);
    fromAtDayStart.minutes(0);
    toAtDayEnd.hour(23);
    toAtDayEnd.minutes(59);

    v2.date = {
      gte: fromAtDayStart.format(),
      lte: toAtDayEnd.format(),
    };
  } else if (!currentQueryHasTemporalComponent && v1.passed !== undefined) {
    const passed = parseInt(v1.passed, 10);

    v2.date = {
      [passed ? 'lte' : 'gte']: 'today',
      timezone,
    };
  }

  if (v1.featured !== undefined) {
    v2.featured = v1.featured;
  }

  if (v1.tags && slugSchemaOptionIdMap) {
    Object.assign(
      v2,
      v1.tags
        .map((tag) => slugSchemaOptionIdMap.filter((o) => o.slug === tag).pop())
        .filter((match) => !!match)
        .reduce(
          (additionalFieldFilters, { fieldName, optionId }) => ({
            ...additionalFieldFilters,
            [fieldName]: optionId,
          }),
          {},
        ),
    );
  }

  return v2;
};
