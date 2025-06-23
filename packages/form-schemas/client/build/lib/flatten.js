import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _get from "lodash/get.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import ih from 'immutability-helper';
const defineFlatteningUpdate = (obj, lang) => {
  var _context;
  return _reduceInstanceProperty(_context = ['label', 'info', 'placeholder', 'sub', 'help']).call(_context, (update, f) => {
    if (!obj[f] || typeof obj[f] === 'string') {
      return update;
    }
    return _objectSpread(_objectSpread({}, update), {}, {
      [f]: {
        $set: _get(obj[f], lang, obj[f][Object.keys(obj[f]).shift()])
      }
    });
  }, {});
};
export default (field, lang) => {
  if (!field) return null;
  const {
    options
  } = field;
  const update = defineFlatteningUpdate(field, lang);
  if (options) {
    update.options = _reduceInstanceProperty(options).call(options, (optionsUpdate, o, i) => _objectSpread(_objectSpread({}, optionsUpdate), {}, {
      [i]: defineFlatteningUpdate(o, lang)
    }), {});
  }
  return ih(field, update);
};
//# sourceMappingURL=flatten.js.map