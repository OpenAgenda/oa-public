import _get from "lodash/get.js";
import _isObject from "lodash/isObject.js";
const labelFields = ['label', 'info', 'sub', 'help', 'placeholder'];
const isMultilingual = (field, labelKey) => _isObject(field[labelKey]);
export default function areFieldLabelsMultilingual(field) {
  const definedLabelFields = labelFields.filter(f => _get(field, f));
  if (definedLabelFields.filter(f => !isMultilingual(field, f)).length !== definedLabelFields.length) {
    return true;
  }
  if (field.options) {
    const multilingualOptions = field.options.filter(o => areFieldLabelsMultilingual(o));
    return !!multilingualOptions.length;
  }
  return false;
}
//# sourceMappingURL=areLabelsMultilingual.js.map