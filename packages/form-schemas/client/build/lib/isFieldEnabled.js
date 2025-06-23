import _get from "lodash/get.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import getWithFieldName from '../iso/getWithFieldName.js';
import isObject from '../iso/isObject.js';
const fileValueIsDefined = value => 'originalName' in value || 'filename' in value;
export default function isFieldEnabled(field, values) {
  let disabledForm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (disabledForm) return false;
  if (field.enable === false) return false;
  if (!field.enableWith) return true;
  const relatedFieldValue = _get(values, getWithFieldName(field.enableWith));
  const isEnabledWithValue = typeof field.enableWith === 'object';
  if (isEnabledWithValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![].concat(field.enableWith.value).filter(v => _includesInstanceProperty(relatedFieldValues).call(relatedFieldValues, v)).length;
  }
  if (Array.isArray(relatedFieldValue)) {
    return !!relatedFieldValue.length;
  }
  if (isObject(relatedFieldValue) && fileValueIsDefined(relatedFieldValue)) {
    return !!(relatedFieldValue.filename || relatedFieldValue.originalName);
  }
  return !!relatedFieldValue;
}
//# sourceMappingURL=isFieldEnabled.js.map