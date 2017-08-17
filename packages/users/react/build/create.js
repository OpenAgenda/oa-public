"use strict";

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('redux'),
    createStore = _require.createStore,
    compose = _require.compose,
    applyMiddleware = _require.applyMiddleware,
    _require2 = require('react-router-redux'),
    routerMiddleware = _require2.routerMiddleware;

module.exports = function (history, initialState) {

  var enhancer = void 0;
  var middleware = applyMiddleware(routerMiddleware(history), promiseMiddleware);

  if (process.env.NODE_ENV == 'development' && typeof window !== 'undefined') {
    var _require3 = require('redux-devtools'),
        persistState = _require3.persistState,
        DevTools = require('./containers/DevTools');

    enhancer = compose(middleware, window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(), persistState(getDebugSessionKey()));
  } else {
    enhancer = compose(middleware);
  }

  var reducers = require('./reducers/index');
  // const initialState = typeof window !== 'undefined' ? window.__data : undefined;
  var store = createStore(reducers, initialState, enhancer);

  return store;
};

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  var matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

function promiseMiddleware() {

  return function (next) {
    return function (action) {
      var promise = action.promise,
          types = action.types,
          rest = removeObjectProperties(action, ['promise', 'types']);


      if (!promise) {
        return next(action);
      }

      var _types = (0, _slicedToArray3.default)(types, 3),
          REQUEST = _types[0],
          SUCCESS = _types[1],
          FAILURE = _types[2];

      next((0, _assign2.default)({}, rest, { type: REQUEST }));

      return promise.then(function (result) {
        return next((0, _assign2.default)({}, rest, { result: result, type: SUCCESS }));
      }, function (error) {
        return next((0, _assign2.default)({}, rest, { error: error, type: FAILURE }));
      });
    };
  };
}

function removeObjectProperties(obj, keys) {

  var target = {};

  for (var i in obj) {

    if (keys.indexOf(i) >= 0) continue;

    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;

    target[i] = obj[i];
  }

  return target;
}
//# sourceMappingURL=create.js.map