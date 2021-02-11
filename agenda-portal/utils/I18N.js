'use strict';

const fs = require('fs');

const {
  createIntl,
  createIntlCache
} = require('@formatjs/intl');

const loadFromFiles = path => fs.readdirSync(path)
  .map(file => file.split('.'))
  .filter(parts => parts[parts.length - 1] === 'json')
  .map(parts => ({
    locale: parts[0],
    messages: JSON.parse(fs.readFileSync(`${path}/${parts.join('.')}`))
  }));

const createIntlByLocale = path => {
  const cache = createIntlCache();

  return loadFromFiles(path)
    .map(localeMessages => ({
      locale: localeMessages.locale,
      intl: createIntl(localeMessages, cache)
    }))
    .map(({ intl, locale }) => ({
      formatMessage: (code, values) => intl.formatMessage({ id: code }, values),
      locale
    }))
    .reduce((byLocale, { formatMessage, locale }) => ({
      ...byLocale,
      [locale]: formatMessage
    }), {});
};

const handlebarsHelper = (intlByLocale, code, options = {}) => (intlByLocale[
  options?.data?.root?.lang] || intlByLocale[Object.keys(intlByLocale).shift()
])(code);

module.exports = path => {
  const intlByLocale = createIntlByLocale(path);

  return {
    handlebarsHelper: handlebarsHelper.bind(null, intlByLocale)
  };
};
