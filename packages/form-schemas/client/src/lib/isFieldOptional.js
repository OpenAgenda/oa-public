'use strict';

const _ = require('lodash');
const debug = require('debug');
const log = debug('isFieldOptional');

const getWithFieldName = require('../iso/getWithFieldName');

module.exports = (field, values) => {
  if (typeof field.optional === 'boolean') {
    return field.optional;
  }

  if (!field.optionalWith) return true;

  const relatedFieldValue = _.get(values, getWithFieldName(field.optionalWith));
  const optionalWithHasValue = typeof field.optionalWith === 'object';

  log('optionalWith is defined %s value', optionalWithHasValue ? 'with' : 'without');

  if (optionalWithHasValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![].concat(field.optionalWith.value).filter(v => relatedFieldValues.includes(v)).length;
  }

  return !!(relatedFieldValue instanceof Array ? relatedFieldValue.length : relatedFieldValue);
}
