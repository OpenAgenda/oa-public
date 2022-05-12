'use strict';

const VError = require('verror');

module.exports = (config, templateName, lang) => (code, values) => {
  const intl = config.intl[lang];

  try {
    return intl.formatMessage({ id: `${templateName}.${code}` }, values);
  } catch (e) {
    if (Object.keys(config.intl).length === 0) {
      throw new VError(`Missing locales for template '${templateName}'`);
    }

    if (!intl) {
      throw new VError(`Missing locale '${lang}' for template '${templateName}'`);
    }

    throw e;
  }
};
