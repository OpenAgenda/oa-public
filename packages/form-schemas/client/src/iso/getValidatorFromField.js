import _ from 'lodash';
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
  choice,
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
  phone,
};

function appendMinMax(validatorOptions, fieldOptions) {
  ['min', 'max']
    .filter((f) => ![undefined, null].includes(fieldOptions[f]))
    .forEach((f) => {
      validatorOptions[f] = fieldOptions[f];
    });
}

function convertToChoice(preset, validatorOptions, fieldOptions) {
  Object.assign(validatorOptions, preset, {
    options: fieldOptions.options.map((o) => o.id),
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
  return { ...validatorOptions, ...fieldOptions };
}

const map = [
  {
    field: ['radio', 'select'],
    parser: convertToChoice.bind(null, { unique: true }),
    type: 'choice',
  },
  {
    field: ['text', 'textarea', 'markdown', 'html', 'slate'],
    test: (f) => f.languages,
    parser: convertToMultilingual,
    type: 'multilingual',
  },
  {
    field: 'date',
    parser: convertTo,
    type: 'date',
  },
  {
    field: 'boolean',
    type: 'boolean',
  },
  {
    field: ['checkbox', 'multiselect'],
    parser: convertToChoice.bind(null, { unique: false }),
    type: 'choice',
  },
  {
    field: ['textarea', 'markdown', 'html', 'pass'],
    parser: convertTo,
    type: 'text',
  },
  {
    field: 'slate',
    parser: convertTo,
    type: 'pass',
  },
  {
    field: ['image', 'file'],
    parser: convertToFile,
    type: 'file',
  },
];

export default (field, options = {}) => {
  const customValidators = _.get(options, 'custom', {});

  const draft = _.get(options, 'draft', false);

  const matchingMapItem = _.head(
    map.filter((mapItem) => {
      // field type must match given field
      if (![].concat(mapItem.field).includes(field.fieldType)) return false;

      // if fieldOptions are set, they must all match
      if (mapItem.test) {
        return mapItem.test(field);
      }

      return true;
    }),
  );

  const type = _.get(matchingMapItem, 'type', field.fieldType);

  const validatorOptions = _.assign(
    _.pick(field, [
      'field',
      'optional',
      'optionalWith',
      'enableWith',
      'related',
      'allowNull',
      'allowFalse',
      'allowURL',
      'imageWithSizeAndVariants',
      'allowPath',
      'allowObject',
      'warnAllCaps',
      'default',
    ]),
    draft ? { optional: true, type } : { type },
  );

  if (!matchingMapItem) {
    if (
      !_.get(customValidators, field.fieldType)
      && !validators[field.fieldType]
    ) {
      throw new Error(
        `Unknown field type ${field.fieldType} for field ${field.field}`,
      );
    }

    convertTo(validatorOptions, field);
  } else if (matchingMapItem.parser) {
    matchingMapItem.parser(validatorOptions, field);
  }

  return validatorOptions;
};
