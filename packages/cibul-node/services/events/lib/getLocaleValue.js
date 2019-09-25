'use strict';

module.exports = function getLocaleValue(labels, lang) {
  if (!labels || typeof labels !== 'object') {
    return labels;
  }

  const keys = Object.keys(labels);

  return keys.find(v => v === lang) ? labels[lang] : labels[keys[0]];
};
