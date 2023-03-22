'use strict';

const schema = require('@openagenda/validators/schema');

const integerValidator = require('@openagenda/validators/integer');
const numberValidator = require('@openagenda/validators/number');
const regexValidator = require('@openagenda/validators/regex');
const passValidator = require('@openagenda/validators/pass');

const {
  BadRequest,
} = require('@openagenda/verror');

schema.register({
  integer: integerValidator,
  number: numberValidator,
  regex: regexValidator,
  pass: passValidator,
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

const navValidator = schema({
  scroll: {
    type: 'regex',
    optional: true,
    regex: /^[0-9]([0-9]|)m$/,
  },
  from: {
    type: 'integer',
    optional: true,
    default: 0,
  },
  size: {
    type: 'integer',
    optional: true,
    default: 20,
  },
  searchAfter: {
    type: 'integer',
    list: { default: null },
    optional: true,
  },
  after: {
    type: 'pass',
    list: { default: null },
    optional: true,
  },
});

module.exports = function validateNav(nav, options = {}) {
  const preClean = {
    ...nav ?? {},
  };

  const {
    maxResultWindow = 10000,
  } = options;

  const {
    offset, limit,
  } = preClean;

  if (offset) {
    preClean.from = offset;
  }

  if (limit) {
    preClean.size = limit;
  }

  const clean = navValidator(preClean);

  if ((clean.from ?? 0) + (clean.size ?? 20) > maxResultWindow) {
    const fromKey = Object.keys(nav).includes('offset') ? 'offset' : 'from';
    const toKey = Object.keys(nav).includes('limit') ? 'limit' : 'size';
    throw new BadRequest(`${fromKey} + ${toKey} cannot exceed ${maxResultWindow}. Use "after" navigation for better performance.`);
  }

  if (clean.after) {
    clean.after = cleanAfter(clean.after);
  }

  return clean.scroll ? {
    scroll: clean.scroll,
    size: clean.size,
  } : {
    from: clean.from,
    size: clean.size,
    searchAfter: clean.after ? clean.after : clean.searchAfter,
  };
};
