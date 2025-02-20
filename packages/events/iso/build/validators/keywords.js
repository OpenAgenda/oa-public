'use strict';

var _reduceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/reduce");
var _trimInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/trim");
const multilingual = require('@openagenda/validators/multilingual');
const validate = multilingual({
  max: 255,
  list: true,
  optional: true
});
module.exports = _options => value => {
  const clean = validate(Array.isArray(value) ? value.join(',') : value);
  const splitCommas = {};
  Object.keys(clean).forEach(lang => {
    var _context;
    splitCommas[lang] = _reduceInstanceProperty(_context = clean[lang]).call(_context, (carry, keyword) => carry.concat((keyword || '').split(',').map(v => _trimInstanceProperty(v).call(v))), []);
  });
  return splitCommas;
};
//# sourceMappingURL=keywords.js.map