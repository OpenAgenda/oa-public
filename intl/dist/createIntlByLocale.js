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

// src/createIntlByLocale.js
var createIntlByLocale_exports = {};
__export(createIntlByLocale_exports, {
  default: () => createIntlByLocale
});
module.exports = __toCommonJS(createIntlByLocale_exports);
var import_intl = require("@formatjs/intl");

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
