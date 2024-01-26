import {
  completeMessages
} from "./chunk-DUAUT2UP.mjs";
import {
  getFallbackChain
} from "./chunk-L7V4YAKV.mjs";
import {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG
} from "./chunk-FLP4ZIRX.mjs";

// src/getFallbackedMessages.js
function getFallbackedMessages(messagesMap, fallbackMap = DEFAULT_FALLBACK_MAP, defaultLang = DEFAULT_LANG) {
  const langs = Object.keys(messagesMap);
  const result = {};
  for (const lang of langs) {
    const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);
    result[lang] = {};
    for (const fallback of fallbacks) {
      result[lang] = completeMessages(result[lang], messagesMap[fallback]);
    }
  }
  return result;
}

export {
  getFallbackedMessages
};
