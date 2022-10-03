'use strict';

const {
  mergeLocales,
  getFallbackChain,
  getFallbackedMessages,
  createIntlByLocale,
} = require('@openagenda/intl');
const filtersLocales = require('@openagenda/react-filters/lib/locales');

function getIntl(intlByLocale, lang) {
  const fallbacks = getFallbackChain(lang);
  let intl = intlByLocale[Object.keys(intlByLocale).shift()];

  for (const fallback of fallbacks) {
    if (intlByLocale[fallback]) {
      intl = intlByLocale[fallback];
      break;
    }
  }

  return intl;
}

function handlebarsHelper(intlByLocale) {
  return function formatMessageHelper(code, { data, hash: values }) {
    const intl = getIntl(intlByLocale, data.root.lang);

    return values === true
      ? intl.messages[code]
      : intl.formatMessage({ id: code }, values);
  };
}

module.exports = path => {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const userLocales = require(path);
  const locales = getFallbackedMessages(mergeLocales(filtersLocales, userLocales));
  const intlByLocale = createIntlByLocale(locales);

  return {
    intlByLocale,
    handlebarsHelper: handlebarsHelper(intlByLocale),
  };
};
