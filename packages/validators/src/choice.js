import cleanParams from './lib/params';
import errors from './lib/errors';

export default (config = {}) => {
  const params = cleanParams('choice', config, {
    field: false,
    options: [], // required. Put something
    key: 'value', // optional. For when labeled objects are given
    optional: true,
    min: null,
    max: null,
    unique: false
  });

  return Object.assign(value => {
    let clean = ([].concat(value))
      .map(v => (v instanceof Object) ? v[params.key] : v)
      .filter(v => params.options.indexOf(v) !== -1);

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
    } else if (params.unique && params.optional && value === null && params.allowNull) {
      return null;
    }

    if (params.unique) {
      return clean.length >= 1 ? clean[0] : params.default;
    }

    if (params.min && clean.length < params.min) {
      throw [_getMinMaxError(params, value, 'choice.required.min')];
    }

    if (params.max && clean.length > params.max) {
      throw [_getMinMaxError(params, value, 'choice.required.max')];
    }

    return clean;
  }, {
    type: 'choice',
    field: params.field
  });
}

function _getError(params, origin, error) {
  return Object.assign({
    origin
  }, params.field ? { field: params.field } : {}, error);
}

function _getMinMaxError(params, origin, code) {
  let values = {}, message;

  if (params.min !== null && params.max) {
    return _getError(params, origin, {
      message: 'between %min% and %max% choices must be made',
      values: { min: params.min, max: params.max },
      code
    });
  } else if (!params.max) {
    return _getError(params, origin, {
      message: 'at least %min% choices must be made',
      values: { min: params.min },
      code
    });
  } else {
    return _getError(params, origin, {
      message: 'a maximum of %max% choices is allowed',
      values: { max: params.max },
      code
    });
  }
}
