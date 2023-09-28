import _ from 'lodash';
import debug from 'debug';

const log = debug('getRelatedFieldValues');

const getRelatedFieldValues = (field, values, withField) => {
  return _.pick(values, [].concat(field.related[withField]));
}

export default (field, values) => Object.keys(field.related || {})
  .reduce((relatedValues, withField) => ({
    ...relatedValues,
    [withField]: getRelatedFieldValues(field, values, withField)
  }), {});
  