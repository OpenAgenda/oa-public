import schemas from '@openagenda/validators/schema/index';
import number from '@openagenda/validators/number';
import integer from '@openagenda/validators/integer';
import regex from '@openagenda/validators/regex';
import text from '@openagenda/validators/text';
import { BadRequest } from '@openagenda/verror';

schemas.register({
  number,
  integer,
  regex,
  text,
});

const schema = schemas({
  page: {
    type: 'integer',
    optional: true,
    default: null,
    min: 1,
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
    max: 100,
  },
  after: {
    type: 'text',
    list: { default: null },
    optional: true,
  },
  sort: {
    type: 'regex',
    optional: true,
    error: {
      code: 'sort.invalid',
      message: 'sort value is not valid',
    },
    regex: /(createdAt|recentlyAddedEvents)\.desc/,
    default: null,
  },
});

export default (navQuery, options = {}) => {
  let clean;

  const { maxResultWindow = 10000 } = options;

  try {
    clean = schema(navQuery);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'invalid navigation parameters');
  }

  if ((clean.from ?? 0) + (clean.size ?? 20) > maxResultWindow) {
    const fromKey = Object.keys(navQuery).includes('offset')
      ? 'offset'
      : 'from';
    const toKey = Object.keys(navQuery).includes('limit') ? 'limit' : 'size';
    throw new BadRequest(
      `${fromKey} + ${toKey} cannot exceed ${maxResultWindow}. Use "after" navigation for better performance.`,
    );
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
      sort: clean.sort,
    };
  }

  return Object.keys(clean).reduce((nav, field) => {
    if (clean[field] !== null) {
      nav[field] = clean[field];
    }
    return nav;
  }, {});
};
