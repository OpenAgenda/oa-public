'use strict';

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

module.exports = ({
  baseSearchIncludes,
  detailedSearchIncludes
}, {
  detailed,
  formSchema,
  access,
  requested
}) => {
  const additionalFields = formSchema ? getFormSchemaAdditionalFields(formSchema).map(f => f.field) : [];
  const knownFields = baseSearchIncludes.concat(detailedSearchIncludes).concat(additionalFields);

  const includes = [].concat(
    !requested ? baseSearchIncludes : []
  ).concat(
    !requested && detailed ? detailedSearchIncludes : []
  ).concat(
    requested ? requested : []
  ).concat(requested ? [] : additionalFields)
    .map(field => ({
      field: field,
      higherOrderField: field.split('.').shift(),
      keep: knownFields.includes(field) ? field : null
    }))
    .map(({ higherOrderField, keep }) => {
      if (!requested || keep) {
        return keep;
      }

      if (knownFields.includes(higherOrderField)) {
        return higherOrderField;
      }

      return null;
    }).filter(field => !!field);

  if (!access || !formSchema) {
    return _keepHigherOrderIncludes(includes);
  }

  return _keepHigherOrderIncludes(includes.filter(fieldName => {
    const formSchemaField = formSchema.fields.filter(f => f.field === fieldName).pop();

    if (!formSchemaField && (baseSearchIncludes.includes(fieldName) || detailedSearchIncludes.includes(fieldName))) {
      return true
    }
    return !formSchemaField || !formSchemaField.read || formSchemaField.read.includes(access);
  }));
}

function _keepHigherOrderIncludes(includes = []) {
  const higherOrderIncludes = includes.filter(i => i.indexOf('.') === -1);

  return includes.filter(include => {
    if (higherOrderIncludes.includes(include)) {
      return true;
    }
    return !higherOrderIncludes.includes(include.split('.').shift());
  });
}
