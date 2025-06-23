// src/validators/languages.js
import _ from "lodash";
var languages_default = (options = {}) => (value) => {
  const {
    default: defaultLanguages,
    required,
    strict
  } = _.assign(
    {
      default: null,
      required: null,
      strict: false
    },
    options
  );
  let languages;
  if (strict) {
    languages = required;
  } else if (required) {
    languages = _.uniq(required.concat(value || []));
  } else if (value && value.length !== 0) {
    languages = value;
  } else if (defaultLanguages) {
    languages = defaultLanguages;
  }
  return _.isArray(languages) ? languages.filter((l) => !!l) : [];
};

export {
  languages_default
};
//# sourceMappingURL=chunk-V6VOOY44.js.map