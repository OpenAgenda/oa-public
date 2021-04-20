import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _slicedToArray from "@babel/runtime-corejs3/helpers/slicedToArray";
import _objectWithoutProperties from "@babel/runtime-corejs3/helpers/objectWithoutProperties";
export default function clientMiddleware(helpers) {
  return function (store) {
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(store);
        }

        var promise = action.promise,
            types = action.types,
            rest = _objectWithoutProperties(action, ["promise", "types"]);

        if (!promise) {
          return next(action);
        }

        var _types = _slicedToArray(types, 3),
            REQUEST = _types[0],
            SUCCESS = _types[1],
            FAILURE = _types[2];

        next(_objectSpread(_objectSpread({}, rest), {}, {
          type: REQUEST
        }));

        var actionPromise = _Promise.resolve(promise(helpers, store));

        actionPromise.then(function (result) {
          return next(_objectSpread(_objectSpread({}, rest), {}, {
            result: result,
            type: SUCCESS
          }));
        }, function (error) {
          return next(_objectSpread(_objectSpread({}, rest), {}, {
            error: error,
            type: FAILURE
          }));
        }).catch(function (error) {
          console.error('MIDDLEWARE ERROR:', error);
          return next(_objectSpread(_objectSpread({}, rest), {}, {
            error: error,
            type: FAILURE
          }));
        });
        return actionPromise;
      };
    };
  };
}
//# sourceMappingURL=clientMiddleware.js.map