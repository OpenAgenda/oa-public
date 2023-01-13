'use strict';

const _ = require('lodash');
const {
  BadRequest,
} = require('@openagenda/verror');

const {
  utils: {
    flattenSchema: getFlattenedSchema,
  },
} = require('@openagenda/form-schemas');

const isNumberLike = value => !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));
const extractFromAggregationKey = key => {
  const keyParts = key.split('.');

  return {
    schemaId: isNumberLike(keyParts[0]) ? parseInt(keyParts.shift(), 10) : keyParts.shift(),
    optionValue: keyParts.join('.'),
  };
};

function _formSchemaOptionsCount(formSchema) {
  return formSchema.fields.reduce((count, field) => {
    if (!field.options) return count;
    return count + field.options.length;
  }, 0);
}

function _cleanOption(field, matchingOption) {
  if (field.fieldType !== 'boolean') {
    return _.omit(matchingOption, ['legacyId']);
  }

  return {
    ..._.omit(matchingOption, ['legacyId', 'key']),
    key: matchingOption.key.split('.').pop(),
  };
}

function _decorateWithSchemaFieldAndOption(flattenedFormScheam, { key, doc_count: eventCount }) {
  const {
    schemaId,
    optionValue,
  } = extractFromAggregationKey(key);

  for (const field of flattenedFormScheam.fields) {
    if (field.schemaId !== schemaId) continue;
    if (!field.options && field.fieldType !== 'boolean') continue;

    const keyedOptions = field.options ? field.options.map(o => ({ ...o, key: o.id })) : [{
      key: `${field.field}.true`,
    }, {
      key: `${field.field}.false`,
    }];

    const matchingOption = keyedOptions.filter(o => `${o.key}` === optionValue).pop();

    if (!matchingOption) continue;

    return {
      key,
      eventCount,
      field,
      option: _cleanOption(field, matchingOption),
    };
  }

  return null;
}

function getFieldValues(field) {
  if (field.fieldType === 'boolean') {
    return ['true', 'false'].map(v =>
      [field.schemaId, field.field, v].join('.'));
  }
  return field.options.map(o => [field.schemaId, o.id].join('.'));
}

module.exports.formatDSL = (query, options = {}) => {
  const aggregationQuery = {
    terms: {
      field: '_search_additional_keywords',
    },
  };

  if (options.field) {
    const flattenedSchema = getFlattenedSchema(options.formSchema);
    const field = flattenedSchema.fields.find(f => f.field === options.field.replace(/:/g, '.'));

    if (!field) {
      throw new BadRequest({
        info: { field: options.field },
      }, 'Invalid requested aggregations: unknown additional field');
    }

    const fieldValues = getFieldValues(field);

    aggregationQuery.terms.include = fieldValues;
    aggregationQuery.terms.size = fieldValues.length || 1;
  } else {
    aggregationQuery.terms.size = _formSchemaOptionsCount(options.formSchema) || 1;
  }

  return aggregationQuery;
};

module.exports.formatResult = (result, options = {}) => {
  if (!options.formSchema) return [];

  const flattenedSchema = getFlattenedSchema(options.formSchema);

  const formattedResult = result.buckets
    .map(b => _decorateWithSchemaFieldAndOption(flattenedSchema, b))
    .reduce((fields, optionItem) => {
      const fieldName = optionItem.field.field;
      const values = fields[fieldName] ? fields[fieldName].values : [];

      return {
        ...fields,
        [fieldName]: {
          label: optionItem.field.label,
          values: values.concat({
            ...optionItem.option,
            eventCount: optionItem.eventCount,
          }),
        },
      };
    }, {});

  if (options.field) {
    return (formattedResult[options.field.replace(/:/g, '.')] || {}).values || [];
  }

  return formattedResult;
};
