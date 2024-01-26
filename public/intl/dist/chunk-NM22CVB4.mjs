import {
  getFallbackChain
} from "./chunk-L7V4YAKV.mjs";
import {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG
} from "./chunk-FLP4ZIRX.mjs";

// src/getSupportedLocale.js
function getSupportedLocale(lang, fallbackMap = DEFAULT_FALLBACK_MAP, defaultLang = DEFAULT_LANG) {
  const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);
  return Intl.NumberFormat.supportedLocalesOf(fallbacks)[0];
}

export {
  getSupportedLocale
};
