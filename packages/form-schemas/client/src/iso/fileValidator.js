const requiredError = (field = null) => [{
  code: 'required',
  message: 'A value is required',
  field
}];

const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const linkValidator = require('@openagenda/validators/link');

schema.register({
  text: textValidator,
  link: linkValidator
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
    throw requiredError(validatorOptions?.field);
  }

  if (validatorOptions?.allowPath && v?.path) {
    return validateWithPath(v);
  }

  if (validatorOptions?.allowURL && v?.url) {
    return validateWithURL(v);
  }

  const clean = validate(v);

  if (!Object.keys(clean).filter(k => clean[k] !== null).length) {
    return null;
  }

  return clean;
};
