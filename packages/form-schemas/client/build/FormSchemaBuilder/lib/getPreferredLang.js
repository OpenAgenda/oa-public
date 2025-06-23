import _keys from "lodash/keys.js";
import _first from "lodash/first.js";
import _get from "lodash/get.js";
import _isString from "lodash/isString.js";
export default (label, preferredLang) => {
  if (_isString(label)) return label;
  return _get(label, preferredLang, _get(label, _first(_keys(label))));
};
//# sourceMappingURL=getPreferredLang.js.map