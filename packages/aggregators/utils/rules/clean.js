import dateValidator from '@openagenda/validators/date';
import schema from '@openagenda/validators/schema/index';

schema.register({
  date: dateValidator,
});

const validateTimingsAsDates = schema({
  gte: {
    optional: false,
    type: 'date',
  },
  lte: {
    type: 'date',
    optional: false,
  },
});

const trimTabsAndSpaces = (v) =>
  (typeof v === 'string' ? v.replace(/^(\s|\t)+|(\s|\t)+$/g, '') : v);

const validateTimings = (t) => {
  const asDates = validateTimingsAsDates(t);

  return {
    gte: JSON.stringify(asDates.gte).replace(/"/g, ''),
    lte: JSON.stringify(asDates.lte).replace(/"/g, ''),
  };
};

function _cleanQuery(dirty) {
  if (!dirty) return {};

  return Object.keys(dirty).reduce((result, key) => {
    if (key === 'timings') {
      return {
        ...result,
        timings: validateTimings(dirty.timings),
      };
    }

    // legacy formatting conversion
    if (key === 'location' && dirty.location instanceof Array) {
      const geoKey = Object.keys(dirty.location[0])[0];
      result.location = {
        [geoKey]: dirty.location.map((l) => l[geoKey]),
      };
    } else {
      result[key] = dirty[key];
    }

    // trim filter values
    if (key === 'location') {
      result.location = Object.keys(result.location).reduce(
        (lQuery, lKey) => ({
          ...lQuery,
          [lKey]: []
            .concat(result.location[lKey])
            .map((v) => trimTabsAndSpaces(v)),
        }),
        {},
      );
    }

    return result;
  }, {});
}

function clean(dirty) {
  const actionKey = dirty.transform !== undefined ? 'transform' : 'actions';

  const rule = {
    query: _cleanQuery(dirty.query),
    actions: [],
    required: dirty.required === undefined ? true : !!dirty.required,
  };

  const actions = [];

  if (dirty[actionKey] instanceof Array) {
    dirty[actionKey].forEach((a) => {
      if (typeof a !== 'object' || a === null) {
        return;
      }

      if (Object.keys(a).includes('field')) {
        actions.push(a);
      } else {
        const field = Object.keys(a).pop();
        actions.push({
          field,
          values: a[field],
        });
      }
    });
  } else if (dirty[actionKey] instanceof Object) {
    Object.keys(dirty[actionKey]).forEach((f) =>
      actions.push({
        field: f,
        values: dirty[actionKey][f],
      }));
  }

  rule.actions = actions;

  if (dirty.value && dirty.value.state !== undefined) {
    rule.actions.push({
      field: 'state',
      values: { $set: dirty.value.state },
    });
  }

  return rule;
}

export default (dirty = []) => {
  if (dirty instanceof Array) {
    return dirty.map(clean);
  }
  return clean(dirty);
};
