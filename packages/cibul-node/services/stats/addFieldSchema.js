export default (agendaSchema) => (result, stat) => {
  if (
    !['additionalFields', 'additionalFieldMetrics'].includes(
      stat.aggregation?.type,
    )
  ) {
    return [...result, stat];
  }

  const fieldSchema = agendaSchema.fields?.find(
    (f) => f.field === stat.aggregation.field,
  );

  // field no longer exists in schema
  if (!fieldSchema) {
    return result;
  }

  return [
    ...result,
    {
      ...stat,
      state: {
        ...stat.state,
        fieldSchema,
      },
    },
  ];
};
