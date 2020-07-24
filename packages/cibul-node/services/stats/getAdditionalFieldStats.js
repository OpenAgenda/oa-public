'use strict';

module.exports = function getAdditionalFieldStats(agendaSchema) {
  return agendaSchema.fields
    .filter(fieldSchema => (fieldSchema.options && fieldSchema.options.length > 0))
    .map(fieldSchema => {
      return {
        aggregation: {
          type: 'additionalFields',
          field: fieldSchema.field
        },
        chart: {}
      };
    });
};
