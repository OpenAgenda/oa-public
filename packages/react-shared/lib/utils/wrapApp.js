"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = wrapApp;

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _component = require("@loadable/component");

var _RouterTrigger = _interopRequireDefault(require("./lib/RouterTrigger"));

var _ScrollToTop = _interopRequireDefault(require("./lib/ScrollToTop"));

var _core = require("@emotion/core");

var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/wrapApp.js";
var LoadableContext = _component.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Context;

function wrapApp(app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var Content = app.Content,
      history = app.history,
      triggerHooks = app.triggerHooks;
  var req = options.req,
      staticContext = options.staticContext,
      extractor = options.extractor,
      extraProps = options.extraProps,
      disableScrollToTop = options.disableScrollToTop;
  var baseElement = (0, _core.jsx)(_RouterTrigger.default, {
    trigger: triggerHooks,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 5
    }
  }, (0, _core.jsx)(Content, {
    extraProps: extraProps,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }));

  if (!disableScrollToTop) {
    baseElement = (0, _core.jsx)(_ScrollToTop.default, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 26,
        columnNumber: 19
      }
    }, baseElement);
  }

  var element = req ? (0, _core.jsx)(LoadableContext.Provider, {
    value: extractor,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 5
    }
  }, (0, _core.jsx)(_reactRouterDom.StaticRouter, {
    location: req.originalUrl,
    context: staticContext,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }
  }, baseElement)) : (0, _core.jsx)(_reactRouterDom.Router, {
    history: history,
    key: Math.random(),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36,
      columnNumber: 5
    }
  }, baseElement);
  return element;
}

module.exports = exports.default;
//# sourceMappingURL=wrapApp.js.map