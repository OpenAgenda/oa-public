'use strict';

module.exports = function boolQuery(value, defaultValue = false) {
  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  return defaultValue;
};
