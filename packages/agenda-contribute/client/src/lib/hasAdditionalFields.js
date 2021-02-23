'use strict';

export default (schemaExtensions = []) => !!schemaExtensions
  .reduce((fields, schema) => fields.concat(schema.fields), [])
  .filter(field => field.fieldType !== 'abstract')
  .length;
