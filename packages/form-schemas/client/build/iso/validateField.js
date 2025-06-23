import _isArray from "lodash/isArray.js";
import _get from "lodash/get.js";
import _set from "lodash/set.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import choice from '@openagenda/validators/choice.js';
import schema from '@openagenda/validators/schema/index.js';
import passValidator from '@openagenda/validators/pass.js';
import textValidator from '@openagenda/validators/text.js';
import booleanValidator from '@openagenda/validators/boolean.js';
import linkValidator from '@openagenda/validators/link.js';
import emailValidator from '@openagenda/validators/email.js';
import phoneValidator from '@openagenda/validators/phone.js';
import numberValidator from '@openagenda/validators/number.js';
import dateValidator from '@openagenda/validators/date.js';
import multilingualValidator from '@openagenda/validators/multilingual.js';
import integerValidator from '@openagenda/validators/integer.js';
import areLabelsMultilingual from './areLabelsMultilingual.js';
import getWithFieldName from './getWithFieldName.js';
import { optionedTypes, minMaxedTypes, multilingualTypes } from './fieldTypes.js';
import buildFieldSchema from './buildFieldSchema.js';
import types from './types.js';
const typeKeys = Object.keys(types);
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
  options: typeKeys,
  default: 'text',
  unique: true
});
const stripUndefinedSchemaFields = (fieldSchema, value) => {
  var _context;
  return _reduceInstanceProperty(_context = Object.keys(fieldSchema)).call(_context, (stripped, key) => value[key] !== undefined ? _set(stripped, key, fieldSchema[key]) : stripped, {});
};
function validateType(value) {
  var _context2;
  let custom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const dirtyType = _get(value, 'fieldType', 'abstract');
  if (custom && _includesInstanceProperty(_context2 = Object.keys(custom)).call(_context2, dirtyType)) {
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
function validate(value) {
  var _context3;
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const custom = _get(options, 'custom', {});
  const requireLabels = _get(options, 'requireLabels', true);
  const type = validateType(value, custom);
  const isCustomField = _includesInstanceProperty(_context3 = Object.keys(custom || {})).call(_context3, type);
  const isAbstract = type === 'abstract';
  let errors = [];
  const fieldSchema = buildFieldSchema(isCustomField ? 'custom' : type, {
    defaultLabelLanguage: options.defaultLabelLanguage,
    isMultilingual: areLabelsMultilingual(value),
    requireLabels
  });
  const clean = schema(isAbstract ? stripUndefinedSchemaFields(fieldSchema, value) : fieldSchema)(value);

  // enableWith tells validator it is active if field specified has a value.
  // if set, the field must be part of related fields
  if (clean.enableWith) {
    var _context4;
    const fieldName = getWithFieldName(clean.enableWith);
    if (!_includesInstanceProperty(_context4 = _get(clean, 'related.enable', [])).call(_context4, fieldName)) {
      _set(clean, 'related.enable', _get(clean, 'related.enable', []).concat(fieldName));
    }
  }
  if (clean.optionalWith) {
    var _context5;
    const fieldName = getWithFieldName(clean.optionalWith);
    if (!_includesInstanceProperty(_context5 = _get(clean, 'related.optional', [])).call(_context5, fieldName)) {
      _set(clean, 'related.optional', _get(clean, 'related.optional', []).concat(fieldName));
    }
  }

  // if is custom or abstract field, do not filter out remaining values
  if (isCustomField || isAbstract) {
    Object.keys(value || {}).forEach(key => {
      clean[key] = value[key];
    });
  }

  // validate any optioned type
  if (_includesInstanceProperty(optionedTypes).call(optionedTypes, type)) {
    var _context6;
    const unique = _reduceInstanceProperty(_context6 = _get(value, 'options', [])).call(_context6, (u, v) => !_includesInstanceProperty(u).call(u, v.value) ? u.concat(v.value) : u, []);
    if (unique.length !== _get(value, 'options', []).length) {
      errors = errors.concat({
        field: 'options',
        code: 'duplicate',
        message: 'option values must be unique',
        origin: value
      });
    }
  }

  // validate any
  if ((_includesInstanceProperty(minMaxedTypes).call(minMaxedTypes, type) || isCustomField) && value.min !== undefined && value.max !== undefined) {
    if (value.max < value.min) {
      errors = errors.concat({
        field: 'max',
        code: 'smallerthan.min',
        message: 'max cannot be smaller than min',
        origin: value
      });
    }
  }
  if (_includesInstanceProperty(multilingualTypes).call(multilingualTypes, type) && _isArray(value.languages)) {
    clean.languages = value.languages;
  }
  if (errors.length) throw errors;
  clean.fieldType = type;
  return clean;
}
export default validate;
//# sourceMappingURL=validateField.js.map