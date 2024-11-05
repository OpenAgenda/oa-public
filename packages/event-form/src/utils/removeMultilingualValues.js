import _ from 'lodash';
import ih from 'immutability-helper';

export default (values, multilingualFields, languagesToRemove) => {
  const update = multilingualFields.reduce(
    (result, field) =>
      (values[field]
        ? _.set(result, field, {
          $unset: languagesToRemove,
        })
        : result),
    {},
  );

  return ih(values, update);
};
