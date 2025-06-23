import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _assign from "lodash/assign.js";
import _head from "lodash/head.js";
import _get from "lodash/get.js";
import _pick from "lodash/pick.js";
import "core-js/modules/es.regexp.exec.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import schema from '@openagenda/validators/schema/index.js';
import choice from '@openagenda/validators/choice.js';
import text from '@openagenda/validators/text.js';
import boolean from '@openagenda/validators/boolean.js';
import link from '@openagenda/validators/link.js';
import email from '@openagenda/validators/email.js';
import number from '@openagenda/validators/number.js';
import date from '@openagenda/validators/date.js';
import multilingual from '@openagenda/validators/multilingual.js';
import integer from '@openagenda/validators/integer.js';
import phone from '@openagenda/validators/phone.js';
schema.register({
  choice
});
const validators = {
  text,
  boolean,
  link,
  email,
  number,
  date,
  multilingual,
  integer,
  choice,
  phone
};
function appendMinMax(validatorOptions, fieldOptions) {
  ['min', 'max'].filter(f => {
    var _context;
    return !_includesInstanceProperty(_context = [undefined, null]).call(_context, fieldOptions[f]);
  }).forEach(f => {
    validatorOptions[f] = fieldOptions[f];
  });
}
function convertToChoice(preset, validatorOptions, fieldOptions) {
  Object.assign(validatorOptions, preset, {
    options: fieldOptions.options.map(o => o.id)
  });
  appendMinMax(validatorOptions, fieldOptions);
}
function convertToMultilingual(validatorOptions, fieldOptions) {
  Object.assign(validatorOptions, _pick(fieldOptions, 'languages'));
  appendMinMax(validatorOptions, fieldOptions);
}
function convertTo(validatorOptions, fieldOptions) {
  if (fieldOptions.languages) {
    Object.assign(validatorOptions, _pick(fieldOptions, 'languages'));
  }
  appendMinMax(validatorOptions, fieldOptions);
}
function convertToFile(validatorOptions, fieldOptions) {
  return _objectSpread(_objectSpread({}, validatorOptions), fieldOptions);
}
const map = [{
  field: ['radio', 'select'],
  parser: convertToChoice.bind(null, {
    unique: true
  }),
  type: 'choice'
}, {
  field: ['text', 'textarea', 'markdown', 'html', 'slate'],
  test: f => f.languages,
  parser: convertToMultilingual,
  type: 'multilingual'
}, {
  field: 'date',
  parser: convertTo,
  type: 'date'
}, {
  field: 'boolean',
  type: 'boolean'
}, {
  field: ['checkbox', 'multiselect'],
  parser: convertToChoice.bind(null, {
    unique: false
  }),
  type: 'choice'
}, {
  field: ['textarea', 'markdown', 'html', 'pass'],
  parser: convertTo,
  type: 'text'
}, {
  field: 'slate',
  parser: convertTo,
  type: 'pass'
}, {
  field: ['image', 'file'],
  parser: convertToFile,
  type: 'file'
}];
export default (function (field) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const customValidators = _get(options, 'custom', {});
  const draft = _get(options, 'draft', false);
  const matchingMapItem = _head(map.filter(mapItem => {
    var _context2;
    // field type must match given field
    if (!_includesInstanceProperty(_context2 = [].concat(mapItem.field)).call(_context2, field.fieldType)) return false;

    // if fieldOptions are set, they must all match
    if (mapItem.test) {
      return mapItem.test(field);
    }
    return true;
  }));
  const type = _get(matchingMapItem, 'type', field.fieldType);
  const validatorOptions = _assign(_pick(field, ['field', 'optional', 'optionalWith', 'enableWith', 'allowNull', 'allowURL', 'imageWithSizeAndVariants', 'allowPath', 'allowObject', 'default']), draft ? {
    optional: true,
    type
  } : {
    type
  });
  if (!matchingMapItem) {
    if (!_get(customValidators, field.fieldType) && !validators[field.fieldType]) {
      throw new Error("Unknown field type ".concat(field.fieldType, " for field ").concat(field.field));
    }
    convertTo(validatorOptions, field);
  } else if (matchingMapItem.parser) {
    matchingMapItem.parser(validatorOptions, field);
  }
  return validatorOptions;
});
//# sourceMappingURL=getValidatorFromField.js.map