import schemas from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import boolean from '@openagenda/validators/boolean';
import integer from '@openagenda/validators/integer';
import date from '@openagenda/validators/date';
import { BadRequest } from '@openagenda/verror';

schemas.register({
  text,
  boolean,
  integer,
  date,
});

const validate = schemas({
  search: {
    type: 'text',
    optional: true,
    default: null,
  },
  official: {
    type: 'boolean',
    optional: true,
    default: null,
  },
  contributionType: {
    type: 'integer',
    list: { default: null },
  },
  updatedAt: {
    fields: {
      gte: {
        type: 'date',
        default: null,
      },
      lte: {
        type: 'date',
        default: null,
      },
    },
  },
  network: {
    type: 'integer',
    optional: true,
    default: null,
  },
  locationSet: {
    type: 'integer',
    optional: true,
    default: null,
  },
  uid: {
    type: 'integer',
    list: { default: null },
  },
  slug: {
    type: 'text',
    optional: true,
    list: { default: null },
  },
});

export default (values = {}) => {
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
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid query parameters');
  }
};
