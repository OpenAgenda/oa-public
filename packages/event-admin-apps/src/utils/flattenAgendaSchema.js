const getFieldPath = (field, path) =>
  (path.length
    ? `${path}:${field.slug ?? field.field}`
    : field.slug ?? field.field);

export default function flattenAgendaSchema(schema, path = '') {
  return {
    ...schema,
    fields: schema.fields.reduce((flattenedFields, field) => {
      const fieldPath = getFieldPath(field, path);
      if (field.schema) {
        return flattenedFields.concat(
          flattenAgendaSchema(field.schema, fieldPath).fields,
          fieldPath,
        );
      }
      flattenedFields.push({
        ...field,
        field: fieldPath,
      });
      return flattenedFields;
    }, []),
  };
}
