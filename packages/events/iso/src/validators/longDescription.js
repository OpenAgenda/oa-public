'use strict';

const {
  isHTML,
  fromHTMLToMarkdown,
} = require('@openagenda/md');

const multilingualValidator = require('@openagenda/validators/multilingual');

function checkAndConvertToMarkdown(value, options = {}) {
  const {
    max,
  } = options;
  if (!value) {
    return value;
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((markdownified, lang) => ({
      ...markdownified,
      [lang]: checkAndConvertToMarkdown(value[lang], options),
    }), {});
  }

  return isHTML(value, { length: max }) ? fromHTMLToMarkdown(value) : value;
}

module.exports = function longDescriptionValidator(config) {
  const validate = multilingualValidator(config);
  return value => validate(checkAndConvertToMarkdown(value, config));
};
