// src/utils/transferMultilingualValues.js
import _ from "lodash";
import ih from "immutability-helper";
var transferMultilingualValues_default = (values, multilingualFields, fromLanguage, toLanguage) => {
  const update = multilingualFields.reduce(
    (result, field) => _.set(result, field, {
      $set: _.set({}, toLanguage, _.get(values, [field, fromLanguage]))
    }),
    {}
  );
  return ih(values, update);
};

export {
  transferMultilingualValues_default
};
//# sourceMappingURL=chunk-A2Z36CQ3.js.map