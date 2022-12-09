const validateField = require('./validateField');

const {
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions,
} = require('./fieldOptions');

module.exports = function validateFieldAndAssignOptionIds(
  dirtyField,
  {
    custom,
    defaultLabelLanguage,
    nextOptionId,
    requireLabels,
  },
) {
  let updatedNextOptionId = nextOptionId;

  const cleanField = validateField(dirtyField, {
    custom,
    defaultLabelLanguage,
    requireLabels,
  });

  if (fieldHasUnnassignedOptions(cleanField)) {
    updatedNextOptionId = fieldAssignOptionIds(cleanField, nextOptionId);
  } else if (fieldHasSuperiorOptions(cleanField, nextOptionId)) {
    updatedNextOptionId = cleanField.options.reduce(
      (max, o) => (max < o.id ? o.id : max),
      updatedNextOptionId,
    ) + 1;
  }

  return {
    nextOptionId: updatedNextOptionId,
    field: cleanField,
  };
};
