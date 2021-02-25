'use strict';

var _objectSpread = require("@babel/runtime-corejs3/helpers/objectSpread2");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Array$isArray = require("@babel/runtime-corejs3/core-js/array/is-array");

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var schema = require('@openagenda/validators/schema');

schema.register({
  link: require('@openagenda/validators/link'),
  pass: require('@openagenda/validators/pass')
});
var validateSingle = schema({
  link: {
    type: 'link',
    optional: false
  },
  data: {
    type: 'pass'
  }
});

module.exports = function (_ref) {
  var field = _ref.field;
  return function (v) {
    var _context;

    var clean = [];
    var errors = [];

    var arrayOfValues = _concatInstanceProperty(_context = []).call(_context, v);

    var _loop = function _loop(index) {
      try {
        clean.push(validateSingle(arrayOfValues[index]));
      } catch (e) {
        if (!_Array$isArray(e)) {
          throw e;
        } else {
          _forEachInstanceProperty(e).call(e, function (error) {
            return errors.push(_objectSpread(_objectSpread({}, error), {}, {
              index: index
            }));
          });
        }
      }
    };

    for (var index in arrayOfValues) {
      _loop(index);
    }

    return clean;
  };
};
//# sourceMappingURL=enrichedLinks.js.map