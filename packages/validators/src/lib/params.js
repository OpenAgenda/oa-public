'use strict';

module.exports = (type, values = {}, defaults = {}) => {
  const params = {
    type,
    list: false,
    field: undefined,
    optional: true,
    ...defaults,
    ...values
  };

  if (values.optional === undefined) {
    params.optional = true;
  }

  return params;
}