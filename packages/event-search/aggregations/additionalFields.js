'use strict';

const _ = require('lodash');
const {
  BadRequest
} = require('@openagenda/verror');

function getFieldValues(field) {
  const options = field.fieldType === 'boolean' ? [{ id: 'true' },{ id: 'false' }] : field.options;

  return options.map(o => [field.schemaId, o.id].join('.'));
}

module.exports.formatDSL = (query, options = {}) => {
  const aggregationQuery = {
    terms: {
      field: '_search_additional_keywords'
    }
  };

  if (options.field) {
    const field = options.formSchema.fields.find(field => field.field === options.field);

    if (!field) {
      throw new BadRequest({
        info: { field: options.field }
      }, 'Invalid requested aggregations: unknown additional field');
    }

    const fieldValues = getFieldValues(field);

    aggregationQuery.terms.include = fieldValues;
    aggregationQuery.terms.size = fieldValues.length;
  } else {
    aggregationQuery.terms.size = _formSchemaOptionsCount(options.formSchema);
  }

  return aggregationQuery;
}

module.exports.formatResult = (result, options = {}) => {
  if (!options.formSchema) return [];

  const formattedResult = result.buckets
    .map(b => _decorateWithSchemaFieldAndOption(options.formSchema, b))
    .reduce((fields, optionItem) => {
      const fieldName = optionItem.field.field;
      const values = fields[fieldName] ? fields[fieldName].values : [];

      return {
        ...fields,
        [fieldName]: {
          label: optionItem.field.label,
          values: values.concat({
            ...optionItem.option,
            eventCount: optionItem.eventCount
          })
        }
      }
    }, {});

  if (options.field) {
    return (formattedResult[options.field] || {}).values || [];
  }

  return formattedResult;
}

function _formSchemaOptionsCount(formSchema) {
  return formSchema.fields.reduce((count, field) => {
    if (!field.options) return count;
    return count + field.options.length;
  }, 0);
}

function _decorateWithSchemaFieldAndOption(formSchema, { key, doc_count }) {
  const [schemaIdStr, optionValue] = key.split('.');
  const schemaId = parseInt(schemaIdStr);

  for (const field of formSchema.fields) {
    if (field.schemaId !== schemaId) continue;
    if (!field.options && field.fieldType !== 'boolean') continue;

    const keyedOptions = field.options ? field.options.map(o => ({ ...o, key: o.id })) : [{
      key: 'true'
    }, {
      key: 'false'
    }];

    const matchingOption = keyedOptions.filter(o => `${o.key}` === optionValue).pop();

    if (!matchingOption) continue;

    return {
      key,
      eventCount: doc_count,
      field,
      option: _.omit(matchingOption, ['legacyId'])
    }
  }

  return null;
}
