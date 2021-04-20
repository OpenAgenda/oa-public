"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _bind = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/bind"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _redux = require("redux");

var noopReducer = function noopReducer(asyncReducers) {
  return asyncReducers;
};

function inject(store, getReducers, newReducers) {
  for (var name in newReducers) {
    var reducer = newReducers[name];

    if (store.asyncReducers[name]) {
      continue;
    }

    store.asyncReducers[name] = reducer.__esModule ? reducer.default : reducer;
  }

  store.replaceReducer((0, _redux.combineReducers)(getReducers(store.asyncReducers)));
}

function getNoopReducers(reducers, data) {
  var _context;

  if (!data) {
    return {};
  }

  return (0, _reduce.default)(_context = (0, _keys.default)(data)).call(_context, function (accu, key) {
    if (reducers[key]) {
      return accu;
    }

    return (0, _objectSpread3.default)((0, _objectSpread3.default)({}, accu), {}, (0, _defineProperty2.default)({}, key, function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : data[key];
      return state;
    }));
  }, {});
}

function _default(getReducers, initialState, enhancer) {
  var getter = getReducers || noopReducer;
  var reducers = getter() || {};
  var noopReducers = getNoopReducers(reducers, initialState);
  var rootReducer = (0, _redux.combineReducers)((0, _objectSpread3.default)((0, _objectSpread3.default)({}, noopReducers), reducers));
  var store = (0, _redux.createStore)(rootReducer, initialState, enhancer);
  store.asyncReducers = {};
  store.inject = (0, _bind.default)(inject).call(inject, null, store, function (asyncReducers) {
    return (0, _objectSpread3.default)((0, _objectSpread3.default)({}, noopReducers), getter(asyncReducers));
  });
  return store;
}

;
module.exports = exports.default;
//# sourceMappingURL=createStore.js.map