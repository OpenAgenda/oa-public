'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (history, client) {
  var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  var enhancer = void 0;
  var middleware = (0, _redux.applyMiddleware)((0, _reactRouterRedux.routerMiddleware)(history), promiseMiddleware(client, state));

  if (process.env.NODE_ENV == 'development') {
    var _require = require('redux-devtools');

    var persistState = _require.persistState;
    var DevTools = require('../containers/DevTools/DevTools');

    enhancer = (0, _redux.compose)(middleware, window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(), persistState(getDebugSessionKey()));
  } else {
    enhancer = (0, _redux.compose)(middleware);
  }

  var reducers = require('./reducer');
  var initialState = typeof window !== 'undefined' ? window.__data : {};
  var store = (0, _redux.createStore)(reducers, Object.assign({}, state, initialState), enhancer);

  return store;
};

var _redux = require('redux');

var _reactRouterRedux = require('react-router-redux');

;

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  var matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

function promiseMiddleware(client) {

  return function (store) {
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

        return promise(client, store.getState()).then(function (result) {
          return next(Object.assign({}, rest, { result: result, type: SUCCESS }));
        }, function (error) {
          return next(Object.assign({}, rest, { error: error, type: FAILURE }));
        });
      };
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
module.exports = exports['default'];