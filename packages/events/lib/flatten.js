'use strict';

const fields = require('./fields').filter(f => !!f.languages);

module.exports = (item, lang, { html, useFallbackLang }) => (html ? [{ field: 'html', default: '' }] : []).concat(fields).reduce((item, field) => {  
  if (item[field.field]?.[lang]) {
    item[field.field] = item[field.field]?.[lang];
  } else if (useFallbackLang) {
    const fallbackLangs = Object.keys(item[field.field])
      .filter(l => !!(item[field.field]?.[l] || '').length);

    item[field.field] = fallbackLangs.length ? item[field.field][fallbackLangs[0]] : field.default;
  } else {
    item[field.field] = field.default;
  }

  return item;
}, item);