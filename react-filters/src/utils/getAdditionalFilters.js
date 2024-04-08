const isAdditionalField = field => field.schemaId && [
  'checkbox',
  'radio',
  'multiselect',
  'boolean',
  'select',
  'number',
  'integer',
].includes(field.fieldType);
const getFieldPath = (field, path = '') => (path.length ? `${path}:${field.slug ?? field.field}` : field.slug ?? field.field);

export default function getAdditionalFilters(fields, path = '') {
  return fields.reduce((additionalFilters, field) => {
    const fieldPath = getFieldPath(field, path);

    if (field.schema) {
      return additionalFilters.concat(getAdditionalFilters(field.schema.fields, fieldPath));
    }
    if (!isAdditionalField(field)) {
      return additionalFilters;
    }
    additionalFilters.push({
      name: fieldPath,
      fieldSchema: {
        ...field,
        field: fieldPath,
      },
    });
    return additionalFilters;
  }, []);
}
