const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (values, multilingualFields, languagesToRemove) => {
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
