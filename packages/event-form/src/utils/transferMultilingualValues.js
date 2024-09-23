const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (values, multilingualFields, fromLanguage, toLanguage) => {
  const update = multilingualFields.reduce(
    (result, field) =>
      _.set(result, field, {
        $set: _.set({}, toLanguage, _.get(values, [field, fromLanguage])),
      }),
    {},
  );

  return ih(values, update);
};
