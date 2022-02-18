/**
 * makes validator process lists
 */

function isNothing(validator, v) {
  if (['integer', 'number'].includes(validator.type) && v === '') {
    return true;
  }
  return [undefined, null].includes(v);
}

export default (validator, options) => {
  const params = {
    min: null,
    max: null,
    optional: options.optional === undefined ? true : !!options.optional,
    ...options.list
  };

  return Object.assign(v => {
    const clean = [];
    let errors = [];

    let value = isNothing(validator, v) ? [] : v;

    if (params.default !== undefined) {
      if (v === params.default) {
        return params.default;
      }
      if (v === undefined) {
        return params.default;
      }
    }

    if (!Array.isArray(value)) {
      value = [value];
    }

    value.forEach((item, i) => {
      try {
        clean.push(validator(item));
      } catch (errs) {
        errors = errors.concat(errs.map(e => ({
          ...e,
          index: i
        })));
      }
    });

    if (!params.optional && value.length === 0) {
      errors.push({
        field: validator.field,
        code: 'list.required',
        message: 'list cannot be empty',
        origin: value
      });
    } else if (
      (!params.optional || value.length > 0)
      && params.min !== null
      && value.length < params.min
    ) {
      errors.push({
        field: validator.field,
        code: 'list.tooshort',
        message: 'list is too short',
        origin: value
      });
    }

    if (params.max !== null && value.length > params.max) {
      errors.push({
        field: validator.field,
        code: 'list.toolong',
        message: 'list is too long',
        origin: value
      });
    }

    if (errors.length) throw errors;

    return clean;
  }, {
    type: validator.type,
    field: validator.field
  });
};
