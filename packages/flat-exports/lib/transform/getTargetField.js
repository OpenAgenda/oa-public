'use strict';

module.exports = (labels, lang, key) => {
  if (!labels || !labels[key]) return key;

  if (!labels[key][lang]) return key;

  return labels[key][lang];
};
