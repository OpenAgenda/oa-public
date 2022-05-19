const _ = require('lodash');

const choice = require('@openagenda/validators/choice');
const schema = require('@openagenda/validators/schema');

const passValidator = require('@openagenda/validators/pass');
const textValidator = require('@openagenda/validators/text');
const booleanValidator = require('@openagenda/validators/boolean');
const linkValidator = require('@openagenda/validators/link');
const emailValidator = require('@openagenda/validators/email');
const phoneValidator = require('@openagenda/validators/phone');
const numberValidator = require('@openagenda/validators/number');
const dateValidator = require('@openagenda/validators/date');
const multilingualValidator = require('@openagenda/validators/multilingual');
const integerValidator = require('@openagenda/validators/integer');

const types = Object.keys(require('./types'));
const areFieldLabelsMultilingual = require('./areFieldLabelsMultilingual');
const getWithFieldName = require('./getWithFieldName');
const {
  optionedTypes,
  minMaxedTypes,
  multilingualTypes
} = require('./fieldTypes');
const buildFieldSchema = require('./buildFieldSchema');

schema.register({
  pass: passValidator,
  text: textValidator,
  boolean: booleanValidator,
  link: linkValidator,
  email: emailValidator,
  phone: phoneValidator,
  number: numberValidator,
  date: dateValidator,
  multilingual: multilingualValidator,
  integer: integerValidator,
  choice
});

const validateStandardType = choice({
  optional: false,
  options: types,
  default: 'text',
  unique: true
});

const stripUndefinedSchemaFields = (fieldSchema, value) => Object.keys(fieldSchema)
  .reduce((stripped, key) => (
    value[key] !== undefined ? _.set(stripped, key, fieldSchema[key]) : stripped
  ), {});

function validateType(value, custom = {}) {
  const dirtyType = _.get(value, 'fieldType', 'abstract');

  if (custom && Object.keys(custom).includes(dirtyType)) {
    return dirtyType;
  }

  return validateStandardType(dirtyType);
}

/**
 * completes schema validation with rules not handled
 * by validation library:
 *
 *  * an option value must be unique within its group
 *  * a max cannot be smaller than a min (when set)
 */
function validate(value, options = {}) {
  const custom = _.get(options, 'custom', {});
  const requireLabels = _.get(options, 'requireLabels', true);

  const type = validateType(value, custom);

  const isCustomField = Object.keys(custom || {}).includes(type);
  const isAbstract = type === 'abstract';

  let errors = [];

  const fieldSchema = buildFieldSchema(
    isCustomField ? 'custom' : type,
    {
      defaultLabelLanguage: options.defaultLabelLanguage,
      isMultilingual: areFieldLabelsMultilingual(value),
      requireLabels
    }
  );

  const clean = schema(isAbstract ? stripUndefinedSchemaFields(fieldSchema, value) : fieldSchema)(value);

  // enableWith tells validator it is active if field specified has a value.
  // if set, the field must be part of related fields
  if (clean.enableWith) {
    const fieldName = getWithFieldName(clean.enableWith);
    if (!_.get(clean, 'related.enable', []).includes(fieldName)) {
      _.set(clean, 'related.enable', _.get(clean, 'related.enable', []).concat(fieldName));
    }
  }

  if (clean.optionalWith) {
    const fieldName = getWithFieldName(clean.optionalWith);
    if (!_.get(clean, 'related.optional', []).includes(fieldName)) {
      _.set(clean, 'related.optional', _.get(clean, 'related.optional', []).concat(fieldName));
    }
  }

  // if is custom or abstract field, do not filter out remaining values
  if (isCustomField || isAbstract) {
    Object.keys(value || {}).forEach(key => {
      clean[key] = value[key];
    });
  }

  // validate any optioned type
  if (optionedTypes.includes(type)) {
    const unique = _.get(value, 'options', []).reduce((u, v) => (
      u.indexOf(v.value) === -1 ? u.concat(v.value) : u
    ), []);

    if (unique.length !== _.get(value, 'options', []).length) {
      errors = errors.concat({
        field: 'options',
        code: 'duplicate',
        message: 'option values must be unique',
        origin: value
      });
    }
  }

  // validate any
  if ((minMaxedTypes.includes(type) || isCustomField) && value.min !== undefined && value.max !== undefined) {
    if (value.max < value.min) {
      errors = errors.concat({
        field: 'max',
        code: 'smallerthan.min',
        message: 'max cannot be smaller than min',
        origin: value
      });
    }
  }

  if (multilingualTypes.includes(type) && _.isArray(value.languages)) {
    clean.languages = value.languages;
  }

  if (errors.length) throw errors;

  clean.fieldType = type;

  return clean;
}

module.exports = validate;
