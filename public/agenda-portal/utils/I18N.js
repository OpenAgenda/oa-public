'use strict';

const { createIntl, createIntlCache } = require('@formatjs/intl');

function createIntlByLocale(path) {
  const cache = createIntlCache();

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const messages = require(path);

  return Object.entries(messages)
    .reduce((byLocale, [locale, localeMessages]) => {
      const intl = createIntl({ messages: localeMessages, locale }, cache);

      byLocale[locale] = intl;

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
