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

// src/getFallbackedMessages.js
var getFallbackedMessages_exports = {};
__export(getFallbackedMessages_exports, {
  default: () => getFallbackedMessages
});
module.exports = __toCommonJS(getFallbackedMessages_exports);

// src/constants.js
var DEFAULT_LANG = "en";
var DEFAULT_FALLBACK_MAP = {
  br: "fr",
  ca: "es",
  eu: "es",
  oc: "fr"
};

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

// src/utils/completeMessages.js
function hasValue(value) {
  return value && value !== "";
}
function completeMessages(messages, fallbackMessages) {
  return Object.keys(fallbackMessages).reduce((accu, key) => {
    const fallbackValue = fallbackMessages[key];
    const value = messages[key];
    if (!hasValue(value) && hasValue(fallbackValue)) {
      accu[key] = fallbackValue;
    }
    return accu;
  }, messages);
}

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
