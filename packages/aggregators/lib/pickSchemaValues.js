'use strict';

module.exports = (schema, ...values) => values.reduce((picked, values) => {
  return {
    ...picked,
    ...Object.keys(values)
      .filter(field => schema.fields.find(f => (f.field === field) && (f.fieldType !== 'abstract')))
      .reduce((picked, field) => ({...picked, [field]: values[field]}), {})
} }, {});
