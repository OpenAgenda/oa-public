import {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG
} from "./chunk-FLP4ZIRX.mjs";

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

export {
  getLocaleValue
};
