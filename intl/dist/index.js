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

// src/index.js
var src_exports = {};
__export(src_exports, {
  DEFAULT_FALLBACK_MAP: () => DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG: () => DEFAULT_LANG,
  DEFAULT_LANGS: () => DEFAULT_LANGS,
  createIntlByLocale: () => createIntlByLocale,
  getFallbackChain: () => getFallbackChain,
  getFallbackedMessages: () => getFallbackedMessages,
  getLocaleValue: () => getLocaleValue,
  getSupportedLocale: () => getSupportedLocale,
  mergeLocales: () => mergeLocales
});
module.exports = __toCommonJS(src_exports);

// src/createIntlByLocale.js
var import_intl = require("@formatjs/intl");

// src/constants.js
var DEFAULT_LANG = "en";
var DEFAULT_LANGS = ["en", "fr", "de", "it", "es", "br", "ca", "eu", "oc", "io"];
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

// src/getSupportedLocale.js
function getSupportedLocale(lang, fallbackMap = DEFAULT_FALLBACK_MAP, defaultLang = DEFAULT_LANG) {
  const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);
  return Intl.NumberFormat.supportedLocalesOf(fallbacks)[0];
}

// src/createIntlByLocale.js
function createIntlByLocale(locales) {
  const cache = (0, import_intl.createIntlCache)();
  return Object.entries(locales).reduce((byLocale, [locale, localeMessages]) => {
    if (locale === "io") {
      return byLocale;
    }
    byLocale[locale] = (0, import_intl.createIntl)({
      locale,
      messages: localeMessages,
      defaultLocale: getSupportedLocale(locale),
      onError(e) {
        if (e.code !== "MISSING_DATA") {
          console.error(e);
        }
      }
    }, cache);
    return byLocale;
  }, {});
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

// src/mergeLocales.js
function mergeLocales(target, ...sources) {
  const output = { ...target };
  for (const source of sources) {
    Object.keys(source).forEach((key) => {
      if (!(key in output)) {
        output[key] = source[key];
      } else {
        output[key] = Object.assign(output[key], source[key]);
      }
    });
  }
  return output;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG,
  DEFAULT_LANGS,
  createIntlByLocale,
  getFallbackChain,
  getFallbackedMessages,
  getLocaleValue,
  getSupportedLocale,
  mergeLocales
});
