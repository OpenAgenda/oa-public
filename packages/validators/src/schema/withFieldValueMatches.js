import _ from 'lodash';
import choice from '../choice.js';

export default function withFieldValueMatches(
  fieldOptions,
  withKey,
  values,
  fields,
) {
  const withParams = _.get(fieldOptions, withKey);

  const withField =
    typeof withParams === 'string' ? withParams : withParams.field;
  const value = values?.[withField];

  const evaluateRefFieldAsTruthy = typeof withParams === 'string';

  if (evaluateRefFieldAsTruthy && value instanceof Array && !value.length) {
    return false;
  }
  if (evaluateRefFieldAsTruthy && [undefined, null, false].includes(value)) {
    return false;
  }
  if (evaluateRefFieldAsTruthy) {
    return true;
  }

  if (fields[withField]?.options) {
    return !!choice.preClean(
      {
        options: [].concat(withParams.value),
      },
      value,
    ).length;
  }

  const withValues = [].concat(withParams.value);

  if (withValues.some((v) => _.isPlainObject(v))) {
    return withValues.some((v) => _.isMatch(value, v));
  }

  if (value instanceof Array) {
    return value.includes(withParams.value);
  }

  return [].concat(value).filter((v) => withValues.includes(v)).length;
}
