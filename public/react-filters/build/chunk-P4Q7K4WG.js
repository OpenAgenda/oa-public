// src/utils/getAdditionalFilters.js
var isAdditionalField = (field) => field.schemaId && [
  "checkbox",
  "radio",
  "multiselect",
  "boolean",
  "select",
  "number",
  "integer"
].includes(field.fieldType);
var getFieldPath = (field, path = "") => path.length ? `${path}:${field.slug ?? field.field}` : field.slug ?? field.field;
function getAdditionalFilters(fields, path = "") {
  return fields.reduce((additionalFilters, field) => {
    const fieldPath = getFieldPath(field, path);
    if (field.schema) {
      return additionalFilters.concat(
        getAdditionalFilters(field.schema.fields, fieldPath)
      );
    }
    if (!isAdditionalField(field)) {
      return additionalFilters;
    }
    additionalFilters.push({
      name: fieldPath,
      fieldSchema: {
        ...field,
        field: fieldPath
      }
    });
    return additionalFilters;
  }, []);
}

export {
  getAdditionalFilters
};
//# sourceMappingURL=chunk-P4Q7K4WG.js.map