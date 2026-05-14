export default (type, values = {}, defaults = {}) => {
  const params = {
    type,
    list: false,
    field: undefined,
    allowNull: false,
    optional: true,
    allowFalse: true,
    ...defaults,
    ...values,
  };

  if (values.optional === undefined) {
    params.optional = true;
  }

  return params;
};
