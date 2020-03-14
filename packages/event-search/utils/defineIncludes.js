'use strict';

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

module.exports = ({
  baseSearchIncludes,
  detailedSearchIncludes
}, {
  detailed,
  formSchema,
  access
}) => {
  const includes = [].concat(
    detailed ? detailedSearchIncludes : baseSearchIncludes
  ).concat(
    formSchema ? getFormSchemaAdditionalFields(formSchema).map(f => f.field) : []
  );

  if (!access || !formSchema) {
    return includes;
  }

  return includes.filter(fieldName => {
    const formSchemaField = formSchema.fields.filter(f => f.field === fieldName).pop();

    return !formSchemaField || !formSchemaField.read || formSchemaField.read.includes(access);
  });
}
