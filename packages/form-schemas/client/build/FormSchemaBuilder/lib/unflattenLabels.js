import _set from "lodash/set.js";
import _get from "lodash/get.js";
import _isString from "lodash/isString.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import ih from 'immutability-helper';
import labelKeys from './labelKeys.js';
export default (field, languages) => {
  var _context;
  return ih(field, _reduceInstanceProperty(_context = labelKeys.filter(labelKey => _isString(_get(field, labelKey)))).call(_context, (updates, f) => _set(updates, f, {
    $set: _reduceInstanceProperty(languages).call(languages, (fieldValues, lang) => _set(fieldValues, lang, field[f]), {})
  }), {}));
};
//# sourceMappingURL=unflattenLabels.js.map