import _keys from "lodash/keys.js";
import _isString from "lodash/isString.js";
export default (field, lang) => {
  if (_isString(field.label)) {
    return lang ? [lang] : [];
  }
  return _keys(field.label);
};
//# sourceMappingURL=fieldLanguages.js.map