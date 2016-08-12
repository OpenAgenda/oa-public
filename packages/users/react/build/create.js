"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('redux');

var createStore = _require.createStore;
var compose = _require.compose;
var applyMiddleware = _require.applyMiddleware;

var _require2 = require('react-router-redux');

var routerMiddleware = _require2.routerMiddleware;


module.exports = function (history) {

  var enhancer = void 0;
  var middleware = applyMiddleware(routerMiddleware(history), promiseMiddleware);

  if (process.env.NODE_ENV == 'development') {
    var _require3 = require('redux-devtools');

    var persistState = _require3.persistState;
    var DevTools = require('./containers/DevTools');

    enhancer = compose(middleware, window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(), persistState(getDebugSessionKey()));
  } else {
    enhancer = compose(middleware);
  }

  var reducers = require('./reducers/index');
  var initialState = typeof window !== 'undefined' ? window.__data : undefined;
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
      var promise = action.promise;
      var types = action.types;

      var rest = removeObjectProperties(action, ['promise', 'types']);

      if (!promise) {
        return next(action);
      }

      var _types = _slicedToArray(types, 3);

      var REQUEST = _types[0];
      var SUCCESS = _types[1];
      var FAILURE = _types[2];


      next(Object.assign({}, rest, { type: REQUEST }));

      return promise.then(function (result) {
        return next(Object.assign({}, rest, { result: result, type: SUCCESS }));
      }, function (error) {
        return next(Object.assign({}, rest, { error: error, type: FAILURE }));
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