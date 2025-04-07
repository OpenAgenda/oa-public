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
      displayLabelIfUnset: false,
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
    relatedValues: (relatedValues ?? []).reduce(
      (rv, f) => ({ ...rv, [f]: _.get(event, f) }),
      {},
    ),
  };
};
