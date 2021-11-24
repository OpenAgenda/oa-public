'use strict';

const { createIntl, createIntlCache } = require('@formatjs/intl');
const { mergeLocales } = require('@openagenda/react-shared');
const filtersLocales = require('@openagenda/react-filters/lib/locales');

function createIntlByLocale(path) {
  const cache = createIntlCache();

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const userLocales = require(path);
  const locales = mergeLocales(filtersLocales, userLocales);

  return Object.entries(locales)
    .reduce((byLocale, [locale, localeMessages]) => {
      if (locale === 'io' || locale === 'oc') {
        return byLocale;
      }

      byLocale[locale] = createIntl({ messages: localeMessages, locale }, cache);

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
