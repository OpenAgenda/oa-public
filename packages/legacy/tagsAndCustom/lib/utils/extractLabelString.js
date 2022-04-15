'use strict';

module.exports = function extractLabelString(label, lang) {
  if (typeof label === 'string' || !label) return label;

  return label[Object.keys(label).includes(lang) ? lang : Object.keys(label).shift()];
};
