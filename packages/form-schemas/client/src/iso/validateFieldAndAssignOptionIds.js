import validateField from './validateField.js';
import {
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions,
} from './fieldOptions.js';

export default function validateFieldAndAssignOptionIds(
  dirtyField,
  { custom, defaultLabelLanguage, nextOptionId, requireLabels },
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
}
