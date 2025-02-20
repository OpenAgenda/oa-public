'use strict';

const multilingualValidator = require('@openagenda/validators/multilingual');
const checkAndConvertToMarkdown = require('./checkAndConvertToMarkdown');
module.exports = function longDescriptionValidator(config) {
  const validate = multilingualValidator(config);
  return value => validate(checkAndConvertToMarkdown(value, config));
};
//# sourceMappingURL=longDescription.js.map