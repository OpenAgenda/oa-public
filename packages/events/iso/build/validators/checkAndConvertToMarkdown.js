'use strict';

var _reduceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/reduce");
const {
  isHTML,
  fromHTMLToMarkdown
} = require('@openagenda/md');
module.exports = function checkAndConvertToMarkdown(value) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    max
  } = options;
  if (!value) {
    return value;
  }
  if (value && typeof value === 'object') {
    var _context;
    return _reduceInstanceProperty(_context = Object.keys(value)).call(_context, (markdownified, lang) => ({
      ...markdownified,
      [lang]: checkAndConvertToMarkdown(value[lang], options)
    }), {});
  }
  return isHTML(value, {
    length: max
  }) ? fromHTMLToMarkdown(value) : value;
};
//# sourceMappingURL=checkAndConvertToMarkdown.js.map