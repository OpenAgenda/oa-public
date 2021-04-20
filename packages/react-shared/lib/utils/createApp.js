"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = createApp;

var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/assign"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/toConsumableArray"));

var _react = _interopRequireDefault(require("react"));

var _history = require("history");

var _redux = require("redux");

var _reactRedux = require("react-redux");

var _reactRouterConfig = require("react-router-config");

var _contexts = require("../contexts");

var _apiClient = _interopRequireDefault(require("./apiClient"));

var _createStore = _interopRequireDefault(require("./lib/createStore"));

var _clientMiddleware = _interopRequireDefault(require("./lib/clientMiddleware"));

var _makeTriggerHooks = _interopRequireDefault(require("./lib/makeTriggerHooks"));

var _core = require("@emotion/core");

var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/createApp.js";

function getDefaultHistory(req) {
  return req ? (0, _history.createMemoryHistory)({
    initialEntries: [req.originalUrl]
  }) : (0, _history.createBrowserHistory)();
}

function createApp(options) {
  var _context,
      _context2,
      _this = this;

  var name = options.name,
      initialState = options.initialState,
      layout = options.layout,
      req = options.req,
      apiRoot = options.apiRoot,
      prefix = options.prefix,
      getReducers = options.getReducers,
      getRoutes = options.getRoutes,
      legacyApiClient = options.legacyApiClient,
      _options$reduxMiddlew = options.reduxMiddleware,
      reduxMiddleware = _options$reduxMiddlew === void 0 ? [] : _options$reduxMiddlew;
  var client = (0, _apiClient.default)(apiRoot, req, {
    legacy: legacyApiClient
  });
  var history = options.history || getDefaultHistory(req);
  var helpers = {};
  var store = (0, _createStore.default)(getReducers, initialState, (0, _redux.compose)(_redux.applyMiddleware.apply(void 0, (0, _concat.default)(_context = [(0, _clientMiddleware.default)(helpers)]).call(_context, (0, _toConsumableArray2.default)((0, _isArray.default)(reduxMiddleware) ? reduxMiddleware : [reduxMiddleware]))), typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__({
    name: name ? (0, _concat.default)(_context2 = "".concat(name, " \u2014 ")).call(_context2, document.title) : document.title
  }) : function (v) {
    return v;
  }));
  var routes = getRoutes(prefix);
  (0, _assign.default)(helpers, {
    client: client,
    store: store,
    history: history,
    location: history.location
  });
  var triggerHooks = (0, _makeTriggerHooks.default)({
    routes: routes,
    history: history,
    helpers: helpers,
    req: req
  });

  var Content = /*#__PURE__*/_react.default.memo(function (_ref) {
    var extraProps = _ref.extraProps,
        switchProps = _ref.switchProps;
    return (0, _core.jsx)(_reactRedux.Provider, {
      store: store,
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 73,
        columnNumber: 5
      }
    }, (0, _core.jsx)(_contexts.ApiClientContext.Provider, {
      value: client,
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 74,
        columnNumber: 7
      }
    }, (0, _reactRouterConfig.renderRoutes)(routes, extraProps, switchProps)));
  });

  return {
    Content: Content,
    client: client,
    store: store,
    history: history,
    routes: routes,
    triggerHooks: triggerHooks,
    layout: layout
  };
}

module.exports = exports.default;
//# sourceMappingURL=createApp.js.map