export default (config = {}) => {
  const params = {
    field: false,
    default: undefined,
    optional: true,
    allowNull: false,
    ...config
  };

  return Object.assign(value => {
    const isUndefined = value === undefined;
    const hasDefault = params.default !== undefined;

    if (isUndefined && !params.optional && !hasDefault) {
      throw [{
        field: params.field,
        code: 'required',
        message: 'a boolean is required',
        origin: value
      }];
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
    field: params.field
  });
}
