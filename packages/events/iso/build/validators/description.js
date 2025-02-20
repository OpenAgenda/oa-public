'use strict';

var _reduceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/reduce");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
const multilingualValidator = require('@openagenda/validators/multilingual');
const checkAndConvertToMarkdown = require('./checkAndConvertToMarkdown');
function removeNewLines(value) {
  if (!value) {
    return value;
  }
  if (value && typeof value === 'object') {
    var _context;
    return _reduceInstanceProperty(_context = Object.keys(value)).call(_context, (markdownified, lang) => ({
      ...markdownified,
      [lang]: removeNewLines(value[lang])
    }), {});
  }
  return value.replace(/\r\n|\n/g, ' ');
}
module.exports = function longDescriptionValidator(config) {
  const validate = multilingualValidator(config);
  return value => validate(checkAndConvertToMarkdown(removeNewLines(value), config));
};
//# sourceMappingURL=description.js.map