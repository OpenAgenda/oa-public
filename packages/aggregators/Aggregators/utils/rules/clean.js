'use strict';

function clean(dirty) {
  const actionKey = dirty.transform !== undefined ? 'transform' : 'actions';

  const rule = {
    query: _cleanQuery(dirty.query),
    actions: [],
    required: dirty.required === undefined ? true : !!dirty.required
  };

  const actions = [];

  if (dirty[actionKey] instanceof Array) {
    dirty[actionKey].forEach(a => actions.push(a));
  } else if (dirty[actionKey] instanceof Object) {
    Object.keys(dirty[actionKey]).forEach(f => actions.push({
      [f]: dirty[actionKey][f]
    }));
  }

  rule.actions = actions;

  if (dirty.value && (dirty.value.state !== undefined)) {
    rule.actions.push({
      state: {
        $set: dirty.value.state
      }
    });
  }

  return rule;
}

function _cleanQuery(dirty) {
  if (!dirty) return {};

  return Object.keys(dirty).reduce((clean, key) => {
    if (key === 'location' && dirty.location instanceof Array) {
      const geoKey = Object.keys(dirty.location[0])[0];
      clean.location = {
        [geoKey]: dirty.location.map(l => l[geoKey])
      };
    } else {
      clean[key] = dirty[key];
    }
    return clean;
  }, {});
}

module.exports = dirty => {
  if (dirty instanceof Array) {
    return dirty.map(clean);
  } else {
    return clean(dirty);
  }
}
