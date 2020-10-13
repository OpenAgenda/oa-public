'use strict';

const _ = require('lodash');
const getEnableWithFieldName = require('../iso/getEnableWithFieldName');

module.exports = (field, values, disabledForm = false) => {
  if (disabledForm) return false;

  if (!field.enableWith) return true;

  const relatedFieldValue = _.get(values, getEnableWithFieldName(field.enableWith));
  const isEnabledWithValue = typeof field.enableWith === 'object';

  if (isEnabledWithValue) {
    return ([].concat(relatedFieldValue)).includes(field.enableWith.value);
  }

  return !!(relatedFieldValue instanceof Array ? relatedFieldValue.length : relatedFieldValue);
}
