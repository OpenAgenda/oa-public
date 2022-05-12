'use strict';

const { createIntl, createIntlCache } = require('@formatjs/intl');
const { mergeLocales, getFallbackedMessages, getSupportedLocale } = require('@openagenda/intl');
const filtersLocales = require('@openagenda/react-filters/lib/locales');

function createIntlByLocale(path) {
  const cache = createIntlCache();

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const userLocales = require(path);
  const locales = getFallbackedMessages(mergeLocales(filtersLocales, userLocales));

  return Object.entries(locales)
    .reduce((byLocale, [locale, localeMessages]) => {
      if (locale === 'io') {
        return byLocale;
      }

      try {
        byLocale[locale] = createIntl({
          locale,
          messages: localeMessages,
          defaultLocale: getSupportedLocale(locale)
        }, cache);
      } catch (e) {
        console.log(e);
      }

      return byLocale;
    }, {});
}

function handlebarsHelper(intlByLocale) {
  return function formatMessageHelper(code, { data, hash: values }) {
    const intl = intlByLocale[data.root.lang] || intlByLocale[Object.keys(intlByLocale).shift()];

    return values === true
      ? intl.messages[code]
      : intl.formatMessage({ id: code }, values);
  };
}

module.exports = path => {
  const intlByLocale = createIntlByLocale(path);

  return {
    intlByLocale,
    handlebarsHelper: handlebarsHelper(intlByLocale)
  };
};
