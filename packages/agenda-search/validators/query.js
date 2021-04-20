'use strict';

const schemas = require('@openagenda/validators/schema');

schemas.register({
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  integer: require('@openagenda/validators/integer'),
  date: require('@openagenda/validators/date')
});

const BadRequestError = require('@openagenda/utils/errors/BadRequestError');

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

  try {
    return validate(preClean);
  } catch (e) {
    throw new BadRequestError('query', e);
  }
}
