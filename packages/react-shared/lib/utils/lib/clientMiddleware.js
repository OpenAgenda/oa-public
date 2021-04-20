"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = clientMiddleware;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

function clientMiddleware(helpers) {
  return function (store) {
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(store);
        }

        var promise = action.promise,
            types = action.types,
            rest = (0, _objectWithoutProperties2.default)(action, ["promise", "types"]);

        if (!promise) {
          return next(action);
        }

        var _types = (0, _slicedToArray2.default)(types, 3),
            REQUEST = _types[0],
            SUCCESS = _types[1],
            FAILURE = _types[2];

        next((0, _objectSpread2.default)((0, _objectSpread2.default)({}, rest), {}, {
          type: REQUEST
        }));

        var actionPromise = _promise.default.resolve(promise(helpers, store));

        actionPromise.then(function (result) {
          return next((0, _objectSpread2.default)((0, _objectSpread2.default)({}, rest), {}, {
            result: result,
            type: SUCCESS
          }));
        }, function (error) {
          return next((0, _objectSpread2.default)((0, _objectSpread2.default)({}, rest), {}, {
            error: error,
            type: FAILURE
          }));
        }).catch(function (error) {
          console.error('MIDDLEWARE ERROR:', error);
          return next((0, _objectSpread2.default)((0, _objectSpread2.default)({}, rest), {}, {
            error: error,
            type: FAILURE
          }));
        });
        return actionPromise;
      };
    };
  };
}

module.exports = exports.default;
//# sourceMappingURL=clientMiddleware.js.map