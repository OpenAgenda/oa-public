const _ = require('lodash');

const getWithFieldName = require('../iso/getWithFieldName');
const isObject = require('../iso/isObject');

module.exports = (field, values, disabledForm = false) => {
  if (disabledForm) return false;

  if (!field.enableWith) return true;

  const relatedFieldValue = _.get(values, getWithFieldName(field.enableWith));
  const isEnabledWithValue = typeof field.enableWith === 'object';

  if (isEnabledWithValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![].concat(field.enableWith.value).filter(v => relatedFieldValues.includes(v)).length;
  }

  if (Array.isArray(relatedFieldValue)) {
    return !!relatedFieldValue.length;
  }

  if (isObject(relatedFieldValue) && ('filename' in relatedFieldValue)) {
    return !!relatedFieldValue.filename;
  }

  return !!relatedFieldValue;
};
