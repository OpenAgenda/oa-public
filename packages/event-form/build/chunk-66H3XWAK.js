// src/utils/removeMultilingualValues.js
import _ from "lodash";
import ih from "immutability-helper";
var removeMultilingualValues_default = (values, multilingualFields, languagesToRemove) => {
  const update = multilingualFields.reduce(
    (result, field) => values[field] ? _.set(result, field, {
      $unset: languagesToRemove
    }) : result,
    {}
  );
  return ih(values, update);
};

export {
  removeMultilingualValues_default
};
//# sourceMappingURL=chunk-66H3XWAK.js.map