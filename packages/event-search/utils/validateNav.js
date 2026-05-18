import schema from '@openagenda/validators/schema/index';
import integerValidator from '@openagenda/validators/integer';
import numberValidator from '@openagenda/validators/number';
import regexValidator from '@openagenda/validators/regex';
import passValidator from '@openagenda/validators/pass';
import { BadRequest } from '@openagenda/verror';

schema.register({
  integer: integerValidator,
  number: numberValidator,
  regex: regexValidator,
  pass: passValidator,
});

const hasPrependedZeros = (item) => item.length > 1 && item[0] === '0';

function cleanAfter(after) {
  if (!Array.isArray(after)) {
    return after;
  }

  return after.map((item) => {
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

export default function validateNav(nav, options = {}) {
  const preClean = {
    ...nav ?? {},
  };

  const { maxResultWindow = 10000 } = options;

  if ('offset' in preClean && !('from' in preClean)) {
    preClean.from = preClean.offset;
  }

  if ('limit' in preClean && !('size' in preClean)) {
    preClean.size = preClean.limit;
  }

  if (Array.isArray(preClean.searchAfter)) {
    preClean.searchAfter = preClean.searchAfter.map((s) =>
      (s === 'null' ? null : s));
  }

  const clean = navValidator(preClean);

  if ((clean.from ?? 0) + (clean.size ?? 20) > maxResultWindow) {
    const fromKey = Object.keys(nav).includes('offset') ? 'offset' : 'from';
    const toKey = Object.keys(nav).includes('limit') ? 'limit' : 'size';
    throw new BadRequest(
      `${fromKey} + ${toKey} cannot exceed ${maxResultWindow}. Use "after" navigation for better performance.`,
    );
  }

  if ((clean.from ?? 0) > 0 && clean.after) {
    throw new BadRequest('from and after cannot be used simultaneously');
  }

  if (clean.after) {
    clean.after = cleanAfter(clean.after);
  }

  return clean.scroll
    ? {
      scroll: clean.scroll,
      size: clean.size,
    }
    : {
      from: clean.from,
      size: clean.size,
      searchAfter: clean.after ? clean.after : clean.searchAfter,
    };
}
