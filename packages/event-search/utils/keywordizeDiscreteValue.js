'use strict';

module.exports = function keywordizeDiscreteValue(field, value) {
  if (field.fieldType === 'boolean') {
    return [field.schemaId, field.field, value].join('.');
  }
  return [field.schemaId, value].join('.');
};
