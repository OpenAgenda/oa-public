import _ from 'lodash';
import ih from 'immutability-helper';

export default (values, multilingualFields, fromLanguage, toLanguage) => {
  const update = multilingualFields.reduce(
    (result, field) =>
      _.set(result, field, {
        $set: _.set({}, toLanguage, _.get(values, [field, fromLanguage])),
      }),
    {},
  );

  return ih(values, update);
};
