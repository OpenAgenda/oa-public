'use strict';

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
      if (!fields[optionItem.field]) {
        fields[optionItem.field] = [];
      }
      return {
        ...fields,
        [optionItem.field] : (fields[optionItem.field] || []).concat({
          ...optionItem.option,
          eventCount: optionItem.eventCount
        })
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
      field: field.field,
      option: matchingOption
    }
  }

  return null;
}
