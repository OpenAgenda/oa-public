import cleanParams from './lib/params';
import errors from './lib/errors';

function preClean(params, value) {
  const optionsAreIntegers = params.options.filter(o => Number.isInteger(o)).length === params.options.length;

  return [].concat(value)
    .map(v => {
      const valuePart = v instanceof Object ? v[params.key] : v;

      return params.options.indexOf(optionsAreIntegers ? parseInt(valuePart, 10) : valuePart);
    })
    .filter(matchingIndex => matchingIndex !== -1)
    .map(matchingIndex => params.options[matchingIndex]);
}

const validator = (config = {}) => {
  const params = cleanParams('choice', config, {
    field: false,
    options: [], // required. Put something
    key: 'value', // optional. For when labeled objects are given
    optional: true,
    min: null,
    max: null,
    unique: false,
  });

  return Object.assign(value => {
    let clean = preClean(params, value);

    if ((value === undefined) && (params.default !== undefined)) {
      return params.unique ? params.default : [].concat(params.default);
    }

    if (!params.optional && !clean.length) {
      throw errors(params, value, 'choice.required', 'a (known) value must be chosen');
    }

    if (!clean.length && params.default !== undefined) {
      clean = [].concat(params.default);
    }

    if (params.unique && params.optional && value === undefined) {
      return params.default;
    }

    if (params.unique && params.optional && value === null && params.allowNull) {
      return null;
    }

    if (params.unique) {
      return clean.length >= 1 ? clean[0] : params.default;
    }

    if (params.min && clean.length < params.min) {
      throw errors(params, value, 'choice.required.min', 'between %min% and %max% choices must be made', {
        values: {
          min: params.min,
          max: params.max,
        },
      });
    }

    if (params.max && clean.length > params.max) {
      throw errors(params, value, 'choice.required.max', 'between %min% and %max% choices must be made', {
        values: {
          max: params.max,
          min: params.min,
        },
      });
      // throw [_getMinMaxError(params, value, 'choice.required.max')];
    }

    return clean;
  }, {
    type: 'choice',
    field: params.field,
  });
};

export default Object.assign(validator, {
  preClean,
});
