import {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG
} from "./chunk-FLP4ZIRX.mjs";

// src/getFallbackChain.js
function getFallbackChain(lang, fallbackMap = DEFAULT_FALLBACK_MAP, defaultLang = DEFAULT_LANG) {
  const result = [lang];
  let cursor = fallbackMap[lang];
  while (cursor) {
    result.push(cursor);
    cursor = fallbackMap[cursor];
  }
  result.push(defaultLang);
  return result;
}

export {
  getFallbackChain
};
