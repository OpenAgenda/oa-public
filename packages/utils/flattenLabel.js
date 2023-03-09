'use strict';

module.exports = function flattenLabel(label, requestedLang, options = {}) {
  const {
    fallbackLang = 'fr',
  } = options;

  if (typeof label === 'string') return label;

  for (const lang of [requestedLang, fallbackLang, Object.keys(label || {}).shift()]) {
    if (label?.[lang]) return label[lang];
  }
};
