var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/getLocaleValue.js
var getLocaleValue_exports = {};
__export(getLocaleValue_exports, {
  default: () => getLocaleValue
});
module.exports = __toCommonJS(getLocaleValue_exports);

// src/constants.js
var DEFAULT_LANG = "en";
var DEFAULT_FALLBACK_MAP = {
  br: "fr",
  ca: "es",
  eu: "es",
  oc: "fr"
};

// src/getLocaleValue.js
function getLocaleValue(labels, lang, defaultLangs = [DEFAULT_LANG], fallbackMap = DEFAULT_FALLBACK_MAP) {
  if (!labels || typeof labels !== "object") {
    return labels;
  }
  const keys = Object.keys(labels);
  if (keys.find((v) => v === lang)) {
    return labels[lang];
  }
  if (lang in fallbackMap) {
    return getLocaleValue(labels, fallbackMap[lang], defaultLangs, fallbackMap);
  }
  for (const defaultLang of [].concat(defaultLangs)) {
    if (defaultLang && keys.includes(defaultLang)) {
      return labels[defaultLang];
    }
  }
  return labels[keys[0]];
}
