import _ from 'lodash';

const getRelatedFieldValues = (field, values, withField) =>
  _.pick(values, [].concat(field.related[withField]));

export default (field, values) =>
  Object.keys(field.related || {}).reduce(
    (relatedValues, withField) => ({
      ...relatedValues,
      [withField]: getRelatedFieldValues(field, values, withField),
    }),
    {},
  );
