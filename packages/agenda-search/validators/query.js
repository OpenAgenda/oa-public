"use strict";

const schemas = require('@openagenda/validators/schema');

schemas.register({
  text: require('@openagenda/validators/text'),
  regex: require('@openagenda/validators/regex'),
  boolean: require('@openagenda/validators/boolean'),
  integer: require('@openagenda/validators/integer'),
  date: require('@openagenda/validators/date')
});

const validate = schemas({
  search: {
    type: 'text',
    optional: true,
    default: null
  },
  official: {
    type: 'boolean',
    optional: true,
    default: null
  },
  contributionType: {
    type: 'integer',
    list: { default: null }
  },
  updatedAt: {
    fields: {
      gte: {
        type: 'date',
        default: null
      },
      lte: {
        type: 'date',
        default: null
      }
    }
  },
  network: {
    type: 'integer',
    optional: true,
    default: null
  },
  locationSet: {
    type: 'integer',
    optional: true,
    default: null
  },
  uid: {
    type: 'integer',
    list: { default: null }
  },
  sort: {
    type: 'regex',
    optional: true,
    error: {
      code: 'sort.invalid',
      message: 'sort value is not valid'
    },
    regex: /(createdAt|recentlyContributed)\.desc/,
    default: null
  }
});

module.exports = (values = {}) => {
  const preClean = {
    ...values,   
  };

  if (preClean?.updatedAt?.gte === '') {
    preClean.updatedAt.gte = null;
  }
  if (preClean?.updatedAt?.lte === '') {
    preClean.updatedAt.lte = null;
  }

  return validate(preClean);
}
