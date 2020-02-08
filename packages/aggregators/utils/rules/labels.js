'use strict';

const convertFieldOptionIdsToLabels = require('./convertFieldOptionIdsToLabels');

module.exports = (sourceAgendaSchema, labels, data) => {
  const optionedFields = sourceAgendaSchema.fields.filter(f => !!f.options);
  for (const field of optionedFields) {
    if (convertFieldOptionIdsToLabels(field, data[field.field])
      .filter(fieldLabel => labels.includes(fieldLabel))
      .length) {
      return true;
    }
  }
  return false;
}
