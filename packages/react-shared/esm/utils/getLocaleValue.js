import _findInstanceProperty from "@babel/runtime-corejs3/core-js/instance/find";
import _Object$keys from "@babel/runtime-corejs3/core-js/object/keys";
import _typeof from "@babel/runtime-corejs3/helpers/typeof";
var DEFAULT_LANG = 'en';
var FALLBACK_MAP = {
  br: 'fr'
};
export default function getLocaleValue(labels, lang) {
  var defaultLang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_LANG;
  var fallbackMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : FALLBACK_MAP;

  if (!labels || _typeof(labels) !== 'object') {
    return labels;
  }

  var keys = _Object$keys(labels);

  if (_findInstanceProperty(keys).call(keys, function (v) {
    return v === lang;
  })) {
    return labels[lang];
  }

  if (lang in fallbackMap) {
    return getLocaleValue(labels, fallbackMap[lang], defaultLang, fallbackMap);
  }

  if (defaultLang && _findInstanceProperty(keys).call(keys, function (v) {
    return v === defaultLang;
  })) {
    return labels[defaultLang];
  }

  return labels[keys[0]];
}
//# sourceMappingURL=getLocaleValue.js.map