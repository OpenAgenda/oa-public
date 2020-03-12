'use strict';

function _cleanQuery(dirty) {
  if (!dirty) return {};

  return Object.keys(dirty).reduce((result, key) => {
    if (key === 'location' && dirty.location instanceof Array) {
      const geoKey = Object.keys(dirty.location[0])[0];
      result.location = {
        [geoKey]: dirty.location.map(l => l[geoKey])
      };
    } else {
      result[key] = dirty[key];
    }
    return result;
  }, {});
}

function clean(dirty) {
  const actionKey = dirty.transform !== undefined ? 'transform' : 'actions';

  const rule = {
    query: _cleanQuery(dirty.query),
    actions: [],
    required: dirty.required === undefined ? true : !!dirty.required
  };

  const actions = [];

  if (dirty[actionKey] instanceof Array) {
    dirty[actionKey].forEach(a => {
      if (typeof a !== 'object' || a === null) {
        return;
      }

      if (Object.keys(a).includes('field')) {
        actions.push(a);
      } else {
        const field = Object.keys(a).pop();
        actions.push({
          field,
          values: a[field]
        });
      }
    });
  } else if (dirty[actionKey] instanceof Object) {
    Object.keys(dirty[actionKey]).forEach(f => actions.push({
      field: f,
      values: dirty[actionKey][f]
    }));
  }

  rule.actions = actions;

  if (dirty.value && dirty.value.state !== undefined) {
    rule.actions.push({
      field: 'state',
      values: { $set: dirty.value.state }
    });
  }

  return rule;
}

module.exports = (dirty = []) => {
  if (dirty instanceof Array) {
    return dirty.map(clean);
  }
  return clean(dirty);
};
