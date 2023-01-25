'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  number: require('@openagenda/validators/number'),
  regex: require('@openagenda/validators/regex'),
  pass: require('@openagenda/validators/pass'),
});

const hasPrependedZeros = item => item.length > 1 && item[0] === '0';

function cleanAfter(after) {
  if (!Array.isArray(after)) {
    return after;
  }

  return after.map(item => {
    if (item === 'null') {
      return null;
    }
    if (/^-?\d+$/.test(item) && !hasPrependedZeros(item)) {
      return parseInt(item, 10);
    }
    return item;
  });
}

module.exports = nav => {
  const preClean = {
    ...(nav ?? {})
  };

  const {
    offset, limit
  } = preClean;

  if (offset) {
    preClean.from = offset
  }

  if (limit) {
    preClean.size = limit;
  }

  const clean = navValidator(preClean);

  if (clean.after) {
    clean.after = cleanAfter(clean.after);
  }

  return clean.scroll ? {
    scroll: clean.scroll,
    size: clean.size
  } : {
    from: clean.from,
    size: clean.size,
    searchAfter: clean.after ? clean.after : clean.searchAfter
  }
}

const navValidator = schema({
  scroll: {
    type: 'regex',
    optional: true,
    regex: /^[0-9]([0-9]|)m$/
  },
  from: {
    type: 'integer',
    optional: true,
    default: 0
  },
  size: {
    type: 'integer',
    optional: true,
    default: 20
  },
  searchAfter: {
    type: 'integer',
    list: { default: null },
    optional: true
  },
  after: {
    type: 'pass',
    list: { default: null },
    optional: true,
  }
});
