'use strict';

import errors from './lib/errors';
import cleanParams from './lib/params';

export default config => {
  const params = cleanParams('link', config, {
    min: null,
    max: null,
  });

  return Object.assign(value => {
    let clean;

    if (typeof value == 'string' && value.length) {
      clean = parseFloat(value, 10);
    } else if (typeof value === 'number') {
      clean = value;
    }

    if (clean === undefined && !params.optional &&[undefined, null ].includes(params.default)) {
      throw errors(params, value, 'required', 'a number is required');
    } else if (clean === undefined && (params.default !== undefined)) {
      return params.default;
    } else if (clean === undefined && params.optional) {
      return;
    }

    if (isNaN(clean)) {
      throw errors(params, value, 'number.invalid', 'not a number');
    }

    if (params.min !== null && clean < params.min) {
      throw [{
        code: 'number.toosmall',
        message: 'the number is too small',
        values: {
          min: params.min
        },
        origin: value,
        ...(params.field ? { field: params.field } : {})
      }];
    }

    if (params.max !== null && clean > params.max) {
      throw [{
        code: 'number.toobig',
        message: 'the number is too big',
        values: {
          max: params.max
        },
        origin: value,
        ...(params.field ? { field: params.field } : {})
      }];
    }

    return clean;
  }, {
    type: 'number',
    field: params.field
  });
}
