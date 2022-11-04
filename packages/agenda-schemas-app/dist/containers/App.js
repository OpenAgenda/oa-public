"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactIntl = require("react-intl");

var _reactRouterConfig = require("react-router-config");

var _redial = require("redial");

var _reactQuery = require("react-query");

var _reactShared = require("@openagenda/react-shared");

var _intl = require("@openagenda/intl");

var _localesCompiled = _interopRequireDefault(require("../locales-compiled"));

var _react2 = require("@emotion/react");

var _jsxFileName = "/home/clement/Project/oa/packages/agenda-schemas-app/src/containers/App.js";

function App(_ref) {
  var route = _ref.route;
  var parentQueryClient = (0, _reactQuery.useQueryClient)();
  var queryClient = (0, _reactShared.useConstant)(function () {
    return parentQueryClient || new _reactQuery.QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    });
  });

  var _useLayoutData = (0, _reactShared.useLayoutData)(),
      lang = _useLayoutData.lang;

  return (0, _react2.jsx)(_reactIntl.IntlProvider, {
    key: lang,
    locale: lang,
    messages: _localesCompiled.default[lang],
    defaultLocale: (0, _intl.getSupportedLocale)(lang),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 5
    }
  }, (0, _react2.jsx)(_reactQuery.QueryClientProvider, {
    client: queryClient,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 34,
      columnNumber: 7
    }
  }, (0, _reactRouterConfig.renderRoutes)(route.routes)));
}

var _default = (0, _redial.provideHooks)({
  inject: function inject(_ref2) {
    var store = _ref2.store;
    return store.inject({});
  }
})(App);

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=App.js.map