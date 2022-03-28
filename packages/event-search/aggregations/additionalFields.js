'use strict';

const _ = require('lodash');
const {
  BadRequest
} = require('@openagenda/verror');

function getFieldValues(field) {
  if (field.fieldType === 'boolean') {
    return ['true', 'false'].map(v => (
      [field.schemaId, field.field, v].join('.')
    ));
  }  
  return field.options.map(o => [field.schemaId, o.id].join('.'));
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

function _cleanOption(field, matchingOption) {
  if (field.fieldType !== 'boolean') {
    return _.omit(matchingOption, ['legacyId']);
  }

  return {
    ..._.omit(matchingOption, ['legacyId', 'key']),
    key: matchingOption.key.split('.').pop()
  }
}

function _decorateWithSchemaFieldAndOption(formSchema, { key, doc_count }) {
  const keyParts = key.split('.');
  const schemaId = parseInt(keyParts.shift());
  const optionValue = keyParts.join('.');
  
  for (const field of formSchema.fields) {
    if (field.schemaId !== schemaId) continue;
    if (!field.options && field.fieldType !== 'boolean') continue;

    const keyedOptions = field.options ? field.options.map(o => ({ ...o, key: o.id })) : [{
      key: `${field.field}.true`
    }, {
      key: `${field.field}.false`
    }];

    const matchingOption = keyedOptions.filter(o => `${o.key}` === optionValue).pop();

    if (!matchingOption) continue;

    return {
      key,
      eventCount: doc_count,
      field,
      option: _cleanOption(field, matchingOption)
    }
  }

  return null;
}
