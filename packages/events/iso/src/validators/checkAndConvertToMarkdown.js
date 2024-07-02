'use strict';

const { isHTML, fromHTMLToMarkdown } = require('@openagenda/md');

module.exports = function checkAndConvertToMarkdown(value, options = {}) {
  const { max } = options;
  if (!value) {
    return value;
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce(
      (markdownified, lang) => ({
        ...markdownified,
        [lang]: checkAndConvertToMarkdown(value[lang], options),
      }),
      {},
    );
  }

  return isHTML(value, { length: max }) ? fromHTMLToMarkdown(value) : value;
};
