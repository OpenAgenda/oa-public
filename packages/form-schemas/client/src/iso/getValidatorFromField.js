"use strict";

const _ = require('lodash');

const schema = require('@openagenda/validators/schema');

schema.register({
  choice: require('@openagenda/validators/choice')
});

const validators = {
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  link: require('@openagenda/validators/link'),
  email: require('@openagenda/validators/email'),
  number: require('@openagenda/validators/number'),
  date: require('@openagenda/validators/date'),
  multilingual: require('@openagenda/validators/multilingual'),
  integer: require('@openagenda/validators/integer'),
  choice: require('@openagenda/validators/choice'),
  phone: require('@openagenda/validators/phone')
}

const map = [{
  field: ['radio', 'select'],
  parser: convertToChoice.bind(null, { unique: true }),
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
  parser: convertToChoice.bind(null, { unique: false }),
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

module.exports = (field, options = {}) => {
  const customValidators = _.get(options, 'custom', {});

  const draft = _.get(options, 'draft', false);

  const matchingMapItem = _.head(map.filter(mapItem => {
    // field type must match given field
    if (![].concat(mapItem.field).includes(field.fieldType)) return false;

    // if fieldOptions are set, they must all match
    if (mapItem.test) {
      return mapItem.test(field);
    }

    return true;
  }));

  const type = _.get(matchingMapItem, 'type', field.fieldType);

  const validatorOptions = _.assign(_.pick(field, [
    'field', 
    'optional',
    'optionalWith',
    'enableWith',
    'allowNull',
    'allowURL',
    'imageWithSizeAndVariants',
    'allowPath',
    'allowObject',
    'default'
  ]), draft ? { optional: true , type } : { type });

  if (!matchingMapItem) {
    if (!_.get(customValidators, field.fieldType) && !validators[field.fieldType]) throw new Error(`Unknown field type ${field.fieldType} for field ${field.field}`);

    convertTo(validatorOptions, field);
  } else if (matchingMapItem.parser) {
    matchingMapItem.parser(validatorOptions, field);
  }

  return validatorOptions;
}

function convertToChoice(preset, validatorOptions, fieldOptions) {
  Object.assign(validatorOptions, preset, {
    options: fieldOptions.options.map(o => o.id)
  });

  appendMinMax(validatorOptions, fieldOptions);
}

function convertToMultilingual(validatorOptions, fieldOptions) {
  Object.assign(validatorOptions, _.pick(fieldOptions, 'languages'));

  appendMinMax(validatorOptions, fieldOptions);
}

function convertTo(validatorOptions, fieldOptions) {
  if (fieldOptions.languages) {
    Object.assign(validatorOptions, _.pick(fieldOptions, 'languages'));
  }
  appendMinMax(validatorOptions, fieldOptions);
}

function convertToFile(validatorOptions, fieldOptions) {
  return Object.assign({}, validatorOptions, fieldOptions);
}

function appendMinMax(validatorOptions, fieldOptions) {
  ['min', 'max'].filter(f => ![undefined, null].includes(fieldOptions[f])).forEach(f => {
    validatorOptions[f] = fieldOptions[f];
  });
}
