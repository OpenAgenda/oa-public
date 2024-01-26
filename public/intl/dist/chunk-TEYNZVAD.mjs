import {
  getSupportedLocale
} from "./chunk-NM22CVB4.mjs";

// src/createIntlByLocale.js
import { createIntl, createIntlCache } from "@formatjs/intl";
function createIntlByLocale(locales) {
  const cache = createIntlCache();
  return Object.entries(locales).reduce((byLocale, [locale, localeMessages]) => {
    if (locale === "io") {
      return byLocale;
    }
    byLocale[locale] = createIntl({
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

export {
  createIntlByLocale
};
