import _keys from "lodash/keys.js";
import _first from "lodash/first.js";
import _get from "lodash/get.js";
import _isString from "lodash/isString.js";
import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/es.string.replace.js";
import slug from 'slugify';
import uuid from 'uuid/v4.js';
export default (label, preferredLang) => {
  const str = _isString(label) ? label : _get(label, preferredLang, _get(label, _first(_keys(label))));
  if (!(str !== null && str !== void 0 && str.length)) {
    return uuid().replace(/-/g, '').substr(0, 12);
  }
  return slug(str, {
    lower: true,
    strict: true
  });
};
//# sourceMappingURL=slugFromLabel.js.map