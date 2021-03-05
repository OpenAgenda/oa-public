'use strict';

const _ = require('lodash');

module.exports = (fieldOptions, withKey, values) => {
  const withParams = _.get(fieldOptions, withKey);

  const withField = typeof withParams === 'string' ? withParams : withParams.field;
  const value = values === undefined ? undefined : values[withField];

  const evaluateRefFieldAsTruthy = typeof withParams === 'string';

  if (evaluateRefFieldAsTruthy && (value instanceof Array) && !value.length) {
    return false;
  } else if (evaluateRefFieldAsTruthy && [undefined, null].includes(value)) {
    return false;
  } else if (evaluateRefFieldAsTruthy) {
    return true;
  }

  if (value instanceof Array) {
    return value.includes(withParams.value);
  }

  return [].concat(value).filter(v => [].concat(withParams.value).includes(v)).length;
}