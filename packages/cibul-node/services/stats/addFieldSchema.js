'use strict';

module.exports = agendaSchema => (result, stat) => {
  if (!['additionalFields', 'additionalFieldMetrics'].includes(stat.aggregation?.type)) {
    return [
      ...result,
      stat
    ];
  }

  const fieldSchema = agendaSchema.fields?.find(fieldSchema => fieldSchema.field === stat.aggregation.field);

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
        fieldSchema
      }
    }
  ];
};
