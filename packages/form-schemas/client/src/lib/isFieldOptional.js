import _ from 'lodash';
import debug from 'debug';
import getWithFieldName from '../iso/getWithFieldName.js';

const log = debug('isFieldOptional');

export default (field, values) => {
  if (typeof field.optional === 'boolean') {
    return field.optional;
  }

  if (!field.optionalWith) return true;

  const relatedFieldValue = _.get(values, getWithFieldName(field.optionalWith));
  const optionalWithHasValue = typeof field.optionalWith === 'object';

  log(
    'optionalWith is defined %s value',
    optionalWithHasValue ? 'with' : 'without',
  );

  if (optionalWithHasValue) {
    const relatedFieldValues = [].concat(relatedFieldValue);
    return !![]
      .concat(field.optionalWith.value)
      .filter((v) => relatedFieldValues.includes(v)).length;
  }

  return !!(Array.isArray(relatedFieldValue)
    ? relatedFieldValue.length
    : relatedFieldValue);
};
