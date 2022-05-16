import _ from 'lodash';
import choice from '../choice';

export default function withFieldValueMatches(fieldOptions, withKey, values, fields) {
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

  if (fields[withField]?.options) {
    return !!choice.preClean({
      options: [].concat(withParams.value)
    }, value).length;
    // return !!choice.preClean(fields[withField], withParams.value).length;
  }

  if (value instanceof Array) {
    return value.includes(withParams.value);
  }

  return [].concat(value).filter(v => [].concat(withParams.value).includes(v)).length;
}
