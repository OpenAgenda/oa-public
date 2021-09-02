'use strict';

module.exports = agendaSchema => stat => {
  if (stat.aggregation?.type && ['additionalFields', 'additionalFieldMetrics'].includes(stat.aggregation.type)) {
    return {
      ...stat,
      state: {
        ...stat.state,
        fieldSchema: agendaSchema.fields && agendaSchema.fields
          .find(fieldSchema => fieldSchema.field ===  stat.aggregation.field)
      }
    };
  }

  return stat;
};
