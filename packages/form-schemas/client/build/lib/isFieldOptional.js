import _get from "lodash/get.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import debug from 'debug';
import getWithFieldName from '../iso/getWithFieldName.js';
const log = debug('isFieldOptional');
export default (field, values) => {
  if (typeof field.optional === 'boolean') {
    return field.optional;
  }
  if (!field.optionalWith) return true;
  const relatedFieldValue = _get(values, getWithFieldName(field.optionalWith));
  const optionalWithHasValue = typeof field.optionalWith === 'object';
  log('optionalWith is defined %s value', optionalWithHasValue ? 'with' : 'without');
  if (optionalWithHasValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![].concat(field.optionalWith.value).filter(v => _includesInstanceProperty(relatedFieldValues).call(relatedFieldValues, v)).length;
  }
  return !!(Array.isArray(relatedFieldValue) ? relatedFieldValue.length : relatedFieldValue);
};
//# sourceMappingURL=isFieldOptional.js.map