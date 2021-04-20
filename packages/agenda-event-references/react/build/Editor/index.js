"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _reducers = _interopRequireDefault(require("./reducers"));

var _containers = _interopRequireDefault(require("./containers"));

var _utils = _interopRequireDefault(require("@openagenda/utils"));

var _redux = require("redux");

var _actions = _interopRequireDefault(require("./actions"));

var _configure = _interopRequireDefault(require("./store/configure"));

var _clickTracker = _interopRequireDefault(require("../clickTracker"));

var _this = void 0,
    _jsxFileName = "/home/clement/Project/oa/packages/agenda-event-references/react/src/Editor/index.js";

var store;

var _default = function _default(options) {
  if (!store) {
    var initialState = _utils.default.extend({
      uid: null,
      initUids: [],
      lang: 'fr',
      res: {
        events: '/events',
        suggestions: '/suggestions'
      },
      loading: false,
      loadingSuggestions: false,
      sample: null,
      // suggest events feature
      error: false,
      info: null,
      events: [],
      search: {
        searching: false,
        query: null,
        display: false,
        events: null,
        suggestions: null
      }
    }, options || {}),
        onChange = options.onChange;

    store = (0, _redux.createStore)(_reducers.default, initialState, _configure.default);
    store.dispatch(_actions.default.eventsLoad());
    (0, _clickTracker.default)('search', '.search', function () {
      store.dispatch(_actions.default.searchHide());
    });

    if (onChange) {
      store.subscribe(function () {
        var _context;

        onChange((0, _map.default)(_context = store.getState().events).call(_context, function (e) {
          return e.uid;
        }));
      });
    }
  } else if (options.sample) {
    store.dispatch(_actions.default.resetSuggestions(options.sample));
  }

  return /*#__PURE__*/_react.default.createElement(_reactRedux.Provider, {
    store: store,
    context: _reactRedux.ReactReduxContext,
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 10
    }
  }, /*#__PURE__*/_react.default.createElement(_containers.default, {
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 71,
      columnNumber: 5
    }
  }));
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map