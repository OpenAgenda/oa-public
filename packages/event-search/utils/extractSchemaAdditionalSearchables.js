'use strict';

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const keywordizeDiscreteValue = require('./keywordizeDiscreteValue');

const isEmpty = v => (Array.isArray(v) ? !v.length : v === undefined);
const optionedTypes = ['radio', 'checkbox', 'select', 'multiselect', 'boolean'];

const isDefinedNumber = ({ value, field }) => ![undefined, null].includes(value) && ['number', 'integer'].includes(field.fieldType);

module.exports = function extractSchemaAdditionalSearchables(schema, data) {
  const fields = getFormSchemaAdditionalFields(schema);

  return {
    emptyListFields: fields
      .filter(f => ['multiselect', 'checkbox'].includes(f.fieldType) && data[f.field] === undefined)
      .map(f => f.field),
    emptyFields: fields
      .filter(f => isEmpty(data[f.field])),
    searchableKeywords: fields
      .map(field => ({
        field,
        value: data[field.field],
      }))
      .filter(
        ({ value, field }) =>
          ![undefined, null].includes(value)
          && ['email', 'radio', 'select', 'checkbox', 'multiselect', 'boolean'].includes(field.fieldType),
      )
      .reduce((keywords, { field, value }) => keywords.concat(
        optionedTypes.includes(field.fieldType)
          ? [].concat(value).map(v => keywordizeDiscreteValue(field, v))
          : value,
      ), []),
    searchableNumbers: fields
      .map(field => ({
        field,
        value: data[field.field],
      }))
      .filter(isDefinedNumber)
      .reduce((nested, { field, value }) => nested.concat({
        fieldName: field.field,
        integer: parseInt(value, 10),
        number: parseFloat(value),
      }), [])
      // ES integers cannot exceed 2^31-1
      .filter(({ integer }) => integer < 2147483648),
  };
};
