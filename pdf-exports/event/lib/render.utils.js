import _ from 'lodash';

export const loadItem = (item) => {
  const fieldName = typeof item === 'string' ? item : item.field;
  return {
    ...typeof item === 'string' ? undefined : item,
    fieldName,
    omitLabel: item?.omitLabel ?? !item?.label,
    ...typeof item === 'object' && item.label && { label: item.label },
  };
};

export const additionalFieldValues = (schemaFields, values) =>
  schemaFields
    .filter(({ schemaType }) => ['network', 'agenda'].includes(schemaType))
    .map((field) => ({
      field,
      value: values[field.field],
      displayLabelIfUnset: true,
      displayUnsetMessage: true,
    }));

export const mapToFieldValuePair = (
  agendaFlatSchemaFields,
  event,
  { fieldName, omitLabel, fieldType, field, relatedValues, label, ...params },
) => {
  const schemaField = agendaFlatSchemaFields.find(
    ({ field: f }) => f === fieldName,
  );

  return {
    fieldName,
    ...params,
    field: {
      ...schemaField
        ? _.omit(schemaField, omitLabel ? ['label'] : [])
        : { field },
      ...fieldType ? { fieldType } : undefined,
      ...label && { label },
    },
    value: params.value || _.get(event, fieldName),
    relatedValues: (relatedValues ?? [])
      .map((rv) => (typeof rv === 'string' ? { from: rv, to: rv } : rv))
      .reduce((rv, f) => ({ ...rv, [f.to]: _.get(event, f.from) }), {}),
  };
};

export const extractAndFlattenSchemaFields = (schema) =>
  schema.fields.reduce(
    (flatFields, field) =>
      (field.schema
        ? flatFields.concat(
          field.schema.fields.map((f) => ({
            ...f,
            field: `${field.field}.${f.field}`,
          })),
        )
        : flatFields.concat(field)),
    [],
  );

export const filterUnset = ({ value, filterUnset: filterUnsetOption }) => {
  if (!filterUnsetOption) return true;

  if (value instanceof Object && !Object.keys(value).length) {
    return false;
  }
  return true;
};
