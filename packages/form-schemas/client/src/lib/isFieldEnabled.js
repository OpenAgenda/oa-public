import _ from 'lodash';

import getWithFieldName from '../iso/getWithFieldName.js';
import isObject from '../iso/isObject.js';

const fileValueIsDefined = (value) =>
  'originalName' in value || 'filename' in value;

export default function isFieldEnabled(field, values, disabledForm = false) {
  if (disabledForm) return false;

  if (field.enable === false) return false;

  if (!field.enableWith) return true;

  const relatedFieldValue = _.get(values, getWithFieldName(field.enableWith));
  const isEnabledWithValue = typeof field.enableWith === 'object';

  if (isEnabledWithValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![]
      .concat(field.enableWith.value)
      .filter((v) =>
        relatedFieldValues.some((rv) =>
          (isObject(v) ? _.isMatch(rv, v) : rv === v))).length;
  }

  if (Array.isArray(relatedFieldValue)) {
    return !!relatedFieldValue.length;
  }

  if (isObject(relatedFieldValue) && fileValueIsDefined(relatedFieldValue)) {
    return !!(relatedFieldValue.filename || relatedFieldValue.originalName);
  }

  return !!relatedFieldValue;
}
