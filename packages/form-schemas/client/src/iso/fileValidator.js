"use strict";

const _ = {
  get: require( 'lodash/get' )
};

const schema = require( '@openagenda/validators/schema' );

schema.register({
  text: require('@openagenda/validators/text'),
  link: require('@openagenda/validators/link')
});

const fields = {
  extension: {
    type: 'text'
  },
  originalName: {
    type: 'text'
  },
  filename: {
    type: 'text'
  }
};

const validate = schema(fields);
const validateWithURL = schema({
  ...fields,
  url: {
    type: 'link'
  }
});
const validateWithPath = schema({
  ...fields,
  path: {
    type: 'text'
  }
});

module.exports = (validatorOptions = {}) => v => {
  const optional = validatorOptions?.optional === undefined ? true : validatorOptions?.optional;

  if (!optional && !v) {
    throw [{
      code: 'required',
      message: 'A value is required',
      field: validatorOptions?.field || null
    }];
  }

  if (validatorOptions?.allowPath && v?.path) {
    return validateWithPath(v);
  } else if (validatorOptions?.allowURL && v?.url) {
    return validateWithURL(v);
  }
  const clean = validate(v);

  if (!Object.keys(clean).filter(k => clean[k] !== null).length) {
    return null;
  }

  return clean;
}
