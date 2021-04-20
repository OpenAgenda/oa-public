"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getLocaleValue;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var DEFAULT_LANG = 'en';
var FALLBACK_MAP = {
  br: 'fr'
};

function getLocaleValue(labels, lang) {
  var defaultLang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_LANG;
  var fallbackMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : FALLBACK_MAP;

  if (!labels || (0, _typeof2.default)(labels) !== 'object') {
    return labels;
  }

  var keys = (0, _keys.default)(labels);

  if ((0, _find.default)(keys).call(keys, function (v) {
    return v === lang;
  })) {
    return labels[lang];
  }

  if (lang in fallbackMap) {
    return getLocaleValue(labels, fallbackMap[lang], defaultLang, fallbackMap);
  }

  if (defaultLang && (0, _find.default)(keys).call(keys, function (v) {
    return v === defaultLang;
  })) {
    return labels[defaultLang];
  }

  return labels[keys[0]];
}

module.exports = exports.default;
//# sourceMappingURL=getLocaleValue.js.map