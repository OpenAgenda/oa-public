import _bindInstanceProperty from "@babel/runtime-corejs3/core-js/instance/bind";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _Object$keys from "@babel/runtime-corejs3/core-js/object/keys";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import { combineReducers, createStore } from 'redux';

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

  store.replaceReducer(combineReducers(getReducers(store.asyncReducers)));
}

function getNoopReducers(reducers, data) {
  var _context;

  if (!data) {
    return {};
  }

  return _reduceInstanceProperty(_context = _Object$keys(data)).call(_context, function (accu, key) {
    if (reducers[key]) {
      return accu;
    }

    return _objectSpread(_objectSpread({}, accu), {}, _defineProperty({}, key, function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : data[key];
      return state;
    }));
  }, {});
}

export default function (getReducers, initialState, enhancer) {
  var getter = getReducers || noopReducer;
  var reducers = getter() || {};
  var noopReducers = getNoopReducers(reducers, initialState);
  var rootReducer = combineReducers(_objectSpread(_objectSpread({}, noopReducers), reducers));
  var store = createStore(rootReducer, initialState, enhancer);
  store.asyncReducers = {};
  store.inject = _bindInstanceProperty(inject).call(inject, null, store, function (asyncReducers) {
    return _objectSpread(_objectSpread({}, noopReducers), getter(asyncReducers));
  });
  return store;
}
;
//# sourceMappingURL=createStore.js.map