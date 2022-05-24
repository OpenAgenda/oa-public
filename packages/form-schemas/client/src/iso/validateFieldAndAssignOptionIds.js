'use strict';

const debug = require('debug');
const validateField = require('./validateField');

const {
  extractNextOptionId,
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions
} = require('./fieldOptions');

const log = debug('validateFieldAndAssignOptionIds');

module.exports = (dirtyField, { custom, defaultLabelLanguage, nextOptionId, requireLabels }) => {
  let updatedNextOptionId = nextOptionId;

  const cleanField = validateField(dirtyField, {
    custom,
    defaultLabelLanguage,
    requireLabels
  });

  if (fieldHasUnnassignedOptions(cleanField)) {
    updatedNextOptionId = fieldAssignOptionIds(cleanField, nextOptionId);
  } else if (fieldHasSuperiorOptions(cleanField, nextOptionId)) {
    updatedNextOptionId = cleanField.options.reduce(
      ( max, o ) => max < o.id ? o.id : max,
      updatedNextOptionId
    ) + 1;
  }

  return {
    nextOptionId: updatedNextOptionId,
    field: cleanField
  };
};
