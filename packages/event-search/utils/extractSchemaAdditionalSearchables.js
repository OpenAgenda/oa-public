'use strict';

const MAX_ES_INT = 2147483648;

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const keywordizeDiscreteValue = require('./keywordizeDiscreteValue');

const isEmpty = v => (Array.isArray(v) ? !v.length : v === undefined);
const optionedTypes = ['radio', 'checkbox', 'select', 'multiselect', 'boolean'];
const keywordableTypes = optionedTypes.concat(['email']);

const isDefinedNumber = ({ value, field }) => ![undefined, null].includes(value) && ['number', 'integer'].includes(field.fieldType);
const isValueEmptyList = (field, value) => ['multiselect', 'checkbox'].includes(field.fieldType) && value?.[field.field] === undefined;

function extract(extracted, schema, data = {}, path = '') {
  const fields = getFormSchemaAdditionalFields(schema).concat(
    schema.fields.filter(f => f.schema),
  );

  for (const field of fields) {
    if (field.schema) {
      extract(extracted, field.schema, data[field.field], [path, field.field].filter(v => v).join('.'));
      continue;
    }

    const value = data[field.field];

    if (isValueEmptyList(field, value)) {
      extracted.emptyListFields.push([path, field.field].join('.'));
    }

    if (isEmpty(value)) {
      extracted.emptyFields.push([path, field.field].filter(v => v).join('.'));
    }

    if (keywordableTypes.includes(field.fieldType) && ![undefined, null].includes(value)) {
      [].concat(value)
        .map(v => (optionedTypes.includes(field.fieldType) ? keywordizeDiscreteValue(field, v, path) : v))
        .forEach(k => {
          extracted.searchableKeywords.push(k);
        });
    }

    if (isDefinedNumber({ field, value }) && parseInt(value, 10) < MAX_ES_INT) {
      extracted.searchableNumbers.push({
        fieldName: [path, field.field].filter(v => !!v).join('.'),
        integer: parseInt(value, 10),
        number: parseFloat(value),
      });
    }
  }
}

module.exports = function extractSchemaAdditionalSearchables(schema, data) {
  const extracted = {
    emptyListFields: [],
    emptyFields: [],
    searchableKeywords: [],
    searchableNumbers: [],
  };

  extract(extracted, schema, data);

  return extracted;
};
