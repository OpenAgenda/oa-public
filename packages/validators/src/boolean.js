import cleanParams from './lib/params';
import errors from './lib/errors';

export default (config = {}) => {
  const params = cleanParams('boolean', config, {
    default: undefined,
    optional: true,
    allowNull: false,
    allowFalse: true,
  });

  return Object.assign((value) => {
    const isUndefined = value === undefined;
    const hasDefault = params.default !== undefined;

    if (isUndefined && !params.optional && !hasDefault) {
      throw errors(params, value, 'required', 'a boolean is required');
    }

    if(['0', 'false', false].indexOf(value) !== -1 && params.allowFalse === false && !params.optional){
      throw errors(params, value, 'required', 'value should be true');
    }

    if (isUndefined && hasDefault) {
      return params.default !== null ? !!params.default : null;
    }

    if (isUndefined) {
      return;
    }

    if (value === null && (params.default === null || params.allowNull)) {
      return null;
    }

    if (['0', 'false', false].indexOf(value) !== -1) {
      return false;
    }

    return !!value;
  }, {
    type: 'boolean',
    field: params.field,
  });
};
