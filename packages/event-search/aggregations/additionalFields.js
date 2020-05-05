'use strict';

const _ = require('lodash');

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: '_search_additional_keywords',
    size: _formSchemaOptionsCount(options.formSchema)
  }
})

module.exports.formatResult = (result, options = {}) => {
  if (!options.formSchema) return [];

  return result.buckets
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
}

function _formSchemaOptionsCount(formSchema) {
  return formSchema.fields.reduce((count, field) => {
    if (!field.options) return count;
    return count + field.options.length;
  }, 0);
}

function _decorateWithSchemaFieldAndOption(formSchema, { key, doc_count }) {
  const [schemaId, optionsId] = key.split('.').map(k => parseInt(k));

  for (const field of formSchema.fields) {
    if (field.schemaId !== schemaId) continue;
    if (!field.options) continue;

    const matchingOption = field.options.filter(o => o.id === optionsId).pop();

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
