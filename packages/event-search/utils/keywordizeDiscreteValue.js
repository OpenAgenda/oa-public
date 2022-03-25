'use strict';

module.exports = function keywordizeDiscreteValue(field, value) {
  return [field.schemaId, value].join('.');
}