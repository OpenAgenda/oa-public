'use strict';

module.exports = function convertKeywords(keywords) {
  if (!keywords || (keywords && !Object.keys(keywords).length)) {
    return null;
  }

  if (!Object.keys(keywords).filter(lang => !Array.isArray(keywords[lang]) || keywords[lang].length).length) {
    return null;
  }

  return Object.keys(keywords).reduce((carry, lang) => ({
    ...carry,
    [lang]: Array.isArray(keywords[lang]) ? keywords[lang].filter(v => !!(v ? v : '').length) : keywords[lang]
  }), {});
};
