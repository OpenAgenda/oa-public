import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import validateField from './validateField.js';
import { fieldHasUnnassignedOptions, fieldAssignOptionIds, fieldHasSuperiorOptions } from './fieldOptions.js';
export default function validateFieldAndAssignOptionIds(dirtyField, _ref) {
  let {
    custom,
    defaultLabelLanguage,
    nextOptionId,
    requireLabels
  } = _ref;
  let updatedNextOptionId = nextOptionId;
  const cleanField = validateField(dirtyField, {
    custom,
    defaultLabelLanguage,
    requireLabels
  });
  if (fieldHasUnnassignedOptions(cleanField)) {
    updatedNextOptionId = fieldAssignOptionIds(cleanField, nextOptionId);
  } else if (fieldHasSuperiorOptions(cleanField, nextOptionId)) {
    var _context;
    updatedNextOptionId = _reduceInstanceProperty(_context = cleanField.options).call(_context, (max, o) => max < o.id ? o.id : max, updatedNextOptionId) + 1;
  }
  return {
    nextOptionId: updatedNextOptionId,
    field: cleanField
  };
}
//# sourceMappingURL=validateFieldAndAssignOptionIds.js.map