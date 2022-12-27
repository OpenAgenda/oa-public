'use strict';

const isEmptyString = v => typeof v === 'string' && !v.length;

module.exports = function keywordizeDiscreteValue(field, value, path = '') {
  if (field.fieldType === 'boolean') {
    return [path, field.schemaId, field.field, value].filter(v => !isEmptyString(v)).join('.');
  }
  return [field.schemaId, value].join('.');
};
