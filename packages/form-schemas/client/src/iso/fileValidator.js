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

const baseFields = {
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

module.exports = (validatorOptions = {}) => v => {
  const optional = validatorOptions?.optional === undefined ? true : validatorOptions?.optional;

  if (!optional && !v) {
    throw requiredError(validatorOptions?.field);
  }

  const fields = {
    ...baseFields
  };

  if (validatorOptions?.allowPath && v?.path) {
    fields.path = { type: 'text' };
  } else if (validatorOptions?.allowURL && v?.url) {
    fields.url = { type: 'link' };
  }

  if (validatorOptions?.imageWithSizeAndVariants) {
    fields.size = {
      width: {
        type: 'integer',
        default: null
      },
      height: {
        type: 'integer',
        default: null
      }
    };

    fields.variants = {
      list: true,
      fields: {
        type: { type: 'text' },
        filename: { type: 'text' },
        size: { ...fields.size }
      }
    };
  }

  const clean = schema(fields)(v);

  if (!Object.keys(clean).filter(k => clean[k] !== null).length) {
    return null;
  }

  return clean;
};
