'use strict';

require("core-js/modules/es.array.join");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.split");

var _trimInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/trim");

var _mapInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/map");

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var _reduceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/reduce");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Array$isArray = require("@babel/runtime-corejs3/core-js/array/is-array");

var multilingual = require('@openagenda/validators/multilingual');

var validate = multilingual({
  max: 255,
  list: true,
  optional: true
});

module.exports = function (options) {
  return function (value) {
    var _context;

    var clean = validate(_Array$isArray(value) ? value.join(',') : value);
    var splitCommas = {};

    _forEachInstanceProperty(_context = _Object$keys(clean)).call(_context, function (lang) {
      var _context2;

      splitCommas[lang] = _reduceInstanceProperty(_context2 = clean[lang]).call(_context2, function (carry, value) {
        var _context3;

        return _concatInstanceProperty(carry).call(carry, _mapInstanceProperty(_context3 = (value || '').split(',')).call(_context3, function (v) {
          return _trimInstanceProperty(v).call(v);
        }));
      }, []);
    });

    return splitCommas;
  };
};
//# sourceMappingURL=keywords.js.map