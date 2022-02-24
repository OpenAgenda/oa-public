'use strict';

const schemas = require('@openagenda/validators/schema');
const { BadRequest } = require('@openagenda/verror');

schemas.register({
  number: require('@openagenda/validators/number'),
  integer: require('@openagenda/validators/integer'),
  regex: require('@openagenda/validators/regex'),
  text: require('@openagenda/validators/text')
});

const schema = schemas({
  page: {
    type: 'integer',
    optional: true,
    default: null,
    min: 1
  },
  from: {
    type: 'integer',
    optional: true,
    default: 0
  },
  size: {
    type: 'integer',
    optional: true,
    default: 20,
    max: 100
  },
  after: {
    type: 'text',
    list: { default: null },
    optional: true
  },
  sort: {
    type: 'regex',
    optional: true,
    error: {
      code: 'sort.invalid',
      message: 'sort value is not valid'
    },
    regex: /(createdAt|recentlyAddedEvents)\.desc/,
    default: null
  }
});

module.exports = navQuery => {
  let clean;

  try {
    clean = schema(navQuery);
  } catch(errors) {
    throw new BadRequest({ info: { errors } }, 'invalid navigation parameters');
  }

  if (clean.page !== null) {
    clean.from = (clean.page - 1) * clean.size;
  } else {
    clean.page = Math.ceil(clean.from / clean.size + 1);
  }

  if (clean.after !== null) {
    return {
      after: clean.after,
      size: clean.size,
      sort: clean.sort
    };
  };

  return Object.keys(clean).reduce((nav, field) => {
    if (clean[field] !== null) {
      nav[field] = clean[field];
    }
    return nav;
  }, {});
};
