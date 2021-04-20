import _Object$assign from "@babel/runtime-corejs3/core-js/object/assign";
import _Object$keys from "@babel/runtime-corejs3/core-js/object/keys";
import _forEachInstanceProperty from "@babel/runtime-corejs3/core-js/instance/for-each";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
export default function mergeLocales(target) {
  var output = _objectSpread({}, target);

  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  var _loop = function _loop() {
    var _context;

    var source = _sources[_i];

    _forEachInstanceProperty(_context = _Object$keys(source)).call(_context, function (key) {
      if (!(key in output)) {
        output[key] = source[key];
      } else {
        output[key] = _Object$assign(output[key], source[key]);
      }
    });
  };

  for (var _i = 0, _sources = sources; _i < _sources.length; _i++) {
    _loop();
  }

  return output;
}
//# sourceMappingURL=mergeLocales.js.map