'use strict';

const getFieldSlug = field => field.slug ?? field.field;
const getPath = (parentPath, slug) => ((parentPath ?? '').length ? `${parentPath}.${slug}` : slug);

function getFlattenedSchemaFields(schema, path = '') {
  return schema.fields.reduce((fields, field) => {
    const fieldPath = getPath(path, getFieldSlug(field));
    if (field.schema) {
      return fields.concat(getFlattenedSchemaFields(field.schema, getPath(path, fieldPath)));
    }
    fields.push({
      ...field,
      field: fieldPath,
    });
    return fields;
  }, []);
}

module.exports = function getFlattenedSchema(schema) {
  return {
    ...schema,
    fields: getFlattenedSchemaFields(schema),
  };
};
