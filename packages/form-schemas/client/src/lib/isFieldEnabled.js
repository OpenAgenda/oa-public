'use strict';

const _ = require('lodash');
const debug = require('debug');
const log = debug('isFieldEnabled');

const getWithFieldName = require('../iso/getWithFieldName');

module.exports = (field, values, disabledForm = false) => {
  if (disabledForm) return false;

  if (!field.enableWith) return true;

  const relatedFieldValue = _.get(values, getWithFieldName(field.enableWith));
  const isEnabledWithValue = typeof field.enableWith === 'object';

  if (isEnabledWithValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![].concat(field.enableWith.value).filter(v => relatedFieldValues.includes(v)).length;
  }

  return !!(relatedFieldValue instanceof Array ? relatedFieldValue.length : relatedFieldValue);
}
